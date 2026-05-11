import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMemo } from "react";
import { z } from "zod";
import Accordion from "#/components/shell/Accordion";
import IslandPanel from "#/components/shell/IslandPanel";
import PageHero from "#/components/layout/PageHero";
import SourceTextPanel from "#/features/word-cloud/components/SourceTextPanel";
import WordCloudCanvas from "#/features/word-cloud/components/WordCloudCanvas";
import WordCloudOptions from "#/features/word-cloud/components/WordCloudOptions";
import WordCloudPageLayout from "#/features/word-cloud/components/WordCloudPageLayout";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import {
	type FullGeneratorSearch,
	generatorScaleOptions,
	generatorSpiralOptions,
	getGeneratorPalette,
	getGeneratorSearchForUrl,
	resolveGeneratorSearch,
} from "#/features/word-cloud/textCloudState";
import { tokenizeAndCount } from "#/lib/wordCloudUtils";

const generatorSearchSchema = z.object({
	input: z.string().optional(),
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
});

export const Route = createFileRoute("/text-cloud")({
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

	const {
		input,
		minFontSize,
		maxFontSize,
		padding,
		scale,
		spiral,
		rotationMin,
		rotationMax,
		rotations,
		deterministic,
		fontFamily,
		colors,
		backgroundColor,
	} = resolvedSearch;

	const words = useMemo(() => tokenizeAndCount(input), [input]);
	const cloudData = words;
	const hasWords = words.length > 0;
	const rotationAngles = useMemo(
		() => [rotationMin, rotationMax] as [number, number],
		[rotationMin, rotationMax],
	);

	const palette = useMemo(() => getGeneratorPalette(colors), [colors]);

	const cloudOptions = useMemo(
		() => ({
			minFontSize,
			maxFontSize,
			padding,
			scale,
			spiral,
			rotationAngles,
			rotations,
			deterministic,
			fontFamily,
			randomSeed: `${scale}-42`,
		}),
		[
			minFontSize,
			maxFontSize,
			padding,
			scale,
			spiral,
			rotationAngles,
			rotations,
			deterministic,
			fontFamily,
		],
	);

	return (
		<>
			<PageHero
				kicker="Text Cloud"
				title="Build a word cloud from any text"
				description="Paste text, adjust the layout and colors, then export a clean word cloud image."
			/>

			<WordCloudPageLayout
				cloud={
					<WordCloudCanvas
						words={cloudData}
						palette={palette}
						backgroundColor={backgroundColor}
						mounted
						hasWords={hasWords}
						options={cloudOptions}
						downloadName={input}
					/>
				}
			>
				<SourceTextPanel
					key={JSON.stringify(resolvedSearch)}
					defaultValue={input}
					onBlur={(value) => {
						updateSearch({ input: value });
						if (value.trim()) {
							const wordCount = value.trim().split(/\s+/).length;
							posthog.capture("text_cloud_text_entered", {
								character_count: value.length,
								word_count: wordCount,
							});
						}
					}}
				/>

				<IslandPanel className="rounded-2xl p-5 sm:p-6">
					<Accordion title="Cloud styling" defaultOpen={false}>
						<WordCloudOptions
							formState={resolvedSearch}
							onUpdateSearch={updateSearch}
						/>
					</Accordion>
				</IslandPanel>
			</WordCloudPageLayout>
		</>
	);
}
