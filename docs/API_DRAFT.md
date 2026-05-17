# API taslağı — proje, metraj, PDF

Base URL: `https://api.example.com/v1` (placeholder)

## Veri modeli (özet)

- `Project`: id, name, discipline, clientName?, vatRatePct, spaces[], createdAt, updatedAt
- `Space` (alan): id, name, lineItems[]
- `LineItem`: id, kind (`tile_surface` | …), label, input alanları, `computed` (sunucu/istemci motor ile doldurulur)

## Uç noktalar

### `POST /projects`

Oluştur. Gövde: `CreateProjectDTO`.

### `GET /projects/{id}`

Tek proje.

### `PATCH /projects/{id}`

Alanlar / kalemler güncelleme (JSON merge veya versiyonlu PATCH).

### `POST /projects/{id}/compute`

Tüm satırlar için deterministik motoru çalıştır; `computed` alanlarını döndür. **Sayısal sonuç burada üretilir** (LLM değil).

**İstek örneği:**

```json
{
  "lineItems": [
    {
      "id": "li_1",
      "kind": "tile_surface",
      "areaM2": 12,
      "tileWidthCm": 60,
      "tileHeightCm": 120,
      "jointMm": 2,
      "wastePct": 8,
      "wastePolicy": "medium",
      "includeGroutEstimate": true
    }
  ]
}
```

**Yanıt:** her kalem için `TileComputationResult` + proje toplamları.

### `POST /projects/{id}/quote-pdf`

Sunucuda PDF üretir (logo, watermark politikası, KDV). Yanıt: `application/pdf` veya `{ "downloadUrl": "...", "expiresAt": "..." }`.

**İstek (örnek):**

```json
{
  "locale": "tr",
  "watermark": true,
  "organization": { "name": "Ofis Unvanı", "taxNo": "…" }
}
```

### `POST /assistant/parse-intent` (opsiyonel)

Doğal dil → **önerilen form JSON** (şema doğrulamalı). Hesap yapmaz; istemci motoru çağırır.

## Kimlik doğrulama

`Authorization: Bearer <jwt>` — ticari üründe zorunlu.

## Hata kodları

| HTTP | Anlamı |
|------|--------|
| 400 | Şema/validasyon |
| 401 | Yetkisiz |
| 409 | Revizyon çakışması (etag) |
