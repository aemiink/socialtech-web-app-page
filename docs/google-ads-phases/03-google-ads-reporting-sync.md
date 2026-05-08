<!-- docs/google-ads-phases/03-google-ads-reporting-sync.md -->

# FAZ 3 — Google Ads Read-Only Reporting API ve Data Sync

## Amaç

Google Ads API üzerinden müşteri bazlı performans verilerini çekmek ve panelde göstermek.

Bu fazda campaign management yok. Sadece dashboard/reporting.

## Veri Kaynağı

Kullanılacak API alanları:

- Google Ads Query Language, GAQL
- Customer
- Campaign
- AdGroup
- AdGroupAd
- Metrics
- Segments
- ConversionAction, gerekirse

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

### V2 Persisted Daily Snapshots

Günlük/hourly sync ile DB’ye snapshot yazılır.

Artıları:

- Hızlı dashboard.
- Trend analizi.
- API rate limit daha kontrollü.

Eksileri:

- Sync job gerekir.
- Daha fazla model gerekir.

## Faz Kararı

Faz 3’te:

- Critical dashboard için DB snapshot modeli kur.
- Manual sync endpoint ekle.
- İleride cron job eklenebilir.

## Backend Model

```prisma
model GoogleAdsDailyInsight {
  id              String @id @default(uuid())
  clientProfileId String
  customerId      String
  date            DateTime
  level           GoogleAdsInsightLevel
  entityId        String?
  entityName      String?
  costMicros      BigInt?
  impressions     Int?
  clicks          Int?
  conversions     Decimal?
  conversionValue Decimal?
  ctr             Decimal?
  averageCpc      Decimal?
  costPerConversion Decimal?
  interactions    Int?
  raw             Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum GoogleAdsInsightLevel {
  ACCOUNT
  CAMPAIGN
  AD_GROUP
  AD
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/google-ads/clients/:clientId/summary
GET /api/v1/google-ads/clients/:clientId/campaigns
GET /api/v1/google-ads/clients/:clientId/ad-groups
GET /api/v1/google-ads/clients/:clientId/ads
GET /api/v1/google-ads/clients/:clientId/insights
POST /api/v1/google-ads/clients/:clientId/sync
```

Client:

```http
GET /api/v1/client/google-ads/summary
GET /api/v1/client/google-ads/campaigns
GET /api/v1/client/google-ads/insights
```

## Authorization

Admin:

- all Google Ads clients.

Performance Specialist:

- assigned GOOGLE_ADS clients only.

Project Manager:

- assigned GOOGLE_ADS clients only.

Client:

- only own clientProfile + ACTIVE GOOGLE_ADS purchased service.

## Dashboard Data Contract

Summary:

```ts
{
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue?: number;
  ctr: number;
  averageCpc: number;
  costPerConversion?: number;
  dateRange: { since: string; until: string };
  lastSyncAt: string;
}
```

Campaigns:

```ts
{
  id: string;
  name: string;
  channelType: string;
  status: string;
  servingStatus?: string;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  averageCpc: number;
}
```

## UI

Mevcut mock tasarım korunmalı.

Mock metrik kartları gerçek summary contract’a bağlanmalı.

ClientPanel:

- Google Ads service dashboard.
- service-tab-page içindeki Google Ads tabları.
- Reports sekmesinde Google Ads raporları.

Admin/Employee:

- Müşteri detayında Google Ads summary.
- Performance specialist için Google Ads client workspace.
- Project manager için Google Ads proje/rapor görünümü.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `GoogleAdsDailyInsight` ve `GoogleAdsInsightLevel` ekle.
2. Google Ads sync/read module endpointlerini ekle.
3. Google Ads API client mapper oluştur.
4. External Google Ads API calls testlerde mocklansın.
5. Manual sync endpoint snapshot yazsın.
6. Summary/campaigns/insights endpointleri snapshot’tan data dönsün.
7. Client own scope endpointleri ekle.
8. Admin/employee assigned scope authorization ekle.
9. Client Panel Google Ads dashboard mock UI korunarak real summary data’ya bağlansın.
10. Admin/employee tarafında minimal summary view ekle.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

Backend:

- Admin sync run.
- Sync mocked Google Ads response’u snapshot’a yazar.
- Client own summary görebilir.
- Client other client data göremez.
- Employee assigned client summary görebilir.
- Out-of-scope employee 404/403 alır.
- Google Ads API error normalized edilir.

Frontend:

- Client dashboard summary render.
- Connection missing empty state.
- API error state.
- Campaign list render.
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

- Google Ads summary gerçek API/snapshot’tan gelir.
- Mock UI tasarım korunur.
- Client yalnızca kendi Google Ads verisini görür.
- Performance specialist sadece assigned client görür.
- API hata/permission/rate-limit durumları UI’da düzgün empty/error state üretir.
- Testler geçer.