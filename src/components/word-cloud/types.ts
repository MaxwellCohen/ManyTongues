/**
 * Types and public API for react-wordcloud.
 */

/**
 * Internal / shared types
 */
export type MinMaxPair = [number, number];

export type Scale = 'linear' | 'log' | 'sqrt';

export type Spiral = 'archimedean' | 'rectangular';


export type AttributeValue = string | ((word: Word) => string);

export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Public typings
 */
export interface Callbacks {}

export type CallbacksProp = Optional<Callbacks>;

export interface Options {
  /**
   * Allows the wordcloud to randomnly apply colors in the provided values.
   */
  colors: string[];
  /**
   * By default, words are randomly positioned and rotated.  If true, the wordcloud will produce the same rendering output for any input.
   */
  deterministic: boolean;
  /**
   * Customize the font family.
   */
  fontFamily: string;
  /**
   * Specify the minimum and maximum font size as a tuple.  Tweak these numbers to control the best visual appearance for the wordcloud.
   */
  fontSizes: MinMaxPair;
  /**
   * Accepts CSS values for font-styles (e.g. italic, oblique)
   */
  fontStyle: string;
  /**
   * Accepts CSS values for font-weights (e.g. bold, 400, 700)
   */
  fontWeight: string;
  /**
   * Controls the padding between words
   */
  padding: number;
  /**
   * Set an optional random seed when `deterministic` option is set to `true`.
   */
  randomSeed?: string;
  /**
   * Provide the minimum and maximum angles that words can be rotated.
   */
  rotationAngles: MinMaxPair;
  /**
   * By default, the wordcloud will apply random rotations if this is not specified.  When provided, it will use evenly-divided angles from the provided min/max rotation angles.
   */
  rotations?: number;
  /**
   * Control how words are spaced and laid out.
   */
  scale: Scale;
  /**
   * Control the spiral pattern on how words are laid out.
   */
  spiral: Spiral;
  /**
   * Customizable attributes to set on the rendererd svg node
   */
  svgAttributes: Record<string, AttributeValue>;
  /**
   * Customizable attributes to set on the rendererd text nodes
   */
  textAttributes: Record<string, AttributeValue>;
}

export type OptionsProp = Optional<Options>;

export interface Props {
  /**
   * Callbacks to control various word properties and behaviors.
   */
  callbacks?: CallbacksProp;
  /**
   * Maximum number of words to display.
   */
  maxWords?: number;
  /**
   * Set minimum [width, height] values for the SVG container.
   */
  minSize?: MinMaxPair;
  /**
   * Configure the wordcloud with various options.
   */
  options?: OptionsProp;
  /**
   * Set explicit [width, height] values for the SVG container.  This will disable responsive resizing.  If undefined, the wordcloud will responsively size to its parent container.
   */
  size?: MinMaxPair;
  /**
   * An array of word.  A word is an object that must contain the 'text' and 'value' keys.
   */
  words: Word[];
}

export interface Word {
  [key: string]: any;
  text: string;
  value: number;
}

/**
 * Chainable API for d3-cloud and optimized-d3-cloud layout.
 * Used so layout.ts can type the cloud without @ts-ignore.
 */
export interface CloudLayout {
  size(size: MinMaxPair): CloudLayout;
  padding(padding: number): CloudLayout;
  words(words: Word[]): CloudLayout;
  rotate(rotate: () => number): CloudLayout;
  spiral(spiral: Spiral): CloudLayout;
  random(random: () => number): CloudLayout;
  text(text: (word: Word) => string): CloudLayout;
  font(font: string): CloudLayout;
  fontStyle(fontStyle: string): CloudLayout;
  fontWeight(fontWeight: string): CloudLayout;
  fontSize(fontSize: (word: Word) => number): CloudLayout;
  on(event: 'end', callback: (computedWords: Word[]) => void): CloudLayout;
  start(): CloudLayout;
  revive?(): CloudLayout;
}
