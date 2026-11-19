export const onRequestGet = async (): Promise<Response> => {
  try {
    const upstream = await fetch('https://truck-api-cf.fall3n.workers.dev/health', {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(8_000),
    })
    return Response.json(await upstream.json(), {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'TRUCK health check unavailable' }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}