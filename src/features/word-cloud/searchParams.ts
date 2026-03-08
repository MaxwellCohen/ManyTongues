import { z } from 'zod'

export const booleanSearchParam = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

export const csvSearchParam = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value.split(',').map((part) => part.trim()).filter(Boolean)
      : value,
  z.array(z.string()),
)
