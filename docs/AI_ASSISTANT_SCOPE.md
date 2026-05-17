# AI asistan kapsamı (LLM)

## İlke

**Tüm sayısal metraj ve teklif toplamları deterministik motor + sunucu `compute` ile üretilir.** LLM asla tek başına `N_gross`, KDV veya para tutarını “tahmin” etmez.

## LLM’in yapabilecekleri (MVP)

1. **Doğal dil → form önerisi**  
   Örnek: “12 metrekare duvar, 60x120, fire yüzde 8, derz 2mm” → yapılandırılmış JSON (şema: `TileSurfaceInput`). Kullanıcı onaylamadan uygulanmaz.

2. **Tutarlılık / eksik kalem uyarısı**  
   - Birim karışıklığı (cm vs mm)  
   - Fire % çok düşük uyarısı  
   - “Zemin girilmedi” gibi şablon kontrolleri

3. **Metin üretimi**  
   - Müşteri e-postası taslağı  
   - Teklif kapak notu (şablon + kullanıcı sözlüğü)  
   Motor çıktısı **parametre** olarak verilir; LLM sadece cümleleri üretir.

## LLM’in yapmayacağı

- PDF’teki rakamları tek başına değiştirmek  
- DWG/PDF’den otomatik kesin metraj (Faz 2/3 ayrı ürün kuralı)

## Uygulama notları

- Sunucuda: kısa prompt + **JSON schema** / Zod doğrulama  
- İstemci: ağ yoksa AI devre dışı; manuel akış çalışır
