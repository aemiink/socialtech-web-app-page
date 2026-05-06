<!-- docs/growth-hub-phases/03-growth-hub-admin-panel.md -->

# FAZ 3 — Admin Growth Hub Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında Growth Hub hizmeti alan tüm müşterilerin büyüme durumunu, hedeflerini, risklerini ve aksiyonlarını yönetebileceği bir panel oluşturmak.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Growth Hub global page
4. Reports
5. Approvals
6. Employee assignment
7. Weekly notes / agency comments

## Admin Growth Hub Global Page

Route:

```text
/growth-hub
```

Gösterilecek:

- Growth Hub hizmeti alan tüm müşteriler
- health score
- active channel count
- pending approvals
- open tasks
- completed actions this week
- risk level
- last weekly note
- assigned project manager / growth lead
- next action

## ClientDetail Growth Hub Tab

Gösterilecek:

- Growth Hub config
- primary goal
- target leads
- target ROAS
- target CPA
- target revenue
- channel summaries
- pending approvals
- weekly actions
- recent activity
- agency notes

Actions:

- Config düzenle
- Weekly note ekle
- Growth action oluştur
- Approval request create
- Report publish
- Employee assignment visibility

## Admin Client Create/Edit

`GROWTH_HUB` seçildiğinde:

- primary goal
- target leads
- target ROAS
- target CPA
- target revenue
- reporting day
- internal notes

## Permissions

Yeni veya mevcut permissionlar:

```text
growthHub.config.read.any
growthHub.config.manage.any
growthHub.summary.read.any
growthHub.actions.manage.any
growthHub.notes.manage.any
growthHub.reports.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin global `/growth-hub` route/page ekle.
2. Growth Hub hizmeti alan müşterileri listele.
3. Health score, risk, pending approval, open task, channel count göster.
4. ClientDetail içinde Growth Hub tab/section oluştur.
5. Config edit modal bağla.
6. Weekly note / agency comment create action ekle, model Faz 5’e bırakılacaksa temporary endpoint kullanma; explicit follow-up yaz.
7. Approval request create action ekle.
8. Employee assignment visibility ekle.
9. Permission-aware UX ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Frontend:

- Admin Growth Hub global page loading/error/empty/success.
- Growth Hub client list render.
- Config edit action.
- ClientDetail Growth Hub tab render.
- Pending approvals render.
- Channel summaries render.
- Permission disabled state.

Backend:

- Admin Growth Hub clients list.
- Admin Growth Hub config update.
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

## Kabul Kriterleri

- Admin tüm Growth Hub müşterilerini görebilir.
- Admin müşteri bazlı Growth Hub config yönetebilir.
- Admin Growth Hub summary/risk/action durumunu görebilir.
- Testler geçer.