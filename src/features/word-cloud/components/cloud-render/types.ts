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
   * Customizable attributes to set on the rendererd text nodes
   */
  textAttributes: Record<string, AttributeValue>;
}

export type OptionsProp = Optional<Options>;

export interface Word {
  [key: string]: any;
  text: string;
  value: number;
}


