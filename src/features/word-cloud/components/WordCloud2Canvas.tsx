import { usePostHog } from "@posthog/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DownloadIcon } from "#/components/icons";
import {
	NEON_EXPORT_BUTTON_CLASS,
	NEON_SCREEN_CLASS,
	NeonHud,
} from "#/features/word-cloud/components/neon";
import { DEFAULT_BG } from "#/lib/wordCloudUtils";

const FALLBACK_WIDTH = 640;
const FALLBACK_HEIGHT = 360;
const HEIGHT_RATIO = 0.65;

type WordCloud2Shape =
	| "circle"
	| "cardioid"
	| "diamond"
	| "square"
	| "triangle-forward"
	| "triangle"
	| "pentagon"
	| "star";

export type WordCloud2Options = {
	backgroundColor?: string;
	fontFamily?: string;
	/** wordcloud2.js fontWeight: normal, bold, or CSS weight. */
	fontWeight?: string;
	/** Multiplier or function from weight to font size in px (wordcloud2.js weightFactor). */
	weightFactor?: number | ((weight: number) => number);
	/** wordcloud2.js gridSize: grid in px, larger = bigger gap between words. */
	gridSize?: number;
	/** wordcloud2.js minRotation/maxRotation in radians. */
	minRotation?: number;
	maxRotation?: number;
	/** wordcloud2.js rotationSteps: number of angles (0 = random). */
	rotationSteps?: number;
	/** wordcloud2.js minSize: minimum font size to draw (0 = disable). */
	minSize?: number;
	/** wordcloud2.js shape (default: circle). */
	shape?: WordCloud2Shape;
	/** wordcloud2.js ellipticity (default: 0.65). */
	ellipticity?: number;
	/** wordcloud2.js shuffle (default: true). */
	shuffle?: boolean;
	/** wordcloud2.js rotateRatio: probability word rotates (default: 0.1). */
	rotateRatio?: number;
	/** wordcloud2.js color: string or function(word, weight, fontSize). */
	color?: string | ((word: string, weight: number, fontSize: number) => string);
};

function wordsToList(
	words: { text: string; value: number }[],
): [string, number][] {
	return words.map((w) => [w.text, w.value]);
}

/** Compute weightFactor so the largest value maps to ~maxFontSize px. */
function defaultWeightFactor(
	words: { text: string; value: number }[],
	maxFontSize: number,
): number {
	if (!words.length) return 1;
	const maxVal = Math.max(...words.map((w) => w.value), 1);
	return maxFontSize / maxVal;
}

/** Slugify a string for use in a download filename. */
function toFileSlug(input: string): string {
	return (
		input
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 40) || "word-cloud"
	);
}

const HEX6_BG = /^#[0-9A-Fa-f]{6}$/;

function sanitizeWordCloudBackground(color: string): string {
	return HEX6_BG.test(color) ? color : DEFAULT_BG;
}

function clampWordCloudEllipticity(value: number | undefined): number {
	if (typeof value === "number" && Number.isFinite(value)) {
		return Math.min(1, Math.max(0, value));
	}
	return 0.65;
}

const GLOW_BLUR = 6;
const GLOW_FALLBACK_COLOR = "rgba(255, 255, 255, 0.35)";

/**
 * Neon glow: wordcloud2.js resolves each word's color right before it `save()`s the
 * context and calls `fillText`, so setting `shadowColor` from the color callback gives
 * every word a halo in its own color.
 */
function withGlow(
	ctx: CanvasRenderingContext2D | null,
	color: WordCloud2Options["color"],
): WordCloud2Options["color"] {
	if (!ctx) return color;
	ctx.shadowBlur = GLOW_BLUR;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowColor = GLOW_FALLBACK_COLOR;
	if (typeof color !== "function") return color;
	return (word, weight, fontSize) => {
		const resolved = color(word, weight, fontSize);
		ctx.shadowColor = resolved;
		return resolved;
	};
}

function buildWordCloudLibOptions(args: {
	words: { text: string; value: number }[];
	backgroundColor: string;
	options: WordCloud2Options;
	ctx?: CanvasRenderingContext2D | null;
}): Record<string, unknown> {
	const { words, backgroundColor, options, ctx = null } = args;
	const list = wordsToList(words);
	const weightFactor = options.weightFactor ?? defaultWeightFactor(words, 72);

	return {
		list,
		weightFactor,
		gridSize: options.gridSize ?? 8,
		backgroundColor: sanitizeWordCloudBackground(backgroundColor),
		fontFamily: options.fontFamily ?? "system-ui, sans-serif",
		fontWeight: options.fontWeight ?? "normal",
		minRotation: options.minRotation ?? -Math.PI / 2,
		maxRotation: options.maxRotation ?? Math.PI / 2,
		rotationSteps: options.rotationSteps ?? 0,
		minSize: options.minSize ?? 0,
		clearCanvas: true,
		color: withGlow(ctx, options.color ?? "random-dark"),
		shape: options.shape ?? "circle",
		ellipticity: clampWordCloudEllipticity(options.ellipticity),
		shuffle: options.shuffle ?? true,
		rotateRatio: options.rotateRatio ?? 0.1,
	};
}

