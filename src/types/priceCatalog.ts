/** Birim: kaplama kalemlerinde brüt plaka adedi × birim fiyat */
export type PriceUnit = 'adet'

export interface MaterialPriceEntry {
  /** normalizeMaterialKey(label) */
  key: string
  /** Son kullanılan görünen ad */
  label: string
  unitPriceTry: number
  unit: PriceUnit
  updatedAt: string
  lastUsedAt: string
}

export type PriceCatalog = Record<string, MaterialPriceEntry>
