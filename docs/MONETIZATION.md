# Ticarileştirme — Freemium ve IAP taslağı

## Katmanlar

| Katman | Proje limiti | PDF | Bulut |
|--------|----------------|-----|--------|
| Ücretsiz | Örn. en fazla 3 aktif proje | Watermark + “Ücretsiz sürüm” | Yok veya yalnız cihaz |
| Pro (IAP) | Sınırsız veya yüksek limit | Watermark yok, logo | Yedekleme (sonra) |
| Ekip | — | — | Paylaşım, ortak fiyat kütüphanesi (yol haritası) |

## Store ürün kimlikleri (placeholder)

Platform konsolunda oluşturulacak sabitler:

- iOS: `com.metrajteklif.pro.monthly`, `com.metrajteklif.pro.yearly`
- Android: `pro_monthly`, `pro_yearly` (Play Console ile eşleşen tam ID’ler)

Kodda `expo-in-app-purchases` veya `react-native-iap` entegrasyonu — **MVP’de stub**: satın alma düğmesi “yakında”.

## Watermark stratejisi (PDF)

- Ücretsiz: diyagonal yarı saydam “MetrajTeklif — Ücretsiz”, alt bilgi metni  
- Pro: watermark yok; `POST /quote-pdf` isteğinde `watermark: false` yalnızca doğrulanmış abonelikte

## Fiyatlandırma

Pazar araştırması sonrası güncellenir; teknik olarak sunucu **entitlement** kontrolü yapar.
