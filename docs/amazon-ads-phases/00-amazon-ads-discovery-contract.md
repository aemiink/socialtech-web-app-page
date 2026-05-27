<!-- docs/amazon-ads-phases/00-amazon-ads-discovery-contract.md -->

# FAZ 0 — Amazon Ads Discovery, Official Docs ve Technical Contract

## Amaç

Amazon Ads panelini geliştirmeye başlamadan önce official Amazon Ads API dokümantasyonuna göre teknik contract’ı netleştirmek.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Amazon Ads için hangi veriler çekilecek?
- Hangi Amazon Ads API endpointleri / report tipleri kullanılacak?
- OAuth 2.0, profileId, marketplaceId ve advertiser/account yapısı nasıl kurulacak?
- Müşteri bazlı Amazon Ads yapılandırması nasıl tutulacak?
- Admin, employee ve client hangi veriyi görecek?
- Mevcut mock tasarım hangi backend contract’a bağlanacak?

## Mevcut Repo Bağlamı

Mevcut sistemde:

- `server/` NestJS + Prisma + RBAC backend.
- `adminandemployeePanel/` Admin Panel + Employee Panel.
- `clientPanel/` müşteri portalı.
- `ClientPurchasedService` modeli var.
- Client Portal yalnızca satın alınmış ACTIVE hizmetleri gösteriyor.
- `Project.serviceKey` var.
- Amazon Ads service key mevcut değilse `AMAZON_ADS` purchased service olarak eklenmeli.
- Admin/Employee Panel RTK Query mimarisi var.
- Platform integrations Meta/TikTok/Amazon Ads roadmap’te planned.

## İncelenecek Resmi Kaynaklar

Codex implementation öncesinde resmi Amazon Ads kaynaklarını incele:

- Amazon Ads API Overview
- Amazon Ads API Authorization
- OAuth 2.0 authorization grant
- Profiles / Advertiser account model
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- Reporting v3
- Portfolios
- Product targeting
- Keywords
- Search terms
- Campaigns, ad groups, ads, targets
- API rate limits, report status ve error handling

## Amazon Ads API Temel Kavramları

Amazon Ads API için temel kavramlar:

- OAuth 2.0 delegated authorization
- profileId
- marketplaceId
- region
- advertiser / seller / vendor profile
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- ASIN / SKU / marketplace
- ACOS / ROAS / sales / orders / spend

## İncelenecek Amazon Ads Alanları

### Profile / Account

- profile id
- account type
- country code
- currency code
- timezone, erişilebiliyorsa
- marketplace id
- advertiser id / seller/vendor context

### Sponsored Products

- campaign id
- campaign name
- campaign status
- targeting type
- budget
- ad group id/name
- keyword / target
- advertised ASIN / SKU
- metrics

### Sponsored Brands

- campaign id
- campaign name
- brand entity
- creative
- landing page / store
- keywords / targets
- metrics

### Sponsored Display

- campaign id
- campaign name
- tactic
- audience / product targeting
- creative
- metrics

### Metrics

Minimum V1 metrikleri:

- spend
- impressions
- clicks
- CTR
- CPC
- sales
- orders
- units sold
- conversion rate
- ACOS
- ROAS
- attributed sales, API report tipine göre
- attributed conversions, API report tipine göre

## Çıktılar

Bu fazın sonunda şu contract net olmalı:

- Amazon Ads için kullanılacak official endpoint/report listesi.
- Minimum authorization ve OAuth stratejisi.
- `profileId`, `marketplaceId`, `region` kullanım standardı.
- Veri modelinin V1 kapsamı.
- Client create/edit sırasında alınacak Amazon Ads bilgileri.
- Client Panel’de korunacak mock tasarım alanlarının API karşılığı.
- Admin/Employee/Client role-scope matrisi.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Amazon Ads entegrasyonu için official docs ve mevcut repo mimarisi üzerinden teknik contract çıkarmaktır.

Şunları yap:

