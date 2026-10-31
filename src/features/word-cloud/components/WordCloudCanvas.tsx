import { useCallback, useMemo, useRef } from "react";
import { DownloadIcon } from "#/components/icons";
import ReactWordcloud from "#/features/word-cloud/components/cloud-render";
import {
	NEON_EXPORT_BUTTON_CLASS,
	NEON_SCREEN_CLASS,
	NeonHud,
} from "#/features/word-cloud/components/neon";
import { downloadWordCloudPng } from "#/features/word-cloud/wordCloudExport";
import {
	capMaxFontSizeForWords,
	WORD_CLOUD_LAYOUT_HEIGHT,
	WORD_CLOUD_LAYOUT_WIDTH,
} from "#/features/word-cloud/wordCloudViewport";
import { usePostHog } from "#/lib/analytics";
import { DEFAULT_BG, DEFAULT_COLORS } from "#/lib/wordCloudUtils";

/** Never pass empty colors to react-wordcloud (it reads colors[0]). */
const FALLBACK_PALETTE = DEFAULT_COLORS;

type WordCloudOptions = {
	minFontSize: number;
	maxFontSize: number;
	padding: number;
	scale: "linear" | "sqrt" | "log";
	spiral?: "archimedean" | "rectangular";
	rotationAngles?: [number, number];
	rotations?: number;
	randomSeed?: string;
	/** When false, layout is random each time; when true, layout is stable for the same seed. */
	deterministic?: boolean;
	fontFamily?: string;
};

/** Stable key so only phrase/language set changes remount; weight/option updates re-layout in place. */
function wordsKey(words: { text: string; value: number }[]): string {
	if (!words.length) return "empty";
	const texts = words
		.map((w) => w.text)
		.slice()
		.sort((a, b) => a.localeCompare(b));
	return texts.join("|");
}

export default function WordCloudCanvas({
	words,
	palette,
	backgroundColor,
	mounted,
	hasWords,
	options,
	downloadName,
	prompt,
	children,
}: {
	words: { text: string; value: number }[];
	palette: string[];
	backgroundColor: string;
	mounted: boolean;
	hasWords: boolean;
	options: WordCloudOptions;
	/** Stem used for the downloaded PNG filename (e.g. "hello-world"). Falls back to "word-cloud". */
	downloadName?: string;
	/** Optional prompt bar rendered at the top of the cloud screen. */
	prompt?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const posthog = usePostHog();

	const handleDownload = useCallback(() => {
		const container = containerRef.current;
		if (!container || !hasWords) return;

		const svg = container.querySelector("svg");
		if (!svg) return;

		downloadWordCloudPng({
			svg,
			backgroundColor,
			downloadName,
			onDownloaded: () => {
				posthog.capture("word_cloud_downloaded", {
					word_count: words.length,
					background_color: backgroundColor,
				});
			},
		});
	}, [hasWords, backgroundColor, words.length, posthog, downloadName]);

	const safePalette = palette?.length > 0 ? palette : FALLBACK_PALETTE;

	const accessibilitySummary = useMemo(() => {
		if (!hasWords || words.length === 0) {
			return "Word cloud preview is empty.";
		}
		const sample = words
			.slice()
			.sort((a, b) => b.value - a.value)
			.slice(0, 12)
			.map((w) => w.text);
		return `Word cloud with ${words.length} items. Largest terms include: ${sample.join(", ")}.`;
	}, [hasWords, words]);

	const cloudOptions = useMemo(() => {
		const cappedMax = capMaxFontSizeForWords(words, options.maxFontSize);
		const fontSizes: [number, number] = [
			Math.min(options.minFontSize, cappedMax),
			cappedMax,
		];
		return {
			fontSizes,
			fontFamily: options.fontFamily ?? "system-ui",
			padding: options.padding,
			scale: options.scale,
			spiral: options.spiral ?? "archimedean",
			deterministic: options.deterministic ?? true,
			randomSeed: options.randomSeed ?? "wordcloud",
			enableTooltip: false,
			rotationAngles: options.rotationAngles ?? ([-90, 0] as [number, number]),
			rotations: options.rotations ?? 3,
			colors: safePalette,
		} as Parameters<typeof ReactWordcloud>[0]["options"];
	}, [
		words,
		options.minFontSize,
		options.maxFontSize,
		options.fontFamily,
		options.padding,
		options.scale,
		options.spiral,
		options.deterministic,
		options.randomSeed,
		options.rotationAngles,
		options.rotations,
		safePalette,
	]);

	return (
		<section className={NEON_SCREEN_CLASS} aria-label="Word cloud preview">
			{prompt ? (
				<div className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-6">{prompt}</div>
			) : null}
			<div
				className="relative m-4 flex h-[340px] items-center justify-center overflow-hidden rounded-[20px] sm:m-6 sm:h-[440px] lg:h-[520px]"
				style={{
					backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)
						? backgroundColor
						: DEFAULT_BG,
				}}
			>
				{!mounted ? (
					<p className="font-mono text-sm text-muted-ink">
						&gt; Loading preview...
					</p>
				) : hasWords && Array.isArray(words) && words.length > 0 ? (
					<div
						ref={containerRef}
						role="img"
						aria-label={accessibilitySummary}
						className="relative flex h-full w-full items-center justify-center [&_svg]:m-auto [&_svg]:block [&_svg]:max-h-full [&_svg]:max-w-full"
					>
						<ul className="sr-only">
							{words.map((w, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static screen-reader list; words may repeat
								<li key={`${i}-${w.text}`}>{w.text}</li>
							))}
						</ul>
						<ReactWordcloud
							key={wordsKey(words)}
							words={words}
							minSize={[WORD_CLOUD_LAYOUT_WIDTH, WORD_CLOUD_LAYOUT_HEIGHT]}
							options={cloudOptions}
						/>
					</div>
				) : (
					<p className="max-w-sm px-6 text-center font-mono text-sm text-muted-ink">
						&gt; Add text or translations to see your word cloud preview.
					</p>
				)}
			</div>
			<NeonHud
				wordCount={mounted && hasWords ? words.length : null}
				engine="classic"
			>
				{mounted && hasWords && (
					<button
						type="button"
						onClick={handleDownload}
						className={NEON_EXPORT_BUTTON_CLASS}
					>
						<DownloadIcon className="size-4" />
						Download PNG
					</button>
				)}
			</NeonHud>
			{children}
		</section>
	);
}