export default function WordCloud2Canvas({
	words,
	backgroundColor = DEFAULT_BG,
	mounted,
	hasWords,
	options = {},
	downloadName,
	prompt,
	children,
}: {
	words: { text: string; value: number }[];
	backgroundColor: string;
	mounted: boolean;
	hasWords: boolean;
	options?: WordCloud2Options;
	/** Stem used for the downloaded PNG filename. Falls back to "word-cloud". */
	downloadName?: string;
	/** Optional prompt bar rendered at the top of the cloud screen. */
	prompt?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [WordCloudLib, setWordCloudLib] = useState<
		((el: HTMLElement, opts: Record<string, unknown>) => void) | null
	>(null);
	const [size, setSize] = useState<[number, number]>([
		FALLBACK_WIDTH,
		FALLBACK_HEIGHT,
	]);
	const posthog = usePostHog();

	useEffect(() => {
		let cancelled = false;
		import("wordcloud").then((mod) => {
			if (!cancelled && mod.default) setWordCloudLib(() => mod.default);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateSize = () => {
			const w = container.clientWidth || FALLBACK_WIDTH;
			const h =
				container.clientHeight ||
				Math.round(w * HEIGHT_RATIO) ||
				FALLBACK_HEIGHT;
			setSize([w, h]);
		};

		updateSize();
		const ro = new ResizeObserver(updateSize);
		ro.observe(container);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !WordCloudLib || !hasWords || words.length === 0) return;

		const [w, h] = size;
		if (w <= 0 || h <= 0) return;

		let cancelled = false;
		const draw = () => {
			if (cancelled) return;
			canvas.width = w;
			canvas.height = h;
			WordCloudLib(
				canvas,
				buildWordCloudLibOptions({
					words,
					backgroundColor,
					options,
					ctx: canvas.getContext("2d"),
				}),
			);
		};

		// Make sure web fonts (e.g. Unbounded) are ready so words are measured correctly.
		const fontFamily = options.fontFamily ?? "system-ui, sans-serif";
		const fontWeight = options.fontWeight ?? "normal";
		const fonts = typeof document !== "undefined" ? document.fonts : undefined;
		if (fonts?.load) {
			fonts.load(`${fontWeight} 32px ${fontFamily}`).then(draw, draw);
		} else {
			draw();
		}
		return () => {
			cancelled = true;
		};
	}, [WordCloudLib, words, hasWords, size, backgroundColor, options]);

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

	const handleDownload = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas || !hasWords) return;
		const dataUrl = canvas.toDataURL("image/png");
		const a = document.createElement("a");
		a.href = dataUrl;
		a.download = `${downloadName ? toFileSlug(downloadName) : "word-cloud"}.png`;
		a.click();
		posthog?.capture("word_cloud_downloaded", {
			word_count: words.length,
			background_color: backgroundColor,
			source: "wordcloud2",
		});
	}, [hasWords, backgroundColor, words.length, posthog, downloadName]);

	return (
		<section className={NEON_SCREEN_CLASS} aria-label="Word cloud preview">
			{prompt ? (
				<div className="relative z-10 px-4 pt-4 sm:px-6 sm:pt-6">{prompt}</div>
			) : null}
			<div
				ref={containerRef}
				role="img"
				aria-label={accessibilitySummary}
				className="relative m-4 flex h-[340px] items-center justify-center overflow-hidden rounded-[20px] sm:m-6 sm:h-[440px] lg:h-[520px]"
				style={{
					backgroundColor: sanitizeWordCloudBackground(backgroundColor),
				}}
			>
				{!mounted ? (
					<p className="font-mono text-sm text-muted-ink">
						&gt; Loading preview...
					</p>
				) : hasWords && words.length > 0 ? (
					<>
						<ul className="sr-only">
							{words.map((w, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static screen-reader list; words may repeat
								<li key={`${i}-${w.text}`}>{w.text}</li>
							))}
						</ul>
						<canvas
							ref={canvasRef}
							width={size[0]}
							height={size[1]}
							className="h-full w-full"
							aria-hidden
						/>
					</>
				) : (
					<p className="max-w-sm px-6 text-center font-mono text-sm text-muted-ink">
						&gt; Add text or translations to see your word cloud preview.
					</p>
				)}
			</div>
			<NeonHud
				wordCount={mounted && hasWords ? words.length : null}
				engine="experimental"
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
