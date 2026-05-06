<!-- docs/tiktok-ads-phases/03-tiktok-ads-reporting-sync.md -->

# FAZ 3 — TikTok Ads Read-Only Reporting API ve Data Sync

## Amaç

TikTok Ads API üzerinden müşteri bazlı performans verilerini çekmek ve panelde göstermek.

Bu fazda campaign management yok. Sadece dashboard/reporting.

## Veri Kaynağı

Kullanılacak API alanları:

- Reporting API
- Async report tasks
- Campaign endpoints
- Ad Group endpoints
- Ad endpoints
- Creative/material reporting
- Pixel/event measurement, erişilebiliyorsa

## Veri Stratejisi

### V1 Live Fetch + Cache

Dashboard açılınca API’den veri çekilir ve kısa TTL cache uygulanır.

Artıları:

- Hızlı geliştirme.
- DB model yükü az.

Eksileri:

- Rate limit riski.
- Sayfa yavaşlayabilir.
- Geçmiş trend analizi zor.
- TikTok async report task akışı bazı raporlar için daha uygun olabilir.

### V2 Persisted Daily Snapshots

Günlük/hourly sync ile DB’ye snapshot yazılır.

Artıları:

- Hızlı dashboard.
- Trend analizi.
- API rate limit daha kontrollü.
- Async report flow ile daha uyumlu.

Eksileri:

- Sync job gerekir.
- Daha fazla model gerekir.

## Faz Kararı

Faz 3’te:

- Critical dashboard için DB snapshot modeli kur.
- Manual sync endpoint ekle.
- Async report task flow mocklanabilir.
- İleride cron job eklenebilir.

## Backend Model

```prisma
model TikTokAdsDailyInsight {
  id              String @id @default(uuid())
  clientProfileId String
  advertiserId    String
  date            DateTime
  level           TikTokAdsInsightLevel
  entityId        String?
  entityName      String?
  spend           Decimal?
  impressions     Int?
  reach           Int?
  clicks          Int?
  conversions     Decimal?
  conversionValue Decimal?
  ctr             Decimal?
  cpc             Decimal?
  cpm             Decimal?
  costPerConversion Decimal?
  conversionRate  Decimal?
  videoViews      Int?
  videoViewRate   Decimal?
  completePayment Decimal?
  roas            Decimal?
  raw             Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum TikTokAdsInsightLevel {
  ACCOUNT
  CAMPAIGN
  AD_GROUP
  AD
  CREATIVE
  MATERIAL
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/tiktok-ads/clients/:clientId/summary
GET /api/v1/tiktok-ads/clients/:clientId/campaigns
GET /api/v1/tiktok-ads/clients/:clientId/ad-groups
GET /api/v1/tiktok-ads/clients/:clientId/ads
GET /api/v1/tiktok-ads/clients/:clientId/creatives
GET /api/v1/tiktok-ads/clients/:clientId/insights
POST /api/v1/tiktok-ads/clients/:clientId/sync
```

Client:

```http
GET /api/v1/client/tiktok-ads/summary
GET /api/v1/client/tiktok-ads/campaigns
GET /api/v1/client/tiktok-ads/creatives
GET /api/v1/client/tiktok-ads/insights
```

## Authorization

Admin:

- all TikTok Ads clients.

Social Media Specialist:

- assigned TIKTOK_ADS clients only.

Performance Specialist:

- assigned TIKTOK_ADS clients only.

Designer:

- assigned TIKTOK_ADS clients için creative/design sections.

Client:

- only own clientProfile + ACTIVE TIKTOK_ADS purchased service.

## Dashboard Data Contract

Summary:

```ts
{
  spend: number;
  impressions: number;
  reach?: number;
  clicks: number;
  conversions: number;
  conversionValue?: number;
  ctr: number;
  cpc: number;
  cpm: number;
  costPerConversion?: number;
  conversionRate?: number;
  videoViews?: number;
  videoViewRate?: number;
  roas?: number;
  dateRange: { since: string; until: string };
  lastSyncAt: string;
}
```

Campaigns:

```ts
{
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
}
```

Creatives:

```ts
{
  id: string;
  name: string;
  materialId?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  videoViews?: number;
  videoViewRate?: number;
}
```

## UI

Mevcut mock tasarım korunmalı.

Mock metrik kartları gerçek summary contract’a bağlanmalı.

ClientPanel:

- TikTok Ads service dashboard.
- service-tab-page içindeki TikTok Ads tabları.
- Reports sekmesinde TikTok Ads raporları.

Admin/Employee:

- Müşteri detayında TikTok Ads summary.
- Social media specialist / performance specialist için TikTok Ads client workspace.
- Designer için creative performance veya asset request görünümü.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `TikTokAdsDailyInsight` ve `TikTokAdsInsightLevel` ekle.
2. TikTok Ads sync/read module endpointlerini ekle.
3. TikTok Ads API client mapper oluştur.
4. External TikTok Ads API calls testlerde mocklansın.
5. Manual sync endpoint snapshot yazsın.
6. Summary/campaigns/creatives/insights endpointleri snapshot’tan data dönsün.
7. Client own scope endpointleri ekle.
8. Admin/employee assigned scope authorization ekle.
9. Client Panel TikTok Ads dashboard mock UI korunarak real summary data’ya bağlansın.
10. Admin/employee tarafında minimal summary view ekle.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

Backend:

- Admin sync run.
- Sync mocked TikTok Ads response’u snapshot’a yazar.
- Client own summary görebilir.
- Client other client data göremez.
- Employee assigned client summary görebilir.
- Out-of-scope employee 404/403 alır.
- TikTok Ads API error normalized edilir.

Frontend:

- Client dashboard summary render.
- Connection missing empty state.
- API error state.
- Campaign list render.
- Creative list render.
- Date range query varsa doğru gönderilir.

## Validation Komutları

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

```bash
cd adminandemployeePanel
npm run build
npm run check
npm run test:run
```

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- TikTok Ads summary gerçek API/snapshot’tan gelir.
- Mock UI tasarım korunur.
- Client yalnızca kendi TikTok Ads verisini görür.
- Social media/performance specialist sadece assigned client görür.
- API hata/permission/rate-limit durumları UI’da düzgün empty/error state üretir.
- Testler geçer.