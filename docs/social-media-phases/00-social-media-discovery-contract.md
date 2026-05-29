<!-- docs/social-media-phases/00-social-media-discovery-contract.md -->

# FAZ 0 — Social Media Discovery, Product Contract ve Data Contract

## Durum

- Faz durumu: **Tamamlandı**
- Tarih: **2026-05-28**
- Sonuç: **Faz 1 implementation contract hazır**

## Amaç

Social Media Paneli geliştirmeye başlamadan önce mevcut repo mimarisine göre ürün contract’ını netleştirmek.

Social Media Panel bir reklam kanalı değildir. Organik içerik planlama, kreatif üretim, müşteri onayı, yayın takibi ve sosyal medya performans yönetimi merkezidir.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Social Media Panel hangi verileri gösterecek?
- Hangi veriler mevcut sistemden alınacak?
- Hangi veriler ileride Instagram/Facebook/LinkedIn/TikTok API entegrasyonlarından gelecek?
- Client Panel’deki mevcut service dashboard yapısı hangi API contract’a bağlanacak?
- Admin, Social Media Specialist, Designer, Project Manager ve Client hangi veriyi görecek?
- İçerik takvimi, post, kreatif, onay ve rapor akışı nasıl çalışacak?

## Mevcut Repo Bağlamı

Mevcut sistemde:

- `server/` NestJS + Prisma + RBAC backend.
- `adminandemployeePanel/` Admin Panel + Employee Panel.
- `clientPanel/` müşteri portalı.
- `ClientPurchasedService` modeli var.
- Client Portal yalnızca satın alınmış ACTIVE hizmetleri gösteriyor.
- `Project.serviceKey` var.
- Task / TaskTodo sistemi var.
- ClientApprovalRequest veya approval sistemi var.
- ProjectFiles ve client-visible file/design asset akışı var.
- Reports / client-visible rapor yapısı var.
- Web APP workspace, messages, reports, revisions ve meetings altyapısı var.
- Social Media service key mevcut değilse `SOCIAL_MEDIA` purchased service olarak eklenmeli.
- `MEDIA_HUB` varsa Social Media ile ilişkisi netleştirilmeli.

## Social Media Ürün Konumu

Social Media Panel şu şekilde konumlanmalı:

```text
Social Media Panel = organik içerik operasyon merkezi

Ana akış:
İçerik fikri → Caption → Kreatif üretim → Müşteri onayı → Yayın planı → Yayınlandı → Performans → Rapor
```

Social Media Panel’in cevaplaması gereken sorular:

- Bu ay kaç içerik planlandı?
- Kaç içerik müşteri onayında?
- Kaç içerik yayınlandı?
- Hangi postlar tasarım aşamasında?
- Hangi postlar revizyon bekliyor?
- Hangi kreatifler client-visible?
- Müşteri hangi caption/kreatif/post için onay verdi?
- Hangi postların performansı iyi?
- Ajans ekibinin bu haftaki sosyal medya yorumu ne?
- Sonraki içerik aksiyonları neler?

## İncelenecek Alanlar

Codex önce şu alanları incelemeli:

### Client Panel

- `clientPanel/src/app/pages/services/*`
- `clientPanel/src/app/data/service-pages.ts`
- service selection / selectedService restore logic
- client approvals feature
- client reports / project files / design gallery sections

### Admin/Employee Panel

- Clients create/edit
- ClientDetail
- Services page
- Project Manager workspace
- Tasks
- Approvals
- Reports
- Project files
- Employee role/sidebar mapping

### Backend

- clients module
- projects module
- tasks module
- client approvals module
- project files module
- reports module
- serviceKey / purchased service validation
- assignment scope authorization

## Social Media V1 Data Contract

Önerilen summary response:

```ts
{
  plannedPosts: number;
  publishedPosts: number;
  pendingApprovals: number;
  rejectedPosts: number;
  inDesignPosts: number;
  upcomingPosts: SocialMediaPostSummary[];
  recentPosts: SocialMediaPostSummary[];
  topPosts: SocialMediaPostInsightSummary[];
  creativeAssets: SocialMediaCreativeSummary[];
  agencyNote?: SocialMediaWeeklyNote;
  lastUpdatedAt: string;
}
```

Post summary:

```ts
{
  id: string;
  title: string;
  platform: "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "LINKEDIN" | "X" | "PINTEREST";
  type: "FEED" | "STORY" | "REEL" | "CAROUSEL" | "SHORT_VIDEO" | "STATIC_IMAGE" | "TEXT";
  status: "IDEA" | "DRAFT" | "DESIGN" | "WAITING_APPROVAL" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "REJECTED" | "CANCELLED";
  caption?: string;
  scheduledAt?: string;
  publishedAt?: string;
  approvalStatus?: string;
  thumbnailUrl?: string;
  clientVisible: boolean;
}
```

Creative summary:

```ts
{
  id: string;
  title: string;
  fileUrl: string;
  mimeType: string;
  postId?: string;
  approvalStatus?: string;
  clientVisible: boolean;
  uploadedAt: string;
}
```

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Social Media Panel için mevcut repo mimarisi üzerinden teknik ve ürün contract çıkarmaktır.

Şunları yap:

1. `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. Social Media service profile/tab yapısı var mı kontrol et.
3. Social Media ile ilişkili mock/static dashboard varsa tespit et.
4. Social Media Panel’in hangi mevcut backend kaynaklarından besleneceğini çıkar:
   - purchased services
   - projects
   - tasks/todos
   - approvals
   - files/design assets
   - reports
   - workspace messages
5. V1 data contract oluştur.
6. Admin / Employee / Client role-scope matrisi çıkar.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory gerekiyorsa yalnızca ilgili discovery notlarını ekle.

## Kabul Kriterleri

- Social Media Panel’in organik içerik operasyon merkezi olduğu net.
- İçerik takvimi, post, kreatif, onay ve rapor contract’ı net.
- Backend V1 summary contract net.
- Role-scope matrisi net.
- Mevcut mimariyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.

---

# Faz 0 Çıktısı — 2026-05-28

## İncelenen Repo Yüzeyleri

- `PROJECT_CONTEXT.md`, `REPO_MAP.md`, `DECISIONS.md`, `ROAD_MAP.md`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/clients/*`
- `server/src/admin-clients/*`
- `server/src/projects/*`
- `server/src/tasks/*`
- `server/src/project-files/*`
- `server/src/web-app-workspace/*`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/employee/pages/IcerikTakvimi.tsx`
- `adminandemployeePanel/src/app/employee/pages/Captionlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/OnayBekleyenler.tsx`
- `adminandemployeePanel/src/app/employee/pages/YayinAkisi.tsx`
- `adminandemployeePanel/src/app/employee/pages/DmYorumlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/TrendNotlari.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/SocialMediaSpecialistDashboard.tsx`
- `adminandemployeePanel/src/app/pages/Contents.tsx`
- `adminandemployeePanel/src/app/pages/Approvals.tsx`
- `adminandemployeePanel/src/app/pages/Reports.tsx`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/services/social-media-dashboard.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/features/auth/authNormalizers.ts`
- `clientPanel/src/app/features/tasks/*`
- `clientPanel/src/app/features/projectFiles/*`

## Repo Tespiti

- `PurchasedServiceKey.SOCIAL_MEDIA` ve `EmployeeClientAssignmentScope.SOCIAL_MEDIA` zaten mevcut.
- Admin client create/edit service catalog içinde `social-media -> SOCIAL_MEDIA` map’i mevcut.
- Client Portal service selection, selected-service restore logic ve sidebar içinde `social-media` aktif servis olarak mevcut.
- `Project.serviceKey` zaten `SOCIAL_MEDIA` projelerini taşıyabilecek durumda.
- Backend’de henüz `server/src/social-media/` modülü, `ClientSocialMediaConfig`, `SocialMediaPost`, `SocialMediaReport` veya social-media-specific permission set yok.
- Standalone `ClientApprovalRequest` modeli yok; onay altyapısı şu an `Task` ve `ProjectFile` üzerindeki `approvalRequired`, `approvalType`, `approvalStatus` alanlarıyla çalışıyor.
- `MetaAdsApprovalType` adı ads odaklı kalmış olsa da task/file approval altyapısı fiilen generic onay köprüsü olarak kullanılıyor. Social Media approval tipleri eklenirken bu enum geriye uyumlu genişletilmeli; enum rename Faz 1 kapsamı olmamalı.
- Generic `Report` modeli yok. Report lifecycle şu an Meta/TikTok/Amazon özel report entity’leri ve Web APP workspace weekly report modeliyle sınırlı. Social Media için rapor entity’si Faz 8’e bırakılmalı.
- `ProjectFile` modeli client-visible asset delivery için hazır. Social Media kreatiflerinde yeni dosya modeli açılmamalı; `ProjectFile.serviceKey=SOCIAL_MEDIA` ana filtre olmalı.
- Employee visibility genel `clients/projects/tasks` servislerinde aktif assignment’a bakıyor, assignment `scope` değerini her yerde service-specific filtre olarak kullanmıyor. Social Media modülü kendi endpointlerinde role + permission + active assignment kontrolünü net yapmalı.

