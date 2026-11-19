interface PagesRequestContext {
  request: Request
}

const TRUCK_ORIGIN = 'https://truck-api-cf.fall3n.workers.dev'
const DATA_ORIGIN = 'https://data-api.fall3n.workers.dev'

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const onRequest = async ({ request }: PagesRequestContext): Promise<Response> => {
  const incoming = new URL(request.url)
  const path = incoming.pathname.slice('/api/'.length)
  const segments = path.split('/')

  if (!path || segments.some((segment) => segment === '.' || segment === '..')) {
    return jsonError('Invalid API path', 400)
  }

  let upstreamUrl: URL
  if (path === 'truck-health') {
    upstreamUrl = new URL('/health', TRUCK_ORIGIN)
  } else if (segments[0] === 'truck' && segments.length > 1) {
    upstreamUrl = new URL('/api/' + segments.slice(1).join('/'), TRUCK_ORIGIN)
  } else if (segments[0] === 'data' && segments.length > 1) {
    upstreamUrl = new URL('/api/' + segments.slice(1).join('/'), DATA_ORIGIN)
  } else {
    return jsonError('Unknown API service', 404)
  }
  upstreamUrl.search = incoming.search

  const headers = new Headers()
  for (const name of ['accept', 'authorization', 'content-type', 'idempotency-key', 'if-match', 'if-none-match']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const method = request.method.toUpperCase()
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      signal: controller.signal,
    })

    const responseHeaders = new Headers()
    for (const name of ['content-type', 'cache-control', 'etag', 'content-disposition', 'last-modified', 'retry-after']) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    if (!responseHeaders.has('cache-control')) responseHeaders.set('Cache-Control', 'no-store')

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch {
    return jsonError('Upstream API unavailable', 502)
  } finally {
    clearTimeout(timeout)
  }
}