import React, { useEffect, startTransition, useState } from "react";

import { useWordCloudSize } from "./hooks";
import { layout } from "./layout";
import type { OptionsProp, Options, Word, MinMaxPair } from "./types";
import { getDefaultColors, getFontSize, getText, getTransform } from "./utils";

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
  const [ref, size] = useWordCloudSize(minSize);
  const [laidOutWords, setLaidOutWords] = useState<Word[]>([]);

  useEffect(() => {
    if (!size) return;
    startTransition(() => {
      const mergedOptions = { ...defaultOptions, ...options } as Options;
      layout({
        maxWords,
        onComplete: setLaidOutWords,
        options: mergedOptions,
        size,
        words,
      });
    });
  }, [maxWords, options, size, words]);

  const mergedOptions = { ...defaultOptions, ...options } as Options;
  const { fontFamily, fontStyle, fontWeight, textAttributes } = mergedOptions;

  return (
    <div ref={ref} style={{ height: "100%", width: "100%" }}>
      {size && (
        <svg
          width={size[0]}
          height={size[1]}
          style={{ display: "block" }}
        >
          <g transform={`translate(${size[0] / 2}, ${size[1] / 2})`}>
            {laidOutWords.map((word) => {
              const resolvedTextAttrs =
                typeof textAttributes === "object"
                  ? Object.fromEntries(
                      Object.entries(textAttributes).map(([k, v]) => [
                        k,
                        typeof v === "function" ? v(word) : v,
                      ]),
                    )
                  : {};
              return (
                <text
                  key={`${word.text}-${word.x ?? 0}-${word.y ?? 0}`}
                  fill={(word as Word & { fill?: string }).fill}
                  fontFamily={fontFamily}
                  fontStyle={fontStyle}
                  fontWeight={fontWeight}
                  textAnchor="middle"
                  transform={getTransform(word)}
                  fontSize={getFontSize(word)}
                  {...resolvedTextAttrs}
                >
                  {getText(word)}
                </text>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
