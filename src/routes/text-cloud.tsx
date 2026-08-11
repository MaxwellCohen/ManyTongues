import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMemo } from "react";
import { z } from "zod";
import Accordion from "#/components/shell/Accordion";
import IslandPanel from "#/components/shell/IslandPanel";
import PageHero from "#/components/layout/PageHero";
import SourceTextPanel from "#/features/word-cloud/components/SourceTextPanel";
import WordCloud2Canvas from "#/features/word-cloud/components/WordCloud2Canvas";
import WordCloud2OptionsForm from "#/features/word-cloud/components/WordCloud2OptionsForm";
import type { CloudStyleFormState } from "#/features/word-cloud/components/WordCloud2OptionsForm";
import WordCloudCanvas from "#/features/word-cloud/components/WordCloudCanvas";
import WordCloudEngineSwitch from "#/features/word-cloud/components/WordCloudEngineSwitch";
import WordCloudOptions from "#/features/word-cloud/components/WordCloudOptions";
import WordCloudPageLayout from "#/features/word-cloud/components/WordCloudPageLayout";
import WordCloudOptionCheckboxField from "#/features/word-cloud/components/option-fields/WordCloudOptionCheckboxField";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
	DEFAULT_GENERATOR_SEARCH,
	type FullGeneratorSearch,
	generatorScaleOptions,
	generatorSpiralOptions,
	getGeneratorPalette,
	getGeneratorSearchForUrl,
	resolveGeneratorSearch,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
	wordCloudEngineOptions,
} from "#/features/word-cloud/textCloudState";
import { degToRad } from "#/features/word-cloud/translationCloud2";
import { hashWordForColor } from "#/features/word-cloud/translateState";
import { isExperimentalEngine } from "#/features/word-cloud/wordCloudEngine";
import {
	DEFAULT_STOPWORDS,
	tokenizeAndCount,
} from "#/lib/wordCloudUtils";

