import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { startTransition, useMemo } from "react";
import PageHero from "#/components/layout/PageHero";
import { NeonCard } from "#/features/word-cloud/components/neon";
import TranslationsAccordion from "#/features/word-cloud/components/TranslationsAccordion";
import { TranslatorInputForm } from "#/features/word-cloud/components/TranslatorInputForm";
import WordCloud2Canvas from "#/features/word-cloud/components/WordCloud2Canvas";
import WordCloud2OptionsForm from "#/features/word-cloud/components/WordCloud2OptionsForm";
import WordCloudCanvas from "#/features/word-cloud/components/WordCloudCanvas";
import WordCloudEngineSwitch from "#/features/word-cloud/components/WordCloudEngineSwitch";
import WordCloudOptions from "#/features/word-cloud/components/WordCloudOptions";
import WordCloudPageLayout from "#/features/word-cloud/components/WordCloudPageLayout";
import {
	DEFAULT_TRANSLATOR_SEARCH,
	deduplicateCloudDataByValue,
	type ExperimentalTranslatorSearch,
	type FullExperimentalTranslatorSearch,
	resolveTranslatorSearch,
} from "#/features/word-cloud/translateState";
import {
	buildTranslationPageWordCloudOptions,
	makeTranslationWeightFactor,
} from "#/features/word-cloud/translationCloud2";
import { translatorSearchSchema } from "#/features/word-cloud/translatorSearchSchema";
import { useTranslatePage } from "#/features/word-cloud/useTranslatePage";
import { isExperimentalEngine } from "#/features/word-cloud/wordCloudEngine";

export const Route = createFileRoute("/translate")({
	ssr: false,
	validateSearch: zodValidator(translatorSearchSchema),
	head: () => ({
		meta: [
			{
				title: "Translate | ManyTongues",
			},
			{
				name: "description",
				content:
					"Translate a short phrase into many languages and compare the results in a customizable word cloud.",
			},
			{
				property: "og:title",
				content: "Translate | ManyTongues",
			},
			{
				property: "og:description",
				content:
					"Translate a short phrase into many languages and compare the results in a customizable word cloud.",
			},
		],
	}),
	component: TranslatorWordCloudPage,
});

const CLOUD2_STYLE_DEFAULTS: Partial<ExperimentalTranslatorSearch> = {
	backgroundColor: DEFAULT_TRANSLATOR_SEARCH.backgroundColor,
	cloud2Shape: DEFAULT_TRANSLATOR_SEARCH.cloud2Shape,
	cloud2Ellipticity: DEFAULT_TRANSLATOR_SEARCH.cloud2Ellipticity,
	cloud2Shuffle: DEFAULT_TRANSLATOR_SEARCH.cloud2Shuffle,
	cloud2RotateRatio: DEFAULT_TRANSLATOR_SEARCH.cloud2RotateRatio,
	cloud2Color: DEFAULT_TRANSLATOR_SEARCH.cloud2Color,
	cloud2GridSize: DEFAULT_TRANSLATOR_SEARCH.cloud2GridSize,
	cloud2MinRotation: DEFAULT_TRANSLATOR_SEARCH.cloud2MinRotation,
	cloud2MaxRotation: DEFAULT_TRANSLATOR_SEARCH.cloud2MaxRotation,
	cloud2RotationSteps: DEFAULT_TRANSLATOR_SEARCH.cloud2RotationSteps,
	cloud2MinSize: DEFAULT_TRANSLATOR_SEARCH.cloud2MinSize,
	cloud2FontWeight: DEFAULT_TRANSLATOR_SEARCH.cloud2FontWeight,
	colors: DEFAULT_TRANSLATOR_SEARCH.colors,
};

function TranslatorWordCloudPage() {
	const navigate = useNavigate({ from: "/translate" });
	const searchFromUrl = Route.useSearch();
	const resolvedSearch = useMemo(
		() => resolveTranslatorSearch(searchFromUrl),
		[searchFromUrl],
	);

	return (
		<>
			<PageHero
				kicker="Translate"
				title="Translate one phrase into a word cloud"
				description="Compare a short phrase across multiple languages, then adjust the cloud to highlight the translations that matter most."
			/>

			<TranslatorWordCloudContent
				resolvedSearch={resolvedSearch}
				onSyncToUrl={(search) => {
					navigate({
						to: "/translate",
						search,
						replace: true,
						resetScroll: false,
					});
				}}
			/>
		</>
	);
}

function TranslationSourcePhraseBanner({ phrase }: { phrase: string }) {
	if (!phrase) return null;
	return (
		<p className="min-w-0 truncate font-mono text-xs text-muted-ink">
			<span className="text-neon-pink">src:</span>{" "}
			<span className="text-sea-ink" title={phrase}>
				{phrase}
			</span>
		</p>
	);
}

