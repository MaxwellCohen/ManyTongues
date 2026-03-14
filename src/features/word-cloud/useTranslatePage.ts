import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebounceValue } from '#/hooks/useDebouncedValue'
import {
  type FullTranslatorSearch,
  type TranslatorSearch,
  getCloudData,
  getCloudOptions,
  getHiddenLanguagesSet,
  getTranslatorSearchForUrl,
  getTranslatorPalette,
  getVisibleTranslations,
  parseWeights,
  serializeWeights,
  createRandomWeights,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from '#/features/word-cloud/translateState'
import { getOrTranslatePhrase } from '#/lib/translate'
import type { GetOrTranslateResult } from '#/lib/translate'

function isTranslateSuccess(
  result: GetOrTranslateResult,
): result is Extract<GetOrTranslateResult, { ok: true }> {
  return result.ok
}

function shouldLoadTranslatedPhrase(search: FullTranslatorSearch): boolean {
  return Boolean(search.input.trim())
}

function mergeWeightsForTranslations(
  existingWeights: string,
  translationLangs: Iterable<string>,
): Map<string, number> {
  const existing = parseWeights(existingWeights)
  const merged = new Map(existing)
  for (const lang of translationLangs) {
    if (!merged.has(lang)) {
      merged.set(
        lang,
        Math.floor(Math.random() * WEIGHT_MAX) + WEIGHT_MIN,
      )
    }
  }
  return merged
}

type UseTranslatePageOptions = {
  resolvedSearch: FullTranslatorSearch
  onSyncToUrl: (search: Partial<TranslatorSearch>) => void
}

export function useTranslatePage({
  resolvedSearch,
  onSyncToUrl,
}: UseTranslatePageOptions) {
  const formState = resolvedSearch

  const [translations, setTranslations] = useState<Map<string, string>>(
    () => new Map(),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedPhraseRef = useRef<string | null>(null)

  const updateSearch = useCallback(
    (updates: Partial<FullTranslatorSearch>) => {
      const next = { ...resolvedSearch, ...updates }
      onSyncToUrl(getTranslatorSearchForUrl(next))
    },
    [resolvedSearch, onSyncToUrl],
  )

  useEffect(() => {
    if (!shouldLoadTranslatedPhrase(resolvedSearch)) {
      setTranslations(new Map())
      setError(null)
      loadedPhraseRef.current = null
      return
    }
    const phrase = resolvedSearch.input.trim()
    if (loadedPhraseRef.current === phrase && translations.size > 0) {
      return
    }
    loadedPhraseRef.current = phrase
    setLoading(true)
    setError(null)
    getOrTranslatePhrase({ data: { phrase } })
      .then((result) => {
        if (isTranslateSuccess(result)) {
          setTranslations(new Map(Object.entries(result.translations)))
          setError(null)
          const nextWeights = resolvedSearch.weights
            ? mergeWeightsForTranslations(
                resolvedSearch.weights,
                Object.keys(result.translations),
              )
            : createRandomWeights(Object.keys(result.translations))
          const nextHiddenLanguages = resolvedSearch.hiddenLanguages.filter(
            (lang) => result.translations[lang] !== undefined,
          )
          onSyncToUrl(
            getTranslatorSearchForUrl({
              ...resolvedSearch,
              input: phrase,
              translated: true,
              weights: serializeWeights(nextWeights),
              hiddenLanguages: nextHiddenLanguages,
            }),
          )
        } else {
          setError(result.error)
          setTranslations(new Map())
          onSyncToUrl(
            getTranslatorSearchForUrl({
              ...resolvedSearch,
              translated: false,
            }),
          )
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [resolvedSearch.input, resolvedSearch.translated, onSyncToUrl])

  const requestTranslate = useCallback(
    (phraseOverride?: string) => {
      const trimmed = (phraseOverride ?? formState.input).trim()
      if (!trimmed) {
        setError('Enter some text to translate.')
        setTranslations(new Map())
        updateSearch({ translated: false })
        return
      }
      setLoading(true)
      setError(null)
      loadedPhraseRef.current = null
      getOrTranslatePhrase({ data: { phrase: trimmed } })
      .then((result) => {
        if (isTranslateSuccess(result)) {
          setTranslations(new Map(Object.entries(result.translations)))
          setError(null)
          const nextWeights = formState.weights
            ? mergeWeightsForTranslations(
                formState.weights,
                Object.keys(result.translations),
              )
            : createRandomWeights(Object.keys(result.translations))
          const nextHiddenLanguages = formState.hiddenLanguages.filter((lang) =>
            result.translations[lang] !== undefined,
          )
          onSyncToUrl(
            getTranslatorSearchForUrl({
              ...formState,
              input: trimmed,
              translated: true,
              weights: serializeWeights(nextWeights),
              hiddenLanguages: nextHiddenLanguages,
            }),
          )
        } else {
          setError(result.error)
          setTranslations(new Map())
          onSyncToUrl(
            getTranslatorSearchForUrl({
              ...formState,
              input: trimmed,
              translated: false,
            }),
          )
        }
      })
      .finally(() => {
        setLoading(false)
      })
    },
    [formState, updateSearch, onSyncToUrl],
  )

  const hideLanguage = useCallback(
    (lang: string) => {
      if (formState.hiddenLanguages.includes(lang)) return
      const nextHidden = [...formState.hiddenLanguages, lang]
      onSyncToUrl(
        getTranslatorSearchForUrl({
          ...formState,
          hiddenLanguages: nextHidden,
        }),
      )
    },
    [formState, onSyncToUrl],
  )

  const setWeight = useCallback(
    (lang: string, value: number) => {
      const weights = parseWeights(formState.weights)
      weights.set(lang, value)
      updateSearch({ weights: serializeWeights(weights) })
    },
    [formState.weights, updateSearch],
  )

  const hiddenLanguages = useMemo(
    () => getHiddenLanguagesSet(formState),
    [formState.hiddenLanguages],
  )
  const weights = useMemo(
    () => parseWeights(formState.weights),
    [formState.weights],
  )
  const debouncedWeightsString = useDebounceValue(formState.weights, 150)
  const debouncedWeights = useMemo(
    () => parseWeights(debouncedWeightsString),
    [debouncedWeightsString],
  )
  const visibleTranslations = useMemo(
    () => getVisibleTranslations(translations, hiddenLanguages),
    [translations, hiddenLanguages],
  )
  const cloudDataRaw = useMemo(
    () =>
      getCloudData(
        formState,
        translations,
        debouncedWeights,
        hiddenLanguages,
      ),
    [
      formState.input,
      debouncedWeightsString,
      translations,
      hiddenLanguages,
      debouncedWeights,
    ],
  )
  const cloudData = cloudDataRaw
  const hasWords = cloudData.length > 0
  const palette = useMemo(
    () => getTranslatorPalette(formState.colors),
    [formState.colors],
  )
  const cloudOptions = useMemo(
    () => getCloudOptions(formState),
    [
      formState.minFontSize,
      formState.maxFontSize,
      formState.padding,
      formState.scale,
      formState.spiral,
      formState.rotationMin,
      formState.rotationMax,
      formState.rotations,
      formState.deterministic,
      formState.fontFamily,
    ],
  )

  return {
    formState,
    updateSearch,
    requestTranslate,
    hideLanguage,
    setWeight,
    loading,
    error,
    translations,
    visibleTranslations,
    weights,
    hiddenLanguages,
    cloudData,
    hasWords,
    palette,
    cloudOptions,
  }
}
