# Metraj motoru — hesap spesifikasyonu (MVP)

Bu belge deterministik motorun (`src/engine/tileMath.ts`) davranışını tanımlar. Sonuçlar **kullanıcı girdiğine** dayanır; yaklaşık modüller açık etiketlenir.

## Birimler

| Alan | Birim | Not |
|------|--------|-----|
| Yüzey alanı | m² | > 0 |
| Plaka en/boy | cm | > 0 |
| Derz | mm | ≥ 0 |
| Fire | % | 0–100 (üst sınır uygulamada 50 ile kısıtlanabilir) |
| Birim fiyat | TRY / adet veya m² | opsiyonel; teklif satırı |

## Etkin plaka alanı (MVP)

Derz çizgileri alanı küçük etkilediğinden MVP’de **nominal plaka alanı** kullanılır:

`A_plaka = (W_cm / 100) × (H_cm / 100)` m²

`N_net = A_yüzey / A_plaka` (kesirli; matematiksel plaka sayısı)

## Fire politikaları

`F = 1 + fire_% / 100`

| Politika | Kod | Formül |
|----------|-----|--------|
| Basit brüt | `simple` | `stableCeil(N_net × F)` — kayan nokta gürültüsü için komşu tamsayıya hizalama |

Uygulama: `stableCeil(x)` önce `x`’in en yakın tamsayıya uzaklığı `1e-6`’dan küçükse o tamsayıyı döndürür; aksi halde `ceil(x - 1e-9)`.
| Orta | `medium` | `ceil(ceil(N_net) × F)` — önce kısmi plakayı tam plakaya yuvarla, sonra fire uygula |
| Muhafazakâr | `conservative` | `ceil(ceil(N_net) × F) + 1` — ekstra tam plaka |

## Derz harcı (yaklaşık — zorunlu etiket)

**Yaklaşık modül:** üretici ve derinliğe göre değişir. MVP formülü:

`m_grout ≈ A_yüzey × k` kg, varsayılan `k = 1,3` kg/m² (yapılandırılabilir).

Çıktıda her zaman: **“Yaklaşık; ürün teknik föyüne göre doğrulayın.”**

## Teklif satırı çıktıları

- `N_net`, `N_gross` (adet tam plaka)
- `A_plaka_m2`, `A_yüzey_m2`
- `satır_tutarı` = `N_gross × birim_fiyat` (fiyat yoksa atlanır)
- `hesap_adımları[]`: kullanıcıya gösterilebilir kısa açıklamalar (güven)

## Test vektörleri (referans)

| # | A (m²) | Plaka (cm) | Fire % | Politika | Beklenen N_net | Beklenen N_gross |
|---|--------|------------|--------|----------|----------------|------------------|
| 1 | 12 | 60×120 | 0 | simple | 12/(0.6×1.2)=16.666… | 17 |
| 2 | 12 | 60×120 | 8 | simple | ceil(16.666×1.08)=ceil(18)=18 | 18 |
| 3 | 12 | 60×120 | 8 | medium | ceil(17×1.08)=ceil(18.36)=19 | 19 |
| 4 | 12 | 60×120 | 8 | conservative | ceil(17×1.08)+1=20 | 20 |
| 5 | 5.5 | 30×30 | 10 | simple | 5.5/(0.09)=61.111… | ceil(67.22)=68 | (61.111×1.1)=67.22→68 |
| 6 | 1 | 100×100 | 0 | medium | ceil(1)×1=1 | 1 |
| 7 | 0.99 | 100×100 | 0 | medium | ceil(0.99)=1 | 1 |
| 8 | 20 | 45×45 | 15 | simple | net=20/0.2025=98.76… | ceil(113.58)=114 |

*(Test dosyasında tolerans yok; tam sayı eşitliği kontrol edilir.)*
