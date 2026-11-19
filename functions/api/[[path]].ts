interface PagesRequestContext {
  request: Request
}

const TRUCK_HEALTH = 'https://truck-api-cf.fall3n.workers.dev/health'
const DATA_PING = 'https://data-api.fall3n.workers.dev/api/ping'

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

// Public prototype proxy: intentionally exposes only non-sensitive health checks.
// Do not add business-data or mutation routes until Portal token verification and
// per-app permission enforcement are enabled in the corresponding API.
export const onRequest = async ({ request }: PagesRequestContext): Promise<Response> => {
  const incoming = new URL(request.url)
  const path = incoming.pathname.slice('/api/'.length)
  const method = request.method.toUpperCase()

  if (method !== 'GET' && method !== 'HEAD') {
    return jsonError('Method not allowed', 405)
  }

  let upstreamUrl: URL
  if (path === 'truck-health') {
    upstreamUrl = new URL(TRUCK_HEALTH)
  } else if (path === 'data/ping') {
    upstreamUrl = new URL(DATA_PING)
  } else {
    return jsonError('API route is not enabled in the public prototype', 404)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)
  try {
    const upstream = await fetch(upstreamUrl, { method, redirect: 'manual', signal: controller.signal })
    const headers = new Headers({ 'Cache-Control': 'no-store' })
    const contentType = upstream.headers.get('content-type')
    if (contentType) headers.set('Content-Type', contentType)
    return new Response(upstream.body, { status: upstream.status, headers })
  } catch {
    return jsonError('Upstream health check unavailable', 502)
  } finally {
    clearTimeout(timeout)
  }
}