import { sql } from 'drizzle-orm'
import { getRequest } from '@tanstack/react-start/server'
import { translatorRateLimitsTable } from '#/db/schema'
import { getTursoDb } from '#/lib/db'

const DEFAULT_WINDOW_MS = 5 * 60 * 1000
const DEFAULT_MAX_REQUESTS = 10
const RATE_LIMIT_NAMESPACE = 'translator'
const FORWARDED_IP_HEADERS = [
  'cf-connecting-ip',
  'fly-client-ip',
  'true-client-ip',
  'x-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'x-vercel-forwarded-for',
] as const

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

function normalizeIpCandidate(value: string | null): string | null {
  const firstValue = value?.split(',')[0]?.trim()
  if (!firstValue) {
    return null
  }

  return firstValue.startsWith('::ffff:')
    ? firstValue.slice('::ffff:'.length)
    : firstValue
}

export function getClientIpFromRequest(): string {
  const request = getRequest()

  for (const headerName of FORWARDED_IP_HEADERS) {
    const ip = normalizeIpCandidate(request.headers.get(headerName))
    if (ip) {
      return ip
    }
  }

  return 'unknown'
}

export async function consumeTranslatorRateLimit({
  ip = getClientIpFromRequest(),
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
