<!-- docs/tiktok-ads-phases/04-tiktok-ads-client-panel.md -->

# FAZ 4 — TikTok Ads Client Panel: Yönetilebilir ve Sürdürülebilir Sekme Yapısı

## Amaç

Client Panel’deki TikTok Ads panelinin tüm sekmeleri yönetilebilir, sürdürülebilir ve API-driven hale gelmeli.

Mevcut tasarım korunacak; mock veriler gerçek data contract ile beslenecek.

## Client Panel Ana Sayfa

Dosya mevcutsa onu kullan:

```text
clientPanel/src/app/pages/services/tiktok-ads-dashboard.tsx
```

Eğer mevcut dosya yoksa service pages mimarisine uygun şekilde oluştur.

Bu dosya korunacak; sadece data source API-driven hale getirilecek.

## Sekmeler

Önerilen TikTok Ads sekmeleri:

1. Genel Bakış
2. Kampanyalar
3. Ad Groups
4. Ads
5. Creatives / Materials
6. Audience
7. Pixel / Events
8. Video Performance
9. Raporlar
10. Ajans Notları
11. Onaylar

## Her Sekmenin Backend Karşılığı

### Genel Bakış

Endpoint:

```http
GET /api/v1/client/tiktok-ads/summary
```

Gösterilecek:

- spend
- impressions
- reach
- clicks
- conversions
- CTR
- CPC
- CPM
- cost per conversion
- video views
- video view rate
- ROAS, varsa
- date range
- last sync date

### Kampanyalar

Endpoint:

```http
GET /api/v1/client/tiktok-ads/campaigns
```

Gösterilecek:

- campaign name
- objective
- status
- spend
- impressions
- clicks
- conversions
- CTR
- CPC

### Ad Groups

Endpoint:

```http
GET /api/v1/client/tiktok-ads/ad-groups
```

Gösterilecek:

- campaign
- ad group name
- placement
- optimization goal
- targeting summary
- budget
- spend
- conversions

### Ads

Endpoint:

```http
GET /api/v1/client/tiktok-ads/ads
```

Gösterilecek:

- ad name
- status
- spend
- impressions
- clicks
- conversions
- CTR
- video views

### Creatives / Materials

Endpoint:

```http
GET /api/v1/client/tiktok-ads/creatives
```

Gösterilecek:

- creative/material name
- thumbnail
- video preview, API/asset izin verirse
- spend
- impressions
- clicks
- conversions
- video views
- video view rate

### Pixel / Events

Endpoint:

```http
GET /api/v1/client/tiktok-ads/pixel-status
```

Gösterilecek:

- pixel id
- event status
- last event time
- setup warnings

### Raporlar

Mevcut reports altyapısı kullanılabilir.

TikTok Ads report entity bağlanmalı.

### Ajans Notları

Project/task/workspace message veya özel `TikTokAdsNote` modeliyle ilerlenebilir.

V1’de client approval/info sistemi kullanılabilir.

### Onaylar

Client approval workflow ile entegre:

- campaign launch approval
- creative approval
- budget change approval
- report acknowledgement

## UI Davranışı

- Loading state.
- Error state.
- Empty state.
- Connection not configured state.
- Last sync date.
- “Veriler TikTok Ads API üzerinden alınmıştır” bilgilendirmesi.
- Büyük teknik hata yerine sade client-facing mesaj.
- Mock fallback yok.
- Mevcut tasarım korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `clientPanel` TikTok Ads dashboard ve tab yapısını incele.
2. Mevcut mock tasarımı koru.
3. TikTok Ads client RTK Query feature oluştur veya mevcut feature’ı genişlet.
4. Summary, campaigns, ad-groups, ads, creatives, pixel-status endpointlerini bağla.
5. Loading/error/empty/connection-missing states ekle.
6. Purchased service authorization restore logic bozulmasın.
7. Client only own scope data görsün.
8. Onaylar sekmesini mevcut client approvals sistemiyle bağla.
9. Reports sekmesini mevcut reports veya TikTok Ads report endpointine bağlamaya hazır hale getir.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

ClientPanel:

- TIKTOK_ADS purchased service varsa panel görünür.
- TIKTOK_ADS yoksa panel görünmez.
- Summary endpoint data render eder.
- Connection missing empty state.
- Campaign list render.
- Creative list render.
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

- Client Panel TikTok Ads tasarımı korunur.
- Sekmeler API-driven olur.
- Mock fallback kaldırılır.
- Müşteri sadece kendi TikTok Ads verisini görür.
- Testler geçer.