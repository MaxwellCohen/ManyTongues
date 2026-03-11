import * as Sentry from '@sentry/tanstackstart-react'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// nuqs uses one query param per key with string values; keep router in sync for Links/validateSearch
function parseSearch(searchStr: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(searchStr).entries())
}

function stringifySearch(value: Record<string, unknown>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) p.set(k, v.join(','))
    else p.set(k, String(v))
  }
  const qs = p.toString()
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

  if (!router.isServer) {
    Sentry.init({
      dsn: 'https://c2660f39e62959635d2eb79b48178f01@o4508042447552512.ingest.us.sentry.io/4511020560875520',
      sendDefaultPii: true,
      integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
      tracesSampleRate: 0.1,
    })
  }

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
