# Ads Platform Architecture

## Amaç

Bu doküman Social Tech platformunda reklam kanalları için kullanılacak ortak mimari standardı tanımlar.

Kapsanan platformlar:

- Meta Ads
- TikTok Ads
- Google Ads
- Amazon Ads

Bu dokümanın amacı her reklam platformunu farklı mimariyle geliştirmeyi engellemek ve tüm platformlarda ortak bir pattern sağlamaktır.

Reklam panelleri şu repo yapısına göre geliştirilmelidir:

```text
server/                  NestJS + Prisma + RBAC backend
adminandemployeePanel/    Admin Panel + Employee Panel
clientPanel/              Client Portal
```

Ana prensip:

```text
Aynı platform mimarisi,
müşteri bazlı config,
müşteri bazlı credential,
müşteri bazlı insight/sync/report,
role-based ve service-based erişim.
```

---

# 1. Temel Mimari Karar

Her müşteri için ayrı kod/panel oluşturulmayacak.

Tek panel/component yapısı kullanılacak; hangi müşterinin verisinin gösterileceği backend scope ve `clientProfileId` üzerinden belirlenecek.

Yanlış yaklaşım:

```text
AcmeMetaAdsDashboard
NovaMetaAdsDashboard
MaviMetaAdsDashboard
```

Doğru yaklaşım:

```text
MetaAdsDashboard
  → current clientProfileId
  → client-specific config
  → client-specific insight data
  → client-specific approval/report/tasks
```

Yani her müşteri için ayrı sistem değil, her müşteri için ayrı data/config/credential olacak.

---

# 2. Ortak Platform Pattern

Tüm reklam platformları şu ortak yapıyı izlemelidir:

```text
ClientProfile
  ├── ClientPurchasedService
  ├── Project
  │     └── serviceKey
  ├── PlatformConfig
  ├── PlatformCredential
  ├── PlatformDailyInsight
  ├── PlatformSyncLog
  ├── PlatformReport
  ├── ClientApprovalRequest
  ├── ProjectFile / Creative Asset
  └── ClientPanelDashboard / AdminPanel / EmployeeWorkspace
```

Ortak akış:

```text
1. Admin müşteri oluşturur.
2. Müşterinin aldığı hizmetler ClientPurchasedService içine kaydedilir.
3. Reklam platformu seçildiyse platform-specific config oluşturulur.
4. Token/credential gerekiyorsa encrypted credential kaydedilir.
5. Platform verileri sync/snapshot ile alınır.
6. Client Panel yalnızca kendi verisini görür.
7. Admin tüm müşterileri görür.
8. Employee yalnızca assigned müşterileri görür.
9. Approval/report/file/task akışları serviceKey ve clientProfileId ile bağlanır.
```

---

# 3. ServiceKey Standardı

Reklam platformları serviceKey üzerinden ayrılmalıdır.

Önerilen serviceKey değerleri:

```text
META_ADS
TIKTOK_ADS
GOOGLE_ADS
AMAZON_ADS
```

Bu serviceKey değerleri şu alanlarda tutarlı kullanılmalıdır:

```text
ClientPurchasedService.serviceKey
Project.serviceKey
Task / TaskTodo context
ProjectFile context
ClientApprovalRequest entity/service context
Reports context
Client Panel service selection
Admin/Employee workspace routing
```

Örnek:

```text
ClientProfile: Acme E-ticaret

Purchased Services:
- META_ADS
- GOOGLE_ADS
- WEB_APP

Projects:
- Acme Meta Ads Yönetimi
  serviceKey: META_ADS

- Acme Google Ads Yönetimi
  serviceKey: GOOGLE_ADS

- Acme Web App Geliştirme
  serviceKey: WEB_APP
```

---

# 4. ClientPurchasedService Kuralı

Bir reklam paneli yalnızca müşteri o hizmeti satın aldıysa görünmelidir.

Client Panel tarafında:

