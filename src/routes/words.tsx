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
import WordCloudPageLayout from "#/features/word-cloud/components/WordCloudPageLayout";
import WordCloudOptionCheckboxField from "#/features/word-cloud/components/option-fields/WordCloudOptionCheckboxField";
import WordCloud2OptionsForm from "#/features/word-cloud/components/WordCloud2OptionsForm";
import type { CloudStyleFormState } from "#/features/word-cloud/components/WordCloud2OptionsForm";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
	DEFAULT_TRANSLATOR_SEARCH,
	getTranslatorPalette,
	hashWordForColor,
	resolveWordsSearch,
	type FullWordsSearch,
	getWordsSearchForUrl,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
} from "#/features/word-cloud/wordsState";
import {
	DEFAULT_BG,
	DEFAULT_STOPWORDS,
	tokenizeAndCount,
} from "#/lib/wordCloudUtils";

const wordsSearchSchema = z.object({
	input: z.string().optional(),
	filterStopwords: booleanSearchParam.optional(),
	customExclude: csvSearchParam.optional(),
	backgroundColor: z.string().optional(),
	colors: csvSearchParam.optional(),
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

export const Route = createFileRoute("/words")({
	ssr: false,
	validateSearch: zodValidator(wordsSearchSchema),
	head: () => ({
		meta: [
			{
				title: "Words (experimental) | ManyTongues",
			},
			{
				name: "description",
				content:
					"Experimental wordcloud2.js text cloud. The main Text Cloud tool uses react-wordcloud.",
			},
			{
				property: "og:title",
				content: "Words (experimental) | ManyTongues",
			},
			{
				property: "og:description",
				content:
					"Experimental wordcloud2.js text cloud. Prefer Text Cloud for the default experience.",
			},
		],
	}),
	component: WordsPage,
});

function degToRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

function WordsPage() {
	const posthog = usePostHog();
	const navigate = useNavigate({ from: "/words" });
	const searchFromUrl = Route.useSearch();
	const resolvedSearch = useMemo(
		() => resolveWordsSearch(searchFromUrl),
		[searchFromUrl],
	);

	const updateSearch = (updates: Partial<FullWordsSearch>) => {
		const next = { ...resolvedSearch, ...updates };
		navigate({
			to: "/words",
			search: getWordsSearchForUrl(next),
			replace: true,
			resetScroll: false,
		});
	};

	const excludeSet = useMemo(() => {
		const set = new Set<string>()
		if (resolvedSearch.filterStopwords) {
			for (const w of DEFAULT_STOPWORDS) set.add(w)
		}
		for (const w of resolvedSearch.customExclude ?? []) {
			const t = w.trim().toLowerCase()
			if (t) set.add(t)
		}
		return set.size > 0 ? set : undefined
	}, [resolvedSearch.filterStopwords, resolvedSearch.customExclude])

	const words = useMemo(
		() =>
			tokenizeAndCount(resolvedSearch.input ?? "", {
				exclude: excludeSet,
			}),
		[resolvedSearch.input, excludeSet],
	)
	const hasWords = words.length > 0

	const cloudOptions = useMemo(
		() => ({
			fontWeight: resolvedSearch.cloud2FontWeight ?? "normal",
			gridSize: resolvedSearch.cloud2GridSize ?? 8,
			minRotation: degToRad(resolvedSearch.cloud2MinRotation ?? -90),
			maxRotation: degToRad(resolvedSearch.cloud2MaxRotation ?? 90),
			rotationSteps: resolvedSearch.cloud2RotationSteps ?? 0,
			minSize: resolvedSearch.cloud2MinSize ?? 0,
			shape: resolvedSearch.cloud2Shape ?? "circle",
			ellipticity: Math.min(
				1,
				Math.max(0, Number(resolvedSearch.cloud2Ellipticity) ?? 0.65),
			),
			color:
				resolvedSearch.cloud2Color === "custom"
					? (word: string) => {
							const palette = getTranslatorPalette(resolvedSearch.colors);
							return palette[hashWordForColor(word) % palette.length];
						}
					: (resolvedSearch.cloud2Color ?? "random-dark"),
			shuffle: resolvedSearch.cloud2Shuffle ?? true,
			rotateRatio: resolvedSearch.cloud2RotateRatio ?? 0.1,
		}),
		[resolvedSearch],
	);

	const formState: CloudStyleFormState = {
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
				kicker="Words"
				title="Word cloud from your text"
				description="Paste text and see word frequency as a word cloud. Built with wordcloud2.js."
			/>

			<WordCloudPageLayout
				cloud={
					<WordCloud2Canvas
						words={words}
						backgroundColor={resolvedSearch.backgroundColor}
						mounted
						hasWords={hasWords}
						options={cloudOptions}
						downloadName={resolvedSearch.input}
					/>
				}
			>
				<div className="space-y-4">
					<SourceTextPanel
						key={resolvedSearch.input ?? "empty"}
						defaultValue={resolvedSearch.input ?? ""}
						onBlur={(value) => {
							updateSearch({ input: value });
							if (value.trim()) {
								const wordCount = value.trim().split(/\s+/).length;
								posthog?.capture("words_cloud_text_entered", {
									character_count: value.length,
									word_count: wordCount,
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
										key={`customExclude-${(resolvedSearch.customExclude ?? []).join(",")}`}
										type="text"
										className="w-full rounded-lg border border-line bg-foam px-3 py-2 text-sm text-sea-ink placeholder:text-sea-ink-soft focus:border-lagoon focus:outline-none focus:ring-1 focus:ring-lagoon"
										placeholder="e.g. said, like, just"
										defaultValue={(resolvedSearch.customExclude ?? []).join(", ")}
										onBlur={(e) => {
											const raw = e.target.value
												.split(",")
												.map((s) => s.trim().toLowerCase())
												.filter(Boolean);
											const prev =
												(resolvedSearch.customExclude ?? []).join(", ");
											const next = raw.join(", ");
											if (next !== prev)
												updateSearch({ customExclude: raw });
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
					<WordCloud2OptionsForm
						formState={formState}
						defaults={WORDS_CLOUD_DEFAULTS}
						onUpdateSearch={updateSearch}
					/>
				</aside>
			</WordCloudPageLayout>
		</>
	);
}

const WORDS_CLOUD_DEFAULTS: Partial<CloudStyleFormState> = {
	backgroundColor: DEFAULT_BG,
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
