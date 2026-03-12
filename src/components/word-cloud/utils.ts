import type { MinMaxPair, Scale, Word } from './types';

/** D3 Category10 categorical colors (10 distinct hex values). */
const SCHEME_CATEGORY_10 = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

export function choose<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

export function getDefaultColors(): string[] {
  return Array.from({ length: 10 }, (_, i) => SCHEME_CATEGORY_10[i % 10]);
}

function scaleLinear(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const span = domainMax - domainMin || 1;
  return (t) => rangeMin + (rangeMax - rangeMin) * ((t - domainMin) / span);
}

function scaleSqrt(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const sqrtMin = Math.sqrt(domainMin);
  const sqrtMax = Math.sqrt(domainMax);
  const span = sqrtMax - sqrtMin || 1;
  return (t) =>
    rangeMin + (rangeMax - rangeMin) * ((Math.sqrt(t) - sqrtMin) / span);
}

const LOG_EPSILON = 1e-10;

function scaleLog(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const safeMin = Math.max(domainMin, LOG_EPSILON);
  const safeMax = Math.max(domainMax, LOG_EPSILON);
  const logMin = Math.log(safeMin);
  const logMax = Math.log(safeMax);
  const span = logMax - logMin || 1;
  return (t) => {
    const safeT = Math.max(t, LOG_EPSILON);
    const u = (Math.log(safeT) - logMin) / span;
    const clamped = Math.max(0, Math.min(1, u));
    return rangeMin + (rangeMax - rangeMin) * clamped;
  };
}

export function getFontScale(
  words: Word[],
  fontSizes: MinMaxPair,
  scale: Scale,
): (value: number) => number {
  const values = words.map((word) => Number(word.value));
  const minVal = values.length ? Math.min(...values) : undefined;
  const maxVal = values.length ? Math.max(...values) : undefined;
  const minSize = minVal ?? 0;
  const maxSize = maxVal ?? 1;
  return getFontScaleFromDomain(minSize, maxSize, fontSizes, scale);
}

/**
 * Build a font scale from a precomputed value domain. Use when the same
 * extent is reused (e.g. layout retries) to avoid recomputing min/max.
 */
export function getFontScaleFromDomain(
  domainMin: number,
  domainMax: number,
  fontSizes: MinMaxPair,
  scale: Scale,
): (value: number) => number {
  const [rangeMin, rangeMax] = fontSizes;
  if (scale === 'log') {
    return scaleLog(domainMin, domainMax, rangeMin, rangeMax);
  }
  if (scale === 'sqrt') {
    return scaleSqrt(domainMin, domainMax, rangeMin, rangeMax);
  }
  return scaleLinear(domainMin, domainMax, rangeMin, rangeMax);
}

export function getFontSize(word: Word): string {
  return `${word.size}px`;
}

export function getText(word: Word): string {
  return word.text;
}

export function getTransform(word: Word): string {
  const translate = `translate(${word.x}, ${word.y})`;
  const rotate =
    typeof word.rotate === 'number' ? `rotate(${word.rotate})` : '';
  return translate + rotate;
}

export function rotate(
  rotations: number,
  rotationAngles: MinMaxPair,
  random: () => number,
): number {
  if (rotations < 1) {
    return 0;
  }

  let angles: number[];
  if (rotations === 1) {
    angles = [rotationAngles[0]];
  } else {
    angles = [...rotationAngles];
    const increment = (rotationAngles[1] - rotationAngles[0]) / (rotations - 1);
    let angle = rotationAngles[0] + increment;
    while (angle < rotationAngles[1]) {
      angles.push(angle);
      angle += increment;
    }
  }

  return choose(angles, random);
}
