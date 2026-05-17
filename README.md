# MetrajTeklifMobil

**Stok Takip** deposundan ayrı, `C:\Users\Habip\MetrajTeklifMobil` altında konumlanan greenfield Expo uygulaması.

## Özellikler (MVP)

- Proje → alan → kaplama kalemleri hiyerarşisi
- Deterministik fayans metraj motoru (`src/engine/tileMath.ts`) — ayrıntı: [docs/MATH_SPEC.md](docs/MATH_SPEC.md)
- Özet ekranı (brüt plaka, isteğe bağlı birim fiyat + KDV)
- **Metraj** (alan ekranı) ve **yaklaşık maliyet** (birim fiyatlar, işçilik %, elle malzeme) ayrı adımlar; **teklif** maliyetten üretilir
- Yerel **fiyat kütüphanesi** (maliyet ekranında; sınırsız malzeme — cihazda saklanır)
- Çoklu iş kalemi metrajı (duvar, kazı, betonarme, çatı, cephe, tesisat paketleri, asansör, HVAC, iskele…)
- Ayarlanabilir **norm katsayıları** ve kalem bazlı **% çarpan**
- Dışa aktarım: **PDF**, **Excel (CSV)** ve JSON; firma profili + logo

## Expo Go dışında çalıştırma (APK / yüklü uygulama)

Expo Go, geliştirme içindir; müşteriye veya sahaya **kurulu uygulama** için aşağıdakilerden birini kullanın.

### 1) EAS Build (önerilen — bulut veya kendi makinenizde derleme)

