export interface DataLedgerSummary { count: number }
export interface DataClient {
  id: string
  name: string
  shopName: string
  branch: string
  image: string | null
  thumb: string | null
  badge: string | null
  hasNotes: boolean
  updatedAt: number
}

function firstText(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  if (typeof value !== 'string') return ''
  try {
    const parsed: unknown = JSON.parse(value)
    if (Array.isArray(parsed)) return typeof parsed[0] === 'string' ? parsed[0] : ''
  } catch { /* API may return a plain string */ }
  return value
}

function normalizeClient(value: Record<string, unknown>): DataClient {
  return {
    id: String(value.id ?? ''),
    name: firstText(value.name),
    shopName: firstText(value.shopName),
    branch: typeof value.branch === 'string' ? value.branch : '',
    image: typeof value.image === 'string' ? value.image : null,
    thumb: typeof value.thumb === 'string' ? value.thumb : null,
    badge: typeof value.badge === 'string' ? value.badge : null,
    hasNotes: value.hasNotes === true,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : 0,
  }
}

export async function getDataLedgerSummary(): Promise<DataLedgerSummary | null> {
  try {
    const response = await fetch('/api/data/clients/count', { cache: 'no-store' })
    if (!response.ok) return null
    const value = await response.json() as Partial<DataLedgerSummary>
    return typeof value.count === 'number' ? { count: value.count } : null
  } catch { return null }
}

export async function getDataLedgerClients(query = ''): Promise<DataClient[]> {
  try {
    const path = query.trim()
      ? '/api/data/clients/search?q=' + encodeURIComponent(query.trim())
      : '/api/data/clients/list'
    const response = await fetch(path, { cache: 'no-store' })
    if (!response.ok) return []
    const rows = await response.json() as Record<string, unknown>[]
    return rows.map(normalizeClient).filter((client) => client.id && (client.name || client.shopName)).slice(0, 8)
  } catch { return [] }
}