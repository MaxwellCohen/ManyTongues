import 'd3-transition';

import d3Cloud from 'd3-cloud';

/** Comparator for Array.prototype.sort: higher values first (descending). */
function descending(a: number, b: number): number {
  return b - a;
}
import seedrandom from 'seedrandom';

import type { MinMaxPair, Options, Word } from './types';
import {
  getFontScaleFromDomain,
  getText,
  rotate,
} from './utils';

interface LayoutParams {
  onComplete: (words: Word[]) => void;
  options: Options;
  size: MinMaxPair;
  words: Word[];
}






export function layout({
  onComplete,
  options,
  size,
  words,
}: LayoutParams): void {
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
    .sort((x: Word, y: Word) => descending(Number(x.value), Number(y.value)));

  let valueMax = Number(sortedWords[0].value);
  let valueMin = Number(sortedWords[sortedWords.length - 1].value);

  const random = deterministic ? seedrandom(randomSeed || 'deterministic') as () => number : () => Math.random();
  const fontScale = getFontScaleFromDomain(
    valueMin,
    valueMax,
    fontSizes,
    scale,
  );

    d3Cloud<Word>()
    .size(size)
    .padding(padding)
    .words(sortedWords)
    .spiral(spiral)
    .random(random)
    .text(getText)
    .font(fontFamily)
    .fontStyle(fontStyle)
    .fontWeight(fontWeight)
    .rotate((_) => {
      return rotate(rotations ?? 3, rotationAngles, random);
    })
    .fontSize((word: Word) => fontScale(Number(word.value)))
    .on('end', onComplete)
    .start();

}
