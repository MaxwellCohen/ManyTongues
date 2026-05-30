import { DEFAULT_BG } from "#/lib/wordCloudUtils";
import {
	WORD_CLOUD_LAYOUT_HEIGHT,
	WORD_CLOUD_LAYOUT_WIDTH,
} from "#/features/word-cloud/wordCloudViewport";

/** Slugify a string for use in a download filename. */
export function toWordCloudFileSlug(input: string): string {
	return (
		input
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 40) || "word-cloud"
	);
}

export type DownloadWordCloudPngOptions = {
	svg: SVGElement;
	backgroundColor: string;
	downloadName?: string;
	scale?: number;
	width?: number;
	height?: number;
	onDownloaded?: () => void;
};

/** Rasterize an SVG word cloud and trigger a PNG download in the browser. */
export function downloadWordCloudPng({
	svg,
	backgroundColor,
	downloadName,
	scale = 2,
	width = WORD_CLOUD_LAYOUT_WIDTH,
	height = WORD_CLOUD_LAYOUT_HEIGHT,
	onDownloaded,
}: DownloadWordCloudPngOptions): void {
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
		a.download = `${downloadName ? toWordCloudFileSlug(downloadName) : "word-cloud"}.png`;
		a.click();
		onDownloaded?.();
	};
	img.onerror = () => URL.revokeObjectURL(url);
	img.src = url;
}
