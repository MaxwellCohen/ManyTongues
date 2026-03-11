import { useMachine } from '@xstate/react'
import { useEffect, useMemo, useState } from 'react'
import { useDebounceValue } from '#/hooks/useDebouncedValue'
import { createTranslateMachine } from '#/features/word-cloud/translateMachine'
import {
  type FullTranslatorSearch,
  type TranslatorSearch,
  getCloudData,
  getCloudOptions,
  getHiddenLanguagesSet,
  getTranslatorPalette,
  getVisibleTranslations,
  parseWeights,
} from '#/features/word-cloud/translateState'
import { getOrTranslatePhrase } from '#/lib/translate'
import { createXStateFormControls } from '#/lib/xstateForm'

type UseTranslatePageOptions = {
  resolvedSearch: FullTranslatorSearch
  onSyncToUrl: (search: Partial<TranslatorSearch>) => void
}

export function useTranslatePage({
  resolvedSearch,
  onSyncToUrl,
}: UseTranslatePageOptions) {
  const [machine] = useState(() =>
    createTranslateMachine({
      initialSearch: resolvedSearch,
      translatePhrase: (phrase) =>
        getOrTranslatePhrase({ data: { phrase } }),
      syncToUrl: (search) => onSyncToUrl(search),
    }),
  )
  const [snapshot, send] = useMachine(machine)
  const formState = snapshot.context.formState
  const { updateFields, commitToUrl } =
    createXStateFormControls<typeof formState>(send)

  useEffect(() => {
    if (JSON.stringify(resolvedSearch) === JSON.stringify(formState)) return
    send({ type: 'URL_CHANGED', search: resolvedSearch })
  }, [resolvedSearch, formState, send])

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
  const translations = snapshot.context.translations
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
      formState.translated,
      debouncedWeightsString,
      translations,
      hiddenLanguages,
      debouncedWeights,
    ],
  )
  const cloudData = formState.translated ? cloudDataRaw : []
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
      formState.rotationMin,
      formState.rotationMax,
      formState.rotations,
      formState.deterministic,
      formState.fontFamily,
    ],
  )

  return {
    formState,
    send,
    updateFields,
    commitToUrl,
    loading: snapshot.value === 'translating',
    error: snapshot.context.error,
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
