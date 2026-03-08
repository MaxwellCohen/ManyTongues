export type GetOrTranslateResult =
  | { ok: true; translations: Record<string, string> }
  | { ok: false; error: string }
