# Teknoloji seçimi — kilitleme

## Karar: **Expo + React Native + TypeScript**

| Kriter | Expo (TS) | Flutter |
|--------|-----------|---------|
| Mevcut ekip / ekosistem | Stok Takip ile aynı dil (TS) | Dart öğrenme eğrisi |
| MVP hızı | Yüksek | Orta |
| PDF / IAP | Sunucu tarafı PDF önerilir; istemcide `expo-sharing` vb. | Güçlü plugin ekosistemi |

**Sonuç:** Greenfield mobil ürün için **Expo SDK 54**, **React Navigation** (native stack), hesap motoru saf TypeScript (`src/engine`), birim test **Vitest** (Node; RN bağımlılığı yok).

## Peer uyarıları

Windows ortamında `react-native-screens` ile `react-native` sürüm uyumsuzluğu yaşanırsa kurulum: `npm install --legacy-peer-deps`.

## Backend (plan ile uyum)

- API anahtarları ve PDF üretimi **sunucuda** (ayrı servis / Firebase Functions vb.).
- Bu repo: istemci + motor + sözleşme dokümanları.
