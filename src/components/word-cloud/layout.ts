import 'd3-transition';

import d3Cloud from 'd3-cloud';

/** Comparator for Array.prototype.sort: higher values first (descending). */
function descending(a: number, b: number): number {
  return b - a;
}
import type { Selection } from 'd3-selection';
import seedrandom from 'seedrandom';

import type { CloudLayout, MinMaxPair, Options, Word } from './types';
import {
  choose,
  getFontScaleFromDomain,
  getFontSize,
  getText,
  getTransform,
  rotate,
} from './utils';

interface RenderParams {
  options: Options;
  random: () => number;
  selection: Selection<SVGGElement, unknown, SVGSVGElement | null, unknown>;
  words: Word[];
}

function render({
  options,
  random,
  selection,
  words,
}: RenderParams): void {
  const {
    colors,
    fontFamily,
    fontStyle,
    fontWeight,
    textAttributes,
  } = options;

  function getFill(): string {
    return choose(colors, random);
  }

  // Load words
  const vizWords = selection.selectAll<SVGTextElement, Word>('text').data(words);
  vizWords.join(
    (enter) => {
      let textSelection = enter
        .append('text')
        .attr('fill', getFill as (word: Word) => string)
        .attr('font-family', fontFamily)
        .attr('font-style', fontStyle)
        .attr('font-weight', fontWeight)
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(0, 0) rotate(0)');

      if (typeof textAttributes === 'object') {
        Object.keys(textAttributes).forEach((key) => {
          textSelection = textSelection.attr(key, textAttributes[key] as string);
        });
      }

      textSelection
        .attr('font-size', getFontSize as (word: Word) => string)
        .attr('transform', getTransform as (word: Word) => string)
        .text(getText as (word: Word) => string);
      return textSelection;
    },
    (update) => update
      .attr('fill', getFill as (word: Word) => string)
      .attr('font-family', fontFamily)
      .attr('font-size', getFontSize as (word: Word) => string)
      .attr('transform', getTransform as (word: Word) => string)
      .text(getText as (word: Word) => string) as unknown as typeof update,
    (exit) => {
      exit
        .attr('fill-opacity', 0)
        .remove();
    },
  );
}

interface LayoutParams {
  maxWords: number;
  options: Options;
  selection: Selection<SVGGElement, unknown, SVGSVGElement | null, unknown>;
  size: MinMaxPair;
  words: Word[];
}

export function layout({
  maxWords,
  options,
  selection,
  size,
  words,
}: LayoutParams): void {
  const MAX_LAYOUT_ATTEMPTS = 10;
  const SHRINK_FACTOR = 0.95;
  const {
    deterministic,
    fontFamily,
    fontStyle,
    fontSizes,
    fontWeight,
    padding,
    randomSeed,
    rotations,
    rotationAngles,
    spiral,
    scale,
  } = options;

  const sortedWords = words
    .concat()
    .sort((x: Word, y: Word) => descending(Number(x.value), Number(y.value)))
    .slice(0, maxWords);

  let valueMin = 0;
  let valueMax = 1;
  if (sortedWords.length > 0) {
    for (let i = 0; i < sortedWords.length; i++) {
      const v = Number(sortedWords[i].value);
      if (i === 0) {
        valueMin = v;
        valueMax = v;
      } else {
        if (v < valueMin) valueMin = v;
        if (v > valueMax) valueMax = v;
      }
    }
  }

  const random = seedrandom(
    deterministic ? (randomSeed || 'deterministic') : undefined,
  ) as () => number;

  let cloud: CloudLayout = d3Cloud() as unknown as CloudLayout;


  cloud
    .size(size)
    .padding(padding)
    .words(sortedWords.map((w) => (w)))
    .rotate(() => {
      if (rotations === undefined) {
        return (~~(random() * 6) - 3) * 30;
      }
      return rotate(rotations, rotationAngles, random);
    })
    .spiral(spiral)
    .random(random)
    .text(getText)
    .font(fontFamily)
    .fontStyle(fontStyle)
    .fontWeight(fontWeight);

  function draw(fontSizeRange: MinMaxPair, attempts = 1): void {
    const fontScale = getFontScaleFromDomain(
      valueMin,
      valueMax,
      fontSizeRange,
      scale,
    );
    cloud
      .fontSize((word) => fontScale(word.value))
      .on('end', (computedWords) => {
        console.log('computedWords', computedWords);
        if (
          sortedWords.length !== computedWords.length &&
          attempts <= MAX_LAYOUT_ATTEMPTS
        ) {
          if (attempts === MAX_LAYOUT_ATTEMPTS) {
            console.warn(
              `Unable to layout ${sortedWords.length - computedWords.length
              } word(s) after ${attempts} attempts.  Consider: (1) Increasing the container/component size. (2) Lowering the max font size. (3) Limiting the rotation angles.`,
            );
          }

          const minFontSize = Math.max(fontSizeRange[0] * SHRINK_FACTOR, 1);
          const maxFontSize = Math.max(
            fontSizeRange[1] * SHRINK_FACTOR,
            minFontSize,
          );

          draw([minFontSize, maxFontSize], attempts + 1);
        } else {
          render({
            options,
            random,
            selection,
            words: computedWords,
          });
        }
      })
      .start();
  }

  draw(fontSizes);
}