## Mevcut Social Media Mock / Static Yüzeyleri

- Client Portal `social-media-dashboard.tsx`: KPI, pending content, published content, DM/yorum, rakip/trend, calendar ve agency note tamamen static array’lerden geliyor.
- Client Portal `service-pages.ts`: `social-media` profile ve sekmeleri static table/focus data ile tanımlı.
- Client Portal `service-tab-page.tsx`: Social Media sekmeleri Meta/TikTok/Amazon gibi API-specialized renderer kullanmıyor; generic static renderer’a düşüyor.
- Employee `IcerikTakvimi`, `Captionlar`, `YayinAkisi`, `DmYorumlar`, `TrendNotlari` ve `SocialMediaSpecialistDashboard` static local array’lerden çalışıyor.
- Employee `OnayBekleyenler` şu anda `MetaAdsWorkspace initialView="approvals"` döndürüyor; Social Media approval workspace gelince bu geçici bağlantı kaldırılmalı.
- Admin `Contents`, `Approvals`, `Reports` sayfaları Social Media dahil olmak üzere mock/static ağırlıklı.

## Ürün Kapsam Kararı

**Social Media V1 = organik içerik operasyon merkezi.**

V1 odağı:

- müşteri bazlı Social Media config
- organik içerik planı ve içerik takvimi
- caption/copy üretimi
- kreatif dosya bağlama
- müşteri onayı ve revizyon akışı
- yayın durumu takibi
- client-visible post/asset/report ayrımı
- manuel veya içe aktarılan performans snapshot’ı
- agency weekly note

V1 dışı:

- reklam kampanyası yönetimi
- bütçe/bid/ads mutation
- otomatik DM/yorum cevaplama
- tam otomatik çoklu platform publishing
- sosyal dinleme/sentiment engine
- competitor scraping
- platform API token onboarding zorunluluğu

Gerekçe:

- Social Media reklam kanalı değil, organik içerik üretim ve onay operasyonudur.
- Repo’da purchased service, project, task/todo, file, approval ve client-visible visibility altyapısı hazır.
- Platform publishing API’leri izin, app review, token ve rate-limit açısından değişken; Faz 1-3 API-first operasyon paneli platform entegrasyonundan bağımsız kalmalı.

## MEDIA_HUB İlişkisi

- `SOCIAL_MEDIA`, organik içerik operasyonunun sahibi olmalı.
- `MEDIA_HUB`, Meta/Google/TikTok/Amazon gibi paid media kanallarını ve gerektiğinde Social Media özetini agregasyon görünümü olarak göstermeli.
- Social Media post, caption, creative ve approval entity’leri `MEDIA_HUB` altında oluşturulmamalı.
- `MEDIA_HUB` Social Media verisini yalnızca summary/channel card olarak tüketmeli; source of truth `SOCIAL_MEDIA` modülü olmalı.

## V1 Backend Data Sources

| Kaynak | Kullanım | Faz |
|---|---|---|
| `ClientPurchasedService` | ACTIVE `SOCIAL_MEDIA` gate, client portal visibility, own scope | Faz 1 |
| `Project.serviceKey` | Social Media operasyon projesi, task/file/report bağlamı | Faz 1 |
| `Task` / `TaskTodo` | pre-post-domain iş listesi, approval task, revision task, checklist/progress | Faz 1 |
| `ProjectFile` | kreatif, brand asset, caption brief, client-visible file delivery | Faz 1 |
| `Task` approval fields | caption/post/calendar/report acknowledgement onayları için mevcut köprü | Faz 1-2 |
| `ProjectFile` approval fields | kreatif onayları için mevcut köprü | Faz 2-6 |
| `SocialMediaPost` | içerik takvimi ve post source of truth | Faz 2 |
| `SocialMediaPostAsset` | gerekiyorsa post-file join; dosya duplicate model değil | Faz 2 |
| `SocialMediaWeeklyNote` | ajans yorumu, sonraki odak, riskler | Faz 1 veya Faz 3 |
| `SocialMediaPostInsight` | reach/engagement/followers snapshot | Faz 8 |
| `SocialMediaReport` | draft/publish/acknowledgement rapor lifecycle | Faz 8 |