1. Mevcut `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `ClientPurchasedService`, `Project.serviceKey`, auth/RBAC, RTK Query ve clientPanel service selection akışını kontrol et.
3. Amazon Ads için kullanılacak official Amazon Ads API kaynaklarını incele.
4. Amazon Ads için V1 data contract önerisini çıkar.
5. Admin, employee ve client için role-scope matrisi oluştur.
6. OAuth/profile/marketplace/region stratejisini V1 ve V2 olarak ayır.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory güncellemesi gerekiyorsa yalnızca ilgili notları ekle.

## Kabul Kriterleri

- Official docs referansları okunmuş ve kararlar netleştirilmiş.
- V1 read-only reporting mi yoksa campaign management mı yapılacak net.
- Amazon Ads panel data contract tanımlı.
- OAuth/profile/marketplace stratejisi net.
- Mevcut repo mimarisiyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.

---

# Faz 0 Çıktısı — 2026-05-27

## Okunan Resmi Kaynaklar

- [Amazon Ads API overview](https://advertising.amazon.com/API/docs/en-us/reference/api-overview)
- [Getting started with the Amazon Ads API](https://advertising.amazon.com/API/docs/en-us/guides/get-started/overview)
- [Create an authorization grant](https://advertising.amazon.com/API/docs/en-us/guides/get-started/create-authorization-grant)
- [Retrieve access and refresh tokens](https://advertising.amazon.com/API/docs/en-us/guides/get-started/retrieve-access-token)
- [Retrieve and use a profile ID](https://advertising.amazon.com/API/docs/en-us/guides/get-started/retrieve-profiles)
- [Make your first call](https://advertising.amazon.com/API/docs/en-us/guides/get-started/first-call)
- [Amazon Ads API authorization overview](https://advertising.amazon.com/API/docs/en-us/guides/account-management/authorization/overview)
- [Amazon Ads API v1 overview](https://advertising.amazon.com/API/docs/en-us/reference/amazon-ads/overview)
- [Reporting v3 overview](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/overview)
- [Reporting v3 get started](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/get-started)
- [Reporting v3 report types](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/overview)
- [Reporting v3 campaign reports](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/campaign)
- [Reporting v3 targeting reports](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/targeting)
- [Reporting v3 search term reports](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/search-term)
- [Reporting v3 advertised product reports](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/advertised-product)
- [Reporting v3 purchased product reports](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/report-types/purchased-product)
- [Reporting v3 FAQ](https://advertising.amazon.com/API/docs/en-us/guides/reporting/v3/faq)

## Repo Tespiti

- `PurchasedServiceKey` içinde `AMAZON_ADS` zaten mevcut.
- Admin client create/edit service catalog içinde `amazon-ads -> AMAZON_ADS` map’i mevcut.
- Client Portal service selection, sidebar ve mock dashboard içinde Amazon Ads görünümü mevcut.
- Backend’de `server/src/amazon-ads/` modülü henüz yok.
- Prisma’da Meta Ads ve TikTok Ads domain modelleri var; Amazon Ads için model yok.
- Admin/Employee route tarafında Meta/TikTok global ve employee workspace route’ları var; Amazon route’ları henüz yok.
- Seed permission katalogunda `metaAds.*` ve `tiktokAds.*` var; `amazonAds.*` henüz yok.

## Ürün Kapsam Kararı

V1 kapsamı **read-only reporting + snapshot + report lifecycle** olacak.

V1 dışı:

- campaign create/update/pause
- bid/budget/keyword/target mutation
- negative keyword otomasyonu
- retail readiness verisini Amazon Seller/SP-API’dan otomatik çekme
- TACOS için total retail sales entegrasyonu
- full self-service client OAuth

Gerekçe:

- Amazon Ads Reporting v3 resmi akışı async report üretimine dayanıyor.
- Raporlama API’si günlük/özet performans için tasarlanmış; sık canlı çağrı throttling riski yaratıyor.
- Mevcut Social Tech pattern’i de Meta/TikTok tarafında snapshot + sync + client-safe reporting yaklaşımıyla ilerliyor.

## Resmi API Bulguları

### Regional Hosts

Amazon Ads API regional host kullanılmasını zorunlu kılıyor:

| Region | Host | Marketplace |
|---|---|---|
| NA | `https://advertising-api.amazon.com` | US, CA, MX, BR |
| EU | `https://advertising-api-eu.amazon.com` | UK, FR, IT, ES, DE, NL, AE, PL, TR, EG, SA, SE, BE, IN, ZA |
| FE | `https://advertising-api-fe.amazon.com` | JP, AU, SG |