```text
Müşteri META_ADS hizmeti almıyorsa Meta Ads paneli görünmez.
Müşteri GOOGLE_ADS hizmeti almıyorsa Google Ads paneli görünmez.
Müşteri TIKTOK_ADS hizmeti almıyorsa TikTok Ads paneli görünmez.
Müşteri AMAZON_ADS hizmeti almıyorsa Amazon Ads paneli görünmez.
```

Backend tarafında da aynı kontrol yapılmalıdır.

Frontend hiding tek başına yeterli değildir.

Her client endpoint şunu doğrulamalıdır:

```text
currentUser.clientProfileId
+
ClientPurchasedService.serviceKey
+
status = ACTIVE
```

---

# 5. Client Endpoint Pattern

Client Panel endpointleri clientId almamalıdır.

Yanlış:

```http
GET /api/v1/client/meta-ads/summary?clientId=abc
```

Doğru:

```http
GET /api/v1/client/meta-ads/summary
GET /api/v1/client/google-ads/summary
GET /api/v1/client/tiktok-ads/summary
GET /api/v1/client/amazon-ads/summary
```

Backend current user’dan `clientProfileId` çözmelidir.

Örnek backend mantığı:

```text
currentUser → clientProfileId
clientProfileId → purchased service check
clientProfileId → platform config
clientProfileId → platform insight data
```

Böylece müşteri başka bir clientId deneyerek başka müşterinin verisine erişemez.

---

# 6. Admin / Employee Endpoint Pattern

Admin ve Employee panellerinde clientId route parametresi kullanılabilir.

Örnek:

```http
GET /api/v1/meta-ads/clients/:clientId/summary
GET /api/v1/google-ads/clients/:clientId/summary
GET /api/v1/tiktok-ads/clients/:clientId/summary
GET /api/v1/amazon-ads/clients/:clientId/summary
```

Backend yetki kontrolü:

```text
Admin:
  any client

Employee:
  assigned client only

Client:
  this route kullanılmaz
```

Employee için mutlaka assignment scope kontrolü yapılmalıdır.

Kontrol sırası:

```text
1. Kullanıcı authenticated mı?
2. Role/permission uygun mu?
3. clientId var mı?
4. Client ilgili serviceKey’i ACTIVE olarak satın almış mı?
5. Employee bu client/project/service scope’a assigned mı?
6. Data bu clientProfileId üzerinden filtreleniyor mu?
```

---

# 7. Platform-Specific Config Tabloları

Generic JSON tablosu kullanılmayacak.

Yanlış yaklaşım:

```prisma
model ClientPlatformIntegration {
  id              String
  clientProfileId String
  provider        String
  config          Json
  credential      Json
}
```

Bu yaklaşım type safety’yi düşürür ve platform-specific validation’ı zorlaştırır.

Doğru yaklaşım:

```text
ClientMetaAdsConfig
ClientGoogleAdsConfig
ClientTikTokAdsConfig
ClientAmazonAdsConfig
```

Her platformun config alanları farklı olduğu için ayrı model kullanılmalıdır.

---

# 8. Platform Config Modelleri

## Meta Ads

```prisma
model ClientMetaAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  businessId         String?
  adAccountId        String?
  pixelId            String?
  instagramAccountId String?
  facebookPageId     String?
  currency           String?
  timezone           String?
  connectionStatus   MetaAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## TikTok Ads

```prisma
model ClientTikTokAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  advertiserId       String?
  businessCenterId   String?
  pixelId            String?
  advertiserName     String?
  currency           String?
  timezone           String?
  connectionStatus   TikTokAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## Google Ads

