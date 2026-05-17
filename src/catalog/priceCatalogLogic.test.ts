import { describe, expect, it } from 'vitest'
import {
  getCatalogEntry,
  normalizeMaterialKey,
  searchCatalog,
  upsertCatalogEntry,
} from './priceCatalogLogic'

describe('normalizeMaterialKey', () => {
  it('trims and lowercases', () => {
    expect(normalizeMaterialKey('  60x120 Fayans  ')).toBe('60x120 fayans')
  })
})

describe('upsertCatalogEntry', () => {
  it('adds and updates without limit', () => {
    let cat = {}
    for (let i = 0; i < 60; i++) {
      cat = upsertCatalogEntry(cat, `Malzeme ${i}`, 100 + i)
    }
    expect(Object.keys(cat)).toHaveLength(60)
    cat = upsertCatalogEntry(cat, 'Malzeme 0', 250)
    expect(getCatalogEntry(cat, 'malzeme 0')?.unitPriceTry).toBe(250)
  })
})

describe('searchCatalog', () => {
  it('finds by partial label', () => {
    const cat = upsertCatalogEntry({}, 'Banyo zemin 60x120', 450)
    const hits = searchCatalog(cat, 'banyo')
    expect(hits).toHaveLength(1)
    expect(hits[0].unitPriceTry).toBe(450)
  })
})
