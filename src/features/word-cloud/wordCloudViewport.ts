/** Layout bounds passed to d3-cloud / react-wordcloud. */
export const WORD_CLOUD_LAYOUT_WIDTH = 640;
export const WORD_CLOUD_LAYOUT_HEIGHT = 360;

const CHAR_WIDTH_RATIO = 0.6;
const LINE_HEIGHT_RATIO = 1.2;

/** Cap max font size so the longest phrase fits in the canvas and isn't dropped by d3-cloud. */
export function capMaxFontSizeForWords(
	words: { text: string; value: number }[],
	requestedMax: number,
	layoutWidth = WORD_CLOUD_LAYOUT_WIDTH,
	layoutHeight = WORD_CLOUD_LAYOUT_HEIGHT,
): number {
	if (!words.length) return requestedMax;
	const maxLen = Math.max(...words.map((w) => w.text.length), 1);
	const maxByWidth = layoutWidth / (maxLen * CHAR_WIDTH_RATIO);
	const maxByHeight = layoutHeight / LINE_HEIGHT_RATIO;
	return Math.min(requestedMax, maxByWidth, maxByHeight);
}
