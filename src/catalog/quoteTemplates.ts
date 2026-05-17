import type { CostUnit } from '../types/costEstimate'
import type { Discipline } from '../types/domain'

export interface QuoteTemplateItem {
  label: string
  unit: CostUnit
  category: string
  /** Varsayılan miktar ipucu (kullanıcı düzenler) */
  defaultQty: number
}

export interface QuoteTemplateGroup {
  title: string
  items: QuoteTemplateItem[]
}

const common: QuoteTemplateGroup[] = [
  {
    title: 'Ortak — işçilik ve genel',
    items: [
      { label: 'İşçilik (genel)', unit: 'takim', category: 'İşçilik', defaultQty: 1 },
      { label: 'Nakliye / lojistik', unit: 'takim', category: 'Genel', defaultQty: 1 },
      { label: 'Şantiye genel gider payı', unit: 'takim', category: 'Genel', defaultQty: 1 },
    ],
  },
]

const interior: QuoteTemplateGroup[] = [
  {
    title: 'İç mimari — kaplama ve yapıştırma',
    items: [
      { label: 'Seramik / fayans (kaplama)', unit: 'm2', category: 'Kaplama', defaultQty: 1 },
      { label: 'Yapıştırıcı (çimento esaslı)', unit: 'torba', category: 'Yapıştırma', defaultQty: 1 },
      { label: 'Derz harcı', unit: 'kg', category: 'Derz', defaultQty: 1 },
      { label: 'Su yalıtımı (kat)', unit: 'lt', category: 'Yalıtım', defaultQty: 1 },
      { label: 'Şilte / ses yalıtımı', unit: 'm2', category: 'Yalıtım', defaultQty: 1 },
    ],
  },
  {
    title: 'İç mimari — bitirme',
    items: [
      { label: 'Süpürgelik', unit: 'm', category: 'Bitirme', defaultQty: 1 },
      { label: 'Alçıpan / bölme', unit: 'm2', category: 'Kuru inşaat', defaultQty: 1 },
      { label: 'Boya (iç cephe)', unit: 'm2', category: 'Boya', defaultQty: 1 },
      { label: 'Asma tavan', unit: 'm2', category: 'Tavan', defaultQty: 1 },
    ],
  },
]

const landscape: QuoteTemplateGroup[] = [
  {
    title: 'Peyzaj — zemin ve bitki',
    items: [
      { label: 'Toprak / humus', unit: 'm3', category: 'Toprak', defaultQty: 1 },
      { label: 'Çim / rulo', unit: 'm2', category: 'Çim', defaultQty: 1 },
      { label: 'Süs bitkisi', unit: 'adet', category: 'Bitki', defaultQty: 1 },
      { label: 'Ağaç / çalı', unit: 'adet', category: 'Bitki', defaultQty: 1 },
      { label: 'Malç / kaplama', unit: 'm2', category: 'Zemin', defaultQty: 1 },
    ],
  },
  {
    title: 'Peyzaj — sert zemin ve sulama',
    items: [
      { label: 'Doğal taş / kaplama', unit: 'm2', category: 'Sert zemin', defaultQty: 1 },
      { label: 'Bordür / kenar elemanı', unit: 'm', category: 'Sert zemin', defaultQty: 1 },
      { label: 'Sulama borusu ve fittings', unit: 'takim', category: 'Sulama', defaultQty: 1 },
      { label: 'Damlama hattı', unit: 'm', category: 'Sulama', defaultQty: 1 },
    ],
  },
]

const architecture: QuoteTemplateGroup[] = [
  {
    title: 'Mimari — proje ve cephe',
    items: [
      { label: 'Mimari proje (paket)', unit: 'takim', category: 'Proje', defaultQty: 1 },
      { label: 'Ruhsat / resmi işler koordinasyonu', unit: 'takim', category: 'Proje', defaultQty: 1 },
      { label: 'Cephe kaplama sistemi', unit: 'm2', category: 'Cephe', defaultQty: 1 },
      { label: 'Doğrama (PVC / alüminyum)', unit: 'm2', category: 'Doğrama', defaultQty: 1 },
      { label: 'Cam cephe / korkuluk', unit: 'm', category: 'Cephe', defaultQty: 1 },
    ],
  },
]

const civil: QuoteTemplateGroup[] = [
  ...architecture,
  {
    title: 'İnşaat — kaba yapı',
    items: [
      { label: 'Beton (hazır / şantiye)', unit: 'm3', category: 'Betonarme', defaultQty: 1 },
      { label: 'Donatı çelik', unit: 'kg', category: 'Betonarme', defaultQty: 1 },
      { label: 'Kalıp işi', unit: 'm2', category: 'Betonarme', defaultQty: 1 },
      { label: 'Tuğla / gazbeton duvar', unit: 'm2', category: 'Duvar', defaultQty: 1 },
      { label: 'Çimento harcı', unit: 'torba', category: 'Duvar', defaultQty: 1 },
    ],
  },
  {
    title: 'İnşaat — yalıtım ve çatı',
    items: [
      { label: 'Temel / perde yalıtımı', unit: 'm2', category: 'Yalıtım', defaultQty: 1 },
      { label: 'Mantolama sistemi', unit: 'm2', category: 'Yalıtım', defaultQty: 1 },
      { label: 'Çatı kiremit / kaplama', unit: 'm2', category: 'Çatı', defaultQty: 1 },
      { label: 'Su yalıtım membranı', unit: 'm2', category: 'Yalıtım', defaultQty: 1 },
    ],
  },
  {
    title: 'İnşaat — tesisat (yaklaşık kalem)',
    items: [
      { label: 'Elektrik tesisatı (paket)', unit: 'takim', category: 'Tesisat', defaultQty: 1 },
      { label: 'Sıhhi tesisat (paket)', unit: 'takim', category: 'Tesisat', defaultQty: 1 },
      { label: 'Doğalgaz tesisatı', unit: 'takim', category: 'Tesisat', defaultQty: 1 },
    ],
  },
]

export function getQuoteTemplateGroups(discipline: Discipline): QuoteTemplateGroup[] {
  const specific =
    discipline === 'interior' ? interior : discipline === 'landscape' ? landscape : civil
  return [...specific, ...common]
}