const generatorSearchSchema = z.object({
	input: z.string().optional(),
	engine: z.enum(wordCloudEngineOptions).optional(),
	filterStopwords: booleanSearchParam.optional(),
	customExclude: csvSearchParam.optional(),
	minFontSize: z.coerce.number().int().min(1).max(200).optional(),
	maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
	padding: z.coerce.number().int().min(0).max(20).optional(),
	scale: z.enum(generatorScaleOptions).optional(),
	spiral: z.enum(generatorSpiralOptions).optional(),
	rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
	rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
	rotations: z.coerce.number().int().min(0).optional(),
	deterministic: booleanSearchParam.optional(),
	fontFamily: z.string().optional(),
	colors: csvSearchParam.optional(),
	backgroundColor: z.string().optional(),
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

export const Route = createFileRoute("/text-cloud")({
	ssr: false,
	validateSearch: zodValidator(generatorSearchSchema),
	head: () => ({
		meta: [
			{
				title: "Text Cloud | ManyTongues",
			},
			{
				name: "description",
				content:
					"Paste text, count word frequency, and build a customizable word cloud you can download as PNG.",
			},
			{
				property: "og:title",
				content: "Text Cloud | ManyTongues",
			},
			{
				property: "og:description",
				content:
					"Paste text, count word frequency, and build a customizable word cloud you can download as PNG.",
			},
		],
	}),
	component: WordCloudPage,
});

const CLOUD2_STYLE_DEFAULTS: Partial<CloudStyleFormState> = {
	backgroundColor: DEFAULT_GENERATOR_SEARCH.backgroundColor,
	cloud2Shape: DEFAULT_GENERATOR_SEARCH.cloud2Shape,
	cloud2Ellipticity: DEFAULT_GENERATOR_SEARCH.cloud2Ellipticity,
	cloud2Shuffle: DEFAULT_GENERATOR_SEARCH.cloud2Shuffle,
	cloud2RotateRatio: DEFAULT_GENERATOR_SEARCH.cloud2RotateRatio,
	cloud2Color: DEFAULT_GENERATOR_SEARCH.cloud2Color,
	cloud2GridSize: DEFAULT_GENERATOR_SEARCH.cloud2GridSize,
	cloud2MinRotation: DEFAULT_GENERATOR_SEARCH.cloud2MinRotation,
	cloud2MaxRotation: DEFAULT_GENERATOR_SEARCH.cloud2MaxRotation,
	cloud2RotationSteps: DEFAULT_GENERATOR_SEARCH.cloud2RotationSteps,
	cloud2MinSize: DEFAULT_GENERATOR_SEARCH.cloud2MinSize,
	cloud2FontWeight: DEFAULT_GENERATOR_SEARCH.cloud2FontWeight,
	colors: DEFAULT_GENERATOR_SEARCH.colors,
};

function WordCloudPage() {
	const posthog = usePostHog();
	const navigate = useNavigate({ from: "/text-cloud" });
	const searchFromUrl = Route.useSearch();
	const resolvedSearch = useMemo(
		() => resolveGeneratorSearch(searchFromUrl),
		[searchFromUrl],
	);

	const updateSearch = (updates: Partial<FullGeneratorSearch>) => {
		const next = { ...resolvedSearch, ...updates };
		navigate({
			to: "/text-cloud",
			search: getGeneratorSearchForUrl(next),
			replace: true,
			resetScroll: false,
		});
	};

	const experimental = isExperimentalEngine(resolvedSearch.engine);

	const excludeSet = useMemo(() => {
		const set = new Set<string>();
		if (resolvedSearch.filterStopwords) {
			for (const w of DEFAULT_STOPWORDS) set.add(w);
		}
		for (const w of resolvedSearch.customExclude) {
			const t = w.trim().toLowerCase();
			if (t) set.add(t);
		}
		return set.size > 0 ? set : undefined;
	}, [resolvedSearch.filterStopwords, resolvedSearch.customExclude]);

	const words = useMemo(
		() =>
			tokenizeAndCount(resolvedSearch.input, {
				exclude: excludeSet,
			}),
		[resolvedSearch.input, excludeSet],
	);
	const hasWords = words.length > 0;

	const palette = useMemo(
		() => getGeneratorPalette(resolvedSearch.colors),
		[resolvedSearch.colors],
	);

	const classicOptions = useMemo(
		() => ({
			minFontSize: resolvedSearch.minFontSize,
			maxFontSize: resolvedSearch.maxFontSize,
			padding: resolvedSearch.padding,
			scale: resolvedSearch.scale,
			spiral: resolvedSearch.spiral,
			rotationAngles: [
				resolvedSearch.rotationMin,
				resolvedSearch.rotationMax,
			] as [number, number],
			rotations: resolvedSearch.rotations,
			deterministic: resolvedSearch.deterministic,
			fontFamily: resolvedSearch.fontFamily,
			randomSeed: `${resolvedSearch.scale}-42`,
		}),
		[resolvedSearch],
	);

	const cloud2Options = useMemo(
		() => ({
			fontWeight: resolvedSearch.cloud2FontWeight,
			gridSize: resolvedSearch.cloud2GridSize,
			minRotation: degToRad(resolvedSearch.cloud2MinRotation),
			maxRotation: degToRad(resolvedSearch.cloud2MaxRotation),
			rotationSteps: resolvedSearch.cloud2RotationSteps,
			minSize: resolvedSearch.cloud2MinSize,
			shape: resolvedSearch.cloud2Shape,
			ellipticity: Math.min(
				1,
				Math.max(0, Number(resolvedSearch.cloud2Ellipticity) || 0.65),
			),
			color:
				resolvedSearch.cloud2Color === "custom"
					? (word: string) => {
							const customPalette = getGeneratorPalette(resolvedSearch.colors);
							return customPalette[hashWordForColor(word) % customPalette.length];
						}
					: resolvedSearch.cloud2Color,
			shuffle: resolvedSearch.cloud2Shuffle,
			rotateRatio: resolvedSearch.cloud2RotateRatio,
		}),
		[resolvedSearch],
	);

	const cloud2FormState: CloudStyleFormState = {
		backgroundColor: resolvedSearch.backgroundColor,
		cloud2Shape: resolvedSearch.cloud2Shape,
		cloud2Ellipticity: resolvedSearch.cloud2Ellipticity,
		cloud2Shuffle: resolvedSearch.cloud2Shuffle,
		cloud2RotateRatio: resolvedSearch.cloud2RotateRatio,
		cloud2Color: resolvedSearch.cloud2Color,
		cloud2GridSize: resolvedSearch.cloud2GridSize,
		cloud2MinRotation: resolvedSearch.cloud2MinRotation,
		cloud2MaxRotation: resolvedSearch.cloud2MaxRotation,
		cloud2RotationSteps: resolvedSearch.cloud2RotationSteps,
		cloud2MinSize: resolvedSearch.cloud2MinSize,
		cloud2FontWeight: resolvedSearch.cloud2FontWeight,
		colors: resolvedSearch.colors,
	};

	return (
		<>
			<PageHero
				kicker="Text Cloud"
				title="Build a word cloud from any text"
				description="Paste text, adjust the layout and colors, then export a clean word cloud image."
			/>

			<WordCloudPageLayout
				cloud={
					<div className="flex min-w-0 flex-col gap-3">
						<WordCloudEngineSwitch
							value={resolvedSearch.engine}
							onChange={(engine) => updateSearch({ engine })}
						/>
						{experimental ? (
							<WordCloud2Canvas
								words={words}
								backgroundColor={resolvedSearch.backgroundColor}
								mounted
								hasWords={hasWords}
								options={cloud2Options}
								downloadName={resolvedSearch.input}
							/>
						) : (
							<WordCloudCanvas
								words={words}
								palette={palette}
								backgroundColor={resolvedSearch.backgroundColor}
								mounted
								hasWords={hasWords}
								options={classicOptions}
								downloadName={resolvedSearch.input}
							/>
						)}
					</div>
				}
			>
				<div className="space-y-4">
					<SourceTextPanel
						key={resolvedSearch.input}
						defaultValue={resolvedSearch.input}
						onBlur={(value) => {
							updateSearch({ input: value });
							if (value.trim()) {
								const wordCount = value.trim().split(/\s+/).length;
								posthog?.capture("text_cloud_text_entered", {
									character_count: value.length,
									word_count: wordCount,
									engine: resolvedSearch.engine,
								});
							}
						}}
					/>

					<IslandPanel className="rounded-2xl p-5 sm:p-6">
						<Accordion title="Word filters" defaultOpen={false}>
							<div className="space-y-4 pt-1">
								<WordCloudOptionCheckboxField
									label="Exclude common words (the, of, and, a, …)"
									checked={resolvedSearch.filterStopwords}
									defaultChecked={resolvedSearch.filterStopwords}
									onChange={(checked) =>
										updateSearch({ filterStopwords: checked })
									}
									onBlur={(checked) =>
										updateSearch({ filterStopwords: checked })
									}
								/>
								<label className="block">
									<span className="mb-1 block text-xs font-medium text-sea-ink-soft">
										Also exclude (comma-separated)
									</span>
									<input
										key={`customExclude-${resolvedSearch.customExclude.join(",")}`}
										type="text"
										className="w-full rounded-lg border border-line bg-foam px-3 py-2 text-sm text-sea-ink placeholder:text-sea-ink-soft focus:border-lagoon focus:outline-none focus:ring-1 focus:ring-lagoon"
										placeholder="e.g. said, like, just"
										defaultValue={resolvedSearch.customExclude.join(", ")}
										onBlur={(e) => {
											const raw = e.target.value
												.split(",")
												.map((s) => s.trim().toLowerCase())
												.filter(Boolean);
											const prev = resolvedSearch.customExclude.join(", ");
											const next = raw.join(", ");
											if (next !== prev) updateSearch({ customExclude: raw });
										}}
									/>
								</label>
							</div>
						</Accordion>
					</IslandPanel>
				</div>

				<aside
					className="w-full shrink-0 rounded-2xl border border-line bg-foam/50 px-5 py-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
					aria-label="Word cloud options"
				>
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-sea-ink-soft">
						Cloud style
					</h2>
					{experimental ? (
						<WordCloud2OptionsForm
							formState={cloud2FormState}
							defaults={CLOUD2_STYLE_DEFAULTS}
							onUpdateSearch={updateSearch}
						/>
					) : (
						<WordCloudOptions
							formState={resolvedSearch}
							onUpdateSearch={updateSearch}
						/>
					)}
				</aside>
			</WordCloudPageLayout>
		</>
	);
}
