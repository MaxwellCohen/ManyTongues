type SearchRecord = Record<string, unknown>

export function getSearchDiffFromDefaults<T extends SearchRecord>(
  state: T,
  defaults: T,
): Partial<T> {
  const out: Partial<T> = {}

  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const nextValue = state[key]
    const defaultValue = defaults[key]

    if (Array.isArray(nextValue) && Array.isArray(defaultValue)) {
      if (
        nextValue.length !== defaultValue.length ||
        nextValue.some((value, index) => value !== defaultValue[index])
      ) {
        out[key] = nextValue
      }
      continue
    }

    if (nextValue !== defaultValue) {
      out[key] = nextValue
    }
  }

  return out
}

export function mergeSearchWithDefaults<
  T extends SearchRecord,
  K extends keyof T,
>(
  defaults: T,
  search: Partial<T>,
  arrayKeys: readonly K[],
): T {
  const merged = {
    ...defaults,
    ...search,
  } as T

  for (const key of arrayKeys) {
    merged[key] = search[key] ?? defaults[key]
  }

  return merged
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function getValidPalette(
  colors: string[],
  fallback: string[],
): string[] {
  const validColors = colors.filter(isHexColor)
  return validColors.length > 0 ? validColors : fallback
}
