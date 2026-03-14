export const DEFAULT_TEXT = `Paste any text here to create a word cloud. Words that appear more often will show up larger. Try an article, meeting notes, a speech, or song lyrics to quickly spot the terms that stand out.`

export const DEFAULT_COLORS = ['#173a40', '#328f97', '#4fb8b2', '#2f6a4a']
export const DEFAULT_BG = '#e8f4f0'

type CloudWord = {
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

export const SPIRAL_OPTIONS = [
  { value: 'archimedean', label: 'Archimedean' },
  { value: 'rectangular', label: 'Rectangular' },
] as const

export type SpiralType = (typeof SPIRAL_OPTIONS)[number]['value']

export const FONT_FAMILY_OPTIONS = [
  { value: 'system-ui', label: 'System UI' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
] as const

export const DEFAULT_FONT_FAMILY = 'system-ui'
