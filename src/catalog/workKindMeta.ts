import type { Discipline } from '../types/domain'
import type { WorkKind } from '../types/workItem'

export interface WorkKindMeta {
  kind: WorkKind
  title: string
  category: string
  shortHelp: string
  inputHint: string
  disciplines?: Discipline[]
}

export const WORK_KIND_META: WorkKindMeta[] = [
  {
    kind: 'excavation',
    title: 'Kazı / hafriyat',
    category: 'Kaba yapı & zemin',
    shortHelp: 'Temel, radye veya yol için hacim metrajı.',
    inputHint: 'Boy, en, derinlik (m). Şişme payı nakliye için.',
    disciplines: ['civil', 'landscape'],
  },
  {
    kind: 'reinforced_concrete',
    title: 'Betonarme (donatılı)',
    category: 'Kaba yapı & zemin',
    shortHelp: 'Temel, kolon, kiriş, döşeme — beton + donatı normu.',
    inputHint: 'Boy×en×kalınlık; eleman tipi ile kg/m³ normu ayarlardan gelir.',
    disciplines: ['civil'],
  },
  {
    kind: 'concrete',
    title: 'Beton (donatısız)',
    category: 'Kaba yapı & zemin',
    shortHelp: 'Şap altı radye, mertek beton vb.',
    inputHint: 'Hazır beton m³ veya şantiye karışımı torba/kum/çakıl.',
    disciplines: ['civil'],
  },
  {
    kind: 'formwork',
    title: 'Kalıp işi',
    category: 'Kaba yapı & zemin',
    shortHelp: 'Beton hacmine göre kalıp m².',
    inputHint: 'İlgili beton hacmi (m³); m³ başına kalıp m² normu ayarlarda.',
    disciplines: ['civil'],
  },
  {
    kind: 'steel',
    title: 'Çelik / donatı (paket)',
    category: 'Kaba yapı & zemin',
    shortHelp: 'kg girişi veya m² başına norm.',
    inputHint: 'Keşif kg veya alan×kg/m²; hasır / profil / donatı rolü seçin.',
    disciplines: ['civil'],
  },
  {
    kind: 'facade',
    title: 'Cephe kaplama',
    category: 'Çatı & cephe',
    shortHelp: 'Dış cephe m²; taş, kompozit, cam veya boya.',
    inputHint: 'Net cephe alanı; kaplama tipi seçin.',
    disciplines: ['civil'],
  },
  {
    kind: 'scaffolding',
    title: 'İskele',
    category: 'Çatı & cephe',
    shortHelp: 'Cephe iskelesi kiralama metrajı.',
    inputHint: 'Bina çevresi × yükseklik (m).',
    disciplines: ['civil'],
  },
  {
    kind: 'roof',
    title: 'Çatı kaplama',
    category: 'Çatı & cephe',
    shortHelp: 'Kiremit, membran veya metal kaplama.',
    inputHint: 'Çatı alanı m², kaplama tipi, eğim payı %.',
    disciplines: ['civil'],
  },
  {
    kind: 'insulation',
    title: 'Isı yalıtımı / mantolama',
    category: 'Yalıtım',
    shortHelp: 'EPS, XPS veya taş yünü levha.',
    inputHint: 'Alan m², kalınlık cm; levha ve yapıştırıcı normları ayarlarda.',
  },
  {
    kind: 'waterproofing',
    title: 'Su yalıtımı',
    category: 'Yalıtım',
    shortHelp: 'Temel, perde, teras, ıslak hacim.',
    inputHint: 'Alan m² ve kat sayısı (bindirme).',
  },
  {
    kind: 'masonry_wall',
    title: 'Duvar örme',
    category: 'Duvar & bölme',
    shortHelp: 'Tuğla veya gazbeton; harç/çimento ve tuğla adedi.',
    inputHint: 'Duvar boyu, yüksekliği, boşluk alanı; normlar ayarlardan.',
  },
  {
    kind: 'electrical',
    title: 'Elektrik tesisatı (paket)',
    category: 'Tesisat',
    shortHelp: 'Alan bazlı kablo, priz ve pano yaklaşığı.',
    inputHint: 'Iskan alanı m² ve yoğunluk (hafif / standart / yoğun).',
    disciplines: ['civil', 'interior'],
  },
  {
    kind: 'elevator',
    title: 'Asansör',
    category: 'Tesisat & mekanik',
    shortHelp: 'Asansör adedi ve durak sayısı.',
    inputHint: 'Makine + montaj paketi; özel projede ayrı keşif.',
    disciplines: ['civil'],
  },
  {
    kind: 'hvac',
    title: 'Isıtma-soğutma (HVAC)',
    category: 'Tesisat & mekanik',
    shortHelp: 'Split, VRF veya kanallı sistem paketi.',
    inputHint: 'Iskan m² ve sistem tipi.',
    disciplines: ['civil'],
  },
  {
    kind: 'plumbing',
    title: 'Sıhhi tesisat (paket)',
    category: 'Tesisat',
    shortHelp: 'Boru hattı ve armatür adedi yaklaşığı.',
    inputHint: 'Alan m² ve armatür sayısı (lavabo, klozet vb.).',
    disciplines: ['civil', 'interior'],
  },
  {
    kind: 'plaster',
    title: 'Sıva',
    category: 'Sıva & şap',
    shortHelp: 'İç/dış sıva alanı ve kalınlık.',
    inputHint: 'Net sıva alanı m², kalınlık mm.',
  },
  {
    kind: 'screed',
    title: 'Şap / tesviye',
    category: 'Sıva & şap',
    shortHelp: 'Zemin şapı hacmi ve yaklaşık çimento.',
    inputHint: 'Alan m², kalınlık cm.',
  },
  {
    kind: 'tile',
    title: 'Seramik / fayans kaplama',
    category: 'Kaplama & bitirme',
    shortHelp: 'Plaka adedi ve derz kg.',
    inputHint: 'Kaplama alanı m², plaka ölçüsü, derz ve ziyan payı.',
    disciplines: ['interior', 'civil'],
  },
  {
    kind: 'paint',
    title: 'Boya',
    category: 'Kaplama & bitirme',
    shortHelp: 'İç cephe boya litresi yaklaşık.',
    inputHint: 'Alan m² ve kat sayısı.',
    disciplines: ['interior'],
  },
]

export function workKindsForDiscipline(discipline: Discipline): WorkKindMeta[] {
  return WORK_KIND_META.filter(
    (m) => !m.disciplines || m.disciplines.includes(discipline)
  )
}

export function getWorkKindMeta(kind: WorkKind): WorkKindMeta {
  return WORK_KIND_META.find((m) => m.kind === kind) ?? WORK_KIND_META[0]
}