`region` config alanı `NA | EU | FE` enum gibi ele alınmalı ve profile marketplace’i ile uyumlu olmalı.

### Authorization

Amazon Ads için resmi minimum auth zinciri:

1. Approved Login with Amazon client application.
2. LwA Authorization Code Grant ile advertiser consent.
3. Authorization code exchange.
4. Access token + refresh token saklama.
5. `/v2/profiles` ile profile listesi alma.
6. Profile/account seçimi ile API çağrısı.

OAuth scope:

```text
advertising::campaign_management
```

Bu scope Sponsored Products, Sponsored Brands, Sponsored Display ve Amazon Attribution API erişimi için resmi kaynakta önerilen scope’tur.

Token notları:

- Access token geçerliliği: 60 dakika.
- Authorization code geçerliliği: 5 dakika.
- Refresh token ile yeni access token üretilecek.
- Resmi dokümana göre 30 Haziran 2026 ve sonrasında verilen refresh token’lar advertiser consent tarihinden itibaren 365 gün geçerli olacak; bu yüzden `refreshTokenExpiresAt` alanı nullable ama desteklenebilir olmalı.
- Plain token response’ta dönmeyecek, loglanmayacak, encrypted saklanacak.

### Profile / Account Model

`GET /v2/profiles` response’u V1 config için kaynak kabul edilecek:

```json
{
  "profileId": 888888888,
  "countryCode": "MX",
  "currencyCode": "MXN",
  "timezone": "America/Los_Angeles",
  "accountInfo": {
    "marketplaceStringId": "A1AM78C64UM0Y8",
    "id": "ENTITY2Ihjasdjkeru",
    "type": "vendor",
    "name": "Name of the Account",
    "validPaymentMethod": false
  }
}
```

Kullanım standardı:

- `profileId`: campaign management / profile-scoped çağrılar için `Amazon-Advertising-API-Scope`.
- `advertiserAccountId`: reporting account header için `Amazon-Ads-AccountId`; profile response `accountInfo.id` veya Accounts API `advertiserAccount.id` ile hizalanmalı.
- `marketplaceId`: profile response `accountInfo.marketplaceStringId`.
- `accountType`: `seller | vendor | agency | author | ...` gibi string tutulmalı; Amazon enum değişimine karşı daraltılmamalı.
- `countryCode`, `currencyCode`, `timezone`: profile response’dan normalize edilmeli.

Not: Eski taslaklarda `advertiserId` adı geçiyor. Faz 1 implementation’da Amazon için daha doğru alan adı `advertiserAccountId` olmalı; DSP advertiser id ile karıştırılmamalı.

### Required Headers

Campaign/profile scoped çağrılar:

```text
Amazon-Ads-ClientId
Authorization: Bearer <access_token>
Amazon-Advertising-API-Scope: <profileId>
```

Reporting v3 çağrıları:

```text
Amazon-Ads-ClientId
Authorization: Bearer <access_token>
Amazon-Advertising-API-Scope: <profileId>
Amazon-Ads-AccountId: <advertiserAccountId>
Content-Type: application/vnd.createasyncreportrequest.v3+json
```

Kod tarafında header isimleri tek helper içinde üretilmeli; eski/new casing farkları da client wrapper seviyesinde izole edilmeli.

## Reporting v3 Contract

