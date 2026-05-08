<!-- docs/amazon-ads-phases/03-amazon-ads-reporting-sync.md -->

# FAZ 3 — Amazon Ads Read-Only Reporting API ve Data Sync

## Amaç

Amazon Ads API üzerinden müşteri bazlı performans verilerini çekmek ve panelde göstermek.

Bu fazda campaign management yok. Sadece dashboard/reporting.

## Veri Kaynağı

Kullanılacak API alanları:

- Sponsored Products
- Sponsored Brands
- Sponsored Display
- Reports v3
- Profiles
- Campaigns
- Ad Groups
- Ads
- Keywords
- Targets
- Products / ASIN / SKU
- Search terms

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
- Amazon Ads reports async olduğu için direkt live fetch her zaman uygun olmayabilir.

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
- Reporting v3 async request/download akışı mocklanabilir.
- İleride cron job eklenebilir.

## Backend Model

```prisma
model AmazonAdsDailyInsight {
  id              String @id @default(uuid())
  clientProfileId String
  profileId       String
  marketplaceId   String?
  date            DateTime
  level           AmazonAdsInsightLevel
  entityId        String?
  entityName      String?
  adProduct       AmazonAdsProductType?
  spend           Decimal?
  impressions     Int?
  clicks          Int?
  sales           Decimal?
  orders          Int?
  unitsSold       Int?
  ctr             Decimal?
  cpc             Decimal?
  acos            Decimal?
  roas            Decimal?
  conversionRate  Decimal?
  raw             Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum AmazonAdsInsightLevel {
  ACCOUNT
  PORTFOLIO
  CAMPAIGN
  AD_GROUP
  AD
  KEYWORD
  TARGET
  PRODUCT
  SEARCH_TERM
}

enum AmazonAdsProductType {
  SPONSORED_PRODUCTS
  SPONSORED_BRANDS
  SPONSORED_DISPLAY
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/amazon-ads/clients/:clientId/summary
GET /api/v1/amazon-ads/clients/:clientId/campaigns
GET /api/v1/amazon-ads/clients/:clientId/ad-groups
GET /api/v1/amazon-ads/clients/:clientId/ads
GET /api/v1/amazon-ads/clients/:clientId/keywords
GET /api/v1/amazon-ads/clients/:clientId/targets
GET /api/v1/amazon-ads/clients/:clientId/search-terms
GET /api/v1/amazon-ads/clients/:clientId/products
GET /api/v1/amazon-ads/clients/:clientId/insights
POST /api/v1/amazon-ads/clients/:clientId/sync
```

Client:

```http
GET /api/v1/client/amazon-ads/summary
GET /api/v1/client/amazon-ads/campaigns
GET /api/v1/client/amazon-ads/products
GET /api/v1/client/amazon-ads/insights
```

## Authorization

Admin:

- all Amazon Ads clients.

Performance Specialist:

- assigned AMAZON_ADS clients only.

Project Manager:

- assigned AMAZON_ADS clients only.

Client:

- only own clientProfile + ACTIVE AMAZON_ADS purchased service.

## Dashboard Data Contract

Summary:

```ts
{
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  unitsSold: number;
  ctr: number;
  cpc: number;
  acos: number;
  roas: number;
  conversionRate?: number;
  dateRange: { since: string; until: string };
  lastSyncAt: string;
}
```

Campaigns:

```ts
{
  id: string;
  name: string;
  adProduct: "SPONSORED_PRODUCTS" | "SPONSORED_BRANDS" | "SPONSORED_DISPLAY";
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
}
```

Products:

```ts
{
  asin?: string;
  sku?: string;
  title?: string;
  spend: number;
  clicks: number;
  sales: number;
  orders: number;
  acos: number;
  roas: number;
}
```

## UI

Mevcut mock tasarım korunmalı.

Mock metrik kartları gerçek summary contract’a bağlanmalı.

ClientPanel:

- Amazon Ads service dashboard.
- service-tab-page içindeki Amazon Ads tabları.
- Reports sekmesinde Amazon Ads raporları.

Admin/Employee:

- Müşteri detayında Amazon Ads summary.
- Performance specialist için Amazon Ads client workspace.
- Project manager için Amazon Ads proje/rapor görünümü.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `AmazonAdsDailyInsight`, `AmazonAdsInsightLevel`, `AmazonAdsProductType` ekle.
2. Amazon Ads sync/read module endpointlerini ekle.
3. Amazon Ads API client mapper oluştur.
4. External Amazon Ads API calls testlerde mocklansın.
5. Manual sync endpoint snapshot yazsın.
6. Summary/campaigns/products/insights endpointleri snapshot’tan data dönsün.
7. Client own scope endpointleri ekle.
8. Admin/employee assigned scope authorization ekle.
9. Client Panel Amazon Ads dashboard mock UI korunarak real summary data’ya bağlansın.
10. Admin/employee tarafında minimal summary view ekle.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

Backend:

- Admin sync run.
- Sync mocked Amazon Ads response’u snapshot’a yazar.
- Client own summary görebilir.
- Client other client data göremez.
- Employee assigned client summary görebilir.
- Out-of-scope employee 404/403 alır.
- Amazon Ads API error normalized edilir.

Frontend:

- Client dashboard summary render.
- Connection missing empty state.
- API error state.
- Campaign list render.
- Products list render.
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

- Amazon Ads summary gerçek API/snapshot’tan gelir.
- Mock UI tasarım korunur.
- Client yalnızca kendi Amazon Ads verisini görür.
- Performance specialist sadece assigned client görür.
- API hata/permission/rate-limit durumları UI’da düzgün empty/error state üretir.
- Testler geçer.