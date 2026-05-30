import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounceValue } from "#/hooks/useDebouncedValue";
import { applyPhraseTranslationResult } from "#/features/word-cloud/applyPhraseTranslationResult";
import {
	getCloudData,
	getCloudOptions,
	getHiddenLanguagesSet,
	getVisibleTranslations,
	parseWeights,
	type FullExperimentalTranslatorSearch,
	type ExperimentalTranslatorSearch,
} from "#/features/word-cloud/translateState";
import {
	getTranslatorSearchForUrl,
	getTranslatorPalette,
	serializeWeights,
} from "#/features/word-cloud/translatorSearchState";
import { getOrTranslatePhrase } from "#/lib/phraseTranslation";

function shouldLoadTranslatedPhrase(search: FullExperimentalTranslatorSearch): boolean {
	return Boolean(search.input.trim());
}

function phraseLoadKey(search: FullExperimentalTranslatorSearch, phrase: string): string {
	return `${search.sourceLanguage}:${phrase}`;
}

type UseTranslatePageOptions = {
	resolvedSearch: FullExperimentalTranslatorSearch;
	onSyncToUrl: (search: Partial<ExperimentalTranslatorSearch>) => void;
};

export function useTranslatePage({
	resolvedSearch,
	onSyncToUrl,
}: UseTranslatePageOptions) {
	const formState = resolvedSearch;

	const [translations, setTranslations] = useState<Map<string, string>>(
		() => new Map(),
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadedPhraseRef = useRef<string | null>(null);
	const requestSeqRef = useRef(0);

	const updateSearch = useCallback(
		(updates: Partial<FullExperimentalTranslatorSearch>) => {
			const next = { ...resolvedSearch, ...updates };
			onSyncToUrl(getTranslatorSearchForUrl(next));
		},
		[resolvedSearch, onSyncToUrl],
	);

	const handleTranslateResult = useCallback(
		(
			result: Awaited<ReturnType<typeof getOrTranslatePhrase>>,
			phrase: string,
			syncInputOnFailure: boolean,
		) => {
			const applied = applyPhraseTranslationResult(
				result,
				resolvedSearch,
				phrase,
				{ syncInputOnFailure },
			);
			setTranslations(applied.translations);
			setError(applied.error);
			onSyncToUrl(applied.urlPatch);
		},
		[resolvedSearch, onSyncToUrl],
	);

	useEffect(() => {
		if (!shouldLoadTranslatedPhrase(resolvedSearch)) {
			setTranslations(new Map());
			setError(null);
			loadedPhraseRef.current = null;
			return;
		}
		const phrase = resolvedSearch.input.trim();
		const loadKey = phraseLoadKey(resolvedSearch, phrase);
		if (loadedPhraseRef.current === loadKey && translations.size > 0) {
			return;
		}
		loadedPhraseRef.current = loadKey;
		const seq = ++requestSeqRef.current;
		setLoading(true);
		setError(null);
		getOrTranslatePhrase({
			data: {
				phrase,
				sourceLanguage: resolvedSearch.sourceLanguage,
			},
		})
			.then((result) => {
				if (seq !== requestSeqRef.current) return;
				handleTranslateResult(result, phrase, false);
			})
			.finally(() => {
				if (seq === requestSeqRef.current) {
					setLoading(false);
				}
			});
	}, [
		resolvedSearch.input,
		resolvedSearch.translated,
		resolvedSearch.sourceLanguage,
		onSyncToUrl,
		handleTranslateResult,
	]);

	const requestTranslate = useCallback(
		(phraseOverride?: string) => {
			const trimmed = (phraseOverride ?? formState.input).trim();
			if (!trimmed) {
				setError("Enter some text to translate.");
				setTranslations(new Map());
				updateSearch({ translated: false });
				return;
			}
			const seq = ++requestSeqRef.current;
			setLoading(true);
			setError(null);
			loadedPhraseRef.current = null;
			getOrTranslatePhrase({
				data: {
					phrase: trimmed,
					sourceLanguage: formState.sourceLanguage,
				},
			})
				.then((result) => {
					if (seq !== requestSeqRef.current) return;
					handleTranslateResult(result, trimmed, true);
				})
				.finally(() => {
					if (seq === requestSeqRef.current) {
						setLoading(false);
					}
				});
		},
		[formState, updateSearch, handleTranslateResult],
	);

	const hideLanguage = useCallback(
		(lang: string) => {
			if (formState.hiddenLanguages.includes(lang)) return;
			const nextHidden = [...formState.hiddenLanguages, lang];
			onSyncToUrl(
				getTranslatorSearchForUrl({
					...formState,
					hiddenLanguages: nextHidden,
				}),
			);
		},
		[formState, onSyncToUrl],
	);

	const setWeight = useCallback(
		(lang: string, value: number) => {
			const weights = parseWeights(formState.weights);
			weights.set(lang, value);
			updateSearch({ weights: serializeWeights(weights) });
		},
		[formState.weights, updateSearch],
	);

	const hiddenLanguages = useMemo(
		() => getHiddenLanguagesSet(formState),
		[formState.hiddenLanguages],
	);
	const weights = useMemo(
		() => parseWeights(formState.weights),
		[formState.weights],
	);
	const debouncedWeightsString = useDebounceValue(formState.weights, 150);
	const debouncedWeights = useMemo(
		() => parseWeights(debouncedWeightsString),
		[debouncedWeightsString],
	);
	const visibleTranslations = useMemo(
		() => getVisibleTranslations(translations, hiddenLanguages),
		[translations, hiddenLanguages],
	);
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
	);
	const cloudData = cloudDataRaw;
	const hasWords = cloudData.length > 0;
	const palette = useMemo(
		() => getTranslatorPalette(formState.colors),
		[formState.colors],
	);
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
	);

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
	};
}
