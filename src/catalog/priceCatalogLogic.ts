import type { MaterialPriceEntry, PriceCatalog } from '../types/priceCatalog'

export function normalizeMaterialKey(label: string): string {
  return label.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ')
}

export function upsertCatalogEntry(
  catalog: PriceCatalog,
  label: string,
  unitPriceTry: number,
  now: string = new Date().toISOString()
): PriceCatalog {
  const trimmed = label.trim()
  if (!trimmed || unitPriceTry <= 0 || !Number.isFinite(unitPriceTry)) return catalog

  const key = normalizeMaterialKey(trimmed)
  const prev = catalog[key]

  return {
    ...catalog,
    [key]: {
      key,
      label: trimmed,
      unitPriceTry,
      unit: 'adet',
      updatedAt: now,
      lastUsedAt: now,
    },
  }
}

export function touchCatalogEntry(catalog: PriceCatalog, key: string, now: string): PriceCatalog {
  const entry = catalog[key]
  if (!entry) return catalog
  return {
    ...catalog,
    [key]: { ...entry, lastUsedAt: now },
  }
}

export function searchCatalog(
  catalog: PriceCatalog,
  query: string,
  limit = 12
): MaterialPriceEntry[] {
  const q = normalizeMaterialKey(query)
  const all = Object.values(catalog)
  if (!q) {
    return all.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, limit)
  }
  return all
    .filter((e) => e.key.includes(q) || e.label.toLocaleLowerCase('tr-TR').includes(q))
    .sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))
    .slice(0, limit)
}

export function getCatalogEntry(catalog: PriceCatalog, label: string): MaterialPriceEntry | undefined {
  const key = normalizeMaterialKey(label)
  if (!key) return undefined
  return catalog[key]
}