```prisma
model ClientGoogleAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  customerId         String?
  managerCustomerId  String?
  descriptiveName    String?
  currencyCode       String?
  timeZone           String?
  connectionStatus   GoogleAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## Amazon Ads

```prisma
model ClientAmazonAdsConfig {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  profileId         String?
  advertiserId      String?
  marketplaceId     String?
  region            String?
  countryCode       String?
  currencyCode      String?
  accountType       String?
  connectionStatus  AmazonAdsConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt        DateTime?
  syncError         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

---

# 9. Credential Modelleri

Credential bilgileri config modellerinin içinde tutulmayacak.

Credential modelleri ayrı olacak ve tokenlar encrypted tutulacak.

## Meta Ads Credential

```prisma
model ClientMetaAdsCredential {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  accessTokenEnc  String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  grantedScopes   String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## TikTok Ads Credential

```prisma
model ClientTikTokAdsCredential {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  accessTokenEnc  String?
  refreshTokenEnc String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  grantedScopes   String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## Google Ads Credential

```prisma
model ClientGoogleAdsCredential {
  id                String   @id @default(uuid())
  clientProfileId   String   @unique
  refreshTokenEnc    String?
  accessTokenEnc     String?
  tokenHash          String?
  tokenExpiresAt     DateTime?
  grantedScopes      String[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

## Amazon Ads Credential

```prisma
model ClientAmazonAdsCredential {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  accessTokenEnc  String?
  refreshTokenEnc String?
  tokenHash       String?
  tokenExpiresAt  DateTime?
  grantedScopes   String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Credential kuralları:

```text
Token response’ta dönmez.
Token loglanmaz.
Token plain text tutulmaz.
Token encrypt edilmeden DB’ye yazılmaz.
Encryption env key yoksa credential write fail eder.
Frontend token’ı yalnızca write-only input olarak görebilir.
Client Panel token görmez.
```

---

# 10. ConnectionStatus Standardı

Her platform kendi enumunu kullanabilir.

Örnek:

```prisma
enum MetaAdsConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

Aynı pattern şu platformlarda da kullanılmalıdır:

```text
TikTokAdsConnectionStatus
GoogleAdsConnectionStatus
AmazonAdsConnectionStatus
```

Status anlamları:

```text
NOT_CONNECTED:
  Config veya credential yok.

PENDING:
  Config var ama bağlantı doğrulanmamış.

CONNECTED:
  Test connection başarılı.

ERROR:
  Son bağlantı/sync hatalı.

DISCONNECTED:
  Admin bağlantıyı bilinçli olarak kesti.
```

Client-facing mesajlar teknik olmamalıdır.

Örnek:

```text
Bağlantı aktif.
Bağlantı bekleniyor.
Bağlantıda sorun var, ekibimiz ilgileniyor.
```

---

# 11. Daily Insight / Snapshot Pattern

Her platform kendi insight snapshot tablosunu kullanmalıdır.

Generic metric JSON tablosu kullanılmayacak.

Çünkü Meta, Google, TikTok ve Amazon metrikleri farklıdır.

## Meta Ads

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

## TikTok Ads

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

## Google Ads

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

## Amazon Ads

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

---

# 12. SyncLog Pattern

Her platform için ayrı sync log modeli kullanılmalıdır.

Örnek ortak alanlar:

```text
id
clientProfileId
platform account id
status
startedAt
finishedAt
errorCode
errorMessage
recordsFetched
apiCallCount
createdAt
```

Örnek status enum:

```prisma
enum PlatformSyncStatus {
  RUNNING
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}
```

Platform-specific enum kullanılabilir:

```text
MetaAdsSyncStatus
TikTokAdsSyncStatus
GoogleAdsSyncStatus
AmazonAdsSyncStatus
```

Sync kuralları:

```text
Manual sync admin action olmalı.
Client dashboard her açıldığında live API call yapmamalı.
Snapshot ve lastSyncAt üzerinden veri göstermeli.
Rate limit riskine karşı TTL uygulanmalı.
Repeated failed sync kısa sürede tekrar denenmemeli.
External API error normalize edilmeli.
Client teknik error görmemeli.
```

Client-facing error örneği:

```text
Veriler hazırlanıyor.
Bağlantı problemi var, ekibimiz ilgileniyor.
Son güncelleme başarısız oldu.
```

Admin-facing error:

```text
Permission denied
Token expired
Invalid account id
Rate limit
Unknown API error
```

Raw error stack client’a dönmemelidir.

---

# 13. Reports Pattern

Her platform için rapor sistemi mevcut generic report modeli varsa ona bağlanmalıdır.

Generic report yoksa platform-specific minimal model kullanılabilir.

Platform-specific report modelleri:

```text
MetaAdsReport
TikTokAdsReport
GoogleAdsReport
AmazonAdsReport
```

Ortak alanlar:

```prisma
id
clientProfileId
projectId
periodStart
periodEnd
type
status
summary
metricsSnapshot
createdByUserId
clientVisible
createdAt
updatedAt
```

Report görünürlük kuralları:

```text
Draft report client’a görünmez.
clientVisible=false report client’a görünmez.
clientVisible=true report client’a görünür.
Client sadece kendi reportlarını görür.
Employee sadece assigned client reportlarını görür.
Admin tüm reportları görür.
```

Report publish işlemi mevcut approval/acknowledgement sistemiyle bağlanmalıdır.

---

# 14. Approval Pattern

Tüm reklam platformları mevcut `ClientApprovalRequest` sistemini kullanmalıdır.

Yeni ayrı approval sistemi yazılmamalıdır.

Platform-specific approval type örnekleri:

```text
META_ADS_CAMPAIGN_APPROVAL
META_ADS_CREATIVE_APPROVAL
META_ADS_BUDGET_CHANGE_APPROVAL
META_ADS_REPORT_ACKNOWLEDGEMENT

TIKTOK_ADS_CAMPAIGN_APPROVAL
TIKTOK_ADS_CREATIVE_APPROVAL
TIKTOK_ADS_BUDGET_CHANGE_APPROVAL
TIKTOK_ADS_REPORT_ACKNOWLEDGEMENT

GOOGLE_ADS_CAMPAIGN_APPROVAL
GOOGLE_ADS_BUDGET_CHANGE_APPROVAL
GOOGLE_ADS_KEYWORD_PLAN_APPROVAL
GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT

AMAZON_ADS_CAMPAIGN_APPROVAL
AMAZON_ADS_PRODUCT_PROMOTION_APPROVAL
AMAZON_ADS_BUDGET_CHANGE_APPROVAL
AMAZON_ADS_REPORT_ACKNOWLEDGEMENT
```

Eğer enum genişletmek zorlaşırsa `entityType` yaklaşımı kullanılabilir:

```text
entityType = META_ADS_CAMPAIGN
entityType = GOOGLE_ADS_BUDGET_CHANGE
entityType = AMAZON_ADS_PRODUCT_PROMOTION
```

Client approval kuralları:

```text
Client sadece kendi approval requestlerini görür.
Client pending approval için approve/reject/acknowledge yapabilir.
Final status tekrar değiştirilemez.
Reject note kaydedilir.
Internal payload client’a dönmez.
Admin/PM/assigned employee müşteri cevabını görür.
```

---

# 15. Creative / Asset Pattern

Yeni dosya sistemi yazılmayacak.

Creative dosyalar mevcut ProjectFiles / design asset sistemiyle bağlanmalıdır.

Ortak creative akışı:

```text
Employee creative upload eder.
File clientVisible=true yapılabilir.
Approval required seçilebilir.
Client creative preview görür.
Client approve/reject yapar.
Reject note revision/task akışına bağlanabilir.
```

Platform-specific creative use cases:

```text
Meta Ads:
  image/video/reels creative

TikTok Ads:
  video creative/material

Google Ads:
  display/performance max asset

Amazon Ads:
  Sponsored Brands / Sponsored Display creative
```

Internal creative client’a görünmemelidir.

---

# 16. Client Panel Pattern

Client Panel’de her platform kendi dashboard componentine sahip olabilir.

Örnek:

```text
MetaAdsDashboard
TikTokAdsDashboard
GoogleAdsDashboard
AmazonAdsDashboard
```

Fakat görünürlük ve data scope ortak olmalıdır.

Client Panel service map:

```ts
const serviceDashboardMap = {
  META_ADS: MetaAdsDashboard,
  TIKTOK_ADS: TikTokAdsDashboard,
  GOOGLE_ADS: GoogleAdsDashboard,
  AMAZON_ADS: AmazonAdsDashboard,
};
```

Client Panel kuralları:

```text
Purchased service yoksa dashboard görünmez.
Endpoint clientId almaz.
Mock fallback gösterilmez.
Data yoksa explicit empty-state gösterilir.
Connection yoksa connection-aware empty-state gösterilir.
Internal data gösterilmez.
Reports/approvals/files client-visible filtreyle gelir.
```

Örnek empty states:

```text
Bu hizmet henüz yapılandırılmadı.
Veriler hazırlanıyor.
Henüz kampanya verisi bulunmuyor.
Bağlantı bekleniyor.
```

---

# 17. Admin Panel Pattern

Admin Panel’de her platform için global yönetim sayfası olabilir.

Routes:

```text
/meta-ads
/tiktok-ads
/google-ads
/amazon-ads
```

Admin global pages şunları göstermelidir:

```text
Platform hizmeti alan tüm müşteriler
Connection status
Last sync
Summary metrics
Pending approvals
Assigned employees
Sync errors
Manual sync action
Config edit action
```

Admin ClientDetail içinde platform tab/section olmalıdır:

```text
ClientDetail > Meta Ads
ClientDetail > TikTok Ads
ClientDetail > Google Ads
ClientDetail > Amazon Ads
```

Admin tüm client scope’a erişebilir.

---

# 18. Employee Workspace Pattern

Employee yalnızca assigned client/project/service scope içinde çalışmalıdır.

Platform-specific employee workspaces:

```text
MetaAdsWorkspace
TikTokAdsWorkspace
GoogleAdsWorkspace
AmazonAdsWorkspace
```

Employee workspace genel bölümleri:

```text
Summary
Campaigns
Creatives / Assets
Reports
Approvals
Tasks
Messages
Sync status
```

Role-specific visibility:

```text
Performance Specialist:
  reporting, optimization, budget recommendations

Social Media Specialist:
  campaign/copy/creative notes, Meta/TikTok ağırlıklı

Designer:
  creative assets, design approvals, video/image previews

Project Manager:
  client/project/service coordination, approvals, reports, tasks
```

Employee out-of-scope data göremez.

---

# 19. Permissions Standardı

Platform permissions ortak naming pattern kullanmalıdır.

Meta:

```text
metaAds.config.read.any
metaAds.config.manage.any
metaAds.config.read.assigned
metaAds.reporting.read.any
metaAds.reporting.read.assigned
metaAds.sync.run.any
metaAds.approvals.manage.any
metaAds.approvals.create.assigned
```

TikTok:

```text
tiktokAds.config.read.any
tiktokAds.config.manage.any
tiktokAds.config.read.assigned
tiktokAds.reporting.read.any
tiktokAds.reporting.read.assigned
tiktokAds.sync.run.any
tiktokAds.approvals.manage.any
tiktokAds.approvals.create.assigned
```

Google:

```text
googleAds.config.read.any
googleAds.config.manage.any
googleAds.config.read.assigned
googleAds.reporting.read.any
googleAds.reporting.read.assigned
googleAds.sync.run.any
googleAds.approvals.manage.any
googleAds.approvals.create.assigned
```

Amazon:

```text
amazonAds.config.read.any
amazonAds.config.manage.any
amazonAds.config.read.assigned
amazonAds.reporting.read.any
amazonAds.reporting.read.assigned
amazonAds.sync.run.any
amazonAds.approvals.manage.any
amazonAds.approvals.create.assigned
```

Admin:

```text
*.read.any
*.manage.any
*.sync.run.any
```

Employee:

```text
*.read.assigned
*.create.assigned
*.manage.assigned, role’a göre sınırlı
```

Client:

```text
own-scope endpoint
permission string yerine clientProfile ownership check
```

---

# 20. API Naming Standardı

## Client endpoints

```http
GET /api/v1/client/meta-ads/config
GET /api/v1/client/meta-ads/summary
GET /api/v1/client/meta-ads/campaigns
GET /api/v1/client/meta-ads/reports

GET /api/v1/client/tiktok-ads/config
GET /api/v1/client/tiktok-ads/summary
GET /api/v1/client/tiktok-ads/campaigns
GET /api/v1/client/tiktok-ads/reports

GET /api/v1/client/google-ads/config
GET /api/v1/client/google-ads/summary
GET /api/v1/client/google-ads/campaigns
GET /api/v1/client/google-ads/reports

GET /api/v1/client/amazon-ads/config
GET /api/v1/client/amazon-ads/summary
GET /api/v1/client/amazon-ads/campaigns
GET /api/v1/client/amazon-ads/reports
```

## Admin/Employee endpoints

```http
GET /api/v1/meta-ads/clients/:clientId/summary
GET /api/v1/tiktok-ads/clients/:clientId/summary
GET /api/v1/google-ads/clients/:clientId/summary
GET /api/v1/amazon-ads/clients/:clientId/summary
```

## Admin config endpoints

```http
GET /api/v1/admin/clients/:clientId/meta-ads/config
PATCH /api/v1/admin/clients/:clientId/meta-ads/config

GET /api/v1/admin/clients/:clientId/tiktok-ads/config
PATCH /api/v1/admin/clients/:clientId/tiktok-ads/config

GET /api/v1/admin/clients/:clientId/google-ads/config
PATCH /api/v1/admin/clients/:clientId/google-ads/config

GET /api/v1/admin/clients/:clientId/amazon-ads/config
PATCH /api/v1/admin/clients/:clientId/amazon-ads/config
```

## Connection endpoints

```http
POST /api/v1/admin/clients/:clientId/meta-ads/test-connection
POST /api/v1/admin/clients/:clientId/tiktok-ads/test-connection
POST /api/v1/admin/clients/:clientId/google-ads/test-connection
POST /api/v1/admin/clients/:clientId/amazon-ads/test-connection
```

## Sync endpoints

```http
POST /api/v1/meta-ads/clients/:clientId/sync
POST /api/v1/tiktok-ads/clients/:clientId/sync
POST /api/v1/google-ads/clients/:clientId/sync
POST /api/v1/amazon-ads/clients/:clientId/sync
```

---

# 21. Frontend RTK Query Pattern

Her platform kendi feature klasörüne sahip olabilir.

Client Panel:

```text
clientPanel/src/app/features/metaAds/
clientPanel/src/app/features/tiktokAds/
clientPanel/src/app/features/googleAds/
clientPanel/src/app/features/amazonAds/
```

Admin/Employee Panel:

```text
adminandemployeePanel/src/app/features/metaAds/
adminandemployeePanel/src/app/features/tiktokAds/
adminandemployeePanel/src/app/features/googleAds/
adminandemployeePanel/src/app/features/amazonAds/
```

Her feature içinde:

```text
platformApi.ts
platformTypes.ts
platformUtils.ts
```

RTK Query kuralları:

```text
baseApi.injectEndpoints pattern kullanılmalı.
Cache tags platform-specific olmalı.
Mutation sonrası summary/list/detail invalidation yapılmalı.
Sync sonrası summary/campaigns/reports invalidation yapılmalı.
Approval response sonrası approvals + platform summary invalidation yapılmalı.
```

---

# 22. Mock Data Policy

Mock fallback kullanılmayacak.

Yanlış:

```text
API hata verirse mock campaigns göster.
```

Doğru:

```text
API hata verirse error state göster.
Data yoksa empty state göster.
Connection yoksa connection state göster.
```

İzin verilen mock kullanımı:

```text
Testlerde mock API response.
Story/demo amaçlı explicit fixture, production route’a bağlı değilse.
```

Production dashboard’da hard-coded performance data olmamalıdır.

---

# 23. External API Strategy

Her platform external API integration için ayrı client service kullanmalıdır.

Örnek:

```text
meta-ads-client.service.ts
tiktok-ads-client.service.ts
google-ads-client.service.ts
amazon-ads-client.service.ts
```

External API çağrıları testlerde mocklanmalıdır.

Dış API hataları normalize edilmelidir.

Client-facing raw error dönmemelidir.

---

# 24. Validation / Test Standardı

Her faz sonunda şu komutlar çalıştırılmalıdır.

Backend:

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

Admin/Employee Panel:

```bash
cd adminandemployeePanel
npm run build
npm run check
npm run test:run
```

Client Panel:

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

Testlerde minimum coverage:

```text
Admin any-scope access
Employee assigned-scope access
Employee out-of-scope blocked
Client own-scope access
Client other-client blocked
Token not returned
Internal data not returned
clientVisible filtering
Connection missing state
Sync error state
```

---

# 25. Development Order

Önerilen geliştirme sırası:

```text
1. Meta Ads
2. TikTok Ads
3. Google Ads
4. Amazon Ads
5. Social Media Panel
6. Growth & Hub
7. Cross-channel Ads Overview
```

Platformlar içinde önerilen faz sırası:

```text
00 Discovery / Contract
01 Backend Foundation / Config
02 Auth / Credential / Connection
03 Reporting / Sync / Snapshot
04 Client Panel
05 Admin Panel
06 Employee Workspace
07 Approval / Creative / Collaboration
08 Sync Automation / Hardening
09 Reports / Export
10 Production Hardening
```

Meta Ads ilk platform olarak uçtan uca V1 tamamlanmalıdır.

Sonra Meta Ads pattern’i TikTok, Google ve Amazon’a uygulanmalıdır.

---

# 26. Non-Goals

Bu mimaride şu işler yapılmayacak:

```text
Her müşteri için ayrı component yazmak
Generic JSON platform integration modeli kurmak
Tokenları config tablosunda tutmak
Client endpointlerinde clientId almak
Mock fallback ile production dashboard doldurmak
Auth/RBAC sistemini yeniden yazmak
Vite/React yapısını Next.js’e taşımak
Yeni dosya sistemi yazmak
Mevcut approval sistemi yerine ikinci approval sistemi yazmak
```

---

# 27. Codex İçin Sabit Kurallar

Platform fazları uygulanırken Codex şu kurallara uymalıdır:

```text
- Mevcut mimariyi bozma.
- Generic platform integration JSON modeli üretme.
- ClientPurchasedService ve Project.serviceKey mimarisine uy.
- Her platform için platform-specific config/credential/insight/sync/report modelleri kullan.
- Client endpointleri clientId almasın.
- Client sadece kendi clientProfile scope verisini görsün.
- Employee sadece assigned client/project/service scope verisini görsün.
- Admin global erişimi korusun.
- Token response’ta dönmesin.
- Token encrypted saklansın.
- Mock fallback üretme.
- Data yoksa explicit empty-state göster.
- Migration-first convention kullan; db push kullanma.
- Auth/RBAC sistemini yeniden yazma.
- Refresh/access token stratejisine dokunma.
- Vite + React SPA yapısını koru.
- Redux Toolkit + RTK Query ve existing baseApi.injectEndpoints pattern’ini kullan.
- Gereksiz yeni library ekleme.
- Büyük klasör reorganizasyonu yapma.
- Test yazmadan işi bitmiş sayma.
- Shared memory dosyalarını en sonda güncelle.
```

---

# 28. Final Response Standardı

Codex her faz sonunda final response’u Türkçe yazmalı ve şu başlıkları kullanmalıdır:

```text
1. Yapılan işler
2. Backend değişiklikleri
3. Admin/Employee Panel değişiklikleri
4. Client Panel değişiklikleri
5. Eklenen/güncellenen endpointler
6. Permission/RBAC değişiklikleri
7. Test sonuçları
8. Shared memory güncellemeleri
9. Kalan riskler
10. Sonraki önerilen task
```

Final response’ta özellikle şunları açıkça belirtmelidir:

```text
- İlgili serviceKey/purchased service akışı çalışıyor mu?
- Her müşteri için platform config tutulabiliyor mu?
- Admin müşteri create/edit sırasında platform config girebiliyor mu?
- Client yalnızca kendi config/summary’sini görebiliyor mu?
- Employee assigned scope dışına çıkamıyor mu?
- Token veya sensitive data response’ta dönüyor mu?
- Mock response kaldı mı?
- Migration yapıldı mı?
- Testler gerçekten çalıştırıldı mı ve sonuçları ne?
```