function TranslatorPhraseInputPanel({
	resolvedSearch,
	loading,
	error,
	translationCount,
	formInput,
	updateSearch,
	requestTranslate,
	onRetry,
}: {
	resolvedSearch: FullExperimentalTranslatorSearch;
	loading: boolean;
	error: string | null;
	translationCount: number;
	formInput: string;
	updateSearch: ReturnType<typeof useTranslatePage>["updateSearch"];
	requestTranslate: ReturnType<typeof useTranslatePage>["requestTranslate"];
	onRetry: () => void;
}) {
	return (
		<div>
			<h2 className="sr-only">Enter phrase</h2>
			<TranslatorInputForm
				key={`${resolvedSearch.sourceLanguage}-${resolvedSearch.input ?? "empty"}`}
				initialInput={resolvedSearch.input ?? ""}
				sourceLanguage={resolvedSearch.sourceLanguage}
				loading={loading}
				error={error}
				translationCount={translationCount}
				onSourceLanguageChange={(sourceLanguage) => {
					updateSearch({ sourceLanguage, translated: false });
				}}
				onTranslate={(input: string) => {
					updateSearch({ input });
					requestTranslate(input);
				}}
				onBlur={(input: string) => {
					const inputChanged = input !== formInput;
					updateSearch(inputChanged ? { input, translated: false } : { input });
				}}
				onRetry={onRetry}
			/>
		</div>
	);
}

function TranslatorLanguagesPanel({
	translationCount,
	visibleTranslations,
	weights,
	setWeight,
	onRemoveLanguage,
}: {
	translationCount: number;
	visibleTranslations: [string, string][];
	weights: Map<string, number>;
	setWeight: ReturnType<typeof useTranslatePage>["setWeight"];
	onRemoveLanguage: (lang: string) => void;
}) {
	return (
		<NeonCard title="Weights">
			{translationCount > 0 ? (
				<TranslationsAccordion
					visibleTranslations={visibleTranslations}
					weights={weights}
					onWeightChange={setWeight}
					onRemoveLanguage={onRemoveLanguage}
					onBlur={() => {}}
					defaultOpen
				/>
			) : (
				<p className="rounded-xl border border-dashed border-white/12 px-4 py-5 text-center font-mono text-xs leading-relaxed text-muted-ink">
					Translate a phrase above to see languages and adjust weights for the
					cloud.
				</p>
			)}
		</NeonCard>
	);
}

function TranslatorCloudStyleAside({
	experimental,
	formState,
	onUpdateSearch,
}: {
	experimental: boolean;
	formState: FullExperimentalTranslatorSearch;
	onUpdateSearch: ReturnType<typeof useTranslatePage>["updateSearch"];
}) {
	return (
		<NeonCard as="aside" title="Cloud style" aria-label="Word cloud options">
			{experimental ? (
				<WordCloud2OptionsForm
					formState={formState}
					defaults={CLOUD2_STYLE_DEFAULTS}
					onUpdateSearch={onUpdateSearch}
				/>
			) : (
				<WordCloudOptions
					formState={formState}
					onUpdateSearch={onUpdateSearch}
				/>
			)}
		</NeonCard>
	);
}

function TranslatorWordCloudContent({
	resolvedSearch,
	onSyncToUrl,
}: {
	resolvedSearch: ReturnType<typeof resolveTranslatorSearch>;
	onSyncToUrl: (search: Partial<ExperimentalTranslatorSearch>) => void;
}) {
	const posthog = usePostHog();
	const {
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
		cloudData,
		hasWords,
		palette,
		cloudOptions,
	} = useTranslatePage({
		resolvedSearch,
		onSyncToUrl,
	});

	const experimental = isExperimentalEngine(formState.engine);

	const translationWeightFactor = useMemo(
		() => makeTranslationWeightFactor(formState.input),
		[formState.input],
	);

	const wordCloud2Options = useMemo(
		() =>
			buildTranslationPageWordCloudOptions(formState, translationWeightFactor),
		[formState, translationWeightFactor],
	);

	const phraseForDisplay = formState.input.trim();

	const handleRemoveLanguage = (lang: string) => {
		posthog.capture("translation_language_removed", {
			language: lang,
			remaining_languages: visibleTranslations.length - 1,
			engine: formState.engine,
		});
		startTransition(() => hideLanguage(lang));
	};

	const phrasePrompt = (
		<TranslatorPhraseInputPanel
			resolvedSearch={resolvedSearch}
			loading={loading}
			error={error}
			translationCount={translations.size}
			formInput={formState.input}
			updateSearch={updateSearch}
			requestTranslate={requestTranslate}
			onRetry={() => requestTranslate()}
		/>
	);

	return (
		<WordCloudPageLayout
			cloud={
				<div className="flex min-w-0 flex-col gap-3">
					<div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
						<WordCloudEngineSwitch
							value={formState.engine}
							onChange={(engine) => updateSearch({ engine })}
						/>
						<TranslationSourcePhraseBanner phrase={phraseForDisplay} />
					</div>
					{experimental ? (
						<WordCloud2Canvas
							words={deduplicateCloudDataByValue(cloudData)}
							backgroundColor={formState.backgroundColor}
							mounted
							hasWords={hasWords}
							options={wordCloud2Options}
							downloadName={phraseForDisplay}
							prompt={phrasePrompt}
						/>
					) : (
						<WordCloudCanvas
							words={cloudData}
							palette={palette}
							backgroundColor={formState.backgroundColor}
							mounted
							hasWords={hasWords}
							options={cloudOptions}
							downloadName={phraseForDisplay}
							prompt={phrasePrompt}
						/>
					)}
				</div>
			}
		>
			<TranslatorLanguagesPanel
				translationCount={translations.size}
				visibleTranslations={visibleTranslations}
				weights={weights}
				setWeight={setWeight}
				onRemoveLanguage={handleRemoveLanguage}
			/>
			<TranslatorCloudStyleAside
				experimental={experimental}
				formState={formState}
				onUpdateSearch={updateSearch}
			/>
		</WordCloudPageLayout>
	);
}
