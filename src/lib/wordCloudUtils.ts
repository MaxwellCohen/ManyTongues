export const DEFAULT_TEXT = `Enter or paste your text here. Common words like the and is will appear larger when they appear more often. Try pasting an article, a speech, or song lyrics to see which words stand out.`

export const DEFAULT_COLORS = ['#173a40', '#328f97', '#4fb8b2', '#2f6a4a']
export const DEFAULT_BG = '#e8f4f0'

export type CloudWord = {
  text: string
  value: number
  x?: number
  y?: number
  rotate?: number
  size?: number
  font?: string
  style?: string
  weight?: string
}

export function tokenizeAndCount(
  text: string,
): { text: string; value: number }[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
  if (!normalized) return []
  const tokens = normalized.split(/\s+/).filter(Boolean)
  const counts = new Map<string, number>()
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
}

export const SCALE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'sqrt', label: 'Square root' },
  { value: 'log', label: 'Logarithmic' },
] as const

export type ScaleType = (typeof SCALE_OPTIONS)[number]['value']

export const inputClass =
  'w-full rounded-lg border border-line bg-foam px-3 py-2 text-sm text-sea-ink focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30'

export const labelClass = 'mb-1 block text-xs font-medium text-sea-ink-soft'