1. Bağımlılıkları kurun (ilk kez veya `package.json` değiştiyse): `npm install`
2. [Expo hesabı](https://expo.dev) açın, terminalde: `npm run eas:login`  
   (`npx eas login` çalışmaz — npm paket adı `eas-cli`dir.)
3. Projeyi bağlayın: `npm run eas:init` (`projectId` otomatik yazılır)
4. **Android APK (test):** `npm run build` veya `npm run build:preview:android`  
   Bittiğinde [expo.dev](https://expo.dev) → projeniz → **.apk** indirin.
5. **Mağaza sürümü:** `npm run build:prod` → ardından `npm run eas -- submit`

`eas-cli` projede `devDependencies` içindedir; `npm install` sonrası `npm run eas:login` kullanın.

### 2) Yerel derleme (USB ile cihaz / emülatör)

Android Studio veya Xcode kurulu olmalı.

```bash
npm run prebuild          # android/ ios/ native klasörleri
npm run run:android       # USB/emülatörde debug kurulum
```

Release APK için Android Studio → **Build → Generate Signed Bundle/APK** veya Gradle (`android/` altında).

### 3) Web sürümü (Vercel — ön test, Apple hesabı gerekmez)

Yerel geliştirme:

```bash
npm run web
```

**Vercel’e yayınlama** (iPhone/Android’de link ile test):

1. Kodu [GitHub](https://github.com)’a push edin (`MetrajTeklifMobil` reposu).
2. [vercel.com](https://vercel.com) → giriş (GitHub ile) → **Add New… → Project** → repoyu seçin.
3. Vercel ayarları `vercel.json` dosyasından okunur; elle değiştirmeyin:
   - Build: `npx expo export --platform web`
   - Output: `dist`
4. **Deploy** → `https://…vercel.app` adresi oluşur.
5. Her `git push` (main) sonrası otomatik yeniden deploy (varsayılan).

Testçilere URL’yi gönderin. iPhone: Safari → **Paylaş → Ana Ekrana Ekle** (isteğe bağlı).

CLI ile tek seferlik deploy (GitHub’sız):

```bash
npm install -g vercel
npm run export:web
vercel --prod
```

**Not:** Web’de veriler tarayıcıda (`localStorage`) kalır; native APK’dan farklıdır. Mağaza yayını için EAS build kullanın.

## Komutlar

```bash
cd C:\Users\Habip\MetrajTeklifMobil
npm install --legacy-peer-deps
npm run start
npm run start:tunnel
npm run web
npm run test
```

**Expo’yu durdurmak:** çalıştırdığın terminalde **`Ctrl+C`**. Takılı kalırsa terminal sekmesini kapatıp yeni terminal aç. Şüpheli önbellek için: `npx expo start -c`.

### iOS’ta “QR için kullanılabilir veri bulunamadı”

Bu mesaj genelde **iPhone Kamera** uygulamasının terminaldeki küçük/bozuk QR’ı veya `exp://…` adresini tanımamasından kaynaklanır.

1. **Expo Go** içinden okutun: [Expo Go (App Store)](https://apps.apple.com/app/expo-go/id982107779) → **Scan QR code** (Kamera uygulaması değil).
2. Bilgisayarda `npm run start` sonrası tarayıcıda **http://localhost:8081** açın; oradaki **QR genelde daha güvenilir**.
3. Hâlâ olmuyorsa Expo Go’da **Enter URL** / bağlantıyı elle yapıştırın; terminalde görünen **`exp://…`** satırını kopyalayın.
4. Telefon ile PC **aynı Wi‑Fi**de olsun; iOS’ta **Yerel ağ** iznini (Expo Go / geliştirici aracı) açın. Farklı ağdaysanız: `npm run start:tunnel` (**tünel**, internet gerekir; ilk seferde Expo hesabı istenebilir).

Tarayıcıda arayüzü görmek için: `npm run web` (Metro açıldıktan sonra Expo’nun gösterdiği **Web** adresi, genelde `http://localhost:8081`).

Chrome / Edge **otomatik çeviri** açıkken İngilizce “fire” gibi kelimeler “yangın” diye yanlış çevrilebilir. Geliştirme sırasında bu origin için çeviriyi kapatmanız iyi olur; uygulama metinleri Türkçe ve inşaat anlamındaki pay için **ziyan payı** ifadesini kullanır (kodda alan adı `wastePct` kalır).

Web’de Metro `ENOENT ... @emnapi\runtime\dist` ile çöküyorsa: `npm install --legacy-peer-deps` (projede `@emnapi/runtime` doğrudan bağımlılık olarak tanımlıdır).

**Expo Go + iOS “boolean / string” köprü hatası:** Yerel `react-native-screens` / `safe-area-context` / `async-storage` sürümleri Expo SDK ile uyumsuz olabiliyor. Çözüm: `npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage` (projede zaten uyumlu aralıklara çekildi). `app.json` içinde `newArchEnabled: false` **Expo Go’da işe yaramaz** (Go her zaman Yeni Mimari kullanır); bu anahtarı kaldırdık.

## Visual Studio Code’da test

1. **Klasörü doğru açın:** `Dosya` → `Klasör Aç…` → `C:\Users\Habip\MetrajTeklifMobil` (üst klasör değil, proje kökü).
2. Bir kez `npm install --legacy-peer-deps` çalıştırın (yerleşik terminal: `` Ctrl+` ``).
3. **Terminalden tek seferlik test:** `npm run test` — tüm birim testleri biter ve çıkış kodu hata varsa 0 değildir.
4. **İzleme modu (dosya kaydedince yeniden):** `npx vitest` — durdurmak için terminalde `q` veya `Ctrl+C`.
5. **Görev menüsü:** `Terminal` → `Görevi Çalıştır…` → **Testler (Vitest)**, **Testler (izleme modu)**, **Expo (Web önizleme)** veya **Expo (telefon, tünel)** (`.vscode/tasks.json`).
6. **Test Gezgini (isteğe bağlı):** Uzantılar’dan **Vitest** (`Vitest.vitest`) yükleyin; sol çubukta test ağacından tek tek veya tümünü çalıştırabilirsiniz.

## Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| [docs/STACK.md](docs/STACK.md) | Expo + TypeScript kilidi |
| [docs/AI_ASSISTANT_SCOPE.md](docs/AI_ASSISTANT_SCOPE.md) | LLM sınırları |
| [docs/MONETIZATION.md](docs/MONETIZATION.md) | Freemium / IAP taslağı |
