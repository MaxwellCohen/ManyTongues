import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { parse, stringify } from 'zipson'
import { routeTree } from './routeTree.gen'

// Safe binary encoding/decoding for URL-safe base64 (handles non-UTF8)
// https://tanstack.com/router/v1/docs/guide/custom-search-param-serialization#safe-binary-encodingdecoding
function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
}

function encodeToBinary(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_match, p1) {
      return String.fromCharCode(parseInt(p1, 16))
    }),
  )
}

/** Parse raw search string: each param value is Zipson+base64; fallback to raw string for legacy URLs. */
function parseSearch(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(searchStr)
  const out: Record<string, unknown> = {}
  for (const [key, value] of params.entries()) {
    try {
      out[key] = parse(decodeFromBinary(value))
    } catch {
      out[key] = value
    }
  }
  return out
}

/** Stringify search object: each value is Zipson-compressed then base64-encoded. */
function stringifySearch(obj: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    params.set(key, encodeToBinary(stringify(value)))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,

    parseSearch,
    stringifySearch,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
