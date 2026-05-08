<!-- docs/social-media-phases/00-social-media-discovery-contract.md -->

# FAZ 0 — Social Media Discovery, Product Contract ve Data Contract

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