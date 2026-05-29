# Architecture Decisions

## 2026-05-28 - Social Media Faz 0 Discovery Contract (Organic Content Operations)

Context:
Google, TikTok, Amazon ve Meta aşamaları tamamlandıktan sonra Social Media modülünün reklam kanalı gibi değil; organik içerik planlama, kreatif üretim, müşteri onayı, yayın takibi ve performans görünürlüğü merkezi olarak konumlandırılması gerekiyordu. Repo’da `SOCIAL_MEDIA` service key ve assignment scope zaten vardı ancak backend domain modülü, Social Media-specific post/config/report modelleri ve API-driven client/employee yüzeyleri henüz yoktu.

Decision:

- `SOCIAL_MEDIA` mevcut purchased service key olarak korunacak; yeni service key açılmayacak.
- `MEDIA_HUB`, Social Media source of truth olmayacak; yalnızca kanal/agregasyon görünümü olarak Social Media summary verisini tüketebilecek.
- Faz 1 scope’u config + gerçek kaynaklardan hesaplanan summary olacak; `SocialMediaPost` post/calendar domaini Faz 2’ye bırakılacak.
- Faz 1 summary mock dönmeyecek; `ClientPurchasedService`, `Project.serviceKey=SOCIAL_MEDIA`, `Task/TaskTodo`, `ProjectFile` ve mevcut approval alanlarından empty/summary state üretilecek.
- Social Media kreatiflerinde yeni dosya modeli açılmayacak; `ProjectFile.serviceKey=SOCIAL_MEDIA` ana dosya/asset filtresi olacak.
- Standalone `ClientApprovalRequest` modeli olmadığı için Social Media approval akışı mevcut task/file approval alanlarıyla başlayacak; Social Media-specific approval enum değerleri Faz 2/Faz 6’da geriye uyumlu şekilde eklenecek.
- Own-client endpoint pattern’i mevcut ads pattern’iyle uyumlu olarak `/clients/me/social-media/*` olacak.
- Platform publishing API’leri Faz 7’ye kadar zorunlu olmayacak; V1 manuel publish/status tracking ve ileride `externalPostId` / `externalPostUrl` alanlarıyla entegrasyon uyumu sağlayacak.

Reason:
Bu karar, mevcut NestJS/Prisma + Vite/React Router mimarisine en düşük riskli şekilde uyar. Social Media paneli önce ajans operasyonunun güvenilir source of truth’u olur; platform API izinleri, app review ve publishing kısıtları daha sonra ayrı fazda ele alınır.

Affected files:
- `docs/social-media-phases/00-social-media-discovery-contract.md`
- `ROAD_MAP.md`

---

## 2026-05-28 - Amazon Ads Faz 10 Production Hardening (Report Export + Client-Safe Authz/Error Surface)

Context:
Amazon Ads Faz 9 ile report lifecycle tamamlandı ancak production öncesi eksik kalan kritik alanlar vardı: admin/assigned/client için gerçek export dosya akışı, own-client görünürlük sertleştirmesi, assigned report permission hizası ve state/authz edge-case test kapsamı.

Decision:

- Backend Amazon Ads report export surface’i eklendi:
  - `GET /api/v1/admin/amazon-ads/reports/:reportId/export?format=json|csv`
  - `GET /api/v1/amazon-ads/reports/:reportId/export?format=json|csv`
  - `GET /api/v1/clients/me/amazon-ads/reports/:reportId/export?format=json|csv`
- Export query contract’ı için `AmazonAdsReportExportQueryDto` (`json|csv`) eklendi; export response’ları `Content-Disposition` + `Cache-Control: private, no-store` başlıklarıyla dosya indirme davranışına taşındı.
- Own-client report görünürlüğü sertleştirildi: own list/export akışında yalnızca `PUBLISHED + clientVisible=true` raporlar döner; out-of-scope veya gizli taslak raporlar client-safe `404` (`Amazon Ads raporu bulunamadı.`) ile kapanır.
- Assigned report endpointleri `reports.read` / `reports.manage` permission’larıyla route + service katmanında netleştirildi; employee role visibility/aksiyonları bu authz modeliyle eşlendi.
- Report create + optional acknowledgement task üretimi transaction içine alındı; acknowledgement create hatasında orphan draft kalmaması sağlandı.
- Admin global panel (`/amazon-ads`), employee workspace (`/employee/amazon-ads`) ve client service-tab Amazon report listelerine CSV/JSON export aksiyonları eklendi.
- Authz/state regression kapsamı genişletildi: archived report own görünürlüğü, scoped export success, own hidden/draft export denial, assigned export permission denial ve publish-state guard senaryoları e2e’ye alındı.

Reason:
Bu karar Faz 10’da hedeflenen production hardening’i minimum invaziv şekilde tamamlar: rapor paylaşımı API-scoped dosya export ile güvenli hale gelir, own-client görünürlüğü publish contract’ına kilitlenir, assigned operasyonlar explicit report permission gerektirir ve edge-case’ler testlerle korunur.

Affected files:
- `server/src/amazon-ads/dto/amazon-ads-report-export-query.dto.ts`
- `server/src/amazon-ads/amazon-ads.controller.ts`
- `server/src/amazon-ads/amazon-ads.service.ts`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/AmazonAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/AmazonAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/employee/components/AmazonAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/AmazonAdsWorkspace.test.tsx`
- `clientPanel/src/app/features/amazonAds/amazonAdsTypes.ts`
- `clientPanel/src/app/features/amazonAds/amazonAdsApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.amazon-ads.test.tsx`

---

## 2026-05-28 - Amazon Ads Faz 9 Reporting + Export Foundation (Report Entity + Publish/Ack Bridge)

Context:
Amazon Ads Faz 8 sonrası sync lifecycle üretim seviyesine taşındı ancak raporlar hâlâ snapshot görünümünden ayrı bir lifecycle entity’si olarak tutulmuyordu. Admin/assigned ekip için draft->publish akışı, client tarafı için yalnızca own-visible rapor görünürlüğü ve publish sonrası acknowledgement task köprüsü gerekiyordu.

Decision:

- Prisma’ya yeni `AmazonAdsReport` domain entity’si eklendi (`AmazonAdsReportType`, `AmazonAdsReportStatus`, acknowledgement alanları ve task bridge foreign key’i).
- Backend Amazon Ads API surface’i rapor lifecycle ile genişletildi:
  - Admin: `GET /api/v1/admin/clients/:clientId/amazon-ads/reports`, `POST /api/v1/admin/clients/:clientId/amazon-ads/reports`, `PATCH /api/v1/admin/amazon-ads/reports/:reportId`
  - Assigned: `GET /api/v1/amazon-ads/clients/:clientId/reports`, `POST /api/v1/amazon-ads/clients/:clientId/reports`, `PATCH /api/v1/amazon-ads/reports/:reportId`
  - Own client: `GET /api/v1/clients/me/amazon-ads/reports`
- Create/update report akışında publish state normalize edildi: `clientVisible` veya `requestAcknowledgement` aktif olduğunda rapor `PUBLISHED + clientVisible` modeline taşınır; `DRAFT/ARCHIVED` durumunda client görünürlüğü kapatılır.
- Publish->ack bridge için Amazon report bazlı task üretimi/update akışı eklendi (`MetaAdsApprovalType.AMAZON_ADS_REPORT_ACKNOWLEDGEMENT`), report/task ilişkisinde `acknowledgementTaskId` tutulur.
- Admin global panel (`/amazon-ads`) ve employee workspace (`/employee/amazon-ads`) report read-model ile genişletildi; draft oluşturma, publish etme, ack talebi oluşturma ve liste filtreleme aksiyonları permission-aware bağlandı.
- Client portal Amazon service-tab, mock rapor placeholder yerine own reports endpointinden sadece publish/client-visible raporları gösteren API-driven panel ile güncellendi.

Reason:
Bu karar, Amazon Ads raporlarını snapshot performans verisinden ayrıştırılmış bir deliverable domainine taşır ve ajans iş akışını kalıcı hale getirir. Admin/employee lifecycle operasyonu ve client görünürlüğü aynı authz/read-model çizgisinde birleşirken publish sonrası onay/ack süreci mevcut task approval altyapısıyla tekrar kullanılabilir olur.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260528152000_add_amazon_ads_reports/migration.sql`
- `server/src/amazon-ads/amazon-ads.controller.ts`
- `server/src/amazon-ads/amazon-ads.service.ts`
- `server/src/amazon-ads/dto/amazon-ads-reports-query.dto.ts`
- `server/src/amazon-ads/dto/create-amazon-ads-report.dto.ts`
- `server/src/amazon-ads/dto/update-amazon-ads-report.dto.ts`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/AmazonAdsAdmin.tsx`
- `adminandemployeePanel/src/app/employee/components/AmazonAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/AmazonAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/AmazonAdsWorkspace.test.tsx`
- `clientPanel/src/app/features/amazonAds/amazonAdsTypes.ts`
- `clientPanel/src/app/features/amazonAds/amazonAdsApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.amazon-ads.test.tsx`

---

## 2026-05-28 - Amazon Ads Faz 8 Sync Automation Hardening

Context:
Amazon Ads Faz 7 sonrası sync lifecycle fonksiyonel olsa da operasyonel gözlemlenebilirlik, tekrar-deneme kontrolü ve client-safe hata yüzeyi production standardı için yetersizdi. Admin ve assigned employee tarafında sync geçmişinin merkezi izlenmesi, retry aksiyonu ve TTL/cooldown normalizasyonu gerekiyordu.

Decision:

- Backend sync lifecycle’a trigger-aware loglama eklendi (`MANUAL_SYNC`, `ON_DEMAND_ASSIGNED_REFRESH`, `ERROR_RETRY`), `AmazonAdsSyncLog` kaydı üzerinden status/error/report-status observability standardize edildi.
- Assigned sync flow’u için TTL skip (`SYNC_TTL_ACTIVE`) ve failed-sync cooldown skip (`FAILED_SYNC_COOLDOWN_ACTIVE`) normalize edildi; skip durumları response contract’ına `skippedReason` olarak eklendi.
- Admin API surface’i genişletildi:
  - `GET /api/v1/admin/amazon-ads/sync-logs`
  - `POST /api/v1/admin/clients/:clientId/amazon-ads/sync/retry`
- Amazon API hata katalogu normalize edilerek connection config üzerinde admin-readable `syncError` standardına taşındı (`TOKEN_EXPIRED_OR_REVOKED`, `PERMISSION_DENIED`, `REPORT_NOT_READY`, `RATE_LIMIT`, vb.).
- Admin global panelde sync log tablosu, status sayaçları, report-status görünürlüğü ve failed-client retry aksiyonları eklendi.
- Client dashboard manual refresh tarafında kısa cooldown/rate-limit UX koruması eklendi; teknik hata detayları client response yüzeyinden saklı tutuldu.
- Faz 8 e2e senaryoları (sync logs, retry, TTL skip, normalized auth/profile/report errors, token-safe read models) test kapsamına alındı.

Reason:
Bu yaklaşım sync operasyonunu sadece “çalışıyor” seviyesinden “izlenebilir, tekrar denenebilir ve güvenli hata yüzeyine sahip” production-grade seviyeye taşır. Admin/employee aksiyonları aynı lifecycle modelini kullanırken client tarafında teknik detay sızıntısı engellenir.

Affected files:
- `server/src/amazon-ads/amazon-ads.service.ts`
- `server/src/amazon-ads/amazon-ads.controller.ts`
- `server/src/amazon-ads/dto/amazon-ads-sync-logs-query.dto.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/AmazonAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/AmazonAdsAdmin.test.tsx`
- `clientPanel/src/app/pages/services/amazon-ads-dashboard.tsx`
- `clientPanel/src/app/pages/__tests__/amazon-ads-dashboard.test.tsx`

---

## 2026-05-28 - Amazon Ads Faz 7 Approval + Creative Collaboration Contract Alignment

Context:
Amazon Ads Faz 6 sonrası approval lifecycle Amazon için kısmen çalışıyordu ancak backend enum sözleşmesi, approval permission eşlemesi, client ACK akışı ve admin/employee create payloadları tam hizalı değildi. Ayrıca Amazon creative/product collaboration akışının file-management permission katmanı backend/frontend arasında simetrik hale getirilmesi gerekiyordu.

Decision:

- Backend `MetaAdsApprovalType` enumu Amazon approval setiyle genişletildi: campaign, budget, report acknowledgement, strategy, creative, product promotion ve search-term action type’ları eklendi.
- Tasks service Amazon Ads approval create permission’ını (`amazonAds.approvals.create.assigned`) serviceKey eşlemesine dahil etti; client approval response scope’u da `AMAZON_ADS` projelerini kapsayacak şekilde genişletildi.
- Project files manage guard’ına Amazon Ads için `amazonAds.productCollaboration.manage.assigned` kontrolü eklendi; böylece creative/product asset management aksiyonları assigned scope’ta explicit permission gerektirir hale getirildi.
- Admin Amazon global panelde oluşturulan approval task payload’u Faz 7 contract’ıyla hizalandı (`approvalRequired`, `approvalStatus=PENDING`, `approvalType=AMAZON_ADS_STRATEGY_APPROVAL`).
- Employee Amazon workspace role-based approval type üretir hale geldi (social/campaign, performance/budget, designer/creative) ve task create payload’ı explicit `approvalType` alanı taşımaya başladı.
- Client panel approval contract’ı Amazon type setiyle güncellendi; report acknowledgement task’larında primary aksiyon `ACKNOWLEDGED` (`Okudum`) olarak işlendi.

Reason:
Bu yaklaşım Amazon approval lifecycle’ını Meta/TikTok pattern’iyle aynı teknik seviyeye getirir; API validation, permission guard, UI action semantics ve test kapsamı tek sözleşmede birleşir. Özellikle report acknowledgement ve creative/product collaboration adımları artık hem backend hem frontend’de aynı enum/permission modeline dayanır.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260528110000_add_amazon_ads_approval_types/migration.sql`
- `server/src/tasks/tasks.service.ts`
- `server/src/project-files/project-files.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/employee/components/AmazonAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/AmazonAdsWorkspace.test.tsx`
- `adminandemployeePanel/src/app/pages/AmazonAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/AmazonAdsAdmin.test.tsx`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/features/projectFiles/projectFilesTypes.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.amazon-ads.test.tsx`

---

## 2026-05-28 - Amazon Ads Faz 6 Employee Assigned-Scope Workspace (Social/Performance/Designer)

Context:
Amazon Ads Faz 5 ile admin global panel tamamlandıktan sonra employee panelde Social Media Specialist, Performance Specialist ve Designer rollerinin assigned Amazon Ads müşterileri üzerinde ortak bir çalışma alanına ihtiyacı vardı. Amaç, mock veriye dönmeden Faz 5/Faz 3 read-model endpointleriyle role-aware bir workspace sunmaktı.

Decision:

- Employee panelde yeni `/employee/amazon-ads` route’u eklendi ve Social/Performance/Designer sidebar menülerine `Amazon Ads Workspace` girişleri tanımlandı.
- Yeni generic component `AmazonAdsWorkspace` oluşturuldu; role bazlı görünüm/tabs:
  - Social: campaigns, search terms, reports, approvals
  - Performance: campaigns, products/ASIN, search terms, reports, approvals + recommendation action
  - Designer: creative/assets, approvals, reports
- Frontend data contract’ı genişletildi: assigned Amazon Ads `config/summary/campaigns/products/insights/sync` endpointleri için RTK Query hookları, query serializer’ları, tipler ve normalizer katmanı eklendi.
- Workspace aksiyonları permission-aware tasarlandı (`amazonAds.config.read.assigned`, `amazonAds.reporting.read.assigned`, `amazonAds.sync.read.assigned`, `amazonAds.notes.manage.assigned`, `amazonAds.approvals.create.assigned`, `amazonAds.recommendations.manage.assigned`).
- Seed permission kataloğuna `amazonAds.recommendations.manage.assigned` eklendi ve ilgili employee role mapping’leri güncellendi.
- Faz 6 için dedicated frontend test dosyası eklendi; assigned-scope filtreleme, role görünürlüğü, sync aksiyonu, permission disable ve empty-state senaryoları doğrulandı.

Reason:
Bu yaklaşım Meta/TikTok employee workspace pattern’iyle uyumlu, minimum invaziv ve Phase 5 read-model’i doğrudan kullanan bir Amazon çalışma yüzeyi sağlar. Böylece employee operasyonu admin/client panelden kopmadan aynı yetki sınırları içinde devam eder.

Affected files:
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/employee/components/AmazonAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/AmazonAdsCalismaAlani.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/AmazonAdsWorkspace.test.tsx`
- `server/prisma/seed.ts`

---

## 2026-05-28 - Amazon Ads Faz 5 Admin Global Panel ve Merkezi Yönetim

Context:
Amazon Ads Faz 4 sonrası client panel API-first hale geldi ancak admin tarafında tüm Amazon Ads müşterilerini tek ekranda yönetebilecek global bir panel yoktu. Bağlantı/test/sync/disconnect ve onay talebi gibi operasyonel aksiyonların merkezi hale getirilmesi gerekiyordu.

Decision:

- Backend’e `GET /api/v1/admin/amazon-ads/clients` endpointi eklendi; Amazon Ads hizmeti alan müşteriler için connection status, spend/sales/ACOS/ROAS summary, last sync, pending approvals, assigned employees ve action context tek response modelinde toplandı.
- Endpoint authorization’ı admin + `amazonAds.config.read.any` ile korundu; response token-safe tutuldu (credential secret alanları dışarı verilmedi).
- Admin panelde yeni `/amazon-ads` sayfası eklendi (`AmazonAdsAdmin`): global müşteri listesi, config edit modal, test connection, manual sync, disconnect ve onay talebi oluşturma aksiyonları permission-aware şekilde bağlandı.
- Router ve admin sidebar Amazon Ads global sayfayı içerecek şekilde güncellendi.
- Frontend contract’ı için `AdminAmazonAdsClientListResponse` tipi, normalizer ve RTK Query endpoint/hook eklendi; Amazon aksiyon mutasyonları global liste cache’ini invalidate edecek şekilde genişletildi.

Reason:
Bu yaklaşım Meta/TikTok admin yönetim pattern’iyle uyumlu bir Amazon Ads operasyon yüzeyi sağlar, günlük bağlantı/sync aksiyonlarını müşteri detay sayfasına bağımlı olmadan merkezileştirir ve Faz 6+ iş adımlarına (employee workspace, approval/export katmanları) daha temiz bir yönetim zemini bırakır.

Affected files:
- `server/src/amazon-ads/amazon-ads.controller.ts`
- `server/src/amazon-ads/amazon-ads.service.ts`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/AmazonAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/AmazonAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`

---

## 2026-05-27 - Amazon Ads Faz 4 Client Panel API-Driven Tab Workspace

Context:
Amazon Ads Faz 3 ile reporting snapshot/read model aktive olduktan sonra client portalın Amazon servis sekmeleri hâlâ sınırlı ve kısmen statik bir yapıdaydı. Faz 4 kapsamında mevcut dashboard tasarımını koruyarak sekme bazlı operasyon ekranlarının tek bir API read modelinden beslenmesi gerekiyordu.

Decision:

- `ServiceTabPage` içinde Meta/TikTok pattern’iyle uyumlu `AmazonAdsServiceTab` eklendi; bağlantı/empty/error/loading state’leri tek yerde yönetildi.
- Amazon service navigation ve service tab metadata yapısı Faz 4 kapsamına göre güncellendi: campaigns, sponsored product/brand/display, products/ASIN, keywords, targeting, search terms, reports-ready, agency notes, approvals.
- Amazon insights response’una search-term bağlam alanları (`campaign/adGroup/keyword/target/searchTerm`) eklendi; keywords/targeting/search-term sekmeleri ayrı endpoint gerektirmeden aynı read model satırlarından türetildi.
- Campaigns query contract’ına opsiyonel `adProduct` filtresi eklendi (backend DTO/service + frontend API serializer), böylece ürün tipine göre kampanya yüzeyi desteklendi.
- Client task approval tip normalizer’ı Amazon approval type değerlerini kabul edecek şekilde genişletildi; approvals tab mevcut client approval workflow paneli ile entegre edildi.

Reason:
Bu yaklaşım fazlar arası uyumu korur: yeni Amazon sekmeleri mock fallback olmadan tek read modelden çalışır, backend surface alanı minimum değişiklikle genişler ve ileride Faz 7/Faz 9 approval/report entity katmanlarına hazır bir tab omurgası sağlanır.

Affected files:
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/features/amazonAds/amazonAdsApi.ts`
- `clientPanel/src/app/features/amazonAds/amazonAdsTypes.ts`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/pages/__tests__/service-tab-page.amazon-ads.test.tsx`
- `server/src/amazon-ads/dto/amazon-ads-campaigns-query.dto.ts`
- `server/src/amazon-ads/amazon-ads.service.ts`

---

## 2026-05-27 - Amazon Ads Faz 3 Reporting v3 Snapshot Read Model

Context:
Amazon Ads bağlantı lifecycle’ı tamamlandıktan sonra client/admin dashboard’larının mock performans metriklerinden çıkıp Reporting v3 kaynaklı, token-safe ve permission-gated bir read model’den beslenmesi gerekiyordu. Amazon Ads reporting async create/poll/download akışı ve report type kolonları Meta/TikTok’tan farklı bir entegrasyon yüzeyi gerektiriyor.

Decision:

- Prisma’ya `AmazonAdsDailyInsight` ve `AmazonAdsSyncLog` eklendi; insight level, ad product ve sync status enumları snapshot/read model sözleşmesini netleştirir.
- `AmazonAdsApiService`, LwA refresh-token grant sonrası Reporting v3 report create/poll/download lifecycle’ını tek yerde yürütür ve campaign/product/search-term satırlarını normalize eder.
- Manual sync endpointleri snapshot satırlarını günlük olarak yazar, account-level aggregate üretir ve report request/status metadata’sını sync log içinde saklar.
- Summary/campaigns/products/insights endpointleri admin, assigned employee ve own client yüzeylerinde aynı snapshot read model’den döner; permission kontrolleri backend’de kalır.
- Admin ClientDetail’e Amazon Ads performance summary + manual sync aksiyonu, client dashboard’a API-driven summary/campaign/product/search-term render akışı eklendi.

Reason:
Bu yaklaşım Amazon Ads Reporting v3’ün async/rate-limit hassas doğasını UI’dan izole eder, encrypted refresh-token modelini bozmadan dashboardları deterministic snapshot verisine taşır ve Faz 4+ workspace/panel geliştirmeleri için ortak bir read model sağlar.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260527193000_add_amazon_ads_reporting_snapshot/migration.sql`
- `server/src/amazon-ads/*`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
- `clientPanel/src/app/features/amazonAds/*`
- `clientPanel/src/app/pages/services/amazon-ads-dashboard.tsx`

