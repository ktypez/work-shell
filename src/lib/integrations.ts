export interface IntegrationStatus { id: 'truck' | 'data' | 'clerk'; label: string; endpoint: string; status: 'checking' | 'online' | 'unavailable' | 'not-configured'; detail: string }

const TRUCK_HEALTH = import.meta.env.VITE_TRUCK_API_URL || '/api/truck-health'
const DATA_API = import.meta.env.VITE_DATA_API_URL || '/api/data/ping'

async function ping(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5000)
  try { const response = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store' }); return response.ok }
  catch { return false }
  finally { window.clearTimeout(timeout) }
}

export async function checkIntegrations(): Promise<IntegrationStatus[]> {
  const [truck, data] = await Promise.all([ping(TRUCK_HEALTH), ping(DATA_API)])
  return [
    { id: 'truck', label: 'TRUCK API', endpoint: TRUCK_HEALTH, status: truck ? 'online' : 'unavailable', detail: truck ? 'API health endpoint responded' : 'Health check blocked or unavailable' },
    { id: 'data', label: 'DATA API', endpoint: DATA_API, status: data ? 'online' : 'unavailable', detail: data ? 'API ping endpoint responded' : 'Ping blocked or unavailable' },
    { id: 'clerk', label: 'CLERK IDENTITY', endpoint: 'https://clerk.mcky.space', status: 'not-configured', detail: 'Shared Clerk identity via me.mcky.space; domain authorization needs verification' },
  ]
}