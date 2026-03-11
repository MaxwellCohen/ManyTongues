import 'd3-transition';

import { descending } from 'd3-array';
import d3Cloud from 'd3-cloud';
import type { Selection } from 'd3-selection';
import seedrandom from 'seedrandom';

import optimizedD3Cloud from './optimized-d3-cloud';
import type { Callbacks, CloudLayout, MinMaxPair, Options, Word } from './types';
import {
  choose,
  getFontScale,
  getFontSize,
  getText,
  getTransform,
  rotate,
} from './utils';

export interface RenderParams {
  callbacks: Callbacks;
  options: Options;
  random: () => number;
  selection: Selection<SVGGElement, unknown, SVGSVGElement | null, unknown>;
  words: Word[];
}

export function render({
  callbacks,
  options,
  random,
  selection,
  words,
}: RenderParams): void {
  const {
    getWordColor,
    onWordClick,
    onWordMouseOver,
    onWordMouseOut,
  } = callbacks;
  const {
    colors,
    fontStyle,
    fontWeight,
    textAttributes,
  } = options;
  const { fontFamily, transitionDuration } = options;

  function getFill(word: Word): string {
    return getWordColor ? getWordColor(word) : choose(colors, random);
  }

  // Load words
  const vizWords = selection.selectAll<SVGTextElement, Word>('text').data(words);
  vizWords.join(
    (enter) => {
      let textSelection = enter
        .append('text')
        .on('click', function  textSelection(this: SVGTextElement, datum: Word) {
          if (onWordClick) {
            onWordClick(datum, (globalThis as unknown as { event?: MouseEvent }).event);
          }
        })
        .on('mouseover', function  textSelection(this: SVGTextElement, datum: Word) {
          if (onWordMouseOver) {
            onWordMouseOver(datum, (globalThis as unknown as { event?: MouseEvent }).event);
          }
        })
        .on('mouseout', function  textSelection(this: SVGTextElement, datum: Word) {
          if (onWordMouseOut) {
            onWordMouseOut(datum, (globalThis as unknown as { event?: MouseEvent }).event);
          }
        })
        .attr('cursor', onWordClick ? 'pointer' : 'default')
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
        .transition()
        .duration(transitionDuration)
        .attr('font-size', getFontSize as (word: Word) => string)
        .attr('transform', getTransform as (word: Word) => string)
        .text(getText as (word: Word) => string);
      return textSelection;
    },
    (update) => update
        .transition()
        .duration(transitionDuration)
        .attr('fill', getFill as (word: Word) => string)
        .attr('font-family', fontFamily)
        .attr('font-size', getFontSize as (word: Word) => string)
        .attr('transform', getTransform as (word: Word) => string)
        .text(getText as (word: Word) => string) as unknown as typeof update,
    (exit) => {
      exit
        .transition()
        .duration(transitionDuration)
        .attr('fill-opacity', 0)
        .remove();
    },
  );
}

export interface LayoutParams {
  callbacks: Callbacks;
  maxWords: number;
  options: Options;
  selection: Selection<SVGGElement, unknown, SVGSVGElement | null, unknown>;
  size: MinMaxPair;
  words: Word[];
}

export function layout({
  callbacks,
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
    enableOptimizations,
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
    .toSorted((x: Word, y: Word) => descending(x.value, y.value))
    .slice(0, maxWords);

  const random = seedrandom(
    deterministic ? (randomSeed || 'deterministic') : undefined,
  ) as () => number;

  let cloud: CloudLayout;
  if (enableOptimizations) {
    cloud = optimizedD3Cloud();
  } else {
    cloud = d3Cloud() as unknown as CloudLayout;
  }

  cloud
    .size(size)
    .padding(padding)
    .words(structuredClone(sortedWords) as Word[])
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
    if (enableOptimizations && cloud.revive) {
      cloud.revive();
    }

    cloud
      .fontSize((word) => {
        const fontScale = getFontScale(sortedWords, fontSizeRange, scale);
        return fontScale(word.value);
      })
      .on('end', (computedWords) => {
        if (
          sortedWords.length !== computedWords.length &&
          attempts <= MAX_LAYOUT_ATTEMPTS
        ) {
          if (attempts === MAX_LAYOUT_ATTEMPTS) {
            console.warn(
              `Unable to layout ${
                sortedWords.length - computedWords.length
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
            callbacks,
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
