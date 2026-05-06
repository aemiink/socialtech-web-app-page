<!-- docs/amazon-ads-phases/04-amazon-ads-client-panel.md -->

# FAZ 4 — Amazon Ads Client Panel: Yönetilebilir ve Sürdürülebilir Sekme Yapısı

## Amaç

Client Panel’deki Amazon Ads panelinin tüm sekmeleri yönetilebilir, sürdürülebilir ve API-driven hale gelmeli.

Mevcut tasarım korunacak; mock veriler gerçek data contract ile beslenecek.

## Client Panel Ana Sayfa

Dosya mevcutsa onu kullan:

```text
clientPanel/src/app/pages/services/amazon-ads-dashboard.tsx
```

Eğer mevcut dosya yoksa service pages mimarisine uygun şekilde oluştur.

Bu dosya korunacak; sadece data source API-driven hale getirilecek.

## Sekmeler

Önerilen Amazon Ads sekmeleri:

1. Genel Bakış
2. Sponsored Products
3. Sponsored Brands
4. Sponsored Display
5. Kampanyalar
6. Ürünler / ASIN
7. Anahtar Kelimeler
8. Targeting
9. Arama Terimleri
10. Raporlar
11. Ajans Notları
12. Onaylar

## Her Sekmenin Backend Karşılığı

### Genel Bakış

Endpoint:

```http
GET /api/v1/client/amazon-ads/summary
```

Gösterilecek:

- spend
- impressions
- clicks
- sales
- orders
- units sold
- ACOS
- ROAS
- CTR
- CPC
- conversion rate
- date range
- last sync date

### Sponsored Products

Endpoint:

```http
GET /api/v1/client/amazon-ads/campaigns?adProduct=SPONSORED_PRODUCTS
```

Gösterilecek:

- campaign name
- status
- spend
- sales
- orders
- ACOS
- ROAS
- clicks
- impressions

### Sponsored Brands

Endpoint:

```http
GET /api/v1/client/amazon-ads/campaigns?adProduct=SPONSORED_BRANDS
```

Gösterilecek:

- campaign name
- creative/brand info, varsa
- spend
- sales
- clicks
- impressions
- ACOS
- ROAS

### Sponsored Display

Endpoint:

```http
GET /api/v1/client/amazon-ads/campaigns?adProduct=SPONSORED_DISPLAY
```

Gösterilecek:

- campaign name
- tactic / targeting summary, varsa
- spend
- sales
- clicks
- impressions
- ACOS
- ROAS

### Ürünler / ASIN

Endpoint:

```http
GET /api/v1/client/amazon-ads/products
```

Gösterilecek:

- ASIN
- SKU
- product title, varsa
- spend
- sales
- orders
- units sold
- ACOS
- ROAS

### Anahtar Kelimeler

Endpoint:

```http
GET /api/v1/client/amazon-ads/keywords
```

Gösterilecek:

- keyword text
- match type
- campaign
- ad group
- spend
- clicks
- sales
- orders
- ACOS

### Targeting

Endpoint:

```http
GET /api/v1/client/amazon-ads/targets
```

Gösterilecek:

- target type
- target expression
- campaign
- ad group
- spend
- sales
- ACOS
- ROAS

### Arama Terimleri

Endpoint:

```http
GET /api/v1/client/amazon-ads/search-terms
```

Gösterilecek:

- search term
- campaign
- ad group
- keyword/target, varsa
- spend
- clicks
- sales
- orders
- ACOS

### Raporlar

Mevcut reports altyapısı kullanılabilir.

Amazon Ads report entity bağlanmalı.

### Ajans Notları

Project/task/workspace message veya özel `AmazonAdsNote` modeliyle ilerlenebilir.

V1’de client approval/info sistemi kullanılabilir.

### Onaylar

Client approval workflow ile entegre:

- campaign approval
- budget change approval
- report acknowledgement
- product promotion strategy approval

## UI Davranışı

- Loading state.
- Error state.
- Empty state.
- Connection not configured state.
- Last sync date.
- “Veriler Amazon Ads API üzerinden alınmıştır” bilgilendirmesi.
- Büyük teknik hata yerine sade client-facing mesaj.
- Mock fallback yok.
- Mevcut tasarım korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `clientPanel` Amazon Ads dashboard ve tab yapısını incele.
2. Mevcut mock tasarımı koru.
3. Amazon Ads client RTK Query feature oluştur veya mevcut feature’ı genişlet.
4. Summary, campaigns, products, keywords, targets, search-terms endpointlerini bağla.
5. Loading/error/empty/connection-missing states ekle.
6. Purchased service authorization restore logic bozulmasın.
7. Client only own scope data görsün.
8. Onaylar sekmesini mevcut client approvals sistemiyle bağla.
9. Reports sekmesini mevcut reports veya Amazon Ads report endpointine bağlamaya hazır hale getir.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

ClientPanel:

- AMAZON_ADS purchased service varsa panel görünür.
- AMAZON_ADS yoksa panel görünmez.
- Summary endpoint data render eder.
- Connection missing empty state.
- Campaign list render.
- Products list render.
- Keywords list render.
- API error state.
- Tab switching data query.
- Unauthorized client başka client data göremez.
- Approvals tab pending approval gösterir.
- Mock fallback yok.

## Validation Komutları

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

Backend touched ise:

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

## Kabul Kriterleri

- Client Panel Amazon Ads tasarımı korunur.
- Sekmeler API-driven olur.
- Mock fallback kaldırılır.
- Müşteri sadece kendi Amazon Ads verisini görür.
- Testler geçer.