Reporting v3 async çalışır:

1. `POST /reporting/reports`
2. `GET /reporting/reports/{reportId}` ile status polling
3. `COMPLETED` olduğunda `url` alanından gzip JSON indirme

Status ve rate-limit kararları:

- `PENDING` / `PROCESSING`: sync log RUNNING kalır.
- `COMPLETED`: download + parse + snapshot upsert.
- `FAILURE` / failure reason: sync log FAILED.
- Duplicate report request `425` dönebilir; retry loop yapılmamalı.
- Sık status polling `429` throttling üretebilir; exponential backoff kullanılmalı.
- Official FAQ, advertiser/reportType başına günde 1-2 report request öneriyor. V1 scheduler bu sınıra göre temkinli olmalı.
- Report generation üç saate kadar sürebilir; scheduler async job mantığıyla tasarlanmalı.

### V1 Report Types

| UI Alanı | Reporting v3 reportTypeId | Ad Product | groupBy | V1 Kullanım |
|---|---|---|---|---|
| Sponsored Products campaigns | `spCampaigns` | `SPONSORED_PRODUCTS` | `campaign` | summary + campaigns |
| Sponsored Brands campaigns | `sbCampaigns` | `SPONSORED_BRANDS` | `campaign` | summary + brand campaign |
| Sponsored Display campaigns | `sdCampaigns` | `SPONSORED_DISPLAY` | `campaign` | summary + display campaign |
| SP ad group view | `spCampaigns` | `SPONSORED_PRODUCTS` | `adGroup` | ad group breakdown |
| SB ad groups | `sbAdGroup` | `SPONSORED_BRANDS` | `adGroup` | brand ad group |
| SD ad groups | `sdAdGroup` | `SPONSORED_DISPLAY` | `adGroup` | display ad group |
| Keywords / targets | `spTargeting`, `sbTargeting`, `sdTargeting` | SP/SB/SD | `targeting` | keyword/ASIN/product targeting |
| Search terms | `spSearchTerm`, `sbSearchTerm` | SP/SB | `searchTerm` | search term mining |
| Advertised products | `spAdvertisedProduct`, `sdAdvertisedProduct` | SP/SD | `advertiser` | advertised ASIN/SKU |
| Purchased products | `spPurchasedProduct`, `sbPurchasedProduct`, `sdPurchasedProduct` | SP/SB/SD | `asin` / `purchasedAsin` | purchased ASIN visibility |
| Invalid traffic | `spGrossAndInvalids`, `sbGrossAndInvalids`, `sdGrossAndInvalids` | SP/SB/SD | `campaign` | admin-only diagnostics |

Sponsored Brands v3 reports are marked preview in official docs. V1 should treat SB reporting as best-effort and expose normalized partial states instead of failing the whole sync.

### V1 Metric Normalization

Canonical Social Tech metric fields:

```text
spend
impressions
clicks
ctr
cpc
sales
orders
unitsSold
conversionRate
acos
roas
```

Amazon source fields:

- `spend` / `cost` -> `spend`
- `clickThroughRate` -> `ctr`
- `costPerClick` -> `cpc`
- `sales7d` or `sales14d` -> `sales`
- `purchases7d` / `orders14d` -> `orders`
- `unitsSoldClicks7d` / `unitsSold14d` -> `unitsSold`
- `acosClicks7d` / `acosClicks14d` -> `acos`
- `roasClicks7d` / `roasClicks14d` -> `roas`
- `conversionRate` V1’de türetilebilir: `orders / clicks`

Attribution-window standardı:

- Sponsored Products: default `7d`.
- Sponsored Brands: default `14d`.
- Sponsored Display: report tipine göre available field seçilir.
- API response’ta `attributionWindow` alanı dönmeli.

## V1 Veri Modeli

### Enums