---

## 2026-05-27 - Amazon Ads Faz 2 LwA OAuth ve Token Connection Management

Context:
Amazon Ads Faz 1 config/credential temeli hazırlandıktan sonra adminlerin müşteri bağlantısını güvenli şekilde başlatması, refresh token saklaması, profile selection/test connection yapması ve bağlantıyı kesmesi gerekiyordu. Amazon Ads, Meta/TikTok’tan farklı olarak LwA refresh-token grant ve regional profile context gerektiriyor.

Decision:

- `AmazonAdsTokenService`, refresh/access token değerlerini `AMAZON_ADS_TOKEN_ENCRYPTION_KEY` ile AES-256-GCM şifreler; token hash SHA-256 olarak tutulur ve response yüzeyinde raw/encrypted token alanları gösterilmez.
- `AmazonAdsApiService`, LwA authorization URL/code exchange/refresh-token grant, regional `/v2/profiles` lookup, profile selection ve API hata normalizasyonu için tek entegrasyon yüzeyi oldu.
- Admin endpointleri OAuth URL başlatma, OAuth code exchange, manual refresh token connect, stored/transient refresh token ile test connection ve disconnect aksiyonlarını kapsayacak şekilde genişletildi.
- Test connection başarıyla döndüğünde selected profile metadata config’e yazılır ve connection `CONNECTED` olur; API/auth/permission/rate-limit hataları config üzerinde `ERROR` + normalized `syncError` olarak kalır.
- Admin ClientDetail Amazon Ads kartı OAuth/code/manual/test/disconnect aksiyonlarını destekler; client portal Amazon Ads dashboard connected durumda readonly connection status bilgisini gösterir.

Reason:
Bu karar Amazon Ads credential lifecycle’ını reporting fazlarından önce güvenli ve profile-aware hale getirir. Refresh token saklama encrypted-first kalır, admin UI write-only token alanları kullanır, client portal ise yalnızca safe connection metadata görür.

Affected files:
- `server/src/amazon-ads/*`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/amazon-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
- `clientPanel/src/app/pages/services/amazon-ads-dashboard.tsx`

---

## 2026-05-27 - Amazon Ads Faz 1 Backend Foundation

Context:
Amazon Ads Faz 0 contract ile V1 scope, official LwA OAuth/profile/account yaklaşımı ve `advertiserAccountId` isimlendirmesi sabitlendi. Uygulamaya geçiş için önce config/credential veri temeli, permission-gated endpointler ve mock-free UI durumları gerekiyordu.

Decision:

- Prisma’ya Amazon Ads config foundation eklendi: `AmazonAdsConnectionStatus`, `AmazonAdsRegion`, `ClientAmazonAdsConfig`, `ClientAmazonAdsCredential`.
- Faz 1 kapsamı bilinçli olarak config/credential temelinde tutuldu; reporting snapshot/report lifecycle tabloları Amazon Ads Faz 3/9’a bırakıldı.
- `server/src/amazon-ads/` modülü eklendi; admin read/update, assigned read ve own client safe config endpointleri permission + purchased-service kontrolüyle çalışır.
- Seed permission kataloğu `amazonAds.config.*`, reporting/sync/approval/note/product-collaboration slug’larıyla genişletildi; admin, assigned employee ve client own role mapping’leri eklendi.
- Admin Clients create/edit akışında `AMAZON_ADS` seçilince Amazon config alanları görünür ve config payload’ı ayrı endpointten kaydedilir.
- Admin ClientDetail’e Amazon Ads config/status kartı eklendi; client panel Amazon Ads dashboard artık bağlantı/config yokken mock metrik göstermeyip empty state döndürür.

Reason:
Bu yaklaşım, Amazon Ads OAuth/reporting gibi daha riskli işleri başlatmadan önce müşteri bazlı profile/account/marketplace sözleşmesini, erişim sınırlarını ve UI state davranışını üretim mimarisine yerleştirir. Meta/TikTok pattern’i korunur; Amazon’a özgü `profileId`, `advertiserAccountId`, `marketplaceId`, `region` ayrımı ilk fazdan itibaren net kalır.

Affected files:
- `server/prisma/schema.prisma`
- `server/src/amazon-ads/*`
- `server/prisma/seed.ts`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `clientPanel/src/app/features/amazonAds/*`
- `clientPanel/src/app/pages/services/amazon-ads-dashboard.tsx`
- `server/test/amazon-ads-authz.e2e-spec.ts`

---

## 2026-05-27 - Amazon Ads Faz 0: Discovery Contract ve Teknik Sözleşme

Context:
Meta Ads ve TikTok Ads entegrasyonları tamamlanmış durumda; Amazon Ads service key (`AMAZON_ADS`) Prisma `PurchasedServiceKey` enumunda ve frontend service catalog/client portal mock görünümünde zaten mevcut. Backend’de Amazon Ads modülü ve Amazon-specific Prisma modelleri henüz yok.

Decision:

- Amazon Ads V1 kapsamı read-only reporting + snapshot + report lifecycle olarak belirlendi; campaign create/update/pause, bid/budget/keyword mutation ve otomatik negative keyword yönetimi V1 dışında kalacak.
- Resmi Amazon Ads API akışı Login with Amazon OAuth 2.0 Authorization Code Grant üzerine kurulacak; manuel long-lived access token girişi tercih edilmeyecek.
- V1 auth stratejisi: admin-managed OAuth consent, server-side code exchange, encrypted access/refresh token storage, `/v2/profiles` ile profile/account selection.
- Resmi kaynaklara göre access token 60 dakika geçerli; 30 Haziran 2026 ve sonrasında verilen refresh token’lar consent tarihinden itibaren 365 gün geçerli olacak. Bu nedenle credential modelinde `accessTokenExpiresAt` ve nullable `refreshTokenExpiresAt` tutulacak.
- Region standardı `NA | EU | FE`; regional host map backend helper’da tutulacak:
  - NA: `https://advertising-api.amazon.com`
  - EU: `https://advertising-api-eu.amazon.com`
  - FE: `https://advertising-api-fe.amazon.com`
- Amazon profile/account config alanları official `/v2/profiles` response’una göre normalize edilecek: `profileId`, `advertiserAccountId` (`accountInfo.id` / reporting `Amazon-Ads-AccountId`), `marketplaceId` (`accountInfo.marketplaceStringId`), `countryCode`, `currencyCode`, `timezone`, `accountType`, `accountName`, `validPaymentMethod`.
- Eski taslaklardaki generic `advertiserId` yerine Amazon domaininde `advertiserAccountId` kullanılacak; DSP advertiser id ile karışması engellenecek.
- Reporting v3 V1 veri kaynağı olacak: `POST /reporting/reports`, status polling via `GET /reporting/reports/{reportId}`, `COMPLETED` olunca gzip JSON download ve snapshot upsert.
- V1 report type seti: `spCampaigns`, `sbCampaigns`, `sdCampaigns`, `spTargeting`, `sbTargeting`, `sdTargeting`, `spSearchTerm`, `sbSearchTerm`, `spAdvertisedProduct`, `sdAdvertisedProduct`, `spPurchasedProduct`, `sbPurchasedProduct`, `sdPurchasedProduct`, optional admin diagnostics için `sp/sb/sdGrossAndInvalids`.
- Sponsored Brands Reporting v3 official docs’ta preview olduğu için V1 sync partial/best-effort state desteklemeli.
- TACOS, Buy Box ve Retail Readiness official Amazon Ads Reporting v3’den güvenilir şekilde gelmediği için V1’de API-first empty/manual state olarak kalacak; SP-API veya manual retail data integration V2 konusu.

Reason:
Amazon Ads API, Meta/TikTok’tan farklı olarak profile/account/marketplace ve region context’iyle çalışıyor; reporting ise async report generation ve rate-limit hassasiyeti gerektiriyor. Bu karar Social Tech’in mevcut platform pattern’iyle uyumlu kalırken Amazon’a özgü `profileId`, `marketplaceId`, `advertiserAccountId`, attribution window ve async reporting gereksinimlerini Faz 1 öncesinde sabitler.

Affected files:
- `docs/amazon-ads-phases/00-amazon-ads-discovery-contract.md`
- `DECISIONS.md`
- `ROAD_MAP.md`

---

## 2026-05-27 - TikTok Ads Faz 0: Discovery Contract ve Teknik Sözleşme

Context:
Meta Ads Faz 0-10 tamamlandı. Sıradaki platform entegrasyonu TikTok Ads. `TIKTOK_ADS` purchased service key Prisma schema'da zaten mevcut. Müşteri portalında TikTok mock dashboard ve service-pages.ts içeriği hazır. Backend'de hiç TikTok kodu yok — sıfırdan başlanıyor.

Meta Ads'in 10 fazlık yapısı referans alınarak TikTok Ads için aynı katmanlı mimari uygulanacak.

Decision:

### V1 Kapsam Sınırı
- **V1: Read-only reporting.** Campaign management (create/edit/pause) V1 dışı.
- Manuel token girişi (admin sisteme `access_token` + `advertiser_id` girer). OAuth flow V2.
- Daily snapshot + manual sync. Scheduler cron: günlük 06:00.
- TikTok Marketing API versiyonu: `v1.3` (stable).
- Base URL: `https://business-api.tiktok.com/open_api/v1.3/`

### TikTok API vs Meta API Temel Farklar