## Platform API Notları

Faz 1-3 platform API entegrasyonu gerektirmez. Yine de data contract, ilerideki official API entegrasyonlarına uyumlu kalmalı:

- Instagram/Facebook publishing için Meta’nın Instagram Platform Content Publishing ve Pages API dokümanları implementation anında tekrar doğrulanmalı. Bu entegrasyon `instagramAccountId`, `facebookPageId`, media container, publish status, `externalPostId`, `externalPostUrl`, permission/app-review durumlarını gerektirir.
- TikTok için [Content Posting API](https://developers.tiktok.com/products/content-posting-api) Direct Post ve Upload to TikTok akışlarını destekler; Direct Post tarafında creator consent, scope onayı ve audit/visibility kısıtları dikkate alınmalı.
- LinkedIn için [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03) organic organization/member post üretimini destekler; organization posting permissions ve version headers contract’a dahil edilmeli.
- Pinterest için [Pinterest API v5 Pins](https://developers.pinterest.com/docs/api/v5/pins-create/) ileride opsiyonel kanal olarak ele alınabilir.
- X/Twitter V1’de yalnızca manual tracking alanı olarak kalmalı; API entegrasyonu müşteri ihtiyacı ve erişim seviyesi netleşince ayrı discovery gerektirir.

## V1 Data Contract

### Shared enumlar

```ts
type SocialMediaPanelState =
  | "READY"
  | "NO_ACTIVE_SERVICE"
  | "WAITING_CONFIG"
  | "WAITING_PROJECT"
  | "WAITING_CONTENT_PLAN"
  | "NO_DATA";

type SocialMediaPlatform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "LINKEDIN"
  | "X"
  | "PINTEREST";

type SocialMediaPostType =
  | "FEED"
  | "STORY"
  | "REEL"
  | "CAROUSEL"
  | "SHORT_VIDEO"
  | "STATIC_IMAGE"
  | "TEXT";

type SocialMediaPostStatus =
  | "IDEA"
  | "DRAFT"
  | "DESIGN"
  | "WAITING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "REJECTED"
  | "REVISION_REQUIRED"
  | "CANCELLED";

type SocialMediaApprovalKind =
  | "POST"
  | "CAPTION"
  | "CREATIVE"
  | "CALENDAR"
  | "REPORT_ACKNOWLEDGEMENT";
```

### Summary response

```ts
type SocialMediaSummaryResponse = {
  state: SocialMediaPanelState;
  clientProfileId: string;
  projectId: string | null;
  config: SocialMediaConfigSummary | null;
  metrics: {
    plannedPosts: number;
    inDesignPosts: number;
    pendingApprovals: number;
    revisionRequiredPosts: number;
    scheduledPosts: number;
    publishedPosts: number;
    creativeAssets: number;
    clientVisibleAssets: number;
    reports: number;
  };
  upcomingPosts: SocialMediaPostSummary[];
  recentPosts: SocialMediaPostSummary[];
  topPosts: SocialMediaPostInsightSummary[];
  pendingApprovals: SocialMediaApprovalSummary[];
  creativeAssets: SocialMediaCreativeSummary[];
  agencyNote: SocialMediaWeeklyNote | null;
  dataFreshness: {
    source: "INTERNAL" | "MANUAL_IMPORT" | "PLATFORM_API";
    lastUpdatedAt: string;
    lastSyncedAt: string | null;
  };
};
```

### Config summary

```ts
type SocialMediaConfigSummary = {
  instagramUsername: string | null;
  instagramAccountId: string | null;
  facebookPageId: string | null;
  tiktokUsername: string | null;
  linkedinPageUrl: string | null;
  contentFrequency: string | null;
  primaryGoal:
    | "BRAND_AWARENESS"
    | "COMMUNITY_GROWTH"
    | "ENGAGEMENT"
    | "LEAD_GENERATION"
    | "SALES_SUPPORT"
    | "REPUTATION"
    | "MIXED"
    | null;
  toneOfVoice: string | null;
  hashtags: string[];
  connectionStatus: "NOT_CONNECTED" | "PENDING" | "CONNECTED" | "ERROR" | "DISCONNECTED";
};
```

### Post summary

```ts
type SocialMediaPostSummary = {
  id: string;
  clientProfileId: string;
  projectId: string | null;
  title: string;
  platform: SocialMediaPlatform;
  type: SocialMediaPostType;
  status: SocialMediaPostStatus;
  caption: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" | "ACKNOWLEDGED" | null;
  thumbnailUrl: string | null;
  externalPostId: string | null;
  externalPostUrl: string | null;
  clientVisible: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Creative summary

```ts
type SocialMediaCreativeSummary = {
  id: string;
  projectId: string;
  postId: string | null;
  title: string;
  fileUrl: string;
  mimeType: string;
  category: string;
  approvalStatus: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" | "ACKNOWLEDGED" | null;
  clientVisible: boolean;
  uploadedAt: string;
};
```

### Approval summary

```ts
type SocialMediaApprovalSummary = {
  id: string;
  source: "TASK" | "PROJECT_FILE" | "SOCIAL_MEDIA_POST" | "SOCIAL_MEDIA_REPORT";
  kind: SocialMediaApprovalKind;
  title: string;
  status: "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" | "ACKNOWLEDGED";
  requestedAt: string | null;
  respondedAt: string | null;
  responseNote: string | null;
  postId: string | null;
  projectFileId: string | null;
};
```

### Insight summary

```ts
type SocialMediaPostInsightSummary = {
  postId: string;
  platform: SocialMediaPlatform;
  title: string;
  thumbnailUrl: string | null;
  reach: number;
  impressions: number;
  engagements: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  periodStart: string;
  periodEnd: string;
};
```

### Weekly note

```ts
type SocialMediaWeeklyNote = {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: string;
  nextFocus: string | null;
  risks: string[];
  clientActionItems: string[];
  author: {
    id: string;
    displayName: string | null;
    role: string;
  };
  publishedAt: string | null;
};
```

## Backend Endpoint Contract

Faz 1 minimum:

```http
GET /api/v1/social-media/clients/:clientId/config
PATCH /api/v1/social-media/clients/:clientId/config
GET /api/v1/social-media/clients/:clientId/summary
GET /api/v1/clients/me/social-media/config
GET /api/v1/clients/me/social-media/summary
```

Faz 2+:

```http
GET /api/v1/social-media/clients/:clientId/posts
POST /api/v1/social-media/clients/:clientId/posts
GET /api/v1/social-media/posts/:id
PATCH /api/v1/social-media/posts/:id
DELETE /api/v1/social-media/posts/:id
POST /api/v1/social-media/posts/:id/assets
DELETE /api/v1/social-media/posts/:id/assets/:assetId
GET /api/v1/clients/me/social-media/posts
GET /api/v1/clients/me/social-media/calendar
```

Route convention kararı:

- New own-client routes should use `clients/me/social-media/*` to match existing `clients/me/meta-ads`, `clients/me/tiktok-ads`, and `clients/me/amazon-ads` patterns.
- Existing social-media docs that mention `/client/social-media/*` should be normalized during implementation.

## Role-Scope Matrisi

| Rol | Config | Summary | Posts/Calendar | Captions | Creatives | Approvals | Reports | Platform API |
|---|---|---|---|---|---|---|---|---|
| Admin | any read/write | any read | any CRUD | any CRUD | any manage | any manage | any manage | V2 admin-only |
| Project Manager | assigned read/write operational fields | assigned read | assigned CRUD | assigned review | assigned read | assigned manage | assigned manage | yok |
| Social Media Specialist | assigned read/update content fields | assigned read | assigned CRUD | assigned CRUD | assigned read/bind | assigned create/manage | assigned draft | V2 publish candidate |
| Designer | assigned read | assigned read | assigned read/status update | read | assigned upload/manage creative | creative approval create/update | read | yok |
| Performance Specialist | read only if assigned and explicit permission | assigned aggregate read | read | read | read | read | read | yok |
| Client | own readonly | own readonly | own `clientVisible=true` readonly | own visible captions | own visible assets | own respond | own published/read | yok |

Authorization rules:

- Admin endpoints require admin account/role + `socialMedia.*.any` permission.
- Employee endpoints require employee account + explicit socialMedia permission + active assignment.
- Social Media Specialist and Project Manager can manage post/caption/calendar in assigned scope.
- Designer can manage creative assets in assigned scope but should not own caption strategy by default.
- Client endpoints resolve `clientProfileId` from auth context and require ACTIVE `SOCIAL_MEDIA` purchased service.
- Out-of-scope employee/client detail reads should resolve as safe `404`.
- Frontend role-aware navigation is secondary; backend service-level checks are required.

## Permissions Contract

Faz 1:

```text
socialMedia.config.read.any
socialMedia.config.manage.any
socialMedia.config.read.assigned
socialMedia.summary.read.any
socialMedia.summary.read.assigned
socialMedia.summary.read.own
```

Faz 2+:

```text
socialMedia.posts.read.any
socialMedia.posts.manage.any
socialMedia.posts.read.assigned
socialMedia.posts.manage.assigned
socialMedia.posts.read.own
socialMedia.creatives.manage.assigned
socialMedia.approvals.create.assigned
socialMedia.reports.read.assigned
socialMedia.reports.manage.assigned
socialMedia.reports.read.own
```

Seed role mapping başlangıcı:

- `ADMIN`: all socialMedia permissions.
- `PROJECT_MANAGER`: assigned read/manage + reports.
- `SOCIAL_MEDIA_SPECIALIST`: assigned config/summary/posts/approvals/reports.
- `DESIGNER`: assigned summary/posts read + creatives manage + approval create.
- `CLIENT_OWNER` / `CLIENT_MEMBER`: own summary/posts/reports through own endpoints.

## Faz 1 Teknik Kararları

1. `SOCIAL_MEDIA` service key zaten mevcut; yeni service key eklenmeyecek.
2. `ClientSocialMediaConfig` tekil client config modeli olarak eklenecek.
3. Faz 1 summary mock dönmeyecek; active service/config/project/task/file kaynaklarından gerçek empty/summary state üretilecek.
4. Social Media summary, post domain gelene kadar `Project.serviceKey=SOCIAL_MEDIA`, `Task`, `TaskTodo`, `ProjectFile` ve approval alanlarından hesaplanacak.
5. `ProjectFile` reuse edilecek; kreatif dosya için duplicate asset model açılmayacak.
6. Faz 1’de `SocialMediaPost` eklenmeyecek; post/calendar domain Faz 2’de migration-first eklenecek.
7. Approval altyapısı mevcut `Task`/`ProjectFile` approval alanlarıyla başlayacak; Social Media-specific approval enum değerleri Faz 2/Faz 6’da eklenecek.
8. Generic report modeli olmadığı için Social Media report lifecycle Faz 8’de `SocialMediaReport` olarak ayrıca ele alınacak.
9. Own-client endpoint pattern’i `/clients/me/social-media/*` olacak.
10. Client Panel `social-media-dashboard` Faz 3’e kadar statik kalabilir; Faz 1 sadece config-aware empty/summary contract sağlar.
11. Employee `OnayBekleyenler` içindeki geçici Meta workspace bağlantısı Social Media workspace geldiğinde kaldırılacak.
12. Platform API token/publishing entegrasyonu Faz 7’ye kadar zorunlu değil; V1 manuel publish/status tracking desteklemeli.

## Faz 1'e Giriş Kriteri

- [x] Repo’da `SOCIAL_MEDIA` service key/scope varlığı doğrulandı.
- [x] Mock/static Social Media yüzeyleri tespit edildi.
- [x] Reuse edilecek backend kaynakları netleştirildi.
- [x] V1 summary/config/post/creative/approval/note contract tanımlandı.
- [x] Role-scope matrisi tanımlandı.
- [x] Faz 1 endpoint ve permission contract net.
- [x] Mevcut Vite + React Router 7 + NestJS/Prisma mimarisiyle çelişen karar yok.

## Faz 1 için implementation contract hazır mı?

**Evet, hazır.**
