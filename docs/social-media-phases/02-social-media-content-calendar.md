<!-- docs/social-media-phases/02-social-media-content-calendar.md -->

# FAZ 2 — Social Media Content Calendar ve Post Domain

## Amaç

Social Media Panel’in ana operasyonel katmanını oluşturmak:

- içerik takvimi
- post planı
- caption/copy
- platform
- post tipi
- yayın tarihi
- durum takibi
- client-visible ayrımı
- kreatif dosya ilişkisi
- approval ilişkisi

Bu faz Social Media Panel’in omurgasıdır.

## Backend Models

### SocialMediaPost

```prisma
model SocialMediaPost {
  id                String @id @default(uuid())
  clientProfileId   String
  projectId         String?
  platform          SocialMediaPlatform
  type              SocialMediaPostType
  status            SocialMediaPostStatus @default(IDEA)
  title             String
  caption           String?
  scheduledAt       DateTime?
  publishedAt       DateTime?
  clientVisible     Boolean @default(false)
  approvalId        String?
  createdByUserId   String?
  assignedToUserId  String?
  externalPostId    String?
  externalPostUrl   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Enumlar:

```prisma
enum SocialMediaPlatform {
  INSTAGRAM
  FACEBOOK
  TIKTOK
  LINKEDIN
  X
  PINTEREST
}

enum SocialMediaPostType {
  FEED
  STORY
  REEL
  CAROUSEL
  SHORT_VIDEO
  STATIC_IMAGE
  TEXT
}

enum SocialMediaPostStatus {
  IDEA
  DRAFT
  DESIGN
  WAITING_APPROVAL
  APPROVED
  SCHEDULED
  PUBLISHED
  REJECTED
  REVISION_REQUIRED
  CANCELLED
}
```

### SocialMediaPostAsset

Mevcut `ProjectFile` yeterliyse duplicate dosya modeli oluşturma.

Ancak post-file ilişkisi gerekiyorsa minimal join model ekle:

```prisma
model SocialMediaPostAsset {
  id        String @id @default(uuid())
  postId    String
  fileId    String
  sortOrder Int?
  createdAt DateTime @default(now())
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/social-media/clients/:clientId/posts
POST /api/v1/social-media/clients/:clientId/posts
GET /api/v1/social-media/posts/:id
PATCH /api/v1/social-media/posts/:id
DELETE /api/v1/social-media/posts/:id
POST /api/v1/social-media/posts/:id/assets
DELETE /api/v1/social-media/posts/:id/assets/:assetId
```

Client:

```http
GET /api/v1/client/social-media/posts
GET /api/v1/client/social-media/posts/:id
GET /api/v1/client/social-media/calendar
```

## Authorization

Admin:

- all Social Media posts.

Project Manager / Social Media Specialist:

- assigned SOCIAL_MEDIA client/project scope içinde create/update/delete.

Designer:

- assigned post için asset ekleyebilir.
- caption/content update yetkisi permission’a göre sınırlı olabilir.

Client:

- yalnızca kendi clientProfile scope.
- sadece `clientVisible=true` postları görür.
- internal draft postları görmez.

## Status Flow

Önerilen durum akışı:

```text
IDEA
→ DRAFT
→ DESIGN
→ WAITING_APPROVAL
→ APPROVED
→ SCHEDULED
→ PUBLISHED
```

Alternatifler:

```text
WAITING_APPROVAL → REJECTED
REJECTED → REVISION_REQUIRED
REVISION_REQUIRED → DESIGN
SCHEDULED → CANCELLED
```

## UI

Admin/Employee tarafında:

- Content calendar
- Kanban/list görünümü
- Post create/edit modal
- Platform/type/status selector
- Caption editor
- Scheduled date
- Client-visible toggle
- Approval status badge
- Creative asset binding
- Assignee picker

Client tarafında:

- calendar view
- upcoming posts
- waiting approval posts
- published posts
- post detail
- caption + creative preview
- status badge

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `SocialMediaPost`, enumlar ve gerekiyorsa `SocialMediaPostAsset` ekle.
2. Migration-first convention kullan.
3. Backend post CRUD endpoints ekle.
4. Client visible filtering ekle.
5. Assigned scope authorization ekle.
6. Post status flow validation ekle.
7. Existing ProjectFiles ile post asset bağlama akışını kur.
8. Admin/Employee content calendar UI ekle.
9. Client Panel calendar/posts readonly UI ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Backend:

- Admin post create/update/delete.
- Social Media Specialist assigned client için post create/update.
- Designer assigned post asset ekleyebilir.
- Out-of-scope employee blocked.
- Client only clientVisible posts görür.
- Internal draft client’a görünmez.
- Status transition validasyonları çalışır.

Frontend:

- Admin/Employee calendar render.
- Post create modal.
- Post edit/status update.
- Asset attach.
- Client calendar render.
- Client internal post görmez.
- Empty/loading/error states.

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

- Content calendar backend ve UI çalışır.
- Postlar müşteri bazlı ve service scope içinde yönetilir.
- Client yalnızca client-visible postları görür.
- Kreatif dosyalar postlara bağlanabilir.
- Testler geçer.