<!-- docs/growth-hub-phases/00-growth-hub-discovery-contract.md -->

# FAZ 0 — Growth & Hub Discovery, Product Contract ve Data Contract

## Amaç

Growth & Hub panelini geliştirmeye başlamadan önce mevcut repo mimarisine göre ürün contract’ını netleştirmek.

Growth & Hub bir reklam kanalı değildir. Meta Ads, Google Ads, TikTok Ads, Amazon Ads, Social Media, SEO, Web App, Landing Page ve diğer hizmetlerden gelen verileri üst seviyede birleştiren büyüme merkezi olmalıdır.

Bu fazda kod yazımı minimum olmalı. Ana hedef:

- Growth & Hub panelinde hangi veriler gösterilecek?
- Hangi veriler mevcut sistemden alınacak?
- Hangi veriler ileride platform entegrasyonlarından gelecek?
- Client Panel’deki mevcut mock tasarım hangi API contract’a bağlanacak?
- Admin, Project Manager, Growth Lead ve Client hangi veriyi görecek?
- Growth & Hub müşteriye neyi anlatacak?
- Growth & Hub employee tarafında nasıl yönetilecek?

## Mevcut Repo Bağlamı

Mevcut sistemde:

- `server/` NestJS + Prisma + RBAC backend.
- `adminandemployeePanel/` Admin Panel + Employee Panel.
- `clientPanel/` müşteri portalı.
- `ClientPurchasedService` modeli var.
- Client Portal yalnızca satın alınmış ACTIVE hizmetleri gösteriyor.
- `Project.serviceKey` var.
- Task / TaskTodo sistemi var.
- DeliverySprint / DeliveryRelease sistemi var.
- ClientApprovalRequest veya approval sistemi var.
- ProjectFiles ve client-visible file/design asset akışı var.
- Web APP workspace, messages, reports, revisions ve meetings altyapısı var.
- Client Panel’de `GrowthHubDashboard` mevcut ama mock/static veriyle çalışıyor.
- Growth Hub service profile ve tab yapısı clientPanel service-pages datasında mevcut.

## Growth & Hub Ürün Konumu

Growth & Hub şu şekilde konumlanmalı:

```text
Meta Ads = kanal paneli
Google Ads = kanal paneli
TikTok Ads = kanal paneli
Amazon Ads = kanal paneli
Social Media = kanal/operasyon paneli
Web App / Landing Page = dönüşüm ve delivery paneli
SEO = audit ve organik büyüme paneli

Growth & Hub = bütün kanalların stratejik büyüme kontrol merkezi
```

Growth & Hub’ın cevaplaması gereken sorular:

- Bu hafta büyüme sistemi genel olarak iyi mi?
- Hangi kanal büyümeyi taşıyor?
- Hangi kanalda risk var?
- Hangi onaylar büyümeyi bekletiyor?
- Hangi task/sprint/rapor tamamlandı?
- Müşteriden hangi aksiyon bekleniyor?
- Ajans ekibinin bu haftaki yorumu ne?
- Gelecek hafta odak ne olmalı?

## İncelenecek Alanlar

Codex önce şu alanları incelemeli:

### Client Panel

- `clientPanel/src/app/pages/services/growth-hub-dashboard.tsx`
- `clientPanel/src/app/data/service-pages.ts`
- service selection / selectedService restore logic
- client approvals feature
- client reports / project files / sprint detail sections

### Admin/Employee Panel

- client detail
- services page
- project manager workspace
- tasks
- approvals
- reports
- delivery
- project files
- employee role/sidebar mapping

### Backend

- clients module
- projects module
- tasks module
- delivery module
- client approvals module
- project files module
- web-app-workspace module
- serviceKey / purchased service validation
- assignment scope authorization

## Growth & Hub V1 Data Contract

Önerilen summary response:

```ts
{
  healthScore: number;
  healthStatus: "HEALTHY" | "WATCH" | "RISK" | "CRITICAL";
  totalLeads?: number;
  totalSpend?: number;
  blendedRoas?: number;
  blendedCpa?: number;
  pendingApprovals: number;
  openTasks: number;
  completedActionsThisWeek: number;
  activeChannels: number;
  risks: GrowthRisk[];
  recommendations: GrowthRecommendation[];
  channelSummaries: GrowthChannelSummary[];
  weeklyActions: GrowthWeeklyAction[];
  recentActivity: GrowthActivity[];
  agencyComment?: GrowthWeeklyNote;
  lastUpdatedAt: string;
}
```

Channel summary:

```ts
{
  serviceKey: string;
  label: string;
  status: "ACTIVE" | "WAITING_CONFIG" | "NO_DATA" | "RISK" | "OPTIMIZE" | "SCALE";
  spend?: number;
  leads?: number;
  conversions?: number;
  revenue?: number;
  roas?: number;
  cpa?: number;
  progressPercent?: number;
  pendingApprovals?: number;
  openTasks?: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastUpdatedAt?: string;
}
```

Weekly action:

```ts
{
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ownerName?: string;
  dueAt?: string;
  clientVisible: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
```

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu fazda ana hedef kod yazmak değil, Growth & Hub için mevcut repo mimarisi üzerinden teknik ve ürün contract çıkarmaktır.

Şunları yap:

1. `server/`, `adminandemployeePanel/`, `clientPanel/` yapısını incele.
2. `GrowthHubDashboard` içindeki mock/static alanları tespit et.
3. Client Panel service profile/tab yapısında Growth Hub’ın nasıl tanımlandığını incele.
4. Growth Hub’ın hangi mevcut backend kaynaklarından besleneceğini çıkar:
   - purchased services
   - projects
   - tasks/todos
   - sprints/releases
   - approvals
   - files
   - reports
   - workspace messages
   - future ads platform summaries
5. V1 data contract oluştur.
6. Admin / Employee / Client role-scope matrisi çıkar.
7. Faz 1 implementation için net teknik kararları yaz.
8. Shared memory gerekiyorsa yalnızca ilgili discovery notlarını ekle.

## Kabul Kriterleri

- Growth & Hub’ın kanal paneli değil orchestration layer olduğu net.
- Client Panel mock alanlarının API karşılığı net.
- Backend V1 summary contract net.
- Role-scope matrisi net.
- Mevcut mimariyle çelişen karar yok.
- Final response’ta “Faz 1 için implementation contract hazır mı?” sorusuna net cevap ver.