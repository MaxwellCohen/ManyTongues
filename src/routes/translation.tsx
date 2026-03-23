import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { startTransition, useMemo } from "react";
import { z } from "zod";
import IslandPanel from "#/components/IslandPanel";
import PageHero from "#/components/PageHero";
import TranslationsAccordion from "#/components/TranslationsAccordion";
import { TranslatorInputForm } from "#/components/TranslatorInputForm";
import WordCloud2Canvas from "#/components/WordCloud2Canvas";
import WordCloud2OptionsForm from "#/components/WordCloud2OptionsForm";
import WordCloudPageLayout from "#/components/WordCloudPageLayout";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
	DEFAULT_TRANSLATOR_SEARCH,
	deduplicateCloudDataByValue,
	getTranslatorPalette,
	hashWordForColor,
	resolveTranslatorSearch,
	type TranslatorSearch,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
	translatorScaleOptions,
	translatorSpiralOptions,
} from "#/features/word-cloud/translateState";
import { useTranslatePage } from "#/features/word-cloud/useTranslatePage";

/** Original phrase (value 12) gets max font size; translations (1–5) get 12–44px. */
function translationWeightFactor(weight: number): number {
	return weight >= 12 ? 80 : 12 + ((weight - 1) / 4) * 32;
}

/** wordcloud2.js expects rotation in radians. */
function degToRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

const translationSearchSchema = z.object({
	input: z.string().optional(),
	translated: booleanSearchParam.optional(),
	minFontSize: z.coerce.number().int().min(1).max(200).optional(),
	maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
	padding: z.coerce.number().int().min(0).max(20).optional(),
	scale: z.enum(translatorScaleOptions).optional(),
	spiral: z.enum(translatorSpiralOptions).optional(),
	rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
	rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
	rotations: z.coerce.number().int().min(0).optional(),
	deterministic: booleanSearchParam.optional(),
	fontFamily: z.string().optional(),
	backgroundColor: z.string().optional(),
	colors: csvSearchParam.optional(),
	hiddenLanguages: csvSearchParam.optional(),
	weights: z.string().optional(),
	cloud2Shape: z.enum(translatorCloud2ShapeOptions).optional(),
	cloud2Ellipticity: z.coerce.number().min(0).max(1).optional(),
	cloud2Shuffle: booleanSearchParam.optional(),
	cloud2RotateRatio: z.coerce.number().min(0).max(1).optional(),
	cloud2Color: z
		.enum(["random-dark", "random-light", "custom"])
		.optional(),
	cloud2GridSize: z.coerce.number().int().min(4).max(32).optional(),
	cloud2MinRotation: z.coerce.number().int().min(-180).max(180).optional(),
	cloud2MaxRotation: z.coerce.number().int().min(-180).max(180).optional(),
	cloud2RotationSteps: z.coerce.number().int().min(0).max(16).optional(),
	cloud2MinSize: z.coerce.number().int().min(0).max(72).optional(),
	cloud2FontWeight: z.enum(translatorCloud2FontWeightOptions).optional(),
});

export const Route = createFileRoute("/translation")({
	ssr: false,
	validateSearch: zodValidator(translationSearchSchema),
	head: () => ({
		meta: [
			{
				title: "Translation | ManyTongues",
			},
		],
	}),
	component: TranslationWordCloudPage,
});

function TranslationWordCloudPage() {
	const navigate = useNavigate({ from: "/translation" });
	const searchFromUrl = Route.useSearch();
	const resolvedSearch = useMemo(
		() => resolveTranslatorSearch(searchFromUrl),
		[searchFromUrl],
	);

	return (
		<>
			<PageHero
				kicker="Translation"
				title="Translation word cloud"
				description="Translate a phrase into multiple languages and view the results as a word cloud. Built with wordcloud2.js."
			/>

			<TranslationWordCloudContent
				resolvedSearch={resolvedSearch}
				onSyncToUrl={(search) => {
					navigate({
						to: "/translation",
						search,
						replace: true,
						resetScroll: false,
					});
				}}
			/>
		</>
	);
}