```prisma
enum AmazonAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}

enum AmazonAdsRegion {
  NA
  EU
  FE
}

enum AmazonAdsProductType {
  SPONSORED_PRODUCTS
  SPONSORED_BRANDS
  SPONSORED_DISPLAY
}

enum AmazonAdsInsightLevel {
  ACCOUNT
  CAMPAIGN
  AD_GROUP
  AD
  TARGETING
  SEARCH_TERM
  ADVERTISED_PRODUCT
  PURCHASED_PRODUCT
}

enum AmazonAdsSyncStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}

enum AmazonAdsReportType {
  WEEKLY
  MONTHLY
  CAMPAIGN_PERFORMANCE
  SEARCH_TERM_MINING
  ASIN_TARGETING
  BUDGET_RECOMMENDATION
}

enum AmazonAdsReportStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Config

```prisma
model ClientAmazonAdsConfig {
  id                  String @id @default(uuid()) @db.Uuid
  clientProfileId     String @unique @db.Uuid
  profileId           String?
  advertiserAccountId String?
  marketplaceId       String?
  region              AmazonAdsRegion?
  countryCode         String?
  currencyCode        String?
  timezone            String?
  accountType         String?
  accountName         String?
  validPaymentMethod  Boolean?
  connectionStatus    AmazonAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt          DateTime?
  syncError           String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)
}
```

### Credential

```prisma
model ClientAmazonAdsCredential {
  id                    String @id @default(uuid()) @db.Uuid
  clientProfileId       String @unique @db.Uuid
  accessTokenEnc        String?
  refreshTokenEnc       String?
  tokenHash             String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  grantedScopes         String[] @default([])
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)
}
```

### Daily Insight

```prisma
model AmazonAdsDailyInsight {
  id                  String @id @default(uuid()) @db.Uuid
  clientProfileId     String @db.Uuid
  profileId           String
  advertiserAccountId String?
  marketplaceId       String?
  date                DateTime
  level               AmazonAdsInsightLevel
  adProduct           AmazonAdsProductType
  reportTypeId        String
  entityId            String
  entityName          String?
  campaignId          String?
  campaignName        String?
  adGroupId           String?
  adGroupName         String?
  adId                String?
  keywordId           String?
  keyword             String?
  matchType           String?
  targeting           String?
  searchTerm          String?
  advertisedAsin      String?
  advertisedSku       String?
  purchasedAsin       String?
  spend               Decimal? @db.Decimal(18, 6)
  impressions         Int?
  clicks              Int?
  ctr                 Decimal? @db.Decimal(18, 6)
  cpc                 Decimal? @db.Decimal(18, 6)
  sales               Decimal? @db.Decimal(18, 6)
  orders              Int?
  unitsSold           Int?
  conversionRate      Decimal? @db.Decimal(18, 6)
  acos                Decimal? @db.Decimal(18, 6)
  roas                Decimal? @db.Decimal(18, 6)
  attributionWindow   String?
  raw                 Json?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)

  @@unique([clientProfileId, date, level, adProduct, reportTypeId, entityId])
  @@index([clientProfileId, level, date])
  @@index([profileId, date])
  @@index([advertiserAccountId, date])
}
```

`entityId` standardı:

- campaign: `campaignId`
- ad group: `adGroupId`
- ad: `adId`
- targeting: `keywordId` veya target expression hash
- search term: stable hash of `campaignId + adGroupId + searchTerm + keyword/targeting`
- advertised product: `adId + advertisedAsin + advertisedSku`
- purchased product: `campaign/adgroup/keyword + purchasedAsin`

### Sync Log

```prisma
model AmazonAdsSyncLog {
  id                  String @id @default(uuid()) @db.Uuid
  clientProfileId     String @db.Uuid
  profileId           String?
  advertiserAccountId String?
  status              AmazonAdsSyncStatus @default(RUNNING)
  trigger             String?
  startedAt           DateTime @default(now())
  finishedAt          DateTime?
  errorCode           String?
  errorMessage        String?
  recordsFetched      Int?
  apiCallCount        Int?
  reportRequestCount  Int?
  createdAt           DateTime @default(now())

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)
}
```

### Report

`AmazonAdsReport` Meta/TikTok report lifecycle ile aynı pattern’de kurulmalı:

- draft / published / archived
- `clientVisible`
- `metricsSnapshot`
- publish sonrası acknowledgement task bridge
- admin/assigned export
- client yalnızca `PUBLISHED + clientVisible`

## API Endpoint Contract

Admin:

```http
GET    /api/v1/admin/amazon-ads/clients
GET    /api/v1/admin/amazon-ads/sync-logs
GET    /api/v1/admin/clients/:clientId/amazon-ads/config
PATCH  /api/v1/admin/clients/:clientId/amazon-ads/config
POST   /api/v1/admin/clients/:clientId/amazon-ads/oauth/start
POST   /api/v1/admin/clients/:clientId/amazon-ads/oauth/callback
POST   /api/v1/admin/clients/:clientId/amazon-ads/test
POST   /api/v1/admin/clients/:clientId/amazon-ads/sync
POST   /api/v1/admin/clients/:clientId/amazon-ads/sync/retry
DELETE /api/v1/admin/clients/:clientId/amazon-ads/disconnect
GET    /api/v1/admin/clients/:clientId/amazon-ads/summary
GET    /api/v1/admin/clients/:clientId/amazon-ads/campaigns
GET    /api/v1/admin/clients/:clientId/amazon-ads/search-terms
GET    /api/v1/admin/clients/:clientId/amazon-ads/asin-targeting
GET    /api/v1/admin/clients/:clientId/amazon-ads/insights
GET    /api/v1/admin/clients/:clientId/amazon-ads/reports
POST   /api/v1/admin/clients/:clientId/amazon-ads/reports
PATCH  /api/v1/admin/amazon-ads/reports/:reportId
```

Assigned employee:

```http
GET  /api/v1/amazon-ads/clients/:clientId/config
GET  /api/v1/amazon-ads/clients/:clientId/summary
GET  /api/v1/amazon-ads/clients/:clientId/campaigns
GET  /api/v1/amazon-ads/clients/:clientId/search-terms
GET  /api/v1/amazon-ads/clients/:clientId/asin-targeting
GET  /api/v1/amazon-ads/clients/:clientId/insights
POST /api/v1/amazon-ads/clients/:clientId/sync
GET  /api/v1/amazon-ads/clients/:clientId/reports
POST /api/v1/amazon-ads/clients/:clientId/reports
PATCH /api/v1/amazon-ads/reports/:reportId
```

Own client:

```http
GET  /api/v1/clients/me/amazon-ads/config
GET  /api/v1/clients/me/amazon-ads/summary
GET  /api/v1/clients/me/amazon-ads/campaigns
GET  /api/v1/clients/me/amazon-ads/search-terms
GET  /api/v1/clients/me/amazon-ads/asin-targeting
GET  /api/v1/clients/me/amazon-ads/reports
POST /api/v1/clients/me/amazon-ads/sync
```

Client endpoints kesinlikle `clientId` almayacak; `currentUser.clientProfileId + ACTIVE AMAZON_ADS purchased service` zorunlu kontrol olacak.

## Permissions

```text
amazonAds.config.read.any
amazonAds.config.manage.any
amazonAds.config.read.assigned
amazonAds.config.read.own
amazonAds.reporting.read.any
amazonAds.reporting.read.assigned
amazonAds.reporting.read.own
amazonAds.sync.run.any
amazonAds.sync.read.assigned
amazonAds.notes.manage.assigned
amazonAds.approvals.manage.any
amazonAds.approvals.create.assigned
amazonAds.productCollaboration.manage.assigned
```

## Role-Scope Matrisi

| Aktör | Scope | V1 Erişim |
|---|---|---|
| Admin | Any client | config manage, OAuth connect/disconnect, test, sync, all reports, export |
| Project Manager | Assigned client/project/service | summary, campaigns, reports, approvals, notes, client coordination |
| Performance Specialist | Assigned client/project/service | summary, campaigns, targeting, search terms, ASIN opportunities, assigned sync |
| Social Media Specialist | Assigned client/project/service | Sponsored Brands creative/copy visibility, approvals/notes; mutation yok |
| Designer | Assigned client/project/service | creative/product asset approval; reporting limited |
| Client | Own active service | connection-aware summary, campaigns, search terms summary, published reports only |

## Client Panel Mock → API Eşleme

| Mock Alan | V1 Kaynak | Not |
|---|---|---|
| ACOS | `acosClicks7d` / `acosClicks14d` | ad product attribution window ile normalize |
| TACOS | V1’de official Ads API’dan gelmez | seller total sales gerekir; V2/SP-API veya manual metric |
| Satış | `sales7d` / `sales14d` | currency config ile formatlanır |
| Dönüşüm | `orders / clicks` veya purchases field | türetilmiş metric |
| Buy Box | Ads API değil | V1’de manual/empty; SP-API V2 |
| Sponsored Products kartı | `spCampaigns` | campaign summary |
| Sponsored Brands kartı | `sbCampaigns` | preview partial handling |
| Sponsored Display kartı | `sdCampaigns` | campaign summary |
| Search Term Mining | `spSearchTerm`, `sbSearchTerm` | sadece click almış search terms API’da görünür |
| ASIN Targeting | `spTargeting`, `sdTargeting`, purchased/advertised product reports | ASIN hedefleri normalize edilir |
| Retail Readiness | Ads API değil | manual checklist veya SP-API V2 |

## OAuth Stratejisi

### V1

- Backend env’de LwA app bilgileri:

```text
AMAZON_ADS_LWA_CLIENT_ID=
AMAZON_ADS_LWA_CLIENT_SECRET=
AMAZON_ADS_REDIRECT_URI=
AMAZON_ADS_TOKEN_ENCRYPTION_KEY=
AMAZON_ADS_SYNC_TTL_MINUTES=30
AMAZON_ADS_REPORT_POLL_INTERVAL_SECONDS=120
```

- Admin connection flow:
  - server authorization URL üretir.
  - advertiser consent alınır.
  - authorization code backend’e gelir veya internal admin kısa ömürlü code paste eder.
  - backend code’u access + refresh token’a çevirir.
  - `/v2/profiles` ile profile listesi alınır.
  - admin bir profile/account seçer.
  - config + credential encrypted saklanır.

### V2

- Full redirect callback UX.
- Multi-profile/account selection modal.
- Consent renewal reminders.
- Refresh token expiry monitor.
- Manager account / viewer access edge-case desteği.
- Retail readiness/TACOS için Seller Partner API veya manual finance integration.

## Faz 1 Implementation Kararları

Faz 1 kodlaması şu kararlara göre yapılmalı:

1. `AMAZON_ADS` service key yeni eklenmeyecek; zaten mevcut, sadece kullanılacak.
2. Prisma’ya Amazon Ads config, credential, insight, sync log ve report modelleri eklenecek.
3. Config alanı `advertiserAccountId` olmalı; eski `advertiserId` adından kaçınılmalı.
4. `AmazonAdsRegion` enum ile regional host map’i backend helper’da tutulacak.
5. Faz 1 live reporting yapmayabilir; ancak model ve endpoint contract reporting v3’e hazır olacak.
6. Credential write, encryption env yoksa fail-closed olacak.
7. Admin create/edit flow’da `AMAZON_ADS` seçilince profile/account/marketplace config alanları görünecek.
8. Client Panel mock fallback kaldırılacak; config yoksa connection-aware empty state gösterilecek.
9. Employee visibility assignment scope + purchased service scope üzerinden kurulacak.
10. Seed’e `amazonAds.*` permissions ve role mappings eklenecek.
11. E2E authz testi Amazon Ads için admin/assigned/client/out-of-scope matrisini kapsayacak.

Faz 1 için implementation contract hazır: **Evet.**
