export type AppId = 'home' | 'truck' | 'data' | 'portal'

export interface AppDefinition { id: AppId; name: string; shortName: string; description: string; eyebrow: string; icon: string; accent: string; status: 'connected' | 'planned' }

export const applications: AppDefinition[] = [
  { id: 'truck', name: 'TRUCK', shortName: 'Truck', description: 'Fleet, shifts and income operations', eyebrow: 'OPERATIONS', icon: 'truck', accent: 'blue', status: 'connected' },
  { id: 'data', name: 'DATA LEDGER', shortName: 'Data', description: 'Client records, catalog and location data', eyebrow: 'INFORMATION', icon: 'database', accent: 'yellow', status: 'connected' },
]