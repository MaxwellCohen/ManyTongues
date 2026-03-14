/**
 * Type declaration for the wordcloud package (wordcloud2.js).
 * @see https://www.npmjs.com/package/wordcloud
 */
declare module "wordcloud" {
	function WordCloud(
		elements: HTMLElement | HTMLElement[],
		options: Record<string, unknown>,
	): void;
	export default WordCloud;
}
