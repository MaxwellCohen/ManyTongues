import { sql } from 'drizzle-orm'
import { translatorRateLimitsTable } from '#/db/schema'
import { getTursoDb } from '#/lib/db'

const DEFAULT_WINDOW_MS = 5 * 60 * 1000
const DEFAULT_MAX_REQUESTS = 10
const RATE_LIMIT_NAMESPACE = 'translator'

type ConsumeRateLimitInput = {
  ip?: string
  maxRequests?: number
  windowMs?: number
}

type ConsumeRateLimitResult =
  | {
      allowed: true
      remaining: number
      retryAfterSeconds: number
    }
  | {
      allowed: false
      retryAfterSeconds: number
    }

export function normalizeIpCandidate(value: string | null): string | null {
  const firstValue = value?.split(',')[0]?.trim()
  if (!firstValue) {
    return null
  }

  return firstValue.startsWith('::ffff:')
    ? firstValue.slice('::ffff:'.length)
    : firstValue
}

export async function consumeTranslatorRateLimit({
  ip = 'unknown',
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS,
}: ConsumeRateLimitInput = {}): Promise<ConsumeRateLimitResult> {
  const now = Date.now()
  const windowStartedAtMs = now - (now % windowMs)
  const key = `${RATE_LIMIT_NAMESPACE}:${ip}`
  const db = getTursoDb()

  const windowStartedAtMsColumn = sql.raw('window_started_at_ms')
  const hitsColumn = sql.raw('hits')

  const [windowState] = await db
    .insert(translatorRateLimitsTable)
    .values({
      key,
      windowStartedAtMs,
      hits: 1,
      updatedAtMs: now,
    })
    .onConflictDoUpdate({
      target: translatorRateLimitsTable.key,
      set: {
        windowStartedAtMs: sql`CASE
          WHEN ${windowStartedAtMsColumn} < ${windowStartedAtMs} THEN ${windowStartedAtMs}
          ELSE ${windowStartedAtMsColumn}
        END`,
        hits: sql`CASE
          WHEN ${windowStartedAtMsColumn} < ${windowStartedAtMs} THEN 1
          ELSE ${hitsColumn} + 1
        END`,
        updatedAtMs: now,
      },
    })
    .returning({
      hits: translatorRateLimitsTable.hits,
      windowStartedAtMs: translatorRateLimitsTable.windowStartedAtMs,
    })

  if (!windowState) {
    throw new Error('Failed to load rate limit state.')
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowState.windowStartedAtMs + windowMs - now) / 1000),
  )

  if (windowState.hits > maxRequests) {
    return { allowed: false, retryAfterSeconds }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - windowState.hits),
    retryAfterSeconds,
  }
}

/**
 * Enforce per-IP translator limits when Turso is configured. Skips when `DB_URL`
 * is unset so local dev without a database still works.
 */
export async function applyTranslatorRateLimit(ipRaw: string | null): Promise<
  | { limited: false }
  | {
      limited: true
      message: string
      retryAfterSeconds: number
    }
> {
  if (!process.env.DB_URL?.trim()) {
    return { limited: false }
  }

  const ip = normalizeIpCandidate(ipRaw) ?? 'unknown'
  const result = await consumeTranslatorRateLimit({ ip })

  if (!result.allowed) {
    return {
      limited: true,
      message: `Too many translation requests. Try again in ${result.retryAfterSeconds} seconds.`,
      retryAfterSeconds: result.retryAfterSeconds,
    }
  }

  return { limited: false }
}
