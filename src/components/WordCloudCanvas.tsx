import { usePostHog } from "@posthog/react";
import { useCallback, useMemo, useRef } from "react";
import ReactWordcloud from "#/components/word-cloud";
import IslandPanel from "#/components/IslandPanel";
import { DownloadIcon } from "#/components/icons";
import { DEFAULT_BG, DEFAULT_COLORS } from "#/lib/wordCloudUtils";

/** Never pass empty colors to react-wordcloud (it reads colors[0]). */
const FALLBACK_PALETTE = DEFAULT_COLORS;

export type WordCloudOptions = {
	minFontSize: number;
	maxFontSize: number;
	padding: number;
	scale: "linear" | "sqrt" | "log";
	maxWords?: number;
	rotationAngles?: [number, number];
	rotations?: number;
	randomSeed?: string;
	/** When false, layout is random each time; when true, layout is stable for the same seed. */
	deterministic?: boolean;
	fontFamily?: string;
};

/** Approximate char width and line height so d3-cloud can place the largest phrase (it drops words that don't fit). */
const LAYOUT_WIDTH = 640;
const LAYOUT_HEIGHT = 360;
const CHAR_WIDTH_RATIO = 0.6;
const LINE_HEIGHT_RATIO = 1.2;

/** Cap max font size so the longest phrase fits in the canvas and isn't dropped by d3-cloud. */
function capMaxFontSizeForWords(
	words: { text: string; value: number }[],
	requestedMax: number,
): number {
	if (!words.length) return requestedMax;
	const maxLen = Math.max(...words.map((w) => w.text.length), 1);
	const maxByWidth = LAYOUT_WIDTH / (maxLen * CHAR_WIDTH_RATIO);
	const maxByHeight = LAYOUT_HEIGHT / LINE_HEIGHT_RATIO;
	return Math.min(requestedMax, maxByWidth, maxByHeight);
}

/** Simple hash to pick a deterministic color index from word text. */
function hashWord(text: string): number {
	let h = 0;
	for (let i = 0; i < text.length; i++) {
		h = (h << 5) - h + text.charCodeAt(i);
		h |= 0;
	}
	return Math.abs(h);
}

export default function WordCloudCanvas({
	words,
	palette,
	backgroundColor,
	mounted,
	hasWords,
	options,
	children,
}: {
	words: { text: string; value: number }[];
	palette: string[];
	backgroundColor: string;
	mounted: boolean;
	hasWords: boolean;
	options: WordCloudOptions;
	children?: React.ReactNode;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const posthog = usePostHog();

	const handleDownload = useCallback(() => {
		const container = containerRef.current;
		if (!container || !hasWords) return;

		const svg = container.querySelector("svg");
		if (!svg) return;

		const width = 640;
		const height = 360;
		const scale = 2;
		const canvas = document.createElement("canvas");
		canvas.width = width * scale;
		canvas.height = height * scale;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const bg = /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)
			? backgroundColor
			: DEFAULT_BG;
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const svgString = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			const dataUrl = canvas.toDataURL("image/png");
			const a = document.createElement("a");
			a.href = dataUrl;
			a.download = "word-cloud.png";
			a.click();
			posthog.capture("word_cloud_downloaded", {
				word_count: words.length,
				background_color: backgroundColor,
			});
		};
		img.onerror = () => URL.revokeObjectURL(url);
		img.src = url;
	}, [hasWords, backgroundColor, words.length, posthog]);

	const safePalette = palette?.length > 0 ? palette : FALLBACK_PALETTE;

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
			spiral: "archimedean",
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
		options.deterministic,
		options.randomSeed,
		options.rotationAngles,
		options.rotations,
		safePalette,
	]);

	const callbacks = useMemo(
		() => ({
			getWordColor: (word: { text: string }) => {
				const colors = safePalette;
				const i = hashWord(word.text) % colors.length;
				return colors[i] ?? colors[0];
			},
		}),
		[safePalette],
	);

	return (
		<IslandPanel className="flex min-h-80 flex-col rounded-2xl p-5 sm:p-6">
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-sea-ink">Preview</h2>
				{mounted && hasWords && (
					<button
						type="button"
						onClick={handleDownload}
						className="flex items-center gap-2 rounded-lg border border-line bg-foam px-3 py-2 text-sm font-medium text-sea-ink hover:border-lagoon hover:bg-lagoon/10 hover:text-lagoon"
					>
						<DownloadIcon className="size-4" />
						Download PNG
					</button>
				)}
			</div>
			<div
				className="relative flex-1 min-h-70 rounded-xl border border-line flex items-center justify-center"
				style={{
					backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(backgroundColor)
						? backgroundColor
						: DEFAULT_BG,
				}}
			>
				{!mounted ? (
					<p className="text-sm text-sea-ink-soft">Loading preview...</p>
				) : hasWords && Array.isArray(words) && words.length > 0 ? (
					<div
						ref={containerRef}
						className="relative h-full w-full flex items-center justify-center [&_svg]:block [&_svg]:m-auto [&_svg]:max-h-full [&_svg]:max-w-full"
						style={{ minWidth: 300, minHeight: 300 }}
					>
						<ReactWordcloud
							key={JSON.stringify(cloudOptions) + JSON.stringify(callbacks)}
							words={words}
							size={[640, 360]}
							minSize={[640, 360]}
							options={cloudOptions}
							callbacks={callbacks}
							maxWords={options.maxWords}
						/>
					</div>
				) : (
					<p className="text-sm text-sea-ink-soft">
						Add text or translations to see your word cloud preview.
					</p>
				)}
			</div>
			{children}
		</IslandPanel>
	);
}
