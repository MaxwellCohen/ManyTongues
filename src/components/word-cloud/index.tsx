import React, { useEffect, startTransition } from "react";

import { useResponsiveSvgSelection } from "./hooks";
import { layout } from "./layout";
import type { OptionsProp, Options, Word, MinMaxPair } from "./types";
import { getDefaultColors } from "./utils";

const defaultOptions: OptionsProp = {
  colors: getDefaultColors(),
  deterministic: false,
  fontFamily: "times new roman",
  fontSizes: [4, 32],
  fontStyle: "normal",
  fontWeight: "normal",
  padding: 1,
  rotationAngles: [-90, 90],
  scale: "sqrt",
  spiral: "rectangular",
  textAttributes: {},
};
// const renderRef = useRef(debounce(layout, 100));

export default function ReactWordCloud({
  maxWords = 100,
  minSize = [300, 300],
  options = defaultOptions,
  words,
}: {
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
   * An array of word.  A word is an object that must contain the 'text' and 'value' keys.
   */
  words: Word[];
}): React.JSX.Element {
  const [ref, selection, size] = useResponsiveSvgSelection(minSize);
  useEffect(() => {
    if (selection && size) {
      startTransition(() => {
        const mergedOptions = { ...defaultOptions, ...options } as Options;
        layout({
          maxWords,
          options: mergedOptions,
          selection,
          size,
          words,
        });
      });
    }
  }, [maxWords, options, selection, size, words]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}
