import { usePostHog } from "@posthog/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useMachine } from "@xstate/react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Accordion from "#/components/Accordion";
import PageHero from "#/components/PageHero";
import SourceTextPanel from "#/components/SourceTextPanel";
import WordCloudCanvas from "#/components/WordCloudCanvas";
import WordCloudOptions from "#/components/WordCloudOptions";
import {
	booleanSearchParam,
	csvSearchParam,
} from "#/features/word-cloud/searchParams";
import { createTextCloudMachine } from "#/features/word-cloud/textCloudMachine";
import {
	generatorScaleOptions,
	getGeneratorPalette,
	resolveGeneratorSearch,
} from "#/features/word-cloud/textCloudState";
import { tokenizeAndCount } from "#/lib/wordCloudUtils";
import { createXStateFormControls } from "#/lib/xstateForm";

const generatorSearchSchema = z.object({
	input: z.string().optional(),
	maxWords: z.coerce.number().int().min(1).max(1000).optional(),
	minFontSize: z.coerce.number().int().min(1).max(200).optional(),
	maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
	padding: z.coerce.number().int().min(0).max(20).optional(),
	scale: z.enum(generatorScaleOptions).optional(),
	rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
	rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
	rotations: z.coerce.number().int().min(0).max(12).optional(),
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
	const [machine] = useState(() => createTextCloudMachine(resolvedSearch));
	const [snapshot, send] = useMachine(machine);
	const formState = snapshot.context.formState;
	const { changeField, commitToUrl } =
		createXStateFormControls<typeof formState>(send);

	useEffect(() => {
		send({ type: "URL_CHANGED", search: resolvedSearch });
	}, [resolvedSearch, send]);

	useEffect(() => {
		const pendingUrlSearch = snapshot.context.pendingUrlSearch;
		if (!pendingUrlSearch) return;

		navigate({
			to: "/text-cloud",
			search: pendingUrlSearch,
			replace: true,
			resetScroll: false,
		});
		send({ type: "URL_COMMITTED" });
	}, [navigate, send, snapshot.context.pendingUrlSearch]);

	const {
		input,
		maxWords,
		minFontSize,
		maxFontSize,
		padding,
		scale,
		rotationMin,
		rotationMax,
		rotations,
		deterministic,
		fontFamily,
		colors,
		backgroundColor,
	} = formState;

	const words = useMemo(() => tokenizeAndCount(input), [input]);
	const cloudData = useMemo(() => words.slice(0, maxWords), [words, maxWords]);
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
			maxWords,
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
			maxWords,
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

			<div className="animate-rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
				<SourceTextPanel
					key={JSON.stringify(resolvedSearch)}
					defaultValue={input}
					onBlur={(value) => {
						changeField("input")(value);
						commitToUrl();
						if (value.trim()) {
							const wordCount = value.trim().split(/\s+/).length;
							posthog.capture("text_cloud_text_entered", {
								character_count: value.length,
								word_count: wordCount,
							});
						}
					}}
				/>

				<WordCloudCanvas
					words={cloudData}
					palette={palette}
					backgroundColor={backgroundColor}
					mounted
					hasWords={hasWords}
					options={cloudOptions}
				>
					<Accordion title="Cloud styling" className="mt-5">
						<WordCloudOptions formState={formState} send={send} />
					</Accordion>
				</WordCloudCanvas>
			</div>
		</>
	);
}
