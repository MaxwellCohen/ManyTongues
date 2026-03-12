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

function choose<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

export function getDefaultColors(): string[] {
  return SCHEME_CATEGORY_10;
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

const anglesMap = new Map<string, number[]>();

function getAngles(rotations: number, rotationAngles: MinMaxPair): number[] {
  const key = `${rotations}-${rotationAngles[0]}-${rotationAngles[1]}`;
  if (anglesMap.has(key)) {
    return anglesMap.get(key)!;
  }
  let angles = [...rotationAngles];
  const increment = (rotationAngles[1] - rotationAngles[0]) / (rotations - 1);
  let angle = rotationAngles[0] + increment;
  while (angle < rotationAngles[1]) {
    angles.push(angle);
    angle += increment;
  }
  anglesMap.set(key, angles);
  return angles;
}

export function rotate(
  rotations: number,
  rotationAngles: MinMaxPair,
  random: () => number,
): number {
  if (rotations < 1) {
    return 0;
  }

  if (rotations === 1) {
    return rotationAngles[0];
  } else if (rotations === 2) {
    return choose(rotationAngles, random);
  }
  return choose(getAngles(rotations, rotationAngles), random);
}