function TranslationWordCloudContent({
	resolvedSearch,
	onSyncToUrl,
}: {
	resolvedSearch: ReturnType<typeof resolveTranslatorSearch>;
	onSyncToUrl: (search: Partial<TranslatorSearch>) => void;
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
	} = useTranslatePage({
		resolvedSearch,
		onSyncToUrl,
	});

	return (
		<WordCloudPageLayout
			cloud={
				<WordCloud2Canvas
					words={deduplicateCloudDataByValue(cloudData)}
					backgroundColor={formState.backgroundColor}
					mounted
					hasWords={hasWords}
					options={{
						fontFamily: formState.fontFamily ?? "system-ui, sans-serif",
						fontWeight: formState.cloud2FontWeight ?? "normal",
						weightFactor: translationWeightFactor,
						gridSize: formState.cloud2GridSize ?? 8,
						minRotation: degToRad(formState.cloud2MinRotation ?? -90),
						maxRotation: degToRad(formState.cloud2MaxRotation ?? 90),
						rotationSteps: formState.cloud2RotationSteps ?? 0,
						minSize: formState.cloud2MinSize ?? 0,
						shape: formState.cloud2Shape ?? "circle",
						ellipticity: Math.min(1, Math.max(0, Number(formState.cloud2Ellipticity) || 0.65)),
						color:
							formState.cloud2Color === "custom"
								? (word: string) => {
										const palette = getTranslatorPalette(formState.colors);
										return palette[hashWordForColor(word) % palette.length];
									}
								: (formState.cloud2Color ?? "random-dark"),
						shuffle: formState.cloud2Shuffle ?? true,
						rotateRatio: formState.cloud2RotateRatio ?? 0.1,
					}}
				/>
			}
		>
			<IslandPanel className="rounded-2xl p-5 sm:p-6">
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sea-ink-soft">
					Enter phrase
				</h2>
				<TranslatorInputForm
					key={resolvedSearch.input ?? "empty"}
					initialInput={resolvedSearch.input ?? ""}
					loading={loading}
					error={error}
					translationCount={translations.size}
					onTranslate={(input: string) => {
						updateSearch({ input });
						requestTranslate(input);
					}}
					onBlur={(input: string) => {
						const inputChanged = input !== formState.input;
						updateSearch(
							inputChanged ? { input, translated: false } : { input },
						);
					}}
				/>
			</IslandPanel>

			<IslandPanel className="rounded-2xl p-5 sm:p-6">
				{translations.size > 0 ? (
					<TranslationsAccordion
						visibleTranslations={visibleTranslations}
						weights={weights}
						onWeightChange={setWeight}
						onRemoveLanguage={(lang) => {
							posthog.capture("translation_language_removed", {
								language: lang,
								remaining_languages: visibleTranslations.length - 1,
								page: "translation",
							});
							startTransition(() => hideLanguage(lang));
						}}
						onBlur={() => {}}
						defaultOpen
					/>
				) : (
					<div className="rounded-xl border border-line bg-foam/50 px-4 py-6 text-center">
						<p className="text-sm text-sea-ink-soft">
							Translate a phrase above to see languages and adjust weights
							for the cloud.
						</p>
					</div>
				)}
			</IslandPanel>

			<aside
				className="w-full shrink-0 rounded-2xl border border-line bg-foam/50 px-5 py-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
				aria-label="Word cloud options"
			>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sea-ink-soft">
					Cloud style
				</h2>
				<WordCloud2OptionsForm
					formState={formState}
					defaults={CLOUD_STYLE_DEFAULTS}
					onUpdateSearch={updateSearch}
				/>
			</aside>
		</WordCloudPageLayout>
	);
}

const CLOUD_STYLE_DEFAULTS: Partial<TranslatorSearch> = {
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
