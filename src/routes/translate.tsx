import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { startTransition, useMemo } from "react";
import { z } from "zod";
import Accordion from "#/components/Accordion";
import IslandPanel from "#/components/IslandPanel";
import PageHero from "#/components/PageHero";
import TranslationsAccordion from "#/components/TranslationsAccordion";
import { TranslatorInputForm } from "#/components/TranslatorInputForm";
import WordCloudCanvas from "#/components/WordCloudCanvas";
import WordCloudOptions from "#/components/WordCloudOptions";
import WordCloudPageLayout from "#/components/WordCloudPageLayout";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import { translatorSourceLanguageRouteSchema } from "#/lib/translatorSourceLanguages";
import {
	resolveTranslatorSearch,
	type TranslatorSearch,
	translatorScaleOptions,
	translatorSpiralOptions,
} from "#/features/word-cloud/translateState";
import { useTranslatePage } from "#/features/word-cloud/useTranslatePage";

const translatorSearchSchema = z.object({
	input: z.string().optional(),
	sourceLanguage: translatorSourceLanguageRouteSchema,
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
});

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

function TranslatorWordCloudContent({
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
		palette,
		cloudOptions,
	} = useTranslatePage({
		resolvedSearch,
		onSyncToUrl,
	});

	return (
		<WordCloudPageLayout
			cloud={
				<WordCloudCanvas
					words={cloudData}
					palette={palette}
					backgroundColor={formState.backgroundColor}
					mounted
					hasWords={hasWords}
					options={cloudOptions}
				/>
			}
		>
			<IslandPanel className="space-y-5 rounded-2xl p-5 sm:p-6">
				<Accordion title="Phrase" defaultOpen>
					<TranslatorInputForm
						key={`${resolvedSearch.sourceLanguage}-${resolvedSearch.input ?? "empty"}`}
						initialInput={resolvedSearch.input ?? ""}
						sourceLanguage={resolvedSearch.sourceLanguage}
						loading={loading}
						error={error}
						translationCount={translations.size}
						onSourceLanguageChange={(sourceLanguage) => {
							updateSearch({ sourceLanguage, translated: false });
						}}
						onTranslate={(input: string) => {
							updateSearch({ input });
							requestTranslate(input);
						}}
						onBlur={(input: string) => {
							updateSearch({ input, translated: false });
						}}
						onRetry={() => requestTranslate()}
					/>
				</Accordion>

				{translations.size > 0 && (
					<TranslationsAccordion
						visibleTranslations={visibleTranslations}
						weights={weights}
						onWeightChange={setWeight}
						onRemoveLanguage={(lang) => {
							posthog.capture("translation_language_removed", {
								language: lang,
								remaining_languages: visibleTranslations.length - 1,
							});
							startTransition(() => hideLanguage(lang));
						}}
						onBlur={() => {}}
					/>
				)}
			</IslandPanel>

			<IslandPanel className="rounded-2xl p-5 sm:p-6">
				<Accordion title="Cloud styling" defaultOpen={false}>
					<WordCloudOptions
						formState={formState}
						onUpdateSearch={updateSearch}
					/>
				</Accordion>
			</IslandPanel>
		</WordCloudPageLayout>
	);
}
