/**
 * Arayüz metinleri — tarayıcı otomatik çevirisi İngilizce "fire"ı "yangın" yapabildiği için
 * kullanıcıya gösterilen yerlerde "ziyan payı" terimi kullanılır (kesim/kırık için ek plaka payı).
 * Kod alanları (wastePct, wastePolicy) İngilizce kalır; JSON dışa aktarımda da aynıdır.
 */

export const UI = {
  wastePctFieldLabel: (maxPct: number) => `Ziyan payı % (en fazla ${maxPct})`,
  wastePctHint: (maxPct: number) =>
    `MVP üst sınırı %${maxPct}. Ziyan: kesim ve kırık için ayrılan ek plaka payı.`,
  wastePolicySection: 'Ziyan politikası',
  /** Kalem satırı özetinde (küçük metin) */
  lineMetaWastePct: (pct: number) => `ziyan %${pct}`,
} as const
