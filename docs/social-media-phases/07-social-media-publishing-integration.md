<!-- docs/social-media-phases/07-social-media-publishing-integration.md -->

# FAZ 7 — Social Media Publishing Integration

## Amaç

Social Media Panel’de post yayınlama ve yayın durumu takibini yönetmek.

Bu faz iki aşamalı ele alınmalı:

- V1: Manual publishing status management.
- V2: Instagram/Facebook Graph API publishing integration.

## V1 — Manual Publishing

İlk sürümde gerçek API ile yayın yapmak zorunlu değildir.

Post lifecycle:

```text
APPROVED
→ SCHEDULED
→ PUBLISHED
```

Aksiyonlar:

```http
POST /api/v1/social-media/posts/:id/schedule
POST /api/v1/social-media/posts/:id/mark-published
POST /api/v1/social-media/posts/:id/cancel
```

`mark-published` payload:

```ts
{
  publishedAt: string;
  externalPostUrl?: string;
  externalPostId?: string;
}
```

## V2 — API Publishing

İleride resmi API publishing entegrasyonu eklenebilir:

- Instagram Content Publishing
- Facebook Pages publishing
- TikTok publishing, destek/izin durumuna göre
- LinkedIn Pages publishing, ayrı integration olarak

## Backend Rules

- Sadece APPROVED post schedule edilebilir.
- Sadece SCHEDULED veya APPROVED post published yapılabilir.
- REJECTED / REVISION_REQUIRED post published yapılamaz.
- Client post publish yapamaz.
- Admin / PM / Social Media Specialist assigned scope içinde publish status yönetebilir.
- Published post client panelde görünür.
- External URL varsa client görebilir.

## UI

Admin/Employee:

- Schedule action.
- Mark as published action.
- External post URL input.
- PublishedAt input.
- Status badge.
- Calendar update.

Client Panel:

- Published posts.
- External post link.
- Scheduled posts.
- Upcoming content.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. SocialMediaPost status flow içinde schedule/publish action endpointleri ekle.
2. Status transition validation ekle.
3. externalPostUrl/externalPostId alanlarını destekle.
4. Admin/Employee UI’da schedule ve mark-published action ekle.
5. Client Panel’de scheduled/published post görünümünü güncelle.
6. API publishing için V2 follow-up notu ROAD_MAP’e ekle.
7. Tests ekle.
8. Shared memory güncelle.

## Testler

Backend:

- APPROVED post schedule edilebilir.
- DRAFT post published yapılamaz.
- SCHEDULED post mark-published yapılabilir.
- Client publish action yapamaz.
- Out-of-scope employee blocked.
- Published post client’a görünür.
- External URL client’a görünür.

Frontend:

- Schedule action render.
- Mark published modal.
- Status badge update.
- Client scheduled/published posts render.
- Invalid action disabled.

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

- Manual publishing status flow çalışır.
- Client sadece yayınlanmış veya client-visible scheduled postları görür.
- Invalid status transition engellenir.
- Gerçek API publishing V2 follow-up olarak belgelenir.
- Testler geçer.