| Konu | Meta Ads | TikTok Ads |
|------|----------|------------|
| Token ömrü | Kısa ömürlü, refresh gerekli | 365 gün (long-lived, V1'de refresh yok) |
| Token tipi | User access token + app token | App-based `access_token` |
| Report API | Graph API GET | `POST /report/integrated/get/` (JSON body) |
| Ad hiyerarşisi | Campaign > Ad Set > Ad | Campaign > Ad Group > Ad |
| Pixel | Meta Pixel (`pixel_id`) | TikTok Pixel (`pixel_id`) |
| Advertiser ID | `adAccountId` (act_xxx) | `advertiser_id` (sayısal string) |

### Prisma Veri Modeli — V1 Tasarımı

5 yeni model (Meta Ads pattern'inden türetildi, TikTok'a özgü alanlar eklendi):

**`ClientTiktokAdsConfig`**
- `clientProfileId` (unique FK)
- `advertiserId` (TikTok advertiser_id string)
- `businessCenterId` (optional)
- `pixelId` (optional)
- `currency`, `timezone` (optional)
- `connectionStatus` (enum: NOT_CONNECTED | PENDING | CONNECTED | ERROR | DISCONNECTED)
- `lastSyncAt`, `syncError`

**`ClientTiktokAdsCredential`**
- `clientProfileId` (unique FK)
- `accessTokenEnc` (AES-256-GCM encrypted)
- `tokenHash` (SHA256, validation için)
- `tokenExpiresAt` (365 gün, nullable)

**`TiktokAdsDailyInsight`**
- `clientProfileId`, `advertiserId`, `date`, `level` (ACCOUNT/CAMPAIGN/ADGROUP/AD)
- `entityId`, `entityName`
- Temel metrikler: `spend`, `impressions`, `reach`, `clicks`, `ctr`, `cpc`, `cpm`
- Video metrikler: `videoViews`, `videoViews2s`, `videoViews6s`, `videoCompletionRate`, `vtr`
- Conversion: `conversions`, `costPerConversion`, `conversionRate`, `purchaseValue`
- `raw` (JSON)

**`TiktokAdsSyncLog`**
- `clientProfileId`, `advertiserId`, `status` (RUNNING/SUCCESS/FAILED/PARTIAL/SKIPPED)
- `startedAt`, `finishedAt`, `errorCode`, `errorMessage`
- `recordsFetched`, `apiCallCount`
- `trigger` (MANUAL_SYNC | SCHEDULER | ERROR_RETRY | ON_DEMAND_CLIENT)

**`TiktokAdsReport`**
- `clientProfileId`, `projectId` (optional)
- `periodStart`, `periodEnd`, `type`, `status`
- `summary`, `metricsSnapshot` (JSON)
- `clientVisible`, `publishedAt`
- `acknowledgementTaskId` (Task FK, optional)

### V1 Endpoint Yüzeyi

**Admin endpoints (`/api/v1/admin/*`):**
- `GET /admin/tiktok-ads/clients` — global client list (connection status + spend summary + pending approvals)
- `GET /admin/clients/:clientId/tiktok-ads/config`
- `POST /admin/clients/:clientId/tiktok-ads/connect` — manual token input
- `POST /admin/clients/:clientId/tiktok-ads/test` — connection test
- `POST /admin/clients/:clientId/tiktok-ads/sync` — manual sync
- `POST /admin/clients/:clientId/tiktok-ads/sync/retry`
- `DELETE /admin/clients/:clientId/tiktok-ads/disconnect`
- `GET /admin/tiktok-ads/sync-logs`
- `GET /admin/clients/:clientId/tiktok-ads/summary`
- `GET /admin/clients/:clientId/tiktok-ads/campaigns`
- `GET /admin/clients/:clientId/tiktok-ads/adgroups`
- `GET /admin/clients/:clientId/tiktok-ads/ads`
- `GET /admin/clients/:clientId/tiktok-ads/insights`
- `GET /admin/clients/:clientId/tiktok-ads/pixel-status`
- `GET/POST /admin/clients/:clientId/tiktok-ads/reports`
- `PATCH /admin/tiktok-ads/reports/:reportId`

**Assigned Employee endpoints (`/api/v1/tiktok-ads/*`):**
- `GET /tiktok-ads/clients/:clientId/config`
- `GET /tiktok-ads/clients/:clientId/summary`
- `GET /tiktok-ads/clients/:clientId/campaigns`
- `GET /tiktok-ads/clients/:clientId/adgroups`
- `GET /tiktok-ads/clients/:clientId/pixel-status`
- `GET/POST /tiktok-ads/clients/:clientId/reports`
- `PATCH /tiktok-ads/reports/:reportId`

**Own Client endpoints (`/api/v1/clients/me/*`):**
- `GET /clients/me/tiktok-ads/summary`
- `GET /clients/me/tiktok-ads/campaigns`
- `GET /clients/me/tiktok-ads/reports`
- `POST /clients/me/tiktok-ads/sync` (TTL-gated)

### Permission Kataloğu — Yeni İzinler

- `tiktokAds.config.read.any` / `tiktokAds.config.manage.any` (admin)
- `tiktokAds.config.read.assigned` / `tiktokAds.reporting.read.assigned` (employee)
- `tiktokAds.reporting.read.own` (client)
- `tiktokAds.notes.manage.assigned`
- `tiktokAds.approvals.create.assigned`
- `tiktokAds.creatives.manage.assigned`

### Role-Scope Matrisi

| Aktör | Erişim Kapsamı | Ana İzinler |
|-------|----------------|-------------|
| Admin | Tüm müşterilerin TikTok Ads verisi | `config.manage.any`, `reporting.read.any` |
| Performance Specialist | Atanan müşteriler (tam metrik) | `config.read.assigned`, `reporting.read.assigned`, `pixel` |
| Social Media Specialist | Atanan müşteriler (kreatif/içerik odaklı) | `config.read.assigned`, `reporting.read.assigned` |
| Designer | Atanan müşteriler (kreatif asset) | `creatives.manage.assigned` |
| Client | Kendi hesabı, yalnızca published raporlar | `reporting.read.own` |

### Ortam Değişkenleri

```
TIKTOK_ADS_APP_ID=
TIKTOK_ADS_APP_SECRET=
TIKTOK_ADS_TOKEN_ENCRYPTION_KEY=  # AES-256-GCM, min 32 char
TIKTOK_ADS_API_VERSION=v1.3
TIKTOK_ADS_SYNC_TTL_MINUTES=30
```

### Client Portal Mock → API Eşleme

| Mock Alan | TikTok API Karşılığı | API Endpoint |
|-----------|---------------------|--------------|
| Video İzlenme | `video_play_actions` | insights |
| VTR | `video_play_rate` | insights |
| CPA | `cost_per_conversion` | insights |
| Aktif Hook | ad-level metrik (özel hesaplama) | ad insights |
| Kampanya listesi | `GET /campaign/get/` | campaigns |
| Hook performans | ad-level first-3s retention | custom metric V1'de hesaplanmaz, mock |
| Video kreatif grid | `GET /ad/get/` + creative materials | ads |
| Pixel durumu | `GET /pixel/list/` | pixel-status |
| Kitle notları | `GET /dmp/custom_audience/list/` | audiences (V2) |

### Employee Workspace Tasarımı

`TiktokAdsWorkspace` bileşeni `MetaAdsWorkspace` pattern'inden türetilecek:
- Tab views: overview, campaigns, performance, video-creatives, reports, approvals, pixel
- Role-based: Performance Specialist (tam erişim), Social (kreatif/içerik), Designer (kreatif)
- Admin: `/tiktok-ads` global yönetim ekranı

### Faz 0 → Faz 1 Köprüsü

Faz 1'de yapılacaklar (Implementation contract hazır):
1. Prisma schema — 5 yeni model + `TiktokAdsInsightLevel` enum + yeni enums
2. Migration dosyaları
3. `server/src/tiktok-ads/` modülü (service/controller/dto/api-client/token-service/scheduler)
4. `server/src/config/env.validation.ts` güncelleme
5. `server/.env.example` güncelleme
6. Seed: `TIKTOK_ADS` permission kataloğu + role-permission mapping
7. `adminandemployeePanel/src/app/features/tiktokAds/` — RTK Query feature
8. E2E test foundation: `server/test/tiktok-ads-authz.e2e-spec.ts`

Reason:
Meta Ads'in kanıtlanmış 10 fazlık delivery yapısı TikTok Ads için doğrudan referans. Contract Meta Ads ile yapısal paralellik kurarak Faz 1-10 boyunca tutarlı bir mimari sağlar. Mevcut codebase'de `TIKTOK_ADS` purchased service key zaten var; yeni Prisma model isimlendirmesi Meta Ads ile simetrik tutuldu.

Affected files:
- `DECISIONS.md`
- `ROAD_MAP.md`

---

## 2026-04-28 - Initial Repository Analysis and Context Bootstrap

Context:
PROJECT_CONTEXT.md and REPO_MAP.md were stubs with placeholder text. The repository had not been analyzed yet.

Decision:
Performed full initial analysis of the repository structure, routes, RBAC, layout architecture, tech stack, and data model. Populated all shared memory files with accurate information derived from actual source files.

Reason:
Enables Claude Code and Codex to work from shared memory rather than re-scanning the repository on each task. Reduces token usage and prevents divergent assumptions.

Affected files:
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 1 Backend Foundation

Context:
Social Media Faz 0 discovery contract organik içerik operasyonu kapsamını, mevcut `SOCIAL_MEDIA` purchased service/assignment foundation'ını ve Faz 1 config + summary sınırını sabitledi. Sıradaki ihtiyaç, müşteri bazlı config modelini, permission-gated endpointleri ve Admin Clients create/edit entegrasyonunu gerçek API contract'ına taşımaktı.

Decision:
Social Media Faz 1 şu şekilde uygulanacak:
- Prisma'ya `ClientSocialMediaConfig`, `SocialMediaGoal` ve `SocialMediaConnectionStatus` eklendi; config `ClientProfile` ile one-to-one tutulur.
- Backend `server/src/social-media/` modülü eklendi. Admin/assigned read endpointleri `/social-media/clients/:clientId/*`, own-client endpointleri mevcut pattern'e uygun `/clients/me/social-media/*` üzerinden çalışır; `/client/social-media/*` alias'ları geçiş uyumluluğu için korunur.
- Config update yalnızca `socialMedia.config.manage.any` ile admin kapsamındadır; assigned Project Manager/Social Media Specialist/Designer rolleri config ve summary read-only görür.
- Summary V1 mock veri üretmez; `ClientPurchasedService`, `ClientSocialMediaConfig`, `Project`, `Task`, `TaskTodo` ve `ProjectFile` kaynaklarından state/metrics/asset read model'i döner. `SocialMediaPost` ve insight/report domainleri Faz 2+ kapsamına bırakıldı.
- Admin Clients create/edit formunda `SOCIAL_MEDIA` seçilince organik kanal/strateji config alanları açılır ve create/update sonrası Social Media config endpointine kaydedilir.

Reason:
Bu karar Social Media'yı ads/reporting pattern'lerini kopyalamadan organik içerik operasyonu olarak konumlandırır. Faz 1'de config + summary read model'iyle gerçek API temeli kurulur; içerik takvimi/post domaini daha sonra ayrı entity olarak eklenebilecek şekilde schema ve endpoint yüzeyi temiz tutulur.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260528183000_add_social_media_config/migration.sql`
- `server/prisma/seed.ts`
- `server/src/app.module.ts`
- `server/src/social-media/*`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 2 Content Calendar Backend Foundation

Context:
Faz 1 ile Social Media config ve gerçek kaynaklardan summary zemini kuruldu. Faz 2 öncesinde e2e’nin güvenli test DB’de doğrulanması ve organik içerik takviminin kalıcı post modeliyle başlatılması gerekiyordu.

Decision:
Social Media Faz 2 backend foundation şu şekilde uygulanacak:
- Prisma’ya `SocialMediaPost`, `SocialMediaPostAsset`, `SocialMediaPlatform`, `SocialMediaPostType` ve `SocialMediaPostStatus` eklendi.
- Kreatif/asset ilişkisi yeni bir dosya modeli açmadan mevcut `ProjectFile` üzerinden `SocialMediaPostAsset` join modeliyle tutulur.
- Backend Social Media API yüzeyi post CRUD, status transition validation, client-visible own read ve own calendar endpointleriyle genişletildi.
- Assigned operasyon modeli permission-gated tutuldu: PM/Social Media Specialist assigned post manage, Designer assigned asset manage, client owner/member sadece `clientVisible=true` own post read.
- Summary read model Faz 2 itibarıyla `SocialMediaPost` kaynaklı planned/published/design/pending/rejected metrics ile upcoming/recent content plan listelerini de üretir.
- E2E suite `socialtech_server_test` güvenli test DB akışında migration reset + seed ile çalıştırıldı; post CRUD, invalid transition, client visibility ve designer asset bağlama senaryoları kapsandı.

Reason:
Bu karar organik içerik operasyonunu mock/task placeholder seviyesinden kalıcı content calendar domainine taşır. Asset tarafında `ProjectFile` reuse edilerek model çoğalması engellenir; client-visible flag ve servis katmanı authz kontrolleriyle admin/assigned/client yüzeyleri birbirinden güvenli şekilde ayrılır.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260528193000_add_social_media_posts/migration.sql`
- `server/prisma/seed.ts`
- `server/src/social-media/*`
- `server/test/social-media-authz.e2e-spec.ts`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 2 UI/API Consumption Layer

Context:
Faz 2 backend post/calendar modeli ve güvenli test DB e2e doğrulaması tamamlandıktan sonra admin/employee operasyon ekranlarının ve client portal görünürlüğünün mock/static içerikten çıkarılıp aynı API contract'ına bağlanması gerekiyordu.

Decision:
- Admin/employee tarafında yeni `features/socialMedia/*` RTK Query slice’ı eklendi; post list/create/update/delete ve asset binding endpointleri `SocialMediaPosts` cache tag’iyle ayrıştırıldı.
- Admin `/social-media` ve employee `/employee/icerik-takvimi` aynı `SocialMediaContentCalendar` bileşenini kullanacak. Bileşen aktif `SOCIAL_MEDIA` hizmetli müşterileri listeler, social-media projelerini form seçeneği yapar, post liste/form akışını permission-aware çalıştırır.
- Client Portal tarafında ayrı `features/socialMedia/*` own-client slice’ı eklendi; `social-media-dashboard` ve Social Media `content-calendar`, `pending-approvals`, `published-content` tabları yalnızca `clientVisible=true` own posts/calendar endpointlerinden beslenir.
- Client tarafında approval/publish aksiyonları Faz 2’de sahte buton olarak gösterilmez; görünür takvim/read model tamamlandıktan sonra action endpointleri sonraki approval fazına bırakılır.

Reason:
Bu yaklaşım backend Faz 2 sözleşmesini bozmadan UI tüketimini iki panelde de tek kaynağa bağlar. Admin/employee operasyonu manage endpointlerini kullanırken client portal sadece own-visible read yüzeyiyle sınırlı kalır; böylece Faz 2 güvenlik modeli frontend davranışında da korunur.

Affected files:
- `adminandemployeePanel/src/app/features/socialMedia/*`
- `adminandemployeePanel/src/app/employee/components/SocialMediaContentCalendar.tsx`
- `adminandemployeePanel/src/app/pages/SocialMediaAdmin.tsx`
- `adminandemployeePanel/src/app/employee/pages/IcerikTakvimi.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `clientPanel/src/app/features/socialMedia/*`
- `clientPanel/src/app/pages/services/social-media-dashboard.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 3 Client Panel API-Driven Dashboard

Context:
Faz 2 ile client portal görünür takvim/post yüzeyi API’ye bağlanmıştı; Faz 3 için dashboard’un summary/config kaynaklarını da tüketmesi, generic Social Media tablarının static/mock renderer’a düşmemesi ve own-client summary’nin internal post/asset bilgisi sızdırmaması gerekiyordu.

Decision:
- Own-client Social Media summary, `clientVisible=true` postlar ve `ProjectFile.visibility=CLIENT_VISIBLE` assetler ile sınırlandı; admin/assigned summary tam operasyon görünürlüğünü korur.
- Client Portal `features/socialMedia/*` slice’ı own config + summary hooklarıyla genişletildi ve `SocialMediaConfig` / `SocialMediaSummary` normalizer contract’ı eklendi.
- `social-media-dashboard`, KPI/strateji/ajans notu/kreatif/takvim alanlarını `summary`, `config` ve `calendar` endpointlerinden render eder; DM/trend/competitor static fallback blokları kaldırıldı.
- `ServiceTabPage`, Social Media tablarında generic static service-page renderer yerine Social Media API workspace’i kullanır. `content-calendar`, `pending-approvals`, `published-content`, `creatives`, `agency-notes` ve mevcut legacy social tabs mock veri göstermeden API/empty-state yüzeyine taşındı.
- Pending approvals tabı mevcut client task approval sistemine bağlandı; Social Media project-service task onayları approve/revision aksiyonlarıyla çalışır.
- Reports/performance gibi kalıcı domaini Faz 8’e bırakılan sekmeler mock göstermeden explicit API-source-pending state döner.

Reason:
Bu yaklaşım Faz 3’ü client güvenliği ve API-first davranış üzerinden tamamlar. Yeni report/insight modeli açmadan mevcut Faz 1-2 kaynaklarını kullanır, client-visible sözleşmesini backend ve frontend’de aynı hizaya getirir ve ileride Faz 6/Faz 8 approval/report katmanlarına temiz bir yüzey bırakır.

Affected files:
- `server/src/social-media/social-media-summary.service.ts`
- `server/src/social-media/social-media.service.ts`
- `server/test/social-media-authz.e2e-spec.ts`
- `clientPanel/src/app/features/socialMedia/*`
- `clientPanel/src/app/services/baseApi.ts`
- `clientPanel/src/app/pages/services/social-media-dashboard.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/social-media-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.social-media.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 4 Admin Panel

Context:
Faz 2 ile admin/employee content calendar, Faz 3 ile client portal dashboard API-driven hale geldi. Admin tarafında ise tüm Social Media müşterilerini tek global operasyon ekranında risk, onay, kreatif, takvim ve atama durumlarıyla görebilecek bir overview eksikti.

Decision:
- Yeni backend global endpoint `GET /api/v1/social-media/clients` eklendi; yalnızca admin hesap + `socialMedia.summary.read.any` ile erişilebilir.
- Global overview yeni model açmadan mevcut `SocialMediaSummaryService`, `SocialMediaPost`, `ProjectFile`, `EmployeeClientAssignment` ve `ClientPurchasedService` kaynaklarından üretilir.
- Response planned/published/pending/rejected counts, overdue scheduled posts, creative assets, Social Media specialist/Designer assignment visibility, last activity ve risk status içerir.
- Admin `/social-media` sayfası global KPI + müşteri risk listesi + selected-client detay paneli + config edit modal + mevcut content calendar create/list bileşimini kullanır.
- `ClientDetail` içinde Social Media section eklendi; config, post counts, pending approvals, creative assets, assignments, recent/upcoming posts ve report no-source state render edilir.
- Social Media report domaini Faz 8’e bırakıldığı için Faz 4’te `lastReport`/report publish mocklanmaz; açık “rapor modeli sonraki faz” state’i gösterilir.

Reason:
Bu karar Faz 4’ü mevcut organik içerik source-of-truth’ı üstünde tamamlar; Ads panellerindeki global overview ergonomisini Social Media’ya taşırken yeni rapor/approval entity’lerini erken açmaz. Backend admin guard’ı, frontend permission-disabled states ve e2e leak guard birlikte global admin görünümünün client/assigned yüzeylerinden ayrılmasını sağlar.

Affected files:
- `server/src/social-media/admin-social-media.controller.ts`
- `server/src/social-media/social-media.service.ts`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/socialMedia/*`
- `adminandemployeePanel/src/app/pages/SocialMediaAdmin.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/SocialMediaAdmin.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-27 - TikTok Ads Faz 10 Production Hardening

Context:
TikTok Ads Faz 9 ile report lifecycle tamamlandı ancak gerçek dosya üretimi, client-safe error yüzeyinin export/sync edge-case'lerine yayılması ve report authz/state coverage sertleştirmesi Faz 10'a bırakılmıştı.

Decision:
TikTok Ads Faz 10 production hardening aşağıdaki sınırlı kapsamla tamamlandı:
- Admin, assigned employee ve own-client rapor export endpointleri eklendi: `GET /api/v1/admin/tiktok-ads/reports/:reportId/export`, `GET /api/v1/tiktok-ads/reports/:reportId/export`, `GET /api/v1/clients/me/tiktok-ads/reports/:reportId/export`.
- Export formatı V1 için `json|csv` ile sınırlandı; dosya içeriği server tarafında üretildi ve `Content-Disposition` + no-store header'larıyla döndürülür.
- Own-client rapor görünürlüğü ve export scope'u yalnızca `PUBLISHED + clientVisible` raporlarla sınırlandı; draft/hidden/archived raporlar client tarafına not-found olarak döner.
- Assigned report read/create/update/export endpointleri backend `reports.read` / `reports.manage` guard'ları ile frontend permission modeline hizalandı.
- Client-safe sync error yüzeyi e2e ile sabitlendi; client response'ları advertiser/token/scope gibi internal detayları döndürmez.
- Admin, employee ve client panellerine CSV/JSON indirme aksiyonları eklendi; RTK Query export mutation'ları text body alıp tarayıcıda Blob download üretir.

Reason:
Bu karar export üretimini frontend string birleştirme veya açık URL download yerine server-scoped ve permission-aware endpointlerde tutar. Client yüzeyi publish state'ine göre daraltılırken admin/assigned operasyonlar tam dosya erişimini korur. Faz 10, yeni domain modeli açmadan mevcut `TikTokAdsReport` contract'ını production kullanımına hazır hale getirir.

Affected files:
- `server/src/tiktok-ads/dto/tiktok-ads-report-export-query.dto.ts`
- `server/src/tiktok-ads/tiktok-ads.controller.ts`
- `server/src/tiktok-ads/tiktok-ads.service.ts`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `adminandemployeePanel/src/app/pages/TikTokAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TikTokAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TikTokAdsWorkspace.test.tsx`
- `clientPanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `clientPanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.tiktok-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

---

## 2026-05-10 - Meta Ads Faz 9 Reporting + Export Foundation (Report Entity + Publish/Ack Bridge)

Context:
Faz 8 sonrası Meta Ads tarafında sync gözlemlenebilir hale geldi ancak rapor üretimi hâlâ insight tabanlı anlık görünüm seviyesindeydi. Ajans tarafında draft/publish lifecycle’ı, client-visible rapor ayrımı ve publish sonrası onay/acknowledgement köprüsü için kalıcı bir report domain eksikti.

Decision:
Faz 9 için dedicated `MetaAdsReport` entity’si eklendi ve rapor lifecycle backend-first olarak standartlaştırıldı:

- Prisma’da:
  - `MetaAdsReport` modeli
  - `MetaAdsReportType` enumu
  - `MetaAdsReportStatus` enumu
  - report -> task acknowledgement relation eklendi
- Endpoint yüzeyi:
  - Admin:
    - `GET /api/v1/admin/clients/:clientId/meta-ads/reports`
    - `POST /api/v1/admin/clients/:clientId/meta-ads/reports`
    - `PATCH /api/v1/admin/meta-ads/reports/:reportId`
  - Assigned employee:
    - `GET /api/v1/meta-ads/clients/:clientId/reports`
    - `POST /api/v1/meta-ads/clients/:clientId/reports`
    - `PATCH /api/v1/meta-ads/reports/:reportId`
  - Own client:
    - `GET /api/v1/clients/me/meta-ads/reports`
- Publish + acknowledgement request köprüsü:
  - report publish sırasında `Task(approvalType=META_ADS_REPORT_ACKNOWLEDGEMENT, approvalStatus=PENDING)` oluşturulabilir/güncellenebilir
  - report response’unda acknowledgement state normalize edilerek döner (`NOT_REQUESTED`, `PENDING`, `ACKNOWLEDGED`, `CHANGES_REQUESTED`)
- Client panel `meta-reports` sekmesi artık raw insight listesi yerine report entity listesi render eder.

Reason:
Bu karar, raporları sync snapshot’ından ayrı bir domain varlığına taşıyarak ajans deliverable akışını kalıcı hale getirir. Draft/publish/client-visible sınırları netleşir, onay süreci mevcut task approval altyapısıyla yeniden kullanılabilir ve Faz 10 production hardening/export adımları için stabil contract sağlar.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260510013000_add_meta_ads_reports/migration.sql`
- `server/src/meta-ads/dto/create-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/update-meta-ads-report.dto.ts`
- `server/src/meta-ads/dto/meta-ads-reports-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

---

## 2026-05-10 - Meta Ads Faz 10 Production Hardening (Client-Safe Errors + Coverage + Safe Code-Splitting)

Context:
Faz 9 sonrası rapor domain’i ve publish/ack lifecycle çalışır durumdaydı ancak production öncesi hardening için üç kritik alan netleştirilmeliydi: client-facing hata güvenliği, authz/state kapsaması ve bundle davranışı.

Decision:
Faz 10 kapsamında aşağıdaki üretim sertleştirmeleri uygulandı:

- Backend:
  - Own-client on-demand sync hata mesajları client-safe seviyeye düşürüldü.
  - Admin/assigned kullanıcılar için operasyonel hata detayları korunurken client endpointlerde generic güvenli mesaj standardı uygulandı.
  - `meta-ads-authz` e2e kapsamı genişletildi:
    - sync logs limit/pagination davranışı
    - reporting date-range validation (90 gün sınırı)
    - own-client sync error sanitization
- Frontend:
  - Client portal `App.tsx` içinde service/dashboard/tab sayfaları lazy import edildi ve runtime fallback eklendi.
  - Vite `manualChunks` ayarıyla vendor parçalama iyileştirildi.
  - Employee Meta Ads workspace testlerine role-specific tab visibility doğrulaması eklendi (social vs performance).

Reason:
Bu karar, client-facing güvenlik riskini (detaylı hata sızıntısı) azaltır, role/scope davranışını testle güçlendirir ve Meta Ads ağırlıklı ekranlarda ilk yük maliyetini düşürerek production stabilitesini artırır. Değişiklikler framework migration içermeden mevcut Vite + React mimarisiyle uyumludur.

Affected files:
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/App.tsx`
- `clientPanel/vite.config.ts`
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`

---

## 2026-04-28 - Shared Project Memory for Claude Code and Codex

Context:
The project may be worked on by both Claude Code and Codex depending on tool availability and limits. Both tools need a shared source of truth to avoid repeated full-repository scans and inconsistent assumptions.

Decision:
Use shared project memory files:
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `DECISIONS.md`
- `ROAD_MAP.md`

Reason:
This keeps Claude Code and Codex aligned, reduces token usage, prevents duplicate analysis, and creates a stable handoff point between tools.

Affected files:
- `CLAUDE.md`
- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `DECISIONS.md`
- `ROAD_MAP.md`
- `.claude/agents/social-tech-context-manager.md`
- `.codex/agents/context-manager.toml`

---

## 2026-04-28 - Demo RBAC (No Real Auth)

Context:
The Employee Panel has a role-selection login screen but no real authentication — no passwords, JWT, sessions, or backend.

Decision:
Role is stored in React Context (in-memory, lost on refresh). RoleAccessLogin is a UI demo only. EmployeeLayout guards the /employee routes by checking context, redirecting to /employee/login if role is null.

Reason:
App is in early/prototype stage. Auth infrastructure has not been built yet.

Affected files:
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- `adminandemployeePanel/src/app/employee/RoleAccessLogin.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`

---

## 2026-04-28 - Employee Panel Pages: Inline Mock Data, No Shared Store

Context:
37 employee pages were placeholder-only (5-line files delegating to PlaceholderPage component). They needed realistic, role-appropriate content.

Decision:
Each page was filled with inline mock data arrays typed explicitly (no `any`) rather than adding all data to mockData.ts. Role-specific data (bugs, sprints, pixel IDs, SEO audits, etc.) is too narrow to be shared globally. Pages that already had relevant shared data (campaigns, tasks, reports, approvals, meetings, projects, clients) import from mockData.ts. Pages with highly specialized content define their own local arrays.

Reason:
Keeps mockData.ts focused on shared cross-role entities. Specialist data (e.g., pixel tracking IDs, SSL certificates, SEO audit scores) is unlikely to be reused outside its role's pages. Avoids inflating mockData.ts with rarely shared data.

Affected files:
- All 37 files in `adminandemployeePanel/src/app/employee/pages/` that previously used PlaceholderPage

---

## 2026-04-28 - Single SPA, No Next.js

Context:
Despite Social Tech building Next.js projects for clients, this internal tool is a Vite + React SPA.

Decision:
Use React Router 7 (createBrowserRouter) for all routing. No SSR, no RSC, no Next.js conventions.

Reason:
This is an internal dashboard/panel tool. SPA with client-side routing is sufficient.

Affected files:
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/routes.tsx`

---

## 2026-04-28 - Demo Login Flow for Admin, Employee, and Client Portal

Context:
Admin + Employee Panel and Client Portal needed realistic login screens, but the project still has no backend, API, JWT, session, or database layer.

Decision:
Implemented frontend-only demo login flows inside the existing Vite + React SPAs. Admin and employee users authenticate through a shared `/login` screen in `adminandemployeePanel/`; demo role/account type comes from a static email map in `RoleContext.tsx`. Client Portal uses a separate frontend demo login gate in `clientPanel/` before the existing service selection flow. Demo auth state is browser-local and should be replaced by real JWT/session-backed auth later.

This supersedes the earlier demo role-picker flow for active navigation.

Reason:
This provides a realistic premium login experience without changing the current SPA architecture or introducing backend infrastructure prematurely.

Affected files:
- `adminandemployeePanel/src/app/contexts/RoleContext.tsx`
- `adminandemployeePanel/src/app/pages/Login.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/EmployeeDashboard.tsx`
- `adminandemployeePanel/src/app/employee/RoleAccessLogin.tsx`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/components/client-login.tsx`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/components/topbar.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`

---

## 2026-04-28 - npm Developer Workflow Standardization

Context:
`adminandemployeePanel/` and `clientPanel/` were buildable, but developer workflow signaling was inconsistent (`package-lock.json` existed while `pnpm` metadata was still present), and there was no explicit TypeScript typecheck pipeline before backend/auth integration work.

Decision:
Standardized both apps on npm (`packageManager: npm@11.8.0`), removed pnpm-specific workspace/override metadata, moved `react` and `react-dom` into `dependencies`, added TypeScript typecheck infrastructure (`typescript`, `@types/*`, `tsconfig.json`), and added `typecheck`, `preview`, and `check` scripts. Ran `npm install` and updated lockfiles, then verified `npm run check` succeeds in both apps.

ESLint/Prettier were intentionally not added in this pass to keep the change set minimal and focused on package manager consistency plus type/build gating.

Reason:
Creates a stable, reproducible baseline for upcoming backend/auth integration while minimizing risk and avoiding broad formatting/lint churn.

Affected files:
- `adminandemployeePanel/package.json`
- `adminandemployeePanel/package-lock.json`
- `adminandemployeePanel/tsconfig.json`
- `adminandemployeePanel/pnpm-workspace.yaml`
- `adminandemployeePanel/vite.config.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `clientPanel/package.json`
- `clientPanel/package-lock.json`
- `clientPanel/tsconfig.json`
- `clientPanel/pnpm-workspace.yaml`
- `clientPanel/vite.config.ts`

---

## 2026-04-28 - NestJS Backend Foundation

Context:
The repository had multiple Vite + React SPAs with frontend-only demo auth and mock/static data, but no backend service. A backend foundation was required before real authentication, RBAC, database migration, and API integration phases.

Decision:
Created a new `server/` application as a NestJS + TypeScript backend foundation to act as a single shared API for Admin/Employee Panel and Client Portal. Added foundational infrastructure only:
- `/api/v1` global prefix
- env/config validation
- global request validation
- global exception handling
- env-driven CORS
- Prisma/PostgreSQL preparation
- health endpoint
- auth/users/clients module skeletons

This milestone intentionally does not include full auth, real RBAC enforcement, full domain modeling, or frontend API integration.

Reason:
Establishes a clean, testable, extensible backend base while keeping implementation risk low and preserving phased delivery.

Affected files:
- `server/.env.example`
- `server/package.json`
- `server/nest-cli.json`
- `server/tsconfig.json`
- `server/tsconfig.build.json`
- `server/src/main.ts`
- `server/src/app.module.ts`
- `server/src/config/env.validation.ts`
- `server/src/config/cors.config.ts`
- `server/src/common/filters/global-exception.filter.ts`
- `server/prisma/schema.prisma`
- `server/src/database/prisma.service.ts`
- `server/src/database/database.module.ts`
- `server/src/health/*`
- `server/src/auth/*`
- `server/src/users/*`
- `server/src/clients/*`

---

## 2026-04-28 - Hybrid RBAC Schema and Demo Seed Foundation

Context:
Backend foundation existed in `server/`, but auth implementation had not started yet. The project needed an auth-ready schema baseline and deterministic demo data before implementing real `login/refresh/logout/me`.

Decision:
Extended Prisma schema with a hybrid RBAC-ready approach:
- Keep fixed `User.role` enum as the primary role identity.
- Add `Permission` and `RolePermission` tables for expandable backend authorization mapping.
- Add `User.displayName` and `User.lastLoginAt`.
- Add unique `ClientProfile.slug`.

Added `prisma/seed.ts` and seed scripts to establish deterministic demo data:
- Admin + 7 employee role users + 1 client owner user.
- Permission catalog and role-permission mapping rows.
- `client@socialtech.com` linked to `Acme E-ticaret` client profile.

This milestone intentionally does not implement auth endpoints, JWT logic, refresh rotation, or backend guard enforcement.

Reason:
Provides a stable schema + seed baseline for the next task (real auth endpoints) while keeping scope controlled and avoiding premature full RBAC/auth implementation.

Operational note:

---

## 2026-05-05 - Project Manager Service-Aware Flow and Web APP Workspace V1 Boundary

Context:
The repository now has a working delivery module and a project-scoped Web APP workspace module, but the intended ownership boundary for project-manager flows and the expected shape of workspace messaging needed to be fixed before additional UI/API work. The frontend also uses two navigation models: route-based admin/employee panels and state-based client portal navigation.

Decision:
Define V1 around the existing project-scoped contract instead of introducing a new orchestration layer or navigation rewrite.

- Canonical scope anchor remains `Project`.
- Delivery workflow stays in `server/src/delivery/*` under `/api/v1/delivery/*`.
- Web APP collaboration stays in `server/src/web-app-workspace/*` under `/api/v1/projects/:projectId/web-app-workspace/*`.
- Admin/employee entry remains route-based via `adminandemployeePanel/src/app/routes.tsx`, with Web APP workspace surfaced inside `ProjectDetail`.
- Client Portal keeps its current state-driven navigation in `clientPanel/src/app/App.tsx`; no React Router migration is required for V1.
- Service-aware behavior for project managers is resolved from `project.serviceKey`, assignment scope, and purchased-service/project linkage, not from a new standalone “project-manager workspace” aggregate.
- Workspace messages remain a flat, append-only project/tab feed in V1. The message tree fix is limited to frontend presentation/query discipline and does not introduce threaded replies, parent-child persistence, or a new message domain model.

V1 behavioral boundary:
- Project managers are the only employee role that can manage delivery sprints/releases in assigned scope.
- Assigned project managers, developers, and designers may operate within assigned Web APP workspace scope according to their existing permissions; clients can read/interact only in own scope and never manage internal records.
- Revisions continue to be the structured change-request system of record; messages are lightweight discussion only.

Out of scope for V1:
- No architecture rewrite from Vite SPA to Next.js.
- No client portal router rewrite.
- No new backend aggregator/BFF that merges delivery + workspace into a separate service.
- No threaded message schema (`parentMessageId`, reply trees, per-thread unread state, mentions, reactions).
- No cross-service unified workspace for non-`WEB_APP` projects.

Reason:
This preserves the current architecture, aligns with already implemented backend/project scoping, avoids duplicating delivery/workspace responsibilities, and keeps the message-tree fix incremental instead of expanding into a new collaboration system.

Affected files:
- `DECISIONS.md`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/features/webAppWorkspace/*`
- `server/src/delivery/*`
- `server/src/web-app-workspace/*`

---

## 2026-05-05 - Project Manager Service-Aware Client Workspace Implementation

Context:
Project-manager employee panelinde müşteri operasyon akışı mock/static kalıyordu ve service-aware çalışma modeli net değildi.

Decision:
Project-manager akışı assigned-client merkezli olacak şekilde uygulandı:
- PM girişinde müşteri listesi ve satın alınan hizmet odaklı kart akışı.
- Müşteri detayında purchased services + serviceKey bazlı operasyon girişleri.
- WEB_APP/MOBILE_APP/LANDING_PAGE için workspace sekmeli operasyon ekranı.
- Non-web servislerde mock yerine gerçek project/task/file summary ve explicit empty-state yaklaşımı.

Reason:
PM operasyonunun müşteri ve hizmet bağlamında gerçek veriyle yönetilebilmesi ve mock bağımlılığının kaldırılması.

Affected files:
- `adminandemployeePanel/src/app/employee/dashboards/ProjectManagerDashboard.tsx`
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`

---

## 2026-05-05 - Web APP Workspace Message Tree Visibility and Reply Persistence Fix

Context:
Client panelde soru-cevap mesajları görünmeme, yanlış cache anahtarıyla patch, PM/admin tarafında cevap akışında kopukluk ve thread/reply bağının zayıf olması sorunları vardı.

Decision:
Mesaj akışı uçtan uca project+tab bağlamında hizalandı ve reply persistence eklendi:
- `WebAppWorkspaceMessage.parentMessageId` ile parent/reply ilişkisi persist edildi.
- Mesaj listeleme ve websocket patch akışında `{ projectId, tabKey }` cache anahtarı standardize edildi.
- Client ve admin/employee panellerinde reply oluşturma `parentMessageId` ile desteklendi.
- Socket sequence guard korunarak stale/out-of-order patch riski azaltıldı.

Reason:
Client mesajlarının PM/admin/employee tarafına güvenli ve tutarlı görünmesi, PM cevaplarının client tarafında doğru thread altında görünmesi.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260505153000_add_workspace_message_threading/migration.sql`
- `server/src/web-app-workspace/dto/create-workspace-message.dto.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceTypes.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- Current local schema sync uses `prisma db push`.
- Prisma migration files are not created yet and remain a planned follow-up.
- `package.json#prisma` seed config is currently valid but deprecated in Prisma 7; migrate later to `prisma.config.ts`.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.seed.json`

---

## 2026-04-28 - Backend Auth Flow with Refresh Token Rotation

Context:
`server/` backend foundation and Prisma seed/schema baseline were ready, but auth endpoints were still placeholder and frontend apps were operating with demo-only auth state.

Decision:
Implemented real backend auth endpoints under `/api/v1/auth`:
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`

Security and session behavior:
- Access token is returned in response body and consumed as Bearer token.
- Refresh token is issued as HttpOnly cookie.
- Refresh token plaintext is never stored in database; only hash is stored in `RefreshToken.tokenHash`.
- Refresh token rotation is enabled.
- On revoked-token reuse detection, active refresh sessions for the same user are revoked.
- Seed password hashing moved to `bcryptjs`.
- Legacy `seed-sha256` hashes are temporarily supported and upgraded to bcrypt on successful login.

Authorization baseline:
- Added `JwtAuthGuard` and `CurrentUser` decorator.
- Added `RequirePermissions` decorator and `PermissionsGuard` skeleton for domain rollout.
- `/auth/me` is protected with backend guard and returns role + resolved permissions (+ `ClientProfile` for client users).

Reason:

---

## 2026-05-05 - Client Web APP Mock Fallback Removal and Assignment Visibility Hardening

Context:
Client Portal Web APP experience still contained static/mock fallback content in shared reports/meetings/tab flows, and assignment visibility was not explicit enough in admin client detail and developer dashboard.

Decision:
- Removed Web APP-facing mock fallback behavior in client panel pages and switched to API-first rendering with explicit empty states when project/data is unavailable.
- Made admin client detail show active assigned employees for the selected client.
- Added developer dashboard visibility card for assigned clients to make assignment scope immediately visible after assignment.

Reason:
Ensures production-like behavior (no hidden mock data), improves assignment transparency for operations, and reduces confusion during onboarding/testing of newly assigned developer accounts.

Affected files:
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/reports.tsx`
- `clientPanel/src/app/pages/meetings.tsx`
- `clientPanel/src/app/pages/services/web-app-dashboard.tsx`
- `clientPanel/src/app/App.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`
Establishes secure, production-aligned auth mechanics early while preserving phased delivery for frontend integration and broader domain authorization.

Operational verification:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- Manual auth flow checks passed (`login`, `me`, `refresh`, `logout`, `logout -> refresh=401`)

Affected files:
- `server/src/auth/auth.controller.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/auth.module.ts`
- `server/src/auth/authorization.service.ts`
- `server/src/auth/dto/login.dto.ts`
- `server/src/auth/dto/refresh-token.dto.ts`
- `server/src/auth/dto/logout.dto.ts`
- `server/src/auth/guards/jwt-auth.guard.ts`
- `server/src/auth/guards/permissions.guard.ts`
- `server/src/auth/decorators/current-user.decorator.ts`
- `server/src/auth/decorators/permissions.decorator.ts`
- `server/src/auth/types/*`
- `server/src/config/env.validation.ts`
- `server/src/main.ts`
- `server/prisma/seed.ts`
- `server/.env.example`
- `server/package.json`
- `server/package-lock.json`

---

## 2026-04-28 - Protected Users and Clients API Foundation

Context:
Auth foundation and JWT refresh rotation were completed, but domain-level protected endpoints were still limited. `users` and `clients` modules needed their first real protected read APIs with backend authorization and object-level scope checks.

Decision:
Implemented protected users/clients read foundation under `/api/v1`:
- `GET /users/me`
- `GET /users`
- `GET /users/:id`
- `GET /clients`
- `GET /clients/:id`
- `GET /clients/me`

Authorization design in this milestone:
- `JwtAuthGuard` + `PermissionsGuard` are used at controller level.
- `GET /users` is guarded with `users.read` permission.
- Service-level object authorization is enforced for user/client ownership scope.
- Admin can read full users/client profile scopes.
- Client can read only own `clientProfile` scope.
- Employee assignment model is not implemented yet; `clients.read.assigned` is intentionally constrained (safe empty/limited behavior).

Security behavior:
- No sensitive auth fields are exposed by these responses (`passwordHash`, refresh token plaintext/hash, and token internals are not returned).

Operational verification:
- `npm run build` passed
- `npm run check` passed

Reason:
Creates the first production-shaped protected domain API layer after auth, while keeping tenant isolation and incremental delivery before assignment modeling and frontend integration.

Affected files:
- `server/src/users/users.module.ts`
- `server/src/users/users.controller.ts`
- `server/src/users/users.service.ts`
- `server/src/clients/clients.module.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`

---

## 2026-04-28 - Employee Client Assignment Model

Context:
Protected users/clients endpoints were implemented, but employee client access was still placeholder-scoped because assignment relations were not modeled yet. `clients.read.assigned` existed in permissions but could not be enforced against real data.

Decision:
Implemented assignment-based employee client access with a dedicated Prisma model and updated clients authorization flow:
- Added `EmployeeClientAssignment` model
- Added `EmployeeClientAssignmentScope` enum
- Added `User.employeeClientAssignments` relation
- Added `ClientProfile.employeeAssignments` relation
- Added assignment uniqueness and query indexes:
  - `@@unique([employeeUserId, clientProfileId, scope])`
  - `@@index([employeeUserId, isActive])`
  - `@@index([clientProfileId, isActive])`
  - `@@index([scope, isActive])`

Seed updates:
- Expanded demo client profiles to 3:
  - `acme-e-ticaret`
  - `nova-performance`
  - `mavi-sosyal`
- Seeded active employee-client assignments:
  - `project@socialtech.com` -> 3 clients (`PROJECT`)
  - `performance@socialtech.com` -> 2 clients (`PERFORMANCE`)
  - `social@socialtech.com` -> 2 clients (`SOCIAL_MEDIA`)

Authorization behavior changes:
- `GET /api/v1/clients` now returns only actively assigned client profiles for employee accounts with `clients.read.assigned`.
- `GET /api/v1/clients/:id` now allows employee access only when there is an active assignment; otherwise returns safe `404`.
- Admin and client account behavior remains unchanged.
- `JwtAuthGuard` + `PermissionsGuard` + service-level object authorization remain in place.

Operational and runtime notes:
- Exported `JwtModule` from `AuthModule` to resolve runtime DI availability for guard dependencies in feature modules.
- Verified successfully:
  - `npm run prisma:generate`
  - `npm run prisma:push`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`

Reason:
Moves employee client visibility from placeholder behavior to enforceable backend authorization scope, while preserving phased rollout for assignment management APIs and test coverage.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/clients/clients.service.ts`
- `server/src/auth/auth.module.ts`

---

## 2026-04-28 - Authorization E2E Test Matrix

Context:
Auth flow, users/clients protected endpoints, and employee assignment scope were implemented, but backend authorization behavior still relied on manual validation. A repeatable e2e verification layer was required before broader domain rollout.

Decision:
Added a Jest + ts-jest + supertest based e2e test foundation under `server/test/` and implemented an authorization matrix suite for users/clients endpoints.

Implemented test characteristics:
- Tests run against real `AppModule` bootstrapping and real guards (`JwtAuthGuard`, `PermissionsGuard`).
- No guard mocking/override is used.
- Runtime setup derives assigned/unassigned client IDs from seeded DB data (no hardcoded UUID dependency).

Added safe e2e runner:
- `server/test/run-e2e.cjs` prepares Prisma and runs Jest in one controlled flow (migration-first flow now in use).
- Runner validates `DATABASE_URL` against test-style naming and blocks unsafe targets by default.
- Explicit override is possible via `ALLOW_E2E_DB_RESET=true`.

Authorization matrix coverage (10 tests):
- admin users list -> `200`
- client users list -> `403`
- employee users list -> `403`
- admin clients list -> `200`
- client clients/me -> `200`
- client another client id -> `403`
- employee assigned clients list -> `200`
- employee assigned client detail -> `200`
- employee unassigned client detail -> `404`
- unauthenticated protected request -> `401`

Validation:
- `npm run typecheck:spec` passed
- `npm run check` passed
- `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (`10/10`)
- Final DB-connected validation after migration-first + test DB access fix: `3/3` suites and `64/64` tests passed on `socialtech_test` (`authz`, `projects-tasks-authz`, `admin-users-password-authz`).

Reason:
Creates a reliable backend authz regression gate before frontend integration and broader domain endpoint expansion.

Affected files:
- `server/package.json`
- `server/package-lock.json`
- `server/tsconfig.spec.json`
- `server/test/jest-e2e.config.cjs`
- `server/test/jest.env.ts`
- `server/test/run-e2e.cjs`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Assignment Management API

Context:
Auth flow, protected users/clients endpoints, and assignment-based employee client visibility were implemented, but admins could not yet manage employee-client assignments via API. Authorization e2e coverage also needed to expand beyond users/clients matrix cases.

Decision:
Implemented a dedicated admin assignment management module under `server/src/admin-assignments/` and wired it into `AppModule`.

Added endpoints:
- `GET /api/v1/admin/assignments`
- `POST /api/v1/admin/assignments`
- `PATCH /api/v1/admin/assignments/:id`
- `PATCH /api/v1/admin/assignments/:id/deactivate`
- `PATCH /api/v1/admin/assignments/:id/activate`

Authorization design:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions`
- Service-level: explicit `ADMIN` account type + `ADMIN` role check and permission check
- Admin permissions: `assignments.read`, `assignments.manage`

Seed updates:
- Added permissions `assignments.read` and `assignments.manage`
- Admin role receives these permissions
- Non-admin stale mappings for these permissions are cleaned idempotently during seed

Behavior and safety:
- Query filtering support on list endpoint (`employeeUserId`, `clientProfileId`, `isActive`, `scope`)
- Employee/client existence validation on create
- Active duplicate assignment create returns conflict
- Inactive duplicate assignment is reactivated instead of creating a duplicate row
- Responses are sanitized (no password hashes, token hashes, refresh token internals)
- Prisma schema was not changed; existing `EmployeeClientAssignment` model is reused

Testing:
- Expanded authz e2e matrix to include admin assignment management scenarios
- Authz suite now passes `19/19`
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Reason:
Completes the first admin-managed assignment lifecycle foundation and extends backend authorization regression coverage before frontend API integration and broader domain endpoint rollout.

Affected files:
- `server/src/app.module.ts`
- `server/src/admin-assignments/admin-assignments.module.ts`
- `server/src/admin-assignments/admin-assignments.controller.ts`
- `server/src/admin-assignments/admin-assignments.service.ts`
- `server/src/admin-assignments/dto/create-assignment.dto.ts`
- `server/src/admin-assignments/dto/update-assignment.dto.ts`
- `server/src/admin-assignments/dto/assignment-query.dto.ts`
- `server/prisma/seed.ts`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Hardened E2E Database Guard and Assignment Negative Tests

Context:
Authorization e2e coverage existed for users/clients/admin-assignment happy-path and core access matrix, and the e2e runner had a safety check. However, DB guard bypass risk and missing assignment negative-case coverage still remained.

Decision:
Hardened the e2e runner database guard and expanded assignment authorization negative-case test coverage.

Runner hardening (`server/test/run-e2e.cjs`):
- E2E execution now strictly requires a test-like DB name in `DATABASE_URL`.
- Allowed DB name patterns:
  - `_test`
  - `test_`
  - `testing`
- `ALLOW_E2E_DB_RESET=true` no longer bypasses the DB-name guard.
- Guard matching was made delimiter-aware to reduce false-positive risk.
- Non-test URL + `ALLOW_E2E_DB_RESET=true` was smoke-tested and correctly rejected.

Authz e2e expansion (`server/test/authz.e2e-spec.ts`):
- Added assignment admin CRUD negative-case scenarios:
  - invalid `employeeUserId` UUID -> `400`
  - invalid `clientProfileId` UUID -> `400`
  - invalid `scope` enum -> `400`
  - missing required fields -> `400`
  - non-existent `employeeUserId` -> `400`
  - non-existent `clientProfileId` -> `400`
  - `employeeUserId` from client account -> `400`
  - duplicate create -> `409`
  - update invalid UUID -> `400`
  - update null payload -> `400`
  - deactivate non-existent assignment -> `404`
  - activate non-existent assignment -> `404`
- Runtime UUID resolution remains dynamic (no hardcoded UUIDs).
- Existing matrix behavior was preserved.
- Total authz suite result: `30/30` passing.

Validation:
- `npm run typecheck:spec` passed
- `npm run check` passed
- `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` passed (using test DB name `socialtech_test`)

Reason:
Reduces accidental non-test DB mutation risk and strengthens authorization regression coverage for assignment management edge cases before broader domain rollout.

Affected files:
- `server/test/run-e2e.cjs`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-28 - Projects and Tasks API Foundation

Context:
Backend auth, users/clients protected APIs, employee-client assignment model, and admin assignment management were completed. Project/task operations were still mock-only and not yet protected with backend object-level authorization.

Decision:
Implemented `projects` and `tasks` domain API foundations under `server/` with role-scoped authorization and assignment-aware object-level checks.

Data model updates:
- Added Prisma models: `Project`, `Task`
- Added enums: `ProjectStatus`, `TaskStatus`, `Priority`
- Added relations:
  - `ClientProfile -> Project[]`
  - `Project -> Task[]`
  - `Task -> assignee User?`
  - `User -> assignedTasks[]`
- Added indexes:
  - Project: `clientProfileId`, `status`, `priority`
  - Task: `projectId`, `assigneeUserId`, `status`, `priority`
- Enforced client-scoped slug uniqueness for projects: `@@unique([clientProfileId, slug])`

Seed updates:
- Seeded 3 client-scoped projects:
  - `acme-e-ticaret/growth-hub-launch`
  - `nova-performance/paid-acquisition-optimization`
  - `mavi-sosyal/social-calendar-refresh`
- Seeded 7 realistic tasks
- Assignee resolution is idempotent and natural-key based (email), no brittle hardcoded UUID dependency

API endpoints added:
- Projects:
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/:id`
  - `POST /api/v1/projects`
  - `PATCH /api/v1/projects/:id`
- Tasks:
  - `GET /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
  - `POST /api/v1/tasks`
  - `PATCH /api/v1/tasks/:id`

Authorization behavior:
- Admin: full project/task read-write scope
- Employee:
  - read only active-assignment-scoped projects/tasks
  - update only `status` on own assigned tasks within active assignment scope
- Client:
  - read only own `clientProfileId`-scoped projects/tasks
- Out-of-scope detail access preserves safe `404` behavior

Validation/testing:
- Added DTO/query validation for projects/tasks
- Added e2e suite: `server/test/projects-tasks-authz.e2e-spec.ts`
- Added regression coverage to ensure assignment deactivation removes employee task visibility in that client scope
- Authz e2e suites now pass `64/64` (`3/3` suites) after DB access fix and full suite re-run on `socialtech_test`
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Known follow-up risks left intentionally out of this milestone:
- Project-manager project/task manage policy is currently admin-only behavior and needs explicit product decision
- Assignment CRUD concurrency/race-condition e2e coverage remains pending

Reason:
Establishes secure, RBAC-aware backend foundations for project/task data before frontend API integration and broader domain rollout.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/app.module.ts`
- `server/src/projects/*`
- `server/src/tasks/*`
- `server/test/projects-tasks-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Users Management API

Context:
Backend auth, protected users/clients/assignments/projects/tasks foundations, and admin employee creation were already implemented. Admin-side employee lifecycle operations (list, detail, update, deactivate, activate, reset-password) were still incomplete.

Decision:
Completed Admin Users Management API under `server/src/admin-users/` while preserving existing `POST /api/v1/admin/users`.

Implemented endpoints:
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id/deactivate`
- `PATCH /api/v1/admin/users/:id/activate`
- `PATCH /api/v1/admin/users/:id/reset-password`

Authorization design:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("users.manage")`
- Service-level: explicit `ADMIN` account type + `ADMIN` role + `users.manage` checks

Behavior and safety:
- List query filters: `accountType`, `role`, `isActive`, `search`
- Update scope restricted to: `displayName`, `role`, `isActive`
- `email` and `accountType` updates are intentionally blocked
- Mutation endpoints are intentionally restricted to `EMPLOYEE` targets
- Self-protection:
  - admin cannot deactivate self
  - admin cannot change own `role` / activation status through management update
- Deactivate uses soft status transition: `User.status = INACTIVE`
- Deactivate revokes active refresh tokens for target user
- Activate sets `User.status = ACTIVE`
- Reset-password uses bcrypt hashing and revokes active refresh tokens
- Response payloads remain sanitized (no `passwordHash`, refresh token internals, or token hashes)

Validation/testing:
- Added DTOs:
  - `AdminUserQueryDto`
  - `UpdateAdminUserDto`
  - `ResetAdminUserPasswordDto`
- Added e2e suite:
  - `server/test/admin-users-management-authz.e2e-spec.ts`
- Authz pattern run:
  - `4/4` suites passed
  - `81/81` tests passed
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:migrate:deploy`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `ALLOW_E2E_DB_RESET=true npm run test:e2e:authz` (with `socialtech_test`)

Known follow-up risks:
- Access tokens are stateless and may remain valid until expiry after deactivate/reset-password.
- `GET /admin/users` currently has no pagination.
- Admin user management actions are not yet written to audit logs.

Reason:
Completes backend employee lifecycle management for admins with controlled scope and RBAC enforcement before frontend management integration.

Affected files:
- `server/src/admin-users/admin-users.controller.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/src/admin-users/dto/admin-user-query.dto.ts`
- `server/src/admin-users/dto/update-admin-user.dto.ts`
- `server/src/admin-users/dto/reset-admin-user-password.dto.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-28 - Access Token Invalidation with sessionInvalidatedAt

Context:
Refresh-token rotation/revoke was already implemented, but access tokens were stateless and could remain valid until expiry after password reset/deactivation/role changes.

Decision:
Implemented access-token invalidation using `User.sessionInvalidatedAt` with JWT `siv` (session invalidation version) claim support.

Implementation summary:
- Prisma `User` model extended with nullable `sessionInvalidatedAt DateTime?`.
- Migration-first flow used; no `db push`.
- New migration:
  - `server/prisma/migrations/20260428211614_add_session_invalidated_at/migration.sql`
- JWT payload types extended with optional `siv` (ms timestamp snapshot) and existing `iat` compatibility.

Guard/session validation:
- `JwtAuthGuard` now fetches `sessionInvalidatedAt` from DB.
- Validation order:
  1) user active check
  2) `siv` match check against current `sessionInvalidatedAt`
  3) if `siv` absent, backward-compatible fallback: `iat <= sessionInvalidatedAt` invalidates token
- Mismatch returns `401 Unauthorized`.

Invalidation triggers:
- `PATCH /api/v1/users/me/password`:
  - updates password hash
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id/reset-password`:
  - updates password hash
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id/deactivate`:
  - sets `status = INACTIVE`
  - revokes active refresh tokens
  - sets `sessionInvalidatedAt = now`
- `PATCH /api/v1/admin/users/:id`:
  - role change -> `sessionInvalidatedAt = now`
  - `isActive=false` -> `sessionInvalidatedAt = now`
  - displayName-only update -> no session invalidation
- `activate` does not clear `sessionInvalidatedAt`, so stale tokens do not become valid again.

Refresh behavior:
- Existing revoked-token reuse handling preserved; revoked check remains before session invalidation check.
- Refresh tokens also validate session via `siv` (with `iat` fallback).

Validation/testing:
- Added e2e suite:
  - `server/test/access-token-invalidation-authz.e2e-spec.ts`
- Authz pattern run:
  - `5/5` suites passed
  - `88/88` tests passed
- Verified:
  - `npm run prisma:generate`
  - `npm run prisma:migrate:dev -- --name add-session-invalidated-at`
  - `npm run prisma:seed`
  - `npm run build`
  - `npm run check`
  - `DATABASE_URL=postgresql://ahmeteminkaya@localhost:5432/socialtech_test?schema=public ALLOW_E2E_DB_RESET=true npm run test:e2e:authz`

Known follow-up risks:
- Admin users list pagination/sorting is still pending.
- Admin user management audit logs are still pending.
- Pre-`siv` legacy tokens rely on fallback `iat` evaluation.

Reason:
Provides deterministic invalidation of previously issued access tokens after security-sensitive account changes while preserving migration-first and existing RBAC behavior.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260428211614_add_session_invalidated_at/migration.sql`
- `server/src/auth/types/token-payload.type.ts`
- `server/src/auth/guards/jwt-auth.guard.ts`
- `server/src/auth/auth.service.ts`
- `server/src/users/users.service.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/access-token-invalidation-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin User Management Audit Logging

Context:
Admin user lifecycle endpoints were already implemented (`create`, `update`, `deactivate`, `activate`, `reset-password`) but actions were not yet persisted as durable audit trail entries.

Decision:
Implemented centralized audit write infrastructure for admin user management actions using existing `AuditLog` model (no schema change). Added `AuditLogService` + `AuditLogModule` and integrated admin user mutation flows to write audit entries in the same Prisma transaction as the business mutation.

Audit actions written:
- `ADMIN_USER_CREATED`
- `ADMIN_USER_UPDATED`
- `ADMIN_USER_DEACTIVATED`
- `ADMIN_USER_ACTIVATED`
- `ADMIN_USER_PASSWORD_RESET`

Operational behavior:
- Controller passes request context (`ipAddress`, `userAgent`) to service layer.
- Audit metadata includes safe fields (`actorUserId`, `targetUserId`, `changedFields`, and where applicable role/status transitions).
- Sensitive key fragments (`password`, `passwordHash`, `token`, `secret`, `authorization`) are recursively removed before persistence.
- Forbidden employee/client calls do not create audit rows.
- Audit failure fails the parent mutation (transactional consistency).

Validation:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- authz pattern passed: `5/5 suites`, `102/102 tests`

Reason:
Provides traceability and tamper-resistant operational history for privileged admin user management actions.

Affected files:
- `server/src/audit-log/audit-log.module.ts`
- `server/src/audit-log/audit-log.service.ts`
- `server/src/admin-users/admin-users.module.ts`
- `server/src/admin-users/admin-users.controller.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Audit Logs Read API

Context:
Audit log writes were active, but there was no backend read API for admin-side “operation history / audit logs” screens.

Decision:
Added admin-only audit log read endpoints under `/api/v1/admin/audit-logs` with validation, filtering, pagination, sorting, and metadata sanitization:
- `GET /api/v1/admin/audit-logs`
- `GET /api/v1/admin/audit-logs/:id`

Authorization:
- Route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("audit_logs.read")`
- Service-level: `AccountType.ADMIN` + `UserRole.ADMIN` + permission assertion
- No seed/catalog change needed because `audit_logs.read` was already present and mapped for admin role.

Query/response behavior:
- Pagination: `page` default `1` (min `1`, max `10000`), `limit` default `20` (min `1`, max `100`)
- Sorting: `sortBy` (`createdAt`, `action`, `entityType`), `sortOrder` (`asc`, `desc`), default `createdAt desc`, stable secondary `id asc`
- Filters: `action`, `actorUserId`, `targetUserId`, `targetClientProfileId`, `entityType`, `entityId`, `dateFrom`, `dateTo`, `search`
- `dateFrom > dateTo` => `400`
- List response: `data + meta` envelope
- Detail response: single sanitized log row or `404`
- Metadata is recursively sanitized on read (`password`, `token`, `secret`, `authorization`, `apikey`, `credential`, `cookie` key fragments removed)

Validation:
- `npm run prisma:generate` passed
- `npm run prisma:seed` passed
- `npm run build` passed
- `npm run check` passed
- authz pattern passed: `6/6 suites`, `123/123 tests`

Reason:
Enables secure and filterable admin-facing audit log consumption without exposing sensitive operational data.

Affected files:
- `server/src/admin-audit-logs/admin-audit-logs.module.ts`
- `server/src/admin-audit-logs/admin-audit-logs.controller.ts`
- `server/src/admin-audit-logs/admin-audit-logs.service.ts`
- `server/src/admin-audit-logs/dto/audit-log-query.dto.ts`
- `server/src/app.module.ts`
- `server/test/admin-audit-logs-authz.e2e-spec.ts`

---

## 2026-04-28 - Admin Users Pagination and Sorting

Context:
`GET /api/v1/admin/users` existed under Admin Users Management API, but returned an unpaginated list. As user volume grows, list performance, predictable ordering, and frontend consumption shape needed a stable contract.

Decision:
Added strict pagination/sorting to `GET /api/v1/admin/users` while preserving existing auth and filter behavior.

Implemented contract:
- Pagination:
  - `page` default `1`, min `1`, max `10000`
  - `limit` default `20`, min `1`, max `100`
  - invalid values return `400`
  - offset paging: `skip = (page - 1) * limit`, `take = limit`
- Sorting:
  - `sortBy`: `createdAt | updatedAt | displayName | email | lastLoginAt | role | status`
  - `sortOrder`: `asc | desc`
  - default: `createdAt desc`
  - Prisma `orderBy` is built from a whitelist map (no raw query field passthrough)
  - stable secondary sort: `id asc`
- Response shape changed from array to paginated envelope:
  - `data: AdminUserResponse[]`
  - `meta: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }`
- Existing filters preserved:
  - `accountType`, `role`, `isActive`, `search`
  - `search` is trimmed; empty search is ignored; email/displayName case-insensitive search remains
- Authorization and safety preserved:
  - `JwtAuthGuard` + `PermissionsGuard` + `users.manage`
  - employee/client still `403`, unauthenticated still `401`
  - sensitive fields remain excluded from responses

Validation:
- `npm run prisma:generate` passed
- `npm run build` passed
- `npm run check` passed
- DB-connected authz suite re-run passed on `socialtech_test`: `5/5` suites, `100/100` tests

Reason:
Establishes a scalable and frontend-friendly admin users list contract without widening scope to schema changes or new domain behavior.

Affected files:
- `server/src/admin-users/dto/admin-user-query.dto.ts`
- `server/src/admin-users/admin-users.service.ts`
- `server/test/admin-users-management-authz.e2e-spec.ts`

---

## 2026-04-29 - Frontend Auth Integration with Redux Toolkit and RTK Query

Context:
`adminandemployeePanel/` and `clientPanel/` were still using frontend-only/demo auth gates while backend auth endpoints (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`) were already productionized in `server/`.

Decision:
Integrated both frontend apps to backend auth using Redux Toolkit + RTK Query.
- Added shared auth stack in both apps: `@reduxjs/toolkit`, `react-redux`, `redux@5`
- Implemented Redux auth state + RTK Query `baseApi` with:
  - `credentials: include`
  - Bearer token header from Redux memory state
  - `401 -> refresh -> retry` flow
  - refresh single-flight lock
- Access token remains in Redux memory only; refresh token lifecycle remains backend-managed via HttpOnly cookie.
- `adminandemployeePanel`: `ADMIN` users route to admin shell, `EMPLOYEE` users route to employee shell, `CLIENT` accounts are blocked from this app.
- `clientPanel`: accepts only `CLIENT` accounts; state-based portal navigation remains intact and service selection restore stays localStorage-backed.
- `RoleContext` in `adminandemployeePanel` is no longer auth source of truth; Redux auth state is canonical.

Validation:
- `adminandemployeePanel npm run check` passed
- `clientPanel npm run check` passed
- `server npm run build` and `npm run check` passed
- Runtime manual QA remains a separate validation step.

Reason:
Aligns both SPAs with the backend auth model while keeping integration incremental and preserving existing UI/navigation structure.

Affected files:
- `adminandemployeePanel/src/app/store/*`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/features/auth/*`
- `adminandemployeePanel/src/app/pages/Login.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/main.tsx`
- `clientPanel/src/app/store/*`
- `clientPanel/src/app/services/baseApi.ts`
- `clientPanel/src/app/features/auth/*`
- `clientPanel/src/app/components/client-login.tsx`
- `clientPanel/src/app/components/topbar.tsx`
- `clientPanel/src/app/App.tsx`

---

## 2026-04-29 - Nest Build Incremental Output Fix

Context:
Backend runtime experienced intermittent `dist` output/module resolution issues during watch/build cycles.

Decision:
Disabled incremental build for Nest build config via `server/tsconfig.build.json` (`"incremental": false`) to force full deterministic output generation in `dist`.

Validation:
- `server npm run build` passed
- `server npm run check` passed

Reason:
Prioritizes runtime reliability over incremental build speed for current backend development flow.

Affected files:
- `server/tsconfig.build.json`

---

## 2026-04-30 - Admin Summary Endpoint and Client List Server-Side Query Contract

Context:
Admin dashboard KPIs were being derived from multiple list endpoints, increasing frontend request cost and coupling. `GET /api/v1/clients` also lacked a unified server-side pagination/filter/sort contract for growing datasets.

Decision:
Implemented two backend contract changes:
1. Added dedicated admin KPI endpoint:
   - `GET /api/v1/admin/summary`
   - admin-only (`JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("admin.summary.read")`)
   - service-level `ADMIN` account/role + permission enforcement
   - count/aggregate style response for users, clients, projects, tasks, audit logs
2. Standardized `GET /api/v1/clients` to server-side query + envelope response:
   - query: `page`, `limit`, `sortBy`, `sortOrder`, `status`, `search`
   - validated and whitelist-mapped sorting
   - response shape: `data[] + meta`
   - role/object-scope behavior preserved for admin/employee/client

Reason:
Reduces dashboard integration overhead, improves API consistency for frontend pagination/filter UX, and keeps authorization guarantees intact.

Affected files:
- `server/src/admin-summary/admin-summary.module.ts`
- `server/src/admin-summary/admin-summary.controller.ts`
- `server/src/admin-summary/admin-summary.service.ts`
- `server/src/clients/dto/client-query.dto.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`
- `server/src/app.module.ts`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/prisma/migrations/20260430000000_add_client_profile_status/migration.sql`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-30 - Admin Panel Dashboard/Clients/ClientDetail Backend Integration and Test Hardening

Context:
`adminandemployeePanel` auth integration was complete, but dashboard KPIs and some domain pages still needed stronger backend-driven contracts and resilient test coverage.

Decision:
Connected core admin pages fully to backend API contracts using existing Redux Toolkit + RTK Query architecture:
- Dashboard now consumes `GET /admin/summary` via dedicated feature slice (`dashboardApi`).
- Clients list now consumes server-side paginated/filterable/sortable `GET /clients` envelope.
- Client detail now includes related projects/tasks overview via existing projects/tasks query filters.
- Strengthened frontend test coverage and resiliency:
  - Dashboard and ClientDetail backend-state tests
  - Projects/Tasks permission-path checks
  - Combobox interactions moved to label/ARIA-oriented selectors for lower brittleness.

Reason:
Improves runtime performance and maintainability, removes dependency on multi-list KPI derivation, and increases confidence in permission-aware UI behavior.

Affected files:
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/*`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/pages/EmployeeDetail.test.tsx`
- `adminandemployeePanel/src/app/pages/AuditLogs.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/*`
## 2026-04-29 - Client Summary Endpoint and ClientDetail Overview

- Added backend `GET /api/v1/clients/:id/summary` as a single-source client overview endpoint.
- Endpoint response standardizes:
  - `client` basic profile
  - `projects` count breakdown + `recent` (max 5)
  - `tasks` count breakdown + `recent` (max 5)
  - `meta.generatedAt`
- Kept existing route guard chain (`JwtAuthGuard`, `PermissionsGuard`) and reused object-level access from `getClientById`.
- Added explicit summary permission checks per actor:
  - Admin: `projects.read.any`, `tasks.read.any`
  - Employee: `projects.read.assigned`, `tasks.read.assigned`
  - Client: `projects.read.own`, `tasks.read.own`
- Preserved secure cross-tenant deny behavior (`403/404`) consistent with existing client detail rules.
- Frontend `ClientDetail` now uses summary endpoint as primary data source (removed multi-query derived overview path).
- Count/recent overview UI is rendered directly from summary payload; loading/error/invalid/not-found/empty states were retained.

---

## 2026-04-29 - Admin Summary Endpoint and Dashboard Integration

Context:
Admin dashboard KPI cards were derived from multiple list endpoints, creating extra request cost and UI/backend contract drift risk.

Decision:
- Added dedicated backend admin KPI endpoint: `GET /api/v1/admin/summary`.
- Fixed contract to:
  - `users`: `total`, `active`, `inactive`, `employees`, `clients`, `admins`
  - `clients`: `total`, `active`, `inactive`
  - `projects`: `total`, `planned`, `inProgress`, `review`, `completed`, `onHold`
  - `tasks`: `total`, `todo`, `inProgress`, `review`, `done`, `blocked`
  - `auditLogs`: `total`, `lastActionAt`
  - `meta`: `generatedAt`
- Removed legacy/extra fields from summary output:
  - `clients.suspended`
  - `tasks.unassigned`
  - `auditLogs.last24Hours`
  - `meta.resourceCount`
- Enforced authorization:
  - route-level: `JwtAuthGuard` + `PermissionsGuard` + `RequirePermissions("admin.summary.read")`
  - service-level: `ADMIN` accountType + `ADMIN` role + permission check
- Integrated `adminandemployeePanel` Dashboard to use only `/admin/summary` (no list-derived KPI path).

Validation:
- Backend authz suites passed (`6/6`, `148/148` at summary rollout checkpoint).
- Frontend dashboard checkpoint passed (`77/77` tests).

Reason:
Centralizes KPI source-of-truth, reduces frontend query fan-out, and stabilizes dashboard contract evolution.

Affected files:
- `server/src/admin-summary/admin-summary.module.ts`
- `server/src/admin-summary/admin-summary.controller.ts`
- `server/src/admin-summary/admin-summary.service.ts`
- `server/src/app.module.ts`
- `server/test/authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardTypes.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`

---

## 2026-04-29 - Clients Server-side Pagination and Dashboard Contract Hardening

Context:
Clients list needed consistent server-side pagination/filter/sorting across role scopes. Dashboard frontend also needed a single guard/normalize point against backend summary field drift.

Decision:
- Hardened `GET /api/v1/clients` server-side contract (validated paging/sorting/filter envelope already in place, authz coverage expanded):
  - `data + meta` response
  - `page` (`1..10000`), `limit` (`1..100`), `sortBy/sortOrder` whitelist
  - `search` and `status` filters
  - role-scoped visibility preserved for admin/employee/client
- Updated Clients frontend page to fully query backend params (`page`, `limit`, `sortBy`, `sortOrder`, `search`, `status`) and rely on backend `meta`.
- Fixed stale pagination regression by syncing current page from RTK Query `currentData.meta.page`.
- Added/expanded frontend clients tests for query args, meta-driven pagination, and stale-data transition.
- Added dashboard contract hardening layer:
  - `normalizeAdminSummaryResponse(response: unknown)` in dashboard utils
  - `transformResponse` usage in dashboard API
  - safe defaults for malformed/missing fields and invalid dates
  - removal of any UI dependency on legacy removed summary fields.

Validation:
- Backend authz suite passed (`6/6`, `152/152` latest run).
- Frontend checks passed (`build`, `check`, `test:run` with `10` files, `82/82` tests).

Reason:
Keeps list UX scalable and backend-driven while reducing dashboard breakage risk from contract changes to a single normalization boundary.

Affected files:
- `server/src/clients/dto/client-query.dto.ts`
- `server/src/clients/clients.controller.ts`
- `server/src/clients/clients.service.ts`
- `server/test/authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`
- `adminandemployeePanel/src/app/features/dashboard/dashboardApi.ts`
- `adminandemployeePanel/src/app/features/dashboard/dashboardUtils.ts`
- `adminandemployeePanel/src/app/pages/Dashboard.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Dashboard.test.tsx`
## 2026-04-29 - Admin Client Management API and UI CRUD Integration

- Backend tarafında admin odaklı client management akışı `server/src/admin-clients/*` altında tamamlandı.
- Endpoint seti netleşti:
  - `POST /api/v1/admin/clients`
  - `PATCH /api/v1/admin/clients/:id`
  - `PATCH /api/v1/admin/clients/:id/deactivate`
  - `PATCH /api/v1/admin/clients/:id/activate`
  - `POST /api/v1/admin/clients/:id/owner`
- Owner mode stratejisi:
  - `NONE`
  - `CREATE` (CLIENT account + CLIENT_OWNER role oluşturur)
  - `LINK_EXISTING` (mevcut CLIENT user bağlar; bağlıysa 409)
- `LINK_EXISTING` sonrası session güvenliği için `sessionInvalidatedAt` set + aktif refresh token revoke uygulanır.
- `clients.manage` route-level permission + admin-only service-level auth birlikte korunur (defense-in-depth).
- Client mutation aksiyonları audit log’a transaction içinde yazılır:
  - `ADMIN_CLIENT_CREATED`
  - `ADMIN_CLIENT_UPDATED`
  - `ADMIN_CLIENT_DEACTIVATED`
  - `ADMIN_CLIENT_ACTIVATED`
  - `ADMIN_CLIENT_OWNER_CREATED`
  - `ADMIN_CLIENT_OWNER_LINKED`
- Frontend admin Clients ekranı CRUD + owner assign akışlarıyla backend’e bağlanmıştır; mutation sonrası Clients/Summary/AuditLogs/AdminSummary invalidation aktiftir.

## 2026-04-29 - Admin Client Owner Picker UI

- `LINK_EXISTING` owner flow’da manuel UUID input kaldırılmıştır.
- Yerine searchable owner picker eklenmiştir (`useGetAdminUsersQuery`):
  - `accountType=CLIENT`
  - `limit=8`
  - `search` debounce: `275ms`
- UI davranışı:
  - sonuç listesinde `displayName + email`
  - seçilen kullanıcı için “Seçili” görünümü
  - “Seçimi Temizle” butonu
  - loading / error / empty state
- Yetki sıkılaştırma:
  - `users.manage` yoksa `LINK_EXISTING` seçeneği disabled
  - bilgilendirme metni gösterilir
- Payload garantisi:
  - `LINK_EXISTING` için yalnızca `{ mode: "LINK_EXISTING", userId }`
  - `email/displayName/password/confirmPassword` gönderilmez
- Validation:
  - user seçilmeden submit bloklanır
  - `CREATE` ve `NONE` akışları korunur
- Önleyici filtre:
  - listeden dönen CLIENT kullanıcıları içinde `clientProfile.id` dolu olanlar (varsa) picker’da elenir
  - backend yine de linked user için fail-safe reject (409) yapar

---

## 2026-04-30 - Employee Assignment UI Integration

Context:
Admin assignment management API (`/api/v1/admin/assignments`) backend’de hazırdı ancak admin panel tarafında assignment yönetimi için API-driven bir ekran bulunmuyordu. Employee panelde `Musterilerim` sayfası da hâlâ mock/static yaklaşımdan tamamen çıkmamıştı.

Decision:
- `adminandemployeePanel` içinde yeni admin ekranı eklendi: `Çalışan Atamaları` (`/calisanlar/atamalar`).
- Mevcut `baseApi.injectEndpoints` pattern’i ile yeni `adminAssignments` feature katmanı eklendi:
  - `useGetAdminAssignmentsQuery`
  - `useCreateAdminAssignmentMutation`
  - `useUpdateAdminAssignmentMutation`
  - `useDeactivateAdminAssignmentMutation`
  - `useActivateAdminAssignmentMutation`
- Assignment ekranında:
  - employee/client/scope/isActive filtreleri
  - debounced employee picker (`accountType=EMPLOYEE`, `isActive=true`, `limit=8`)
  - debounced client picker (`status=ACTIVE`, `limit=8`)
  - create/edit/activate/deactivate akışları
  - permission-aware UX (`assignments.read`, `assignments.manage`)
  - loading/error/empty/success durumları
- Scope kontrollü ikinci migration olarak employee `Musterilerim` sayfası backend `GET /clients` ile API-driven hale getirildi (assignment-scope veri).
- Backend tarafında assignment aktivasyon güvenliği sıkılaştırıldı:
  - inactive employee veya inactive client profile için assignment create/activate engeli (`400`).
  - ilgili authz e2e senaryoları eklendi/güncellendi.

Reason:
Admin tarafında assignment lifecycle’ını gerçek API ile yönetilebilir hale getirirken, employee tarafında assignment-scope müşteri görünümünü mock’tan çıkarıp backend ile hizalamak; RBAC ve veri bütünlüğünü frontend + backend doğrulamasıyla birlikte korumak.

Affected files:
- `adminandemployeePanel/src/app/features/adminAssignments/*`
- `adminandemployeePanel/src/app/pages/EmployeeAssignments.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/EmployeeAssignments.test.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/pages/Employees.tsx`
- `adminandemployeePanel/src/app/employee/pages/Musterilerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Musterilerim.test.tsx`
- `adminandemployeePanel/src/app/services/baseApi.ts`
- `server/src/admin-assignments/admin-assignments.service.ts`
- `server/test/authz.e2e-spec.ts`

---

## 2026-04-30 - Employee Tasks API Integration

Context:
Employee panelde `Gorevlerim` sayfası hâlâ mock/static görev verisi kullanıyordu. Backend tarafında `GET /api/v1/tasks` ve employee assignment-scope authorization hazırdı.

Decision:
- `Gorevlerim` sayfası mock veriden çıkarılıp `useGetTasksQuery` ile backend’e bağlandı.
- Query employee kullanıcı için `assigneeUserId=currentUser.id` ile çağrılıyor.
- Sayfa yalnızca `EMPLOYEE` + `tasks.read.assigned` durumunda query çalıştırıyor; aksi durumda `skip` + unauthorized state gösteriyor.
- KPI kartları API’den dönen görevlerden hesaplanıyor (bugün, geciken, bu hafta teslim, incelemede, tamamlanan).
- Loading / error / empty / success state’leri standart employee page pattern’iyle işlendi.
- `Gorevlerim` için yeni frontend test dosyası eklendi.

Reason:
Employee görev görünümünü gerçek assignment-aware backend verisine taşımak, mock-data bağımlılığını azaltmak ve yetki davranışını frontend UX seviyesinde netleştirmek.

Affected files:
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`

---

## 2026-04-30 - Client Purchased Services and Portal Service Visibility

Context:
Client lifecycle’ında “satın alınan hizmet” bilgisi hem admin tarafında yönetilebilir hem de client portal tarafında zorlayıcı görünürlük kuralı olacak şekilde eksikti.

Decision:
- Backend’e `ClientPurchasedService` modeli ve ilgili enum sözleşmeleri eklendi; `clientProfileId + serviceKey` unique olacak şekilde kuruldu.
- Admin client create/update akışları `purchasedServices` payload’ını kabul edecek şekilde genişletildi; boş veya duplicate service setleri fail-closed doğrulanıyor.
- Client read/detail/summary ve auth profile (`/auth/me`) yanıtlarına purchased services bilgisi eklendi.
- Client Portal service selection artık yalnızca kullanıcının `ACTIVE` purchased services setini gösteriyor.
- localStorage restore edilen `selectedService` artık authorization-aware doğrulanıyor; yetkisiz service otomatik temizlenip service selection’a dönülüyor.

Reason:
Ürün akışında “müşterinin satın almadığı hizmete erişim” riskini hem backend veri modeli hem frontend UX seviyesinde kapatmak ve service bazlı operasyon akışlarını güvenli hale getirmek.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql`
- `server/prisma/seed.ts`
- `server/src/admin-clients/*`
- `server/src/clients/clients.service.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/types/auth-response.type.ts`
- `clientPanel/src/app/App.tsx`
- `clientPanel/src/app/pages/service-selection.tsx`
- `clientPanel/src/app/features/auth/authTypes.ts`
- `clientPanel/src/app/features/auth/authApi.ts`
- `clientPanel/src/app/features/auth/authNormalizers.ts`
- `clientPanel/src/app/__tests__/client-portal.test.tsx`

---

## 2026-04-30 - Project and Task Picker UX

Context:
Project ve task create/edit akışlarında manuel ID girişi (clientProfileId / assigneeUserId) hem hata üretmeye açıktı hem de operasyonel UX’i zayıflatıyordu.

Decision:
- Projects create/edit akışında manuel client ID input’u yerine backend aramalı müşteri picker kullanıldı.
- Project tarafında `serviceKey` seçimi eklendi ve seçili müşteriyle uyumlu purchased services kümesine bağlandı.
- Tasks create/edit akışında manuel assignee ID input’u yerine backend aramalı employee picker kullanıldı.
- Picker aramaları debounced query paramlarıyla (`275ms`) mevcut RTK Query pattern’i üzerinden taşındı.

Reason:
Admin operasyonunda ID-copy/paste kaynaklı hataları azaltmak, form doğruluğunu artırmak ve product akışını müşteri/hizmet/çalışan ilişkisiyle tutarlı hale getirmek.

Affected files:
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/__tests__/Projects.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Tasks.test.tsx`
- `server/src/projects/dto/create-project.dto.ts`
- `server/src/projects/dto/update-project.dto.ts`
- `server/src/projects/projects.service.ts`

---

## 2026-04-30 - Task Todo Checklist and Client Progress Visibility

Context:
Task operasyonunda checklist/todo eksikti; employee ilerleme güncellemesi ve client tarafında görünür progress ihtiyacı karşılanmıyordu.

Decision:
- Backend’e `TaskTodo` modeli (visibility + completion + sortOrder) eklendi.
- Task API’ye todo yönetimi endpointleri eklendi:
  - `POST /api/v1/tasks/:id/todos`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId`
  - `PATCH /api/v1/tasks/:taskId/todos/:todoId/toggle`
  - `DELETE /api/v1/tasks/:taskId/todos/:todoId`
- Completion hesapları task yanıtına entegre edildi; client kullanıcılar için yalnızca `CLIENT_VISIBLE` todo’lar döndürülüyor.
- Employee, own-assigned task için todo toggle yapabiliyor; client kullanıcılar todo mutation yapamıyor.
- Admin/Employee/Client panellerinde todo/progress görünümü ve mutation akışları mevcut role sınırlarıyla entegre edildi.

Reason:
Teslimatın operasyonel takibini ölçülebilir hale getirmek, employee execution akışını hızlandırmak ve client’e kontrollü ilerleme şeffaflığı sağlamak.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260501000000_add_purchased_services_and_task_todos/migration.sql`
- `server/prisma/seed.ts`
- `server/src/tasks/tasks.controller.ts`
- `server/src/tasks/tasks.service.ts`
- `server/src/tasks/dto/create-task-todo.dto.ts`
- `server/src/tasks/dto/update-task-todo.dto.ts`
- `server/src/tasks/dto/toggle-task-todo.dto.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `clientPanel/src/app/components/client-visible-tasks-section.tsx`
- `clientPanel/src/app/features/tasks/*`

---

## 2026-05-01 - Clients Quick Employee Assignment Entry

Context:
Admin kullanıcılar müşteri satırında hızlıca çalışan ataması başlatmak istiyordu; mevcut akışta yalnızca ayrı `Çalışan Atamaları` ekranına gidip işlem yapmak gerekiyordu.

Decision:
- `Clients` listesinde her müşteri satırına `Çalışan Ata` aksiyonu eklendi.
- Bu aksiyon, ilgili müşteri için scope + employee seçimi alan küçük bir modal açıyor.
- Employee adayları mevcut admin users endpointinden (`accountType=EMPLOYEE`, `isActive=true`) searchable picker ile getiriliyor.
- Oluşturma işlemi doğrudan `POST /api/v1/admin/assignments` ile yapılıyor.
- Permission-aware UX korundu:
  - `assignments.manage` yoksa aksiyon disabled.
  - `users.manage` yoksa employee picker kullanılabilir değil.

Reason:
Müşteri operasyonunda assignment adımını kısaltmak, admin panelde context switch ihtiyacını azaltmak ve atama hızını artırmak.

Affected files:
- `adminandemployeePanel/src/app/pages/Clients.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/Clients.test.tsx`

---

## 2026-05-01 - Employee Task Scope Visibility and Todo Toggle Alignment

Context:
`Gorevlerim` sayfası frontend tarafında `assigneeUserId=currentUser.id` filtresi gönderdiği için assignment scope içindeki ancak kullanıcıya doğrudan atanmamış görevler görünmüyordu. Ek olarak todo toggle kontrolü backend’de yalnızca own-assigned görevlerde çalışıyordu.

Decision:
- Employee `Gorevlerim` query’sinden zorunlu `assigneeUserId` filtresi kaldırıldı; görev görünürlüğü backend assignment-scope kuralına bırakıldı.
- Backend `toggle task todo` yetkisi own-assigned kısıtından assignment-scope kuralına hizalandı.
- Scope dışı todo toggle davranışı safe `404` olarak korundu.
- Employee task **status update** kuralı değişmedi: status mutation hâlâ own-assigned task sınırında.

Reason:
Listeleme, görüntüleme ve todo toggle davranışını aynı authorization modelinde (assignment scope) tutarlı hale getirmek; frontend filtre kaynaklı yanlış-negatif görev görünmezliğini kaldırmak.

Affected files:
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/Gorevlerim.test.tsx`
- `server/src/tasks/tasks.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`

---

## 2026-05-02 - CRM Lead Management and CRM Specialist Module

Context:
Social Tech operasyon panelinde satış/CRM lead takibi ayrı bir domain olarak yoktu. Admin’in manuel lead oluşturması, CRM çalışanına ataması, timeline/takip yönetmesi ve satış başarılı olduğunda lead’i müşteri kaydına dönüştürmesi gerekiyordu.

Decision:
- Backend’e `CRM_SPECIALIST` employee rolü ve CRM permission seti eklendi.
- Prisma schema’ya `CrmLead`, `CrmLeadActivity` modelleri ve CRM enumları eklendi.
- Admin CRM API’si admin-only + permission protected olarak eklendi.
- Employee CRM API’si yalnızca `CRM_SPECIALIST` çalışanların kendilerine atanmış leadleri görüp güncelleyebileceği şekilde eklendi.
- Convert işlemi sadece admin tarafında çalışır; lead `WON` olur ve yeni `ClientProfile` oluşturulur.
- CRM çalışanı lead create/convert/owner değişimi yapamaz; status sınırı `CONTACTED`, `FOLLOW_UP`, `QUALIFIED`, `LOST` ile kısıtlandı.
- Admin/Employee panelde RTK Query CRM feature’ı, admin CRM ekranları ve CRM specialist employee ekranları eklendi.

Reason:
Satış operasyonunu mevcut NestJS + Prisma + RBAC mimarisine bağlı, assignment-safe ve audit-log uyumlu bir V1 domain olarak başlatmak; public website form entegrasyonu ve otomasyonları sonraki fazlara bırakmak.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260502000000_add_crm_leads/migration.sql`
- `server/prisma/seed.ts`
- `server/src/crm/*`
- `server/src/audit-log/audit-log.service.ts`
- `server/test/crm-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/crm/*`
- `adminandemployeePanel/src/app/pages/CrmLeads.tsx`
- `adminandemployeePanel/src/app/pages/CrmLeadDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/CrmLeadlerim.tsx`
- `adminandemployeePanel/src/app/employee/pages/CrmLeadDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/BugunkuTakipler.tsx`

---

## 2026-05-02 - Public Website Contact Form to CRM Lead Integration

Context:
CRM V1 manuel admin lead oluşturma ile başlamıştı. Public website iletişim formundaki gerçek başvuruların CRM kuyruğuna düşmesi gerekiyordu.

Decision:
- Public, unauthenticated `POST /api/v1/public/crm/leads` endpointi eklendi.
- Endpoint form payload’ını validate eder, KVKK/iletişim onayı ister ve lead’i `WEBSITE_FORM` source ile oluşturur.
- Lead aktif `CRM_SPECIALIST` çalışana otomatik atanır.
- Public response minimum tutulur (`id`, `status`) ve CRM owner/user detayları dışarı verilmez.
- Website formu backend endpointine bağlandı; submit/loading/success/error ve basit frontend validation eklendi.
- Public site CORS origin’i `CLIENT_ORIGIN_PUBLIC` olarak konfigüre edildi.

Reason:
Satış hattına gerçek public website başvurularını kontrollü şekilde almak, CRM timeline/audit akışını bozmadan lead kaynağını ayrıştırmak ve sonraki reminder/automation fazına zemin hazırlamak.

Affected files:
- `server/src/crm/public-crm-leads.controller.ts`
- `server/src/crm/dto/create-public-crm-lead.dto.ts`
- `server/src/crm/crm-leads.service.ts`
- `server/src/config/cors.config.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/crm-authz.e2e-spec.ts`
- `client/src/app/components/contact/sections/FormSection.tsx`

---

## 2026-05-03 - CRM Lead Scan Stays Backend-Native Inside `server/`

Context:
The repository already had an in-progress `server/src/crm-lead-scan/` module and extended CRM lead schema for scan-derived outreach data, but shared memory did not reflect it and backend hardening around env validation, migration coverage, permissions, and automated tests was still incomplete.

Decision:
- Keep the feature backend-native under `server/` and reuse the current NestJS + Prisma CRM structure.
- Use SerpAPI Google Maps only as the lead acquisition source.
- Enforce daily free-plan safety via DB-tracked scan logs and env-capped limits (`LEAD_SCAN_DAILY_QUERY_LIMIT`, default `5`, max `6`).
- Run duplicate detection before website analysis and AI scoring.
- Store Turkish-only outreach drafts and related scan metadata directly on created CRM leads.

Reason:
This preserves a single backend enforcement point for quota, duplication, auditability, and resilience without introducing n8n or a separate automation runtime.

Affected files:
- `server/prisma/migrations/20260503000000_add_crm_lead_scan_engine/migration.sql`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/src/crm-lead-scan/*`
- `server/src/crm/crm.module.ts`
- `server/src/crm/crm-leads.service.ts`
- `server/test/crm-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/crm/*`
- `adminandemployeePanel/src/app/pages/CrmLeads.tsx`
- `adminandemployeePanel/src/app/pages/CrmLeadDetail.tsx`

---

## 2026-05-03 - CRM Lead Scoring Provider Switched From OpenAI To Gemini

Context:
The CRM lead scan scoring layer was wired to OpenAI-style chat completions, but the product requirement changed to use Gemini as the LLM provider while preserving the existing NestJS lead scan architecture and heuristic fallback path.

Decision:
- Keep the same `LeadScoringService` boundary and scoring contract.
- Switch provider-specific env/config from `OPENAI_*` to `GEMINI_*`.
- Use Gemini REST `models/{model}:generateContent` with structured JSON output for lead scoring.
- Preserve heuristic fallback when `GEMINI_API_KEY` is missing or the Gemini response cannot be parsed safely.

Reason:
This keeps the implementation modular and minimally invasive while satisfying the provider change without introducing a new architecture or rewriting the CRM scan flow.

Affected files:
- `server/src/crm-lead-scan/lead-scoring.service.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/test/crm-authz.e2e-spec.ts`
- `REPO_MAP.md`

---

## 2026-05-03 - Delivery Task Taxonomy

Context:
Developer/Delivery operations needed backend-native task classification for frontend work, backend/API work, bugs, revisions, QA, deployment, severity, and target environment without splitting work into separate models.

Decision:
Extended the existing `Task` model with delivery taxonomy fields:
- `type`
- `workstream`
- `severity`
- `environment`
- `affectedUrl`
- `reproductionSteps`
- `reportedBy`
- `code`
- `sprintId`

Reason:
Preserves the current `Project -> Task -> TaskTodo` architecture, keeps filtering/reporting centralized, and avoids duplicating workflow logic across multiple task-like entities.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/tasks/*`
- `adminandemployeePanel/src/app/features/tasks/*`
- `adminandemployeePanel/src/app/pages/Tasks.tsx`
- `adminandemployeePanel/src/app/employee/pages/Frontend.tsx`
- `adminandemployeePanel/src/app/employee/pages/BackendAPI.tsx`
- `adminandemployeePanel/src/app/employee/pages/Buglar.tsx`
- `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`

---

## 2026-05-03 - Delivery Sprint and Release System

Context:
Developer Sprintler and Test & Yayın pages were still mock/static and there was no backend-native sprint or release tracking model.

Decision:
Added dedicated `DeliverySprint` and `DeliveryRelease` entities plus a `delivery` backend module, while keeping both linked to the existing project/task backbone.

Reason:
Sprints and releases represent planning and operational lifecycle layers above tasks, so they benefit from explicit persistence and API contracts without replacing the current project/task structure.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/delivery/*`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/employee/pages/Sprintler.tsx`
- `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`

---

## 2026-05-03 - Project GitHub Repository Integration

Context:
Project delivery teams needed repository visibility inside the existing admin/employee panel, but the system had no project-scoped repository persistence or GitHub integration.

Decision:
Added a `ProjectRepository` model with encrypted token storage and project-scoped GitHub REST reads for branches, commits, pull requests, and workflow runs. V1 uses encrypted PAT storage and defers GitHub App installation flow to a later milestone.

Reason:
Delivers operational repository visibility quickly while keeping secrets out of plaintext storage and API responses, and avoids introducing webhook/app-installation complexity in the current milestone.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503120000_add_delivery_and_github_systems/migration.sql`
- `server/src/integrations/github/*`
- `server/src/app.module.ts`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Projeler.tsx`

---

## 2026-05-03 - Developer Dashboard Summary Integration

Context:
The developer dashboard still relied on inline/mock content and did not reflect assigned-scope task load, critical bugs, sprint progress, release queue, or repository activity.

Decision:
Added `GET /api/v1/delivery/summary` as the backend-native summary endpoint and migrated the developer dashboard to consume it via RTK Query.

Reason:
Provides a single assigned-scope source of truth for developer KPIs and keeps aggregation logic in the backend instead of duplicating it across multiple frontend screens.

Affected files:
- `server/src/delivery/*`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/employee/dashboards/DeveloperDashboard.tsx`

---

## 2026-05-03 - Project Delivery Links And Developer Execution Notes

Context:
Delivery teams needed stronger project-level source links and developers needed a backend-native place to record what was done on assigned tasks without exposing GitHub secrets or forcing client-facing visibility.

Decision:
Added business-level `repositoryUrl` and `figmaProjectUrl` fields on `Project`, made the repository link mandatory for `WEB_APP` and `MOBILE_APP` projects, and added task-level work notes plus code-preparation metadata (`branchName`, preparation notes, prepared-by timestamps) to support execution logging and GitHub follow-up.

Reason:
Keeps canonical delivery references on the project entity, gives designers a first-class Figma link, and lets developers document work inside the existing task model instead of using disconnected notes or mock UI state.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503153000_add_project_figma_task_notes_release_approval/migration.sql`
- `server/src/projects/*`
- `server/src/tasks/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/features/tasks/*`

---

## 2026-05-05 - Project Manager Assigned Operations Management

Context:
Project manager paneli müşteri/hizmet/workspace görünürlüğü sağlıyordu ancak operasyonel create/update akışlarında backend ve UI kısıtları nedeniyle pratikte read-only kalıyordu.

Decision:
PM rolü için assigned-scope yönetim modeli güçlendirildi:
- Project create/update admin-only kuralı kaldırılarak `projects.manage.assigned` + assignment scope ile PM’e açıldı.
- Task create/update/assignee/todo yönetimi `tasks.manage.assigned`, `tasks.assign.assigned`, `tasks.todos.manage.assigned` ile PM assigned scope’a açıldı.
- PM workspace aksiyon merkezi üzerinden görev/sprint/release oluşturma, todo toggle ve internal/public message reply akışları eklendi.
- Project-assignee candidates endpointi (`GET /projects/:id/assignee-candidates`) eklendi.

Reason:
PM’in kendi atanmış müşteri/proje scope’u içinde gerçek operasyon yönetebilmesini sağlarken global admin yetkilerini korumak.

Affected files:
- `server/prisma/seed.ts`
- `server/src/projects/projects.controller.ts`
- `server/src/projects/projects.service.ts`
- `server/src/tasks/tasks.controller.ts`
- `server/src/tasks/tasks.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `adminandemployeePanel/src/app/features/projects/projectsTypes.ts`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerClientDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/pages/Projects.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `adminandemployeePanel/src/app/pages/TaskDetail.tsx`
- `adminandemployeePanel/src/app/employee/pages/Gorevlerim.tsx`

---

## 2026-05-03 - Release Approval And GitHub App Preparation

Context:
The delivery release lifecycle needed explicit approval tracking, and GitHub integration needed a safe path toward GitHub App based installation without pretending a full OAuth/install flow already existed.

Decision:
Extended `DeliveryRelease` with explicit approval state fields and expanded project-manager assigned-scope release management. Also added `installationId` plumbing to the project repository connect flow as GitHub App preparation, while keeping PAT-based encrypted storage as the current active V1 authentication path.

Reason:
Approval state is part of real delivery operations and belongs in the release model. Separating installation preparation from the actual installation flow keeps the roadmap honest while still reducing future migration effort.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503153000_add_project_figma_task_notes_release_approval/migration.sql`
- `server/src/delivery/*`
- `server/src/integrations/github/*`
- `server/prisma/seed.ts`
- `server/test/delivery-github-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/delivery/*`
- `adminandemployeePanel/src/app/features/projects/*`
- `adminandemployeePanel/src/app/employee/pages/TestYayin.tsx`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`

---

## 2026-05-03 - Project Files Cloudinary V1

Context:
`Dosyalar` and `Teslim Dosyaları` screens were static/mock and there was no backend-native file sharing model across admin/employee/client scopes.

Decision:
Introduced backend-native project files with Cloudinary signed upload flow, metadata persistence, role/scope visibility, and expiring share link tokens. V1 uses Cloudinary public delivery URLs with app-level visibility controls and supports upload mode selection (new version vs overwrite).

Reason:
This delivers real operational file sharing quickly while preserving RBAC/project scope constraints and avoids blocking on heavier storage orchestration work.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260503190000_add_project_files_cloudinary/migration.sql`
- `server/src/project-files/*`
- `server/src/integrations/cloudinary/*`
- `server/src/config/env.validation.ts`
- `server/.env.example`
- `server/prisma/seed.ts`
- `adminandemployeePanel/src/app/employee/pages/Dosyalar.tsx`
- `adminandemployeePanel/src/app/employee/pages/TeslimDosyalari.tsx`
- `adminandemployeePanel/src/app/features/projects/projectsApi.ts`
- `clientPanel/src/app/features/projectFiles/*`
- `clientPanel/src/app/pages/service-tab-page.tsx`

---

## 2026-05-05 - Web APP Workspace Realtime Snapshot + Sequence Contract

Context:
Web APP workspace live updates were available, but some screens still relied on broad refetch patterns and could be exposed to out-of-order websocket deliveries.

Decision:
Extended `workspace:update` events to carry entity snapshots for create/update events (`message`, `revision`, `meeting-request`, `section`, `content-item`, `weekly-report`) and added monotonic `sequence` metadata next to `emittedAt`.

Admin/Employee and Client panel listeners now use:
- RTK Query `updateQueryData` incremental patching for covered events
- local `lastSequence` guards to drop stale/out-of-order events
- minimal fallback behavior only outside covered snapshot events

Reason:
Improves perceived realtime speed, reduces unnecessary API churn, and prevents stale event overwrite regressions in collaborative workspace screens.

Affected files:
- `server/src/web-app-workspace/web-app-workspace.gateway.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `adminandemployeePanel/src/app/features/projects/workspaceSocket.ts`
- `adminandemployeePanel/src/app/pages/ProjectDetail.tsx`
- `clientPanel/src/app/features/webAppWorkspace/workspaceSocket.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/meetings.tsx`
- `clientPanel/src/app/pages/reports.tsx`

---

## 2026-05-06 - Revisions Tab Hybrid Lifecycle (WEB_APP Workspace + Non-WEB Task)

Context:
`Revizyonlar` akışı panellerde kısmi ve tutarsızdı. WEB_APP tarafında workspace revision lifecycle vardı, diğer servislerde ise `Task(type=REVISION)` modeli kullanılıyordu; client approve/reject ve PM transition UI tarafında üretim davranışı tam değildi.

Decision:
Hibrit model kesinleştirildi:
- WEB_APP revizyonları `WebAppWorkspaceRevision` lifecycle üzerinden yönetilir.
- Non-WEB servis revizyonları `Task(type=REVISION)` ile listelenir.
- Client yetkisi: create + `READY_FOR_REVIEW -> APPROVED|REJECTED` ve `REQUESTED -> CANCELLED`.
- PM/employee transition matrix backend tarafından actor-aware doğrulanır; geçersiz geçişler tutarlı `400` döner.
- Realtime contract korunur (`workspace:update`, `revision.created`, `revision.updated`) ve frontend cache patch akışı incremental devam eder.

Reason:
Tek bir “revizyon” UX’i sunarken, mevcut domain modelini bozmadan WEB_APP workspace lifecycle ile diğer servis task lifecycle’ını aynı sekmede güvenli şekilde birleştirmek.

Affected files:
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `server/test/web-app-workspace-revisions-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/employee/pages/Revizyonlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/ProjectManagerServiceWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/DeveloperTaskPages.test.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/ProjectManagerServiceWorkspace.test.tsx`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.webapp.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 0 Discovery Contract (Read-First V1)

Context:
Meta Ads entegrasyonu roadmap’te planlıydı ancak implementation öncesi scope, permission, token ve erişim modeli netleşmeden backend/frontend geliştirmeye geçmek regresyon ve tekrar iş riski oluşturuyordu.

Decision:
`docs/meta-ads-phases/00-meta-ads-discovery-contract.md` dosyasında Faz 0 tamamlandı ve V1 teknik contract sabitlendi.

- V1 kapsamı read-first (reporting + visibility), campaign mutation akışları Faz 2+.
- Minimum permission set `ads_read`; `ads_management` ve `business_management` staged.
- Auth/token yaklaşımı V1 için Facebook Login for Business + backend-side exchange + encrypted storage; V2’de system user token yönü.
- Role-scope matrisi mevcut repo RBAC ile hizalı şekilde belirlendi.
- Faz 1’e geçiş için go/no-go checklist tamamlandı.

Reason:
Kod geliştirmesi başlamadan sınırları netleştirmek, yanlış permission/tier varsayımlarını erken kapatmak ve backend DTO/service contract’ını tek bir referans dokümandan yönetmek.

Affected files:
- `docs/meta-ads-phases/00-meta-ads-discovery-contract.md`

---

## 2026-05-09 - Meta Ads Faz 1 Backend Foundation (Config + Authz Endpoints)

Context:
Meta Ads Faz 0’da V1 read-first contract netleştirildikten sonra, frontend entegrasyonundan önce backend tarafında müşteri-bazlı config modeli, güvenli credential ayrımı ve authz kontrollü API temelinin tamamlanması gerekiyordu.

Decision:
Meta Ads backend foundation aşağıdaki sınırla tamamlandı:

- Prisma’ya `MetaAdsConnectionStatus`, `ClientMetaAdsConfig`, `ClientMetaAdsCredential` eklendi.
- Config ve credential, `ClientProfile` ile 1:1 ilişkide ayrık tutuldu.
- `server/src/meta-ads/*` modülü eklendi:
  - `GET /api/v1/admin/clients/:clientId/meta-ads/config`
  - `PATCH /api/v1/admin/clients/:clientId/meta-ads/config`
  - `GET /api/v1/meta-ads/clients/:clientId/config` (assigned employee read)
  - `GET /api/v1/clients/me/meta-ads/config`
- Permission seti ve role mapping’e `metaAds.config.*` slugları eklendi.
- PATCH akışında `META_ADS` purchased service `ACTIVE` değilse update fail-closed (`400`) davranışı benimsendi.
- Response contract summary-only tutuldu; credential/token alanları API response’a hiç dahil edilmedi.

Reason:
Bu yaklaşım, Faz 2 token/auth bağlantı işlerine geçmeden önce veri modeli + erişim sınırları + endpoint kontratını güvenli ve test edilebilir şekilde sabitleyerek entegrasyon riskini düşürür.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509123000_add_client_meta_ads_foundation/migration.sql`
- `server/prisma/seed.ts`
- `server/src/meta-ads/*`
- `server/src/app.module.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`

---

## 2026-05-09 - Meta Ads Faz 3 Reporting Sync (Snapshot + Read API)

Context:
Meta Ads Faz 2 ile bağlantı/token yönetimi tamamlandıktan sonra, client ve operasyon panellerinde gerçek performans verisi göstermek için read-only reporting katmanının snapshot tabanlı şekilde eklenmesi gerekiyordu.

Decision:
Faz 3 aşağıdaki sınırla uygulandı:

- Prisma’ya `MetaAdsInsightLevel` enumu ve `MetaAdsDailyInsight` modeli eklendi.
- Manual reporting sync endpointleri eklendi:
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync`
  - `POST /api/v1/meta-ads/clients/:clientId/sync`
- Snapshot okuma endpointleri eklendi:
  - Admin: `GET /api/v1/admin/clients/:clientId/meta-ads/{summary|campaigns|insights}`
  - Assigned employee: `GET /api/v1/meta-ads/clients/:clientId/{summary|campaigns|insights}`
  - Own client: `GET /api/v1/clients/me/meta-ads/{summary|campaigns|insights}`
- Sync akışında Meta API response’u normalize edilip günlük snapshot’lar DB’ye yazılır; hata halinde connection `ERROR` + `syncError` güncellenir.
- Client panel `meta-ads-dashboard` KPI ve campaign alanları gerçek summary/campaigns endpointlerinden beslenir; bağlantı durumuna göre fail-safe görünüm korunur.
- Admin `ClientDetail` içinde minimal Meta Ads performans özeti gösterimi eklendi.

Reason:
Snapshot-first yaklaşımı, canlı API çağrılarını her ekran yüklemesinden ayırarak rate-limit riskini azaltır, sorgu sürelerini öngörülebilir hale getirir ve Faz 4+ raporlama/genişletme adımları için kalıcı veri tabanı oluşturur.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509150000_add_meta_ads_reporting_snapshot/migration.sql`
- `server/src/meta-ads/*`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/*`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `adminandemployeePanel/src/app/features/clients/*`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 4 Client Panel (API-Driven Tab Workspace)

Context:
Faz 3 sonrası client panelde Meta Ads dashboard kısmi API entegrasyonuna geçmişti ancak service-tab alanındaki Meta Ads sekmeleri hâlâ generic/mock renderer akışıyla çalışıyordu. Ayrıca adset/ads/pixel-status gibi panel sekmeleri için dedicated backend endpoint yüzeyi eksikti.

Decision:
Faz 4 için client panel Meta Ads sekmeleri API-driven özel renderer’a taşındı ve backend reporting yüzeyi genişletildi.

- Client panelde `serviceId === "meta-ads"` için özel sekme renderer kullanıldı:
  - `campaigns`, `ad-sets`, `creatives`, `audiences`, `pixel-events`, `meta-reports`, `agency-notes`, `approvals`
  - loading/error/empty/connection-missing durumları fail-safe şekilde eklendi
  - mock fallback yerine API sonuçlarına dayalı görünüm benimsendi
- RTK Query Meta Ads feature genişletildi:
  - own `adsets`, `ads`, `insights`, `pixel-status` endpointleri bağlandı
- Backend Meta Ads API genişletildi:
  - own/assigned/admin scope için `adsets`, `ads`, `pixel-status` endpointleri eklendi
  - reporting sync akışı `ADSET` ve `AD` insight level snapshot yazacak şekilde genişletildi
- Meta Ads sidebar sekme yapısı Faz 4 dokümanına hizalanarak reports/notes/approvals akışı eklendi.

Reason:
Bu karar, client panelde Meta Ads operasyon görünürlüğünü generic mock katmandan çıkarıp doğrudan backend contract’a bağlayarak sürdürülebilirliği artırır, UI davranışını connection/reporting gerçekliğine hizalar ve Faz 5/6 admin-employee genişlemeleri için ortak endpoint yüzeyi oluşturur.

Affected files:
- `server/src/meta-ads/meta-ads-api.service.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/components/sidebar.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 5 Admin Global Panel + Yönetim Aksiyonları

Context:
Faz 4 sonrası Meta Ads operasyonları client panelde API-driven hale geldi ancak admin tarafında tüm Meta Ads müşterilerini tek yerden yönetebileceği global ekran ve özet endpoint eksikti.

Decision:
Faz 5 kapsamında admin global yönetim yüzeyi eklendi:

- Backend’e `GET /api/v1/admin/meta-ads/clients` endpointi eklendi.
  - `META_ADS` purchased service’i olan client profilleri döner.
  - connection status, token varlığı, sync error/last sync, spend summary, pending approvals ve assigned employees özetlenir.
  - response hiçbir credential/token alanı içermez.
- Admin panelde `/meta-ads` route/page eklendi.
  - Global müşteri listesi, durum KPI’ları ve permission-aware aksiyonlar (`config`, `test`, `sync`, `disconnect`, `onay talebi`) sunulur.
- `ClientDetail` Meta Ads section’a manual sync aksiyonu eklendi.
- Onay talebi aksiyonu V1’de mevcut domain sınırını bozmadan `Task(type=REVISION, status=REVIEW)` oluşturma akışıyla sağlandı.

Reason:
Bu karar, admin operasyonlarının müşteri-bazlı tekil ekranlardan çıkarılıp global gözlem ve müdahale ekranına taşınmasını sağlar; mevcut `tasks` ve `meta-ads` API sınırlarını koruyarak minimum invaziv ilerler.

Affected files:
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/ClientDetail.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/ClientDetail.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 6 Employee Workspace (Generic Component + Assigned Scope)

Context:
Faz 5 sonrası Meta Ads akışı admin/client panellerde çalışıyordu ancak employee panelde Social Media Specialist, Performance Specialist ve Designer için assigned-scope operasyon ekranı ve ortak bileşen katmanı yoktu.

Decision:
Employee panelde generic `MetaAdsWorkspace` bileşeni benimsendi ve ilgili rol menülerine `/employee/meta-ads` giriş noktası eklendi.

- Tek component (`MetaAdsWorkspace`) ile role-aware görünüm:
  - social: campaign/copy/approval/messages odaklı aksiyonlar
  - performance: metrics/optimization/reporting odaklı aksiyonlar
  - designer: creative/upload/share/todo odaklı aksiyonlar
- Data scope frontend tarafında sıkı filtrelendi:
  - sadece assigned clients
  - sadece `ACTIVE META_ADS` purchased service
  - sadece `serviceKey=meta-ads` project context
- Assigned Meta Ads reporting endpointleri için admin/employee panelde ayrı RTK Query feature eklendi (`features/metaAds/*`).
- Mevcut employee Meta Ads sayfaları (`Kampanyalar`, `Optimizasyonlar`, `PixelTracking`, `RaporNotlari`, `Kreatifler`, `OnayBekleyenler`) generic workspace’e bağlandı.
- Permission-aware UX eklendi; izin olmayan aksiyonlar disabled/uyarı ile gösteriliyor.

Reason:
Bu karar faz kapsamını minimum invaziv biçimde ilerletir: farklı rol sayfaları için tekrar eden kod yerine tek bir bakım noktası sağlar, backend assigned-scope sözleşmesini doğrudan kullanır ve ileride rol aksiyonlarını genişletmeyi kolaylaştırır.

Affected files:
- `adminandemployeePanel/src/app/features/metaAds/metaAdsApi.ts`
- `adminandemployeePanel/src/app/features/metaAds/metaAdsTypes.ts`
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/MetaAdsCalismaAlani.tsx`
- `adminandemployeePanel/src/app/employee/pages/Kampanyalar.tsx`
- `adminandemployeePanel/src/app/employee/pages/Optimizasyonlar.tsx`
- `adminandemployeePanel/src/app/employee/pages/PixelTracking.tsx`
- `adminandemployeePanel/src/app/employee/pages/RaporNotlari.tsx`
- `adminandemployeePanel/src/app/employee/pages/Kreatifler.tsx`
- `adminandemployeePanel/src/app/employee/pages/OnayBekleyenler.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/MetaAdsWorkspace.test.tsx`

---

## 2026-05-09 - Meta Ads Faz 7 Approval + Creative Collaboration (Task-Centric V1)

Context:
Faz 6 sonrası employee/admin/client taraflarında Meta Ads workspace görünürlüğü vardı ancak approval aksiyonları client panelde kalıcı değildi (`runClientAction` local feedback), creative approval metadata’sı `ProjectFile` modelinde taşınmıyordu ve task bazlı approval lifecycle backend’de standart alanlarla temsil edilmiyordu.

Decision:
FAZ-07 için ayrı bir `ApprovalRequest` modülü açmadan, mevcut domain’i bozmadan task-merkezli V1 uygulandı:
- `Task` modeline Meta Ads approval alanları eklendi (`approvalRequired`, `approvalType`, `approvalStatus`, `approvalResponseNote`, request/response timestamps, creative reference).
- Client kullanıcılar için `PATCH /tasks/:id` içinde daraltılmış approval-response akışı açıldı:
  - sadece `approvals.respond.own` ile,
  - sadece own client scope + `META_ADS` project + `approvalRequired=true` + `approvalStatus=PENDING`,
  - sadece `APPROVED | CHANGES_REQUESTED | REJECTED | ACKNOWLEDGED`.
- `ProjectFile` modeline creative approval metadata alanları eklendi (approval flags/status/note + campaign/adset/ad refs + performance summary).
- Client panel Meta Ads approvals sekmesi backend mutation’a bağlandı; pending approvals, creative preview ve approval history tek ekranda render edildi.
- Employee Meta Ads workspace approvals listesi approval type/status/note alanlarını gösterecek şekilde genişletildi.

Reason:
Bu yaklaşım mevcut `Task` + `ProjectFile` domainleriyle uyumlu, minimum invaziv ve hızlı deploy edilebilir bir approval lifecycle sağlar. Ayrı approval modülü için schema/service parçalanması, migration bağımlılığı ve yüksek entegrasyon riski yerine Faz 7 hedeflerini karşılayan pragmatik bir V1 elde edildi.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260509193000_add_meta_ads_approval_flow/migration.sql`
- `server/src/tasks/dto/*`
- `server/src/tasks/tasks.service.ts`
- `server/src/project-files/dto/*`
- `server/src/project-files/project-files.service.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `clientPanel/src/app/features/tasks/*`
- `clientPanel/src/app/features/projectFiles/*`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `clientPanel/src/app/components/button.tsx`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
- `ROAD_MAP.md`

---

## 2026-05-10 - Meta Ads Faz 8 Sync Automation Hardening (Observability + Safe States)

Context:
Faz 7 sonrası approval/creative akışı üretime yakın hale geldi ancak sync operasyonları için merkezi log görünürlüğü, normalize hata sınıflandırması ve client-side güvenli hata sunumu sınırlıydı. Ayrıca dashboard refresh tetiklerinde TTL-safe koruma ve admin retry görünürlüğü eksikti.

Decision:
Faz 8 kapsamında sync pipeline gözlemlenebilir ve güvenli hale getirildi:

- Prisma’ya `MetaAdsSyncLog` modeli ve `MetaAdsSyncStatus` enumu eklendi (`RUNNING | SUCCESS | FAILED | PARTIAL | SKIPPED`).
- Sync lifecycle başlangıçta log açacak, akış sonunda sonuç + hata + metrik (records/apiCallCount/duration) yazacak şekilde standardize edildi.
- Sync trigger sınıfları netleştirildi (`MANUAL_SYNC`, `ON_DEMAND_CLIENT`, `ON_DEMAND_ASSIGNED`, `ERROR_RETRY`) ve TTL kontrollü skip davranışı eklendi (`META_ADS_SYNC_TTL_MINUTES`, default `30`).
- Error normalize helper’ı aşağıdaki operasyon kodlarını üretir:
  - `TOKEN_EXPIRED`
  - `PERMISSION_MISSING`
  - `AD_ACCOUNT_UNAVAILABLE`
  - `RATE_LIMIT`
  - `BUSINESS_ACCESS_REVOKED`
  - `UNKNOWN_API_ERROR`
- Admin için sync observability endpointleri eklendi:
  - `GET /api/v1/admin/meta-ads/sync-logs`
  - `POST /api/v1/admin/clients/:clientId/meta-ads/sync/retry`
- Client için own refresh endpointi eklendi:
  - `POST /api/v1/clients/me/meta-ads/sync`
- Client-safe error policy uygulandı: client pixel-status ve dashboard katmanında teknik detay maskelenir; admin/assigned rollerde operasyonel detay korunur.
- Admin `/meta-ads` ekranında failed sync müşteriler, sync logs tablosu, retry aksiyonu ve status özetleri eklendi.
- Client dashboard tarafında “Son güncelleme”, “Veriler hazırlanıyor…”, “Bağlantı problemi var, ekibimiz ilgileniyor” güvenli durumları gösterilir.

Reason:
Bu karar, Meta Ads sync operasyonlarında hem teknik izlenebilirliği artırır hem de client-facing UI’da hata sızıntısını önler. TTL-safe refresh yaklaşımı gereksiz API çağrılarını azaltır, retry/log akışları ise operasyon ekiplerinin müdahale hızını artırır.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260510001000_add_meta_ads_sync_logs/migration.sql`
- `server/src/config/env.validation.ts`
- `server/src/meta-ads/dto/meta-ads-sync-logs-query.dto.ts`
- `server/src/meta-ads/meta-ads.controller.ts`
- `server/src/meta-ads/meta-ads.service.ts`
- `server/test/meta-ads-authz.e2e-spec.ts`
- `server/.env.example`
- `adminandemployeePanel/src/app/features/clients/clientsTypes.ts`
- `adminandemployeePanel/src/app/features/clients/clientsUtils.ts`
- `adminandemployeePanel/src/app/features/clients/clientsApi.ts`
- `adminandemployeePanel/src/app/pages/MetaAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/MetaAdsAdmin.test.tsx`
- `clientPanel/src/app/features/metaAds/metaAdsTypes.ts`
- `clientPanel/src/app/features/metaAds/metaAdsApi.ts`
- `clientPanel/src/app/pages/services/meta-ads-dashboard.tsx`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/meta-ads-dashboard.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.meta-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`
## 2026-05-15 — UI Design Token Normalization & Active Nav Convention Change

**Decision:** Standardize design tokens across all three panels (Admin, Employee, Client Portal) and shift active nav item style from full neon fill to ghost tint.

**Changes:**
- `--destructive`: unified to `#ef4444` (was `#d4183d` in admin, `#ff4444` in client)
- `--border` opacity: unified to `0.08` (was `0.06` in admin)
- `--secondary` / `--muted`: unified to `#202020` (was `#2A2A2A` in client)
- `--font-weight-medium`: unified to `500` (was `600` in client)
- `--card-surface: #1C1C1C` added to admin theme
- Active nav item pattern changed from `bg-[#AAFF01] text-[#131313]` (full solid fill) to `bg-primary/10 text-primary` (ghost tint) — consistent with existing client portal sidebar pattern, user confirmed preference

**Rationale:** Ghost tint active state is visually lighter, aligns all three panels, and matches the pattern the client portal already used. Full-fill was high contrast but inconsistent.

**Affected files:** `adminandemployeePanel/src/styles/theme.css`, `clientPanel/src/styles/theme.css`, `RootLayout.tsx`, `EmployeeLayout.tsx`

## 2026-05-27 - TikTok Ads Faz 5 Admin Global Panel

Context:
TikTok Ads Faz 0-4 ile backend foundation, connection management, reporting sync ve client portal API-driven workspace tamamlandı. Admin tarafında müşteri detay ekranı vardı ancak tüm TikTok Ads müşterilerini tek yerden gözlemleyen ve bağlantı aksiyonlarını çalıştıran global panel yoktu.

Decision:
TikTok Ads Faz 5, Meta Ads Faz 5 pattern'inin daha dar V1 karşılığı olarak uygulanacak:
- Backend `GET /api/v1/admin/tiktok-ads/clients` endpointi eklendi.
- Endpoint yalnızca `tiktokAds.config.read.any` iznine açık.
- Response müşteri, purchased service status, connection status, token varlığı, TikTok account IDs, settings, last sync, sync error, 7 günlük spend/video/conversion summary, pending approval count, assigned employees ve `tiktokAdsProjectId` action context içerir.
- Admin panelde `/tiktok-ads` route/page eklendi.
- Global ekrandan config update, connection test, manual sync ve disconnect aksiyonları çalıştırılır.
- TikTok Faz 5'e rapor draft/publish veya approval collaboration eklenmedi; bunlar Faz 7/9 kapsamına bırakıldı.

Reason:
Bu karar admin operasyonlarını tekil ClientDetail ekranından çıkarıp global TikTok Ads gözlem ve müdahale ekranına taşır. Meta Ads ile yapısal simetri korunurken TikTok V1 kapsamı read-only reporting ve connection operations sınırında tutulur.

Affected files:
- `server/src/tiktok-ads/tiktok-ads.controller.ts`
- `server/src/tiktok-ads/dto/update-tiktok-ads-config.dto.ts`
- `server/src/tiktok-ads/tiktok-ads.service.ts`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `adminandemployeePanel/src/app/pages/TikTokAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TikTokAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/components/RootLayout.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-27 - TikTok Ads Faz 6 Employee Workspace

Context:
TikTok Ads Faz 5 ile admin global panel ve operasyon aksiyonlari tamamlandi. Social Media, Performance ve Designer rollerinin ise atandiklari TikTok Ads musterileri icin tek bir employee workspace uzerinden kampanya, performans, kreatif, rapor notu, onay talebi ve pixel guvenli durumlarini yonetmesi gerekiyordu.

Decision:
TikTok Ads Faz 6, Meta Ads Faz 6 pattern'inin TikTok V1 kapsamli employee karsiligi olarak uygulanacak:
- Employee panelde `/employee/tiktok-ads` route'u ve `TikTokAdsWorkspace` eklendi.
- `SOCIAL_MEDIA_SPECIALIST`, `PERFORMANCE_SPECIALIST` ve `DESIGNER` rolleri icin sidebar girisi role-aware hale getirildi.
- Workspace yalnizca atanmis ve aktif `tiktok-ads` purchased service sahibi musterileri listeler.
- Config, summary, campaigns ve insights okumalarinda `/api/v1/tiktok-ads/clients/:clientId/*` assigned employee endpointleri kullanilir.
- Project/task/workspace-message contract'i `serviceKey === "tiktok-ads"` ile yeniden kullanilir.
- Performance ve pixel sekmeleri yalnizca performance rolune acilir; creative aksiyonlar designer rolune, report/message/onay aksiyonlari ilgili employee izinlerine baglanir.
- TikTok'a ozel approval metadata, rapor draft/publish ve dedicated pixel endpointi eklenmedi. Approval metadata Faz 7, report publish/export Faz 9, pixel endpoint hardening sonraki TikTok fazlarinda ele alinacak.

Reason:
Bu karar employee tarafinda yeni backend yuzeyi acmadan mevcut assigned TikTok read endpointlerini ve genel project/task/message altyapisini kullanarak hizli, dusuk riskli ve permission-aware bir workspace saglar. Meta Ads ile UX ve mimari simetri korunur, TikTok'a ozel is akislari ise sonraki fazlara kontrollu bicimde birakilir.

Affected files:
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/TikTokAdsCalismaAlani.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TikTokAdsWorkspace.test.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-27 - TikTok Ads Faz 7 Approval + Creative Collaboration

Context:
TikTok Ads Faz 6 ile employee workspace tamamlandi. Bir sonraki ihtiyac, employee tarafindan TikTok'a ozel onay taleplerinin dogru metadata ile olusturulmasi, kreatif dosya paylasiminin permission-aware hale gelmesi ve client portal UGC/script sekmesinde bekleyen onaylarin yanitlanabilmesiydi.

Decision:
TikTok Ads Faz 7, Meta Ads approval + creative collaboration pattern'inin TikTok V1 karsiligi olarak uygulanacak:
- Ayrı bir approval request modulu acilmadi; mevcut task-centric approval akisi yeniden kullanildi.
- Mevcut `MetaAdsApprovalType` enum'u TikTok Ads approval type'lariyla genisletildi. Bu isim legacy/shared ad approval enum'u olarak korunacak; mevcut Google Ads genisletmesiyle ayni pattern izlenir.
- Employee approval task creation icin `tiktokAds.approvals.create.assigned`, TikTok kreatif dosya yonetimi icin `tiktokAds.creatives.manage.assigned` permission'lari eklendi.
- Backend task service, assigned employee'lerin TikTok Ads projelerinde platform permission'i ile approval task olusturmasina izin verir.
- Client own approval response akisi `META_ADS` ile birlikte `TIKTOK_ADS` projelerini de destekler.
- Client portal TikTok UGC/script sekmesi bekleyen approval queue, approval history ve creative preview dosyalarini gosterir; approve/revision aksiyonlari mevcut client task approval mutation'ini kullanir.
- Report draft/publish Faz 9'a, sync automation hardening Faz 8'e birakildi.

Reason:
Bu karar TikTok Ads onay/kreatif is akisini mevcut proje, task ve dosya contract'lari uzerinde tutarak dusuk riskli, permission-aware ve Meta Ads ile simetrik bir V1 saglar. Yeni domain modeli acmadan platforma ozel izinler ve approval type'lariyla ayrim netlestirildi.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260527143000_add_tiktok_ads_approval_types/migration.sql`
- `server/prisma/seed.ts`
- `server/src/tasks/tasks.service.ts`
- `server/src/project-files/project-files.service.ts`
- `server/test/projects-tasks-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TikTokAdsWorkspace.test.tsx`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/features/projectFiles/projectFilesTypes.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.tiktok-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-27 - TikTok Ads Faz 8 Sync Automation Hardening

Context:
TikTok Ads Faz 7 ile approval/creative collaboration akışı tamamlandı. Sync tarafında snapshot/log modeli ve TTL-gated own refresh vardı ancak admin log okuma, retry aksiyonu, assigned employee sync ve UI gözlemlenebilirliği eksikti.

Decision:
TikTok Ads Faz 8, Meta Ads Faz 8 pattern'inin TikTok V1 karşılığı olarak uygulanacak:
- Mevcut `TikTokAdsSyncLog` modeli yeniden kullanıldı; yeni sync log modeli veya scheduler yüzeyi açılmadı.
- Admin için `GET /api/v1/admin/tiktok-ads/sync-logs` endpointi eklendi; `clientProfileId`, `status`, `failedOnly` ve `limit` filtreleri desteklenir.
- Admin retry için `POST /api/v1/admin/clients/:clientId/tiktok-ads/sync/retry` endpointi eklendi ve sync trigger `ERROR_RETRY` olarak loglanır.
- Assigned employee için `POST /api/v1/tiktok-ads/clients/:clientId/sync` endpointi eklendi; `ON_DEMAND_ASSIGNED_REFRESH` trigger'ı ve `TIKTOK_ADS_SYNC_TTL_MINUTES` koruması kullanılır.
- `tiktokAds.sync.read.assigned` ve `tiktokAds.sync.run.any` seed permission'ları eklendi; assigned sync okuma/çalıştırma izni Project Manager, Performance Specialist ve Social Media Specialist rollerine verildi.
- Sync hata kataloğu deterministic admin mesajları ve client-safe generic mesajlarla normalize edildi.
- Admin `/tiktok-ads` ekranına failed sync retry aksiyonu ve sync logs tablosu eklendi; employee TikTok workspace'e permission-gated `Sync Çalıştır` aksiyonu eklendi.
- Reporting/export foundation Faz 9'a bırakıldı.

Reason:
Bu karar, yeni cron/scheduler yüzeyi açmadan sync operasyonlarını gözlemlenebilir ve güvenli hale getirir. TTL-safe assigned refresh gereksiz TikTok API çağrılarını azaltır, retry/log görünürlüğü ise operasyon ekibinin müdahalesini hızlandırır.

Affected files:
- `server/prisma/seed.ts`
- `server/src/tiktok-ads/dto/tiktok-ads-sync-logs-query.dto.ts`
- `server/src/tiktok-ads/tiktok-ads.controller.ts`
- `server/src/tiktok-ads/tiktok-ads.service.ts`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `adminandemployeePanel/src/app/pages/TikTokAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TikTokAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TikTokAdsWorkspace.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-27 - TikTok Ads Faz 9 Reporting + Export Foundation

Context:
TikTok Ads Faz 8 ile sync automation hardening tamamlandı. Sıradaki ihtiyaç, TikTok Ads raporlarının task/not akışından ayrı domain entity olarak tutulması, admin/assigned ekip tarafından taslak hazırlanıp yayınlanması ve client panelde yalnızca yayınlanmış/client-visible raporların görünmesiydi.

Decision:
TikTok Ads Faz 9, Meta Ads Faz 9 pattern'inin TikTok V1 karşılığı olarak uygulanacak:
- Yeni `TikTokAdsReport` modeli, report type/status enum'ları, Prisma migration ve seed permission genişletmeleri eklendi.
- Admin için `GET/POST /api/v1/admin/clients/:clientId/tiktok-ads/reports` ve `PATCH /api/v1/admin/tiktok-ads/reports/:reportId` endpointleri eklendi.
- Assigned employee için `GET/POST /api/v1/tiktok-ads/clients/:clientId/reports` ve `PATCH /api/v1/tiktok-ads/reports/:reportId` endpointleri eklendi.
- Own client için `GET /api/v1/clients/me/tiktok-ads/reports` endpointi yalnızca `PUBLISHED + clientVisible` raporları döndürür.
- Publish sırasında opsiyonel acknowledgement task bridge'i mevcut shared ad approval/task altyapısı üzerinden kuruldu (`TIKTOK_ADS_REPORT_ACKNOWLEDGEMENT`).
- Admin global TikTok paneli, employee TikTok workspace'i ve client portal TikTok optimization notes sekmesi report entity akışına bağlandı.
- Faz 9 kapsamı gerçek dosya/PDF/CSV export üretimi değil, rapor lifecycle + client-visible export foundation olarak sınırlandı.

Reason:
Bu karar TikTok raporlamasını workspace mesajı veya QA task'ına gömmek yerine sorgulanabilir, permission-aware ve client-visible bir entity haline getirir. Meta Ads ile simetri korunur, publish/ack lifecycle'ı mevcut task altyapısına bağlandığı için yeni approval modülü açmadan üretim riskini düşük tutar.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260527170000_add_tiktok_ads_reports/migration.sql`
- `server/prisma/seed.ts`
- `server/src/tiktok-ads/dto/create-tiktok-ads-report.dto.ts`
- `server/src/tiktok-ads/dto/tiktok-ads-reports-query.dto.ts`
- `server/src/tiktok-ads/dto/update-tiktok-ads-report.dto.ts`
- `server/src/tiktok-ads/tiktok-ads.controller.ts`
- `server/src/tiktok-ads/tiktok-ads.service.ts`
- `server/test/tiktok-ads-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `adminandemployeePanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `adminandemployeePanel/src/app/pages/TikTokAdsAdmin.tsx`
- `adminandemployeePanel/src/app/pages/__tests__/TikTokAdsAdmin.test.tsx`
- `adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/TikTokAdsWorkspace.test.tsx`
- `clientPanel/src/app/features/tiktokAds/tiktokAdsApi.ts`
- `clientPanel/src/app/features/tiktokAds/tiktokAdsTypes.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.tiktok-ads.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-28 - Social Media Faz 5 Employee Workspace

Context:
Social Media Faz 4 ile admin global panel ve ClientDetail Social Media section tamamlandı. Sıradaki ihtiyaç, Social Media Specialist, Designer ve Project Manager rollerinin assigned Social Media müşteriler üzerinde aynı content calendar, creative, approval ve rapor/not operasyonlarını employee panelden yönetebilmesiydi.

Decision:
Social Media Faz 5, yeni bir ayrı backend workspace modeli açmadan mevcut assigned Social Media summary/posts endpointleri, shared projects/tasks endpointleri ve content calendar componenti üzerine kurulacak:
- Employee `/employee/social-media` rotası ve rol bazlı sidebar entry eklendi.
- `SocialMediaWorkspace` componenti assigned active Social Media clients listesi, summary KPI, content calendar, posts, creatives, approvals, reports ve messages tablarını tek yerde sunar.
- Social Media approval task creation shared `POST /api/v1/tasks` endpointiyle yapılır; Faz 5 kapsamında ayrı approval enum eklenmeden `approvalType=null` tutuldu. Bu karar Faz 6 ile `SOCIAL_MEDIA_*` approval type değerleri eklenerek superseded oldu.
- Shared task approval guard’ına `PurchasedServiceKey.SOCIAL_MEDIA -> socialMedia.approvals.create.assigned` mapping’i eklendi.
- Designer asset yönetimi için `socialMedia.creatives.manage.assigned` permission’ı Social Media post asset guard’ında kabul edilir.
- `socialMedia.reports.manage.assigned` ve `socialMedia.notes.manage.assigned` seed permissionları Faz 5 UI action gating zemini olarak eklendi.

Reason:
Bu karar Social Media employee workspace’i mevcut güvenli assignment scope ve task/file altyapısını yeniden kullanarak açar. Ayrı approval enum veya yeni message/report entity migration’ı Faz 5 kapsamına alınmadı; böylece Phase 6 için daha geniş collaboration/reporting domain tasarımı açık kalır.

Affected files:
- `server/prisma/seed.ts`
- `server/src/social-media/social-media.service.ts`
- `server/src/tasks/tasks.service.ts`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/employee/components/SocialMediaWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/SocialMediaCalismaAlani.tsx`
- `adminandemployeePanel/src/app/employee/EmployeeLayout.tsx`
- `adminandemployeePanel/src/app/routes.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx`
- `docs/social-media-phases/05-social-media-employee-workspace.md`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-29 - Social Media Faz 6 Approval + Creative Flow

Context:
Social Media Faz 5 ile employee workspace açıldı ve approval task bridge’i generic task sistemi üzerinden çalışıyordu. Faz 6 ihtiyacı, Social Media approval tiplerini açık enum değerleriyle modellemek, client approval response sonucunu linked post status’una yansıtmak ve client/employee UI katmanında bu approval’ları görünür hale getirmekti.

Decision:
Social Media Faz 6, yeni ayrı approval entity’si açmadan mevcut shared task approval altyapısını genişletecek:
- Shared `MetaAdsApprovalType` enumuna `SOCIAL_MEDIA_POST_APPROVAL`, `SOCIAL_MEDIA_CREATIVE_APPROVAL`, `SOCIAL_MEDIA_CAPTION_APPROVAL`, `SOCIAL_MEDIA_CALENDAR_APPROVAL` ve `SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT` eklendi.
- Client approval response guard’ı `PurchasedServiceKey.SOCIAL_MEDIA` projelerini kabul eder hale getirildi.
- Linked `SocialMediaPost.approvalTaskId` bulunan post/caption/creative approval task response’larında post status güncellenir: `APPROVED -> APPROVED`, `CHANGES_REQUESTED/REJECTED -> REVISION_REQUIRED`.
- Revision/rejection note mevcut shared task response path’iyle follow-up revision task üretmeye devam eder.
- Employee workspace’te genel calendar approval `SOCIAL_MEDIA_CALENDAR_APPROVAL`, post approval aksiyonu `SOCIAL_MEDIA_POST_APPROVAL` üretir; post `approvalTaskId` linki ve `clientVisible=true` update’i aynı aksiyonla yapılır.
- Client portal Social Media approvals tabı yeni Social Media approval type değerlerini normalize eder ve shared approve/revision mutation panelini kullanır.
- Creative asset approval için ayrı ProjectFile-level modal V1’e alınmadı; mevcut creative preview + task/reference altyapısı follow-up genişletmeye açık bırakıldı.

Reason:
Bu karar Meta/TikTok/Amazon approval pattern’iyle simetriyi korur ve yeni approval domain’i açmadan Social Media post lifecycle’ını production-safe şekilde bağlar. Approval type değerleri explicit olduğu için client panel, employee workspace, e2e ve ileride creative/report akışları aynı contract üzerinden ilerleyebilir.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260528203000_add_social_media_approval_types/migration.sql`
- `server/prisma/seed.ts`
- `server/src/tasks/tasks.service.ts`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/tasks/tasksTypes.ts`
- `adminandemployeePanel/src/app/employee/components/SocialMediaWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx`
- `clientPanel/src/app/features/tasks/tasksTypes.ts`
- `clientPanel/src/app/features/tasks/tasksUtils.ts`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.social-media.test.tsx`
- `docs/social-media-phases/05-social-media-employee-workspace.md`
- `docs/social-media-phases/06-social-media-approval-creative-flow.md`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`

## 2026-05-29 - Social Media Faz 8 Insights + Reporting V1

Context:
Social Media Faz 7 ile manuel publishing akışı tamamlandı. Faz 8 ihtiyacı, publishing sonrası post performansını API-driven göstermek ve client-visible Social Media raporlarını draft/publish/acknowledgement akışıyla yönetmekti.

Decision:
Faz 8 V1, gerçek platform insight sync entegrasyonu yerine manuel/snapshot performans modeliyle ilerler:
- `SocialMediaPostInsight` post bazlı günlük KPI snapshotlarını tutar ve admin/assigned employee create, own client read contractını sağlar.
- `SocialMediaReport` weekly/monthly/performance raporlarını draft/published/clientVisible durumlarıyla tutar.
- Rapor acknowledgement yeni bir domain açmadan mevcut `Task` approval altyapısındaki `SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT` type’ına bağlanır.
- Admin/employee workspace reports tabı insight girişi, KPI özeti, report draft create ve publish aksiyonlarını kullanır.
- Client portal Social Media `performance` ve `reports` tabları yalnızca own/client-visible insight ve report API verisini render eder.

Reason:
Bu karar Faz 8’i platform API izinlerine bağlı bırakmadan production-safe bir reporting contractına taşır. Manuel snapshot modeli daha sonra Instagram/Facebook Graph API veya diğer platform sync job’larıyla aynı tabloya yazacak şekilde genişletilebilir.

Affected files:
- `server/prisma/schema.prisma`
- `server/prisma/migrations/20260529172000_add_social_media_insights_reports/migration.sql`
- `server/src/social-media/*`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/features/socialMedia/*`
- `adminandemployeePanel/src/app/employee/components/SocialMediaWorkspace.tsx`
- `adminandemployeePanel/src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx`
- `clientPanel/src/app/features/socialMedia/*`
- `clientPanel/src/app/pages/service-tab-page.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.social-media.test.tsx`
- `ROAD_MAP.md`

## 2026-05-29 - Social Media Faz 9 Report Permission Scoping

Context:
Faz 8 reporting/insights V1 ile Social Media raporları generic `reports.read/manage` permission family’sine bağlandı. Production hardening sırasında bu generic permission’ların employee kullanıcılar için diğer client’lara global Social Media report/insight erişimi açmaması gerekiyordu.

Decision:
Social Media report/insight permission modeli şu şekilde sabitlendi:
- Admin kullanıcılar `reports.read/manage` veya Social Media global permissions ile tüm Social Media client report/insight yüzeylerini yönetebilir.
- Employee kullanıcılar generic `reports.read/manage` permission’a sahip olsa bile Social Media report/insight read/create/manage işlemleri assigned Social Media client scope’u gerektirir.
- Out-of-scope employee report/insight read/create denemeleri güvenli şekilde `404` döner.
- Client-facing Social Media summary yalnızca `CLIENT_VISIBLE` creative files döndürür; internal creative files own-client response’a dahil edilmez.

Reason:
Bu karar generic reporting permission’larını korurken Social Media operasyon verisinin employee assignment boundary’sinden taşmasını engeller. Admin global yetki, assigned employee operasyonu ve own-client görünürlük kontratları birbirinden ayrışmış kalır.

Affected files:
- `server/src/social-media/social-media.service.ts`
- `server/test/social-media-authz.e2e-spec.ts`
- `adminandemployeePanel/src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx`
- `clientPanel/src/app/pages/__tests__/service-tab-page.social-media.test.tsx`
- `PROJECT_CONTEXT.md`
- `REPO_MAP.md`
- `ROAD_MAP.md`
