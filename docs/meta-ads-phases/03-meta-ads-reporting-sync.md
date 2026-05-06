<!-- docs/meta-ads-phases/03-meta-ads-reporting-sync.md -->

# FAZ 3 — Meta Ads Read-Only Reporting API ve Data Sync

## Amaç

Meta Ads Graph API / Marketing API üzerinden müşteri bazlı performans verilerini çekmek ve panelde göstermek.

Bu fazda campaign management yok. Sadece dashboard/reporting.

## Veri Kaynağı

Kullanılacak API ailesi:

- Marketing API
- Ads Insights API
- Ad Account Campaigns / Ad Sets / Ads endpoints

Ads Insights API reklam performans verilerini ad account, campaign, ad set ve ad seviyelerinde raporlamak için kullanılacak ana kaynak olmalı.

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
model MetaAdsDailyInsight {
  id              String @id @default(uuid())
  clientProfileId String
  adAccountId     String
  date            DateTime
  level           MetaAdsInsightLevel
  entityId        String?
  entityName      String?
  spend           Decimal?
  impressions     Int?
  reach           Int?
  clicks          Int?
  ctr             Decimal?
  cpc             Decimal?
  cpm             Decimal?
  frequency       Decimal?
  results         Int?
  costPerResult   Decimal?
  purchaseValue   Decimal?
  roas            Decimal?
  raw             Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum MetaAdsInsightLevel {
  ACCOUNT
  CAMPAIGN
  ADSET
  AD
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/meta-ads/clients/:clientId/summary
GET /api/v1/meta-ads/clients/:clientId/campaigns
GET /api/v1/meta-ads/clients/:clientId/adsets
GET /api/v1/meta-ads/clients/:clientId/ads
GET /api/v1/meta-ads/clients/:clientId/insights
POST /api/v1/meta-ads/clients/:clientId/sync
```

Client:

```http
GET /api/v1/client/meta-ads/summary
GET /api/v1/client/meta-ads/campaigns
GET /api/v1/client/meta-ads/insights
```

## Authorization

Admin:

- all Meta Ads clients.

Social Media Specialist / Performance Specialist:

- assigned META_ADS clients only.

Designer:

- assigned META_ADS clients için creative/design sections.
- performance metrics limited olabilir.

Client:

- only own clientProfile + ACTIVE META_ADS purchased service.

## Dashboard Data Contract

Summary:

```ts
{
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  results: number;
  costPerResult: number;
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
  effectiveStatus: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  results: number;
}
```

## UI

Mevcut mock tasarım korunmalı.

Mock metrik kartları gerçek summary contract’a bağlanmalı.

ClientPanel:

- `meta-ads-dashboard.tsx`
- service-tab-page içindeki Meta Ads tabları.
- Reports sekmesinde Meta Ads raporları.

Admin/Employee:

- Müşteri detayında Meta Ads summary.
- Social media specialist / performance specialist için Meta Ads client workspace.
- Designer için creative performance veya asset request görünümü.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `MetaAdsDailyInsight` ve `MetaAdsInsightLevel` ekle.
2. Meta Ads sync/read module endpointlerini ekle.
3. Meta API client mapper oluştur.
4. External Meta API calls testlerde mocklansın.
5. Manual sync endpoint snapshot yazsın.
6. Summary/campaigns/insights endpointleri snapshot’tan data dönsün.
7. Client own scope endpointleri ekle.
8. Admin/employee assigned scope authorization ekle.
9. Client Panel Meta Ads dashboard mock UI korunarak real summary data’ya bağlansın.
10. Admin/employee tarafında minimal summary view ekle.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

Backend:

- Admin sync run.
- Sync mocked Meta response’u snapshot’a yazar.
- Client own summary görebilir.
- Client other client data göremez.
- Employee assigned client summary görebilir.
- Out-of-scope employee 404/403 alır.
- Meta API error normalized edilir.

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

- Meta Ads summary gerçek API/snapshot’tan gelir.
- Mock UI tasarım korunur.
- Client yalnızca kendi Meta Ads verisini görür.
- Social media/performance specialist sadece assigned client görür.
- API hata/permission/rate-limit durumları UI’da düzgün empty/error state üretir.
- Testler geçer.