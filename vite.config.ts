import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type Plugin } from 'vite'

function devApiProxy(): Plugin {
  return {
    name: 'work-shell-dev-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url ?? ''
        let target: string | null = null
        if (path.startsWith('/api/truck-health')) target = 'https://truck-api-cf.fall3n.workers.dev/health'
        else if (path.startsWith('/api/truck/')) target = 'https://truck-api-cf.fall3n.workers.dev/api/' + path.slice('/api/truck/'.length)
        else if (path.startsWith('/api/data/')) target = 'https://data-api.fall3n.workers.dev/api/' + path.slice('/api/data/'.length)
        if (!target) return next()
        try {
          const headers = new Headers()
          for (const key of ['authorization', 'content-type', 'idempotency-key']) {
            const value = req.headers[key]
            if (typeof value === 'string') headers.set(key, value)
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          const body = chunks.length && req.method !== 'GET' && req.method !== 'HEAD' ? Buffer.concat(chunks) : undefined
          const upstream = await fetch(target, { method: req.method, headers, body })
          res.statusCode = upstream.status
          upstream.headers.forEach((value, key) => {
            if (['content-type', 'cache-control', 'etag'].includes(key.toLowerCase())) res.setHeader(key, value)
          })
          res.end(Buffer.from(await upstream.arrayBuffer()))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Upstream API unavailable', detail: error instanceof Error ? error.message : String(error) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [svelte(), devApiProxy()],
  server: { host: '0.0.0.0' },
})