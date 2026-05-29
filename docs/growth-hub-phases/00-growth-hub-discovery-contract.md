<!-- docs/growth-hub-phases/00-growth-hub-discovery-contract.md -->

# FAZ 0 — Growth & Hub Discovery, Product Contract ve Data Contract

## Amaç

Growth & Hub panelini geliştirmeye başlamadan önce mevcut repo mimarisine göre ürün ve teknik contract'ı netleştirmek.

Growth & Hub bir reklam kanalı değildir. Meta Ads, Google Ads, TikTok Ads, Amazon Ads, Social Media, SEO, Web App, Landing Page ve diğer hizmetlerden gelen verileri üst seviyede birleştiren büyüme kontrol merkezi olmalıdır.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Growth & Hub panelinde hangi veriler gösterilecek?
- Hangi veriler mevcut sistemden alınacak?
- Hangi veriler ileride platform entegrasyonlarından gelecek?
- Client Panel'deki mevcut mock tasarım hangi API contract'a bağlanacak?
- Admin, Project Manager/Growth Lead, specialist roller ve Client hangi veriyi görecek?
- Growth & Hub müşteriye neyi anlatacak?
- Growth & Hub employee tarafında nasıl yönetilecek?

## Mevcut Repo Keşfi

### Aktif mimari

- `server/`: NestJS + Prisma + RBAC backend.
- `adminandemployeePanel/`: Vite + React SPA, Admin Panel + Employee Panel.
- `clientPanel/`: Vite + React SPA müşteri portalı.
- Routing Next.js değil; React Router 7 ve clientPanel state-based service navigation kullanılıyor.
- `PurchasedServiceKey.GROWTH_HUB` Prisma enum'unda mevcut.
- `ClientPurchasedService` hizmet görünürlüğünün source of truth'u.
- Client Portal yalnızca satın alınmış `ACTIVE` hizmetleri gösteriyor.
- `Project.serviceKey` tüm service-level işlerin temel bağlayıcısı.
- Task approval akışı ayrı `ClientApprovalRequest` modeliyle değil, `Task` ve `ProjectFile` üzerindeki `approvalRequired`, `approvalType`, `approvalStatus` alanlarıyla çalışıyor.
- `MetaAdsApprovalType` legacy/shared approval enum'u olarak Meta, TikTok, Amazon ve Social Media approval type'larını taşıyor.
- `DeliverySprint`, `DeliveryRelease`, `ProjectFile`, Web App workspace messages/revisions/weekly reports, Social Media posts/reports ve ads report modelleri Growth Hub için kullanılabilir kaynaklar.

### Aktif kanal modülleri

- Meta Ads aktif backend module: `server/src/meta-ads/`
- TikTok Ads aktif backend module: `server/src/tiktok-ads/`
- Amazon Ads aktif backend module: `server/src/amazon-ads/`
- Social Media aktif backend module: `server/src/social-media/`
- Google Ads contract dokümanları ve eski migration geçmişi var, fakat mevcut `schema.prisma`, `server/src/app.module.ts` ve `server/src/` içinde aktif Google Ads module/model yok. Growth Hub V1 Google Ads'i mock'lamayacak; `GOOGLE_ADS` purchased service varsa `CONTRACT_ONLY` / `WAITING_CONFIG` / `NO_DATA` state üretilecek.

### Growth Hub mevcut frontend durumu

Dosyalar:

- `clientPanel/src/app/pages/services/growth-hub-dashboard.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`

Mevcut `GrowthHubDashboard` tamamen static/mock veriyle çalışıyor:

- `stats`: toplam lead, reklam harcaması, ROAS, yayınlanan içerik, bekleyen onay.
- `healthCards`: strateji, sosyal medya, reklamlar, tasarım, raporlama skorları.
- `weeklySummary`: tamamlanan haftalık iş listesi.
- `channelPerformance`: Meta Ads, Google Ads, Instagram, Website kartları.
- `clientActions`: müşteri bekleyen aksiyonları.
- `recentActivity`: son aktiviteler.
- `leadTrendData`: son 7 gün lead grafiği.
- Ajans yorumu ve Growth Lead bilgisi hard-coded.

`service-pages.ts` içinde Growth Hub service profile ve tabs yine static:

- `growth-summary`
- `channels`
- `campaigns`
- `content-approvals`
- `weekly-actions`

`service-tab-page.tsx` içindeki `GrowthWorkspace` static `ServiceTabContent` tablosunu kullanıyor. Faz 2'de bu da API-driven olmalı.

## Growth & Hub Ürün Konumu

```text
Meta Ads = kanal paneli
Google Ads = kanal paneli/contract-only adapter
TikTok Ads = kanal paneli
Amazon Ads = kanal paneli
Social Media = kanal/operasyon paneli
Web App / Landing Page = dönüşüm ve delivery paneli
SEO = audit ve organik büyüme paneli

Growth & Hub = bütün kanalların stratejik büyüme kontrol merkezi
```

Growth & Hub'ın cevaplaması gereken sorular:

- Bu hafta büyüme sistemi genel olarak iyi mi?
- Hangi kanal büyümeyi taşıyor?
- Hangi kanalda risk var?
- Hangi onaylar büyümeyi bekletiyor?
- Hangi task/sprint/rapor tamamlandı?
- Müşteriden hangi aksiyon bekleniyor?
- Ajans ekibinin bu haftaki yorumu ne?
- Gelecek hafta odak ne olmalı?

## V1 Kaynak Haritası

### Client/service scope

- `ClientPurchasedService`: Growth Hub ve kanal visibility.
- `ClientProfile`: client identity/status.
- `EmployeeClientAssignment`: employee assigned scope.
- Current assignment enum'da dedicated `GROWTH` scope yok. V1'de Project Manager/Growth Lead görünürlüğü `PROJECT` assignment scope + `GROWTH_HUB` active purchased service ile başlamalı. Dedicated `GROWTH` scope gerekirse ayrı karar ve migration ile eklenmeli.

### Project/task/delivery

- `Project.serviceKey=GROWTH_HUB`: Growth Hub ana operasyon projesi.
- Diğer active service project'leri: kanal summary için context.
- `Task` ve `TaskTodo`: open task, completed action, client-visible action, pending approval, overdue work.
- `DeliverySprint` ve `DeliveryRelease`: sprint/release health, progress, release approval state.

### Approval/action kaynakları

- `Task.approvalRequired=true` + `approvalStatus=PENDING`: pending approval.
- `ProjectFile.approvalRequired=true` + `approvalStatus=PENDING`: pending file/creative approval.
- `DeliveryRelease.approvalStatus=PENDING`: release approval.
- Ads/Social report acknowledgement task'ları: report acknowledgement/client action.
- Yeni duplicate approval sistemi yazılmamalı.

### Report/comment/activity kaynakları

- Meta/TikTok/Amazon/Social Media report modelleri: published/client-visible reports.
- Web App workspace weekly reports: delivery/growth context'e yardımcı source.
- Web App workspace messages: client-visible recent activity.
- `ProjectFile.visibility=CLIENT_VISIBLE`: client-facing file activity.
- Growth-specific weekly note modeli Faz 5'e bırakılmalı. Faz 1-2'de ajans yorumu yoksa `agencyComment=null` dönmeli; mock yorum üretilmemeli.

### Channel metric kaynakları

- Meta: `ClientMetaAdsConfig`, `MetaAdsDailyInsight`, `MetaAdsReport`
- TikTok: `ClientTikTokAdsConfig`, `TikTokAdsDailyInsight`, `TikTokAdsReport`
- Amazon: `ClientAmazonAdsConfig`, `AmazonAdsDailyInsight`, `AmazonAdsReport`
- Social Media: `ClientSocialMediaConfig`, `SocialMediaPost`, `SocialMediaPostInsight`, `SocialMediaReport`
- Google: mevcut repo durumunda aktif Prisma model/module yok; contract-only/future adapter.
- Web App/Landing/Mobile/SEO/Support: project/task/delivery/file/report state kaynakları; platform metric yoksa `NO_DATA` veya `WAITING_CONFIG`.

## Mock Alanlarının API Karşılığı

| Client UI alanı | V1 API kaynağı | Not |
| --- | --- | --- |
| Toplam Lead | Meta `results`, TikTok `conversions`, Amazon `orders`, future Google conversions/leads | Metric semantics farklıysa `totalLeads=null` ve kanal bazında gösterim tercih edilmeli. |
| Reklam Harcaması | Meta/TikTok/Amazon spend toplamı, future Google spend | Sadece aktif veri kaynağı olan kanallar dahil edilmeli. |
| ROAS | revenue/purchaseValue/sales toplamı / spend | Veri yoksa `null`; "0" veya mock gösterilmez. |
| Yayınlanan İçerik | `SocialMediaPost.status=PUBLISHED` | Haftalık/aylık period bazlı. |
| Bekleyen Onay | Task/File/Release pending approval + report acknowledgement tasks | Client own scope'ta sadece client-visible/onaya açık kayıtlar. |
| Growth health cards | Summary service rule set | Strategy/Social/Ads/Design/Reporting skorları source state'lerden hesaplanır. |
| Haftalık Growth Özeti | completed tasks/todos, published reports, latest weekly note | Persisted Growth weekly note Faz 5'te. |
| Lead trend grafiği | Daily insight time series | Veri yoksa empty chart state. |
| Kanal performansı | `channelSummaries` | Purchased service yoksa gösterme; active ama kaynak yoksa state kartı göster. |
| Ajans Yorumu | `GrowthHubWeeklyNote` veya geçici olarak latest client-visible weekly report summary | Yoksa `null`. |
| Müşteri Aksiyonları | pending approvals, client-visible tasks/todos, report acknowledgements, meeting confirmations | Growth action modeli Faz 5'te kalıcılaşır. |
| Son Aktiviteler | completed tasks, new files, reports, approvals, messages, releases | Client-safe visibility filtresi zorunlu. |

## Backend Endpoint Convention

Mevcut kanal pattern'i Growth Hub için de korunmalı:

- Admin-any: `/api/v1/admin/clients/:clientId/<service>/*`
- Employee assigned: `/api/v1/<service>/clients/:clientId/*`
- Client own: `/api/v1/clients/me/<service>/*`

Growth Hub için önerilen V1 endpoint surface:

```http
GET /api/v1/admin/growth-hub/clients
GET /api/v1/admin/clients/:clientId/growth-hub/config
PATCH /api/v1/admin/clients/:clientId/growth-hub/config
GET /api/v1/admin/clients/:clientId/growth-hub/summary
GET /api/v1/admin/clients/:clientId/growth-hub/channels
GET /api/v1/admin/clients/:clientId/growth-hub/actions
GET /api/v1/admin/clients/:clientId/growth-hub/activity
```

```http
GET /api/v1/growth-hub/clients/:clientId/config
GET /api/v1/growth-hub/clients/:clientId/summary
GET /api/v1/growth-hub/clients/:clientId/channels
GET /api/v1/growth-hub/clients/:clientId/actions
GET /api/v1/growth-hub/clients/:clientId/activity
```

```http
GET /api/v1/clients/me/growth-hub/config
GET /api/v1/clients/me/growth-hub/summary
GET /api/v1/clients/me/growth-hub/channels
GET /api/v1/clients/me/growth-hub/actions
GET /api/v1/clients/me/growth-hub/activity
```

`/api/v1/client/growth-hub/*` kullanılmamalı; repo'daki aktif own-client convention `/clients/me/*`.

## Growth Hub V1 Data Contract

```ts
type GrowthHubHealthStatus = "HEALTHY" | "WATCH" | "RISK" | "CRITICAL";
type GrowthHubChannelStatus =
  | "ACTIVE"
  | "WAITING_CONFIG"
  | "NO_DATA"
  | "RISK"
  | "OPTIMIZE"
  | "SCALE"
  | "PAUSED";
type GrowthHubRiskLevel = "LOW" | "MEDIUM" | "HIGH";
type GrowthHubSourceStatus = "ACTIVE_MODULE" | "CONTRACT_ONLY" | "NOT_IMPLEMENTED";

interface GrowthHubSummaryResponse {
  client: {
    id: string;
    companyName: string;
  };
  service: {
    serviceKey: "GROWTH_HUB";
    purchasedStatus: "ACTIVE" | "PAUSED" | "INACTIVE";
    configStatus: "CONFIGURED" | "MISSING" | "PAUSED" | "ON_HOLD";
  };
  period: {
    from: string;
    to: string;
    timezone: string;
  };
  healthScore: number | null;
  healthStatus: GrowthHubHealthStatus;
  metrics: {
    totalLeads: number | null;
    totalSpend: number | null;
    blendedRoas: number | null;
    blendedCpa: number | null;
    pendingApprovals: number;
    openTasks: number;
    completedActionsThisWeek: number;
    activeChannels: number;
    publishedContentThisWeek: number;
  };
  healthCards: GrowthHubHealthCard[];
  risks: GrowthHubRisk[];
  recommendations: GrowthRecommendation[];
  channelSummaries: GrowthChannelSummary[];
  weeklyActions: GrowthWeeklyAction[];
  recentActivity: GrowthActivity[];
  leadTrend: GrowthTrendPoint[];
  agencyComment: GrowthWeeklyNote | null;
  lastUpdatedAt: string;
  meta: {
    generatedAt: string;
    sourceStates: GrowthSourceState[];
  };
}
```

### Config

```ts
interface GrowthHubConfig {
  id: string;
  clientProfileId: string;
  primaryGoal:
    | "LEAD_GENERATION"
    | "ECOMMERCE_SALES"
    | "BRAND_AWARENESS"
    | "APP_GROWTH"
    | "RETENTION"
    | "MIXED"
    | null;
  targetLeads: number | null;
  targetRoas: number | null;
  targetCpa: number | null;
  targetRevenue: number | null;
  reportingDay: string | null;
  notes: string | null;
  status: "ACTIVE" | "PAUSED" | "ON_HOLD";
  createdAt: string;
  updatedAt: string;
}
```

### Health card

```ts
interface GrowthHubHealthCard {
  key: "STRATEGY" | "SOCIAL_MEDIA" | "ADS" | "DESIGN" | "REPORTING";
  label: string;
  score: number | null;
  status: GrowthHubHealthStatus;
  reason: string | null;
}
```

### Channel summary

```ts
interface GrowthChannelSummary {
  serviceKey: string;
  label: string;
  sourceStatus: GrowthHubSourceStatus;
  status: GrowthHubChannelStatus;
  configStatus: "CONFIGURED" | "MISSING" | "NOT_REQUIRED" | "ERROR";
  healthScore: number | null;
  primaryMetricLabel: string | null;
  primaryMetricValue: number | null;
  secondaryMetricLabel: string | null;
  secondaryMetricValue: number | null;
  spend: number | null;
  leads: number | null;
  conversions: number | null;
  revenue: number | null;
  roas: number | null;
  cpa: number | null;
  progressPercent: number | null;
  pendingApprovals: number;
  openTasks: number;
  riskLevel: GrowthHubRiskLevel;
  detailRoute: string | null;
  stateMessage: string | null;
  lastUpdatedAt: string | null;
}
```

Rules:

- Purchased service yoksa kanal listesinde gösterme.
- Purchased service active ama config/model yoksa `WAITING_CONFIG` veya `NO_DATA`.
- Aktif Google Ads module yoksa `sourceStatus="CONTRACT_ONLY"` ve mock metric yok.
- Platform summary varsa metricler platform snapshot'ından gelir.
- Sadece task/project state varsa progress/open task/pending approval gösterilir.
- Client-facing response internal raw error içermez.

### Weekly action

```ts
interface GrowthWeeklyAction {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ownerName: string | null;
  dueAt: string | null;
  clientVisible: boolean;
  source: "TASK" | "TASK_TODO" | "REPORT_ACK" | "GROWTH_ACTION";
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}
```

V1'de `GROWTH_ACTION` source'u Faz 5'e kadar dönmeyebilir.

### Risk, recommendation, activity

```ts
interface GrowthHubRisk {
  id: string;
  title: string;
  description: string | null;
  level: GrowthHubRiskLevel;
  source: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}

interface GrowthRecommendation {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  clientVisible: boolean;
  source: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}

interface GrowthActivity {
  id: string;
  title: string;
  description: string | null;
  type:
    | "TASK_COMPLETED"
    | "APPROVAL_UPDATED"
    | "REPORT_PUBLISHED"
    | "FILE_SHARED"
    | "MESSAGE_CREATED"
    | "SPRINT_UPDATED"
    | "RELEASE_UPDATED";
  occurredAt: string;
  sourceEntityType: string;
  sourceEntityId: string;
  serviceKey: string | null;
}

interface GrowthTrendPoint {
  date: string;
  leads: number | null;
  conversions: number | null;
  spend: number | null;
  revenue: number | null;
}

interface GrowthWeeklyNote {
  id: string;
  summary: string;
  nextFocus: string | null;
  risks: string[];
  authorName: string | null;
  weekStart: string;
  weekEnd: string;
  createdAt: string;
}

interface GrowthSourceState {
  source:
    | "META_ADS"
    | "TIKTOK_ADS"
    | "AMAZON_ADS"
    | "GOOGLE_ADS"
    | "SOCIAL_MEDIA"
    | "PROJECTS"
    | "TASKS"
    | "DELIVERY"
    | "FILES"
    | "REPORTS"
    | "WEB_APP_WORKSPACE";
  status: "READY" | "EMPTY" | "WAITING_CONFIG" | "ERROR" | "NOT_IMPLEMENTED";
  lastUpdatedAt: string | null;
  message: string | null;
}
```

## Role-Scope Matrisi

| Rol | Görebilir | Aksiyon | Scope |
| --- | --- | --- | --- |
| Admin | Tüm Growth Hub clientları, config, summary, channels, risks, actions, reports | Config manage, global list, report/action/approval manage fazlarına hazırlık | `any` |
| Project Manager / Growth Lead | Assigned Growth Hub client summary, channels, client actions, reports, messages | Faz 1'de read; Faz 4-5'te action/note/report manage | active assignment + `GROWTH_HUB` service |
| Performance Specialist | Assigned performance channel summaries (Meta/TikTok/Amazon/Google contract), optimization risks | Channel notes/recommendations later | active assignment + relevant channel service |
| Social Media Specialist | Assigned social/content channel state, content approvals, post progress | Social approval/content actions | active assignment + `SOCIAL_MEDIA` |
| Designer | Creative/design approvals, files, asset status | Creative/file approval actions | active assignment + design/channel service |
| Developer/Support/SEO | Kendi domainine ait project/task/delivery/file state Growth Hub'da kaynak olabilir | Growth Hub içinde limited read only, özel workspace gerekmez | active assignment + domain permission |
| Client Owner/Member | Own Growth Hub summary, client-visible channels/actions/activity/reports | Approval/acknowledgement response | own client profile + active `GROWTH_HUB` service |

## Permission Contract

Faz 1 permission set:

```text
growthHub.config.read.any
growthHub.config.manage.any
growthHub.config.read.assigned
growthHub.config.read.own
growthHub.summary.read.any
growthHub.summary.read.assigned
growthHub.summary.read.own
growthHub.actions.read.assigned
growthHub.actions.read.own
```

Faz 3+ genişletmeleri:

```text
growthHub.actions.manage.any
growthHub.actions.manage.assigned
growthHub.notes.manage.any
growthHub.notes.manage.assigned
growthHub.reports.manage.any
growthHub.reports.manage.assigned
growthHub.recommendations.manage.any
growthHub.recommendations.manage.assigned
growthHub.approvals.create.assigned
```

Admin `any` permission'larını alır. Project Manager ilk V1'de assigned read permission'larını alır. Client owner/member own read permission'larını alır.

## Faz 1 Implementation Contract

Faz 1 implementation hazır kabul edilir. Net teknik kararlar:

1. `server/src/growth-hub/` module eklenecek.
2. `ClientGrowthHubConfig`, `GrowthHubGoal`, `GrowthHubStatus` Prisma schema'ya migration-first eklenecek.
3. `ClientProfile` relation'ına `growthHubConfig` eklenecek.
4. Endpointler mevcut kanal convention'ına göre `/admin/clients/:clientId/growth-hub/*`, `/growth-hub/clients/:clientId/*`, `/clients/me/growth-hub/*` olacak.
5. Own-client endpointlerde `/client/growth-hub/*` kullanılmayacak.
6. Summary service mock dönmeyecek; veri yoksa null/empty/status state dönecek.
7. `GrowthHubSummaryService` ilk versiyonda doğrudan Prisma read-model query'leriyle çalışacak; sibling service controller method'larına authz bypass etmek için bağlanmayacak.
8. Meta/TikTok/Amazon/Social Media aktif adapter olarak okunabilir.
9. Google Ads mevcut repo durumunda contract-only adapter olacak; aktif module yeniden eklenene kadar metric üretmeyecek.
10. `ClientApprovalRequest` modeli varsayılmayacak; approval source `Task`, `ProjectFile`, `DeliveryRelease` ve report acknowledgement task'ları olacak.
11. Generic report modeli varsayılmayacak; channel-specific report modelleri ve Web App weekly reports okunacak. Growth Hub report modeli Faz 7'de eklenecek.
12. Persisted `GrowthHubAction` ve `GrowthHubWeeklyNote` Faz 5'e bırakılacak; Faz 1/2 virtual actions ve `agencyComment=null` ile başlayabilir.
13. Admin Clients create/edit flow'da `GROWTH_HUB` seçilirse Growth Hub config alanları açılacak.
14. Client Panel Growth Hub dashboard Faz 2'de bu contract'a bağlanacak ve static fallback kaldırılacak.
15. Testlerde admin any, employee assigned, client own, out-of-scope denial ve no-mock empty state kapsanacak.

## Kabul Kriterleri

- Growth & Hub'ın kanal paneli değil orchestration layer olduğu net.
- Client Panel mock alanlarının API karşılığı net.
- Backend V1 summary contract net.
- Endpoint convention mevcut repo ile uyumlu.
- Role-scope matrisi net.
- Google Ads'in mevcut repo durumundaki contract-only state'i açık.
- Mevcut mimariyle çelişen karar yok.
- Faz 1 implementation contract hazır.
