<!-- docs/social-media-phases/04-social-media-admin-panel.md -->

# FAZ 4 — Admin Social Media Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında Social Media hizmeti alan tüm müşterilerin içerik takvimi, onay, kreatif, rapor ve operasyon durumlarını yönetebileceği bir panel oluşturmak.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Social Media global page
4. Content Calendar
5. Posts
6. Creative Assets
7. Approvals
8. Reports
9. Employee assignment

## Admin Social Media Global Page

Route:

```text
/social-media
```

Gösterilecek:

- Social Media hizmeti alan tüm müşteriler
- planned posts count
- published posts count
- waiting approval count
- rejected/revision count
- overdue scheduled posts
- assigned social media specialist
- assigned designer
- last report
- risk status

## ClientDetail Social Media Tab

Gösterilecek:

- Social Media config
- content calendar
- post list
- creative assets
- pending approvals
- reports
- assigned employees
- recent activity

Actions:

- Config düzenle
- Post oluştur
- Content calendar aç
- Approval request create
- Report publish
- Employee assignment visibility

## Admin Client Create/Edit

`SOCIAL_MEDIA` seçildiğinde:

- Instagram username
- Facebook page ID
- TikTok username
- LinkedIn page URL
- content frequency
- primary goal
- tone of voice
- hashtags
- notes

## Permissions

Yeni veya mevcut permissionlar:

```text
socialMedia.config.read.any
socialMedia.config.manage.any
socialMedia.summary.read.any
socialMedia.posts.manage.any
socialMedia.approvals.manage.any
socialMedia.reports.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin global `/social-media` route/page ekle.
2. Social Media hizmeti alan müşterileri listele.
3. Planned/published/waiting approval/rejected counts göster.
4. ClientDetail içinde Social Media tab/section oluştur.
5. Config edit modal bağla.
6. Post create/list action ekle.
7. Pending approvals render et.
8. Creative assets render et.
9. Employee assignment visibility ekle.
10. Permission-aware UX ekle.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

Frontend:

- Admin Social Media global page loading/error/empty/success.
- Social Media client list render.
- Config edit action.
- ClientDetail Social Media tab render.
- Pending approvals render.
- Post counts render.
- Permission disabled state.

Backend:

- Admin Social Media clients list.
- Admin Social Media config update.
- Admin post counts summary.
- Non-admin global page endpoint erişemez.
- Client data leak yok.

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

## Uygulama Notları (2026-05-28)

Tamamlananlar:

- `GET /api/v1/social-media/clients` admin global overview endpointi eklendi.
- Endpoint aktif `SOCIAL_MEDIA` hizmetli müşteriler için summary/config, planned/published/pending/rejected counts, overdue scheduled posts, creative assets, Social Media specialist/Designer atamaları ve risk status döner.
- Non-admin global endpoint erişimi backend servis guard’ında bloklanır.
- Admin `/social-media` ekranı global KPI, müşteri risk listesi, selected-client detay paneli, config edit modal ve mevcut content calendar create/list akışını içerir.
- `ClientDetail` içine Social Media section eklendi; config, post counts, pending approvals, creative assets, assigned employees, recent/upcoming posts ve report no-source state API-driven render edilir.
- Report publish ve last report gerçek domaini Faz 8’e bırakıldığı için mocklanmadı.

Doğrulama:

```bash
cd server
npm run check
DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true npm run test:e2e -- social-media-authz.e2e-spec.ts
```

```bash
cd adminandemployeePanel
npm run test:run -- src/app/pages/__tests__/SocialMediaAdmin.test.tsx src/app/pages/__tests__/ClientDetail.test.tsx
npm run check
```

## Kabul Kriterleri

- Admin tüm Social Media müşterilerini görebilir.
- Admin müşteri bazlı Social Media config yönetebilir.
- Admin içerik/onay/kreatif durumlarını görebilir.
- Testler geçer.
