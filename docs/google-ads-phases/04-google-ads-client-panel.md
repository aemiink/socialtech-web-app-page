<!-- docs/google-ads-phases/04-google-ads-client-panel.md -->

# FAZ 4 — Google Ads Client Panel: Yönetilebilir ve Sürdürülebilir Sekme Yapısı

## Amaç

Client Panel’deki Google Ads panelinin tüm sekmeleri yönetilebilir, sürdürülebilir ve API-driven hale gelmeli.

Mevcut tasarım korunacak; mock veriler gerçek data contract ile beslenecek.

## Client Panel Ana Sayfa

Dosya mevcutsa onu kullan:

```text
clientPanel/src/app/pages/services/google-ads-dashboard.tsx
```

Eğer mevcut dosya yoksa service pages mimarisine uygun şekilde oluştur.

Bu dosya korunacak; sadece data source API-driven hale getirilecek.

## Sekmeler

Önerilen Google Ads sekmeleri:

1. Genel Bakış
2. Kampanyalar
3. Reklam Grupları
4. Reklamlar
5. Anahtar Kelimeler
6. Dönüşümler
7. Arama Terimleri
8. Raporlar
9. Ajans Notları
10. Onaylar

## Her Sekmenin Backend Karşılığı

### Genel Bakış

Endpoint:

```http
GET /api/v1/client/google-ads/summary
```

Gösterilecek:

- cost
- impressions
- clicks
- conversions
- conversion value
- CTR
- average CPC
- cost per conversion
- ROAS, conversion value varsa
- date range
- last sync date

### Kampanyalar

Endpoint:

```http
GET /api/v1/client/google-ads/campaigns
```

Gösterilecek:

- campaign name
- campaign id
- advertising channel type
- status
- serving status
- cost
- impressions
- clicks
- conversions
- CTR
- average CPC
- cost per conversion

### Reklam Grupları

Endpoint:

```http
GET /api/v1/client/google-ads/ad-groups
```

Gösterilecek:

- campaign name
- ad group name
- status
- cost
- clicks
- impressions
- conversions
- CTR
- average CPC

### Reklamlar

Endpoint:

```http
GET /api/v1/client/google-ads/ads
```

Gösterilecek:

- campaign
- ad group
- ad name / ad id
- ad type
- status
- final URL
- cost
- impressions
- clicks
- conversions

### Anahtar Kelimeler

Endpoint:

```http
GET /api/v1/client/google-ads/keywords
```

Gösterilecek:

- keyword text
- match type
- campaign
- ad group
- status
- cost
- clicks
- conversions
- CTR
- average CPC

### Dönüşümler

Endpoint:

```http
GET /api/v1/client/google-ads/conversions
```

Gösterilecek:

- conversion action
- conversions
- conversion value
- cost per conversion
- conversion rate

### Arama Terimleri

Endpoint:

```http
GET /api/v1/client/google-ads/search-terms
```

Gösterilecek:

- search term
- campaign
- ad group
- keyword, varsa
- cost
- clicks
- conversions
- CTR

### Raporlar

Mevcut reports altyapısı kullanılabilir.

Google Ads report entity bağlanmalı.

### Ajans Notları

Project/task/workspace message veya özel `GoogleAdsNote` modeliyle ilerlenebilir.

V1’de client approval/info sistemi kullanılabilir.

### Onaylar

Client approval workflow ile entegre:

- campaign approval
- budget change approval
- report acknowledgement
- strategy approval

## UI Davranışı

- Loading state.
- Error state.
- Empty state.
- Connection not configured state.
- Last sync date.
- “Veriler Google Ads API üzerinden alınmıştır” bilgilendirmesi.
- Büyük teknik hata yerine sade client-facing mesaj.
- Mock fallback yok.
- Mevcut tasarım korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `clientPanel` Google Ads dashboard ve tab yapısını incele.
2. Mevcut mock tasarımı koru.
3. Google Ads client RTK Query feature oluştur veya mevcut feature’ı genişlet.
4. Summary, campaigns, ad-groups, ads, keywords, conversions, search-terms endpointlerini bağla.
5. Loading/error/empty/connection-missing states ekle.
6. Purchased service authorization restore logic bozulmasın.
7. Client only own scope data görsün.
8. Onaylar sekmesini mevcut client approvals sistemiyle bağla.
9. Reports sekmesini mevcut reports veya Google Ads report endpointine bağlamaya hazır hale getir.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

ClientPanel:

- GOOGLE_ADS purchased service varsa panel görünür.
- GOOGLE_ADS yoksa panel görünmez.
- Summary endpoint data render eder.
- Connection missing empty state.
- Campaign list render.
- Ad group list render.
- Keyword list render.
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

- Client Panel Google Ads tasarımı korunur.
- Sekmeler API-driven olur.
- Mock fallback kaldırılır.
- Müşteri sadece kendi Google Ads verisini görür.
- Testler geçer.