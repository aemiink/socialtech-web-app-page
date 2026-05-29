<!-- docs/growth-hub-phases/01-growth-hub-backend-foundation.md -->

# FAZ 1 — Growth Hub Backend Foundation: Config, Summary API ve Permissions

## Amaç

Growth & Hub hizmeti alan her müşteri için backend’de müşteri bazlı Growth Hub yapılandırması ve summary API altyapısını kurmak.

Bu fazda amaç tüm growth zekasını bitirmek değil; panelin gerçek API contract üzerinden çalışacağı temel backend yapısını oluşturmaktır.

## Ürün Kararı

Growth Hub bir purchased service olarak çalışacak.

Bir müşteri için `GROWTH_HUB` hizmeti ACTIVE ise:

- Client Panel’de Growth Hub dashboard görünecek.
- Admin Client create/edit ekranında Growth Hub hedef/config alanları açılacak.
- Project Manager / Growth Lead assigned scope içinde müşterinin Growth Hub operasyonunu görebilecek.
- Client yalnızca kendi Growth Hub summary’sini görebilecek.

## Backend Model

Yeni model ekle:

```prisma
model ClientGrowthHubConfig {
  id              String   @id @default(uuid())
  clientProfileId String   @unique
  primaryGoal     GrowthHubGoal?
  targetLeads     Int?
  targetRoas      Decimal?
  targetCpa       Decimal?
  targetRevenue   Decimal?
  reportingDay    String?
  notes           String?
  status          GrowthHubStatus @default(ACTIVE)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Enumlar:

```prisma
enum GrowthHubGoal {
  LEAD_GENERATION
  ECOMMERCE_SALES
  BRAND_AWARENESS
  APP_GROWTH
  RETENTION
  MIXED
}

enum GrowthHubStatus {
  ACTIVE
  PAUSED
  ON_HOLD
}
```

## Backend Module

Yeni module:

```text
server/src/growth-hub/
```

Önerilen dosyalar:

```text
server/src/growth-hub/growth-hub.module.ts
server/src/growth-hub/growth-hub.service.ts
server/src/growth-hub/growth-hub-summary.service.ts
server/src/growth-hub/admin-growth-hub.controller.ts
server/src/growth-hub/assigned-growth-hub.controller.ts
server/src/growth-hub/client-growth-hub.controller.ts
server/src/growth-hub/dto/*
```

## Backend Endpointler

Admin:

```http
GET /api/v1/admin/growth-hub/clients
GET /api/v1/admin/clients/:clientId/growth-hub/config
PATCH /api/v1/admin/clients/:clientId/growth-hub/config
GET /api/v1/admin/clients/:clientId/growth-hub/summary
GET /api/v1/admin/clients/:clientId/growth-hub/channels
GET /api/v1/admin/clients/:clientId/growth-hub/actions
GET /api/v1/admin/clients/:clientId/growth-hub/activity
```

Assigned employee:

```http
GET /api/v1/growth-hub/clients/:clientId/config
GET /api/v1/growth-hub/clients/:clientId/summary
GET /api/v1/growth-hub/clients/:clientId/channels
GET /api/v1/growth-hub/clients/:clientId/actions
GET /api/v1/growth-hub/clients/:clientId/activity
```

Client:

```http
GET /api/v1/clients/me/growth-hub/config
GET /api/v1/clients/me/growth-hub/summary
GET /api/v1/clients/me/growth-hub/channels
GET /api/v1/clients/me/growth-hub/actions
GET /api/v1/clients/me/growth-hub/activity
```

## Summary Kaynakları

Growth Hub summary V1’de şu kaynaklardan hesaplanmalı:

- ClientPurchasedService
- Project.serviceKey
- Task / TaskTodo
- DeliverySprint
- DeliveryRelease
- mevcut Task / ProjectFile / DeliveryRelease approval alanları
- ProjectFile
- Reports, mevcutsa
- Web APP workspace reports/messages, varsa
- Meta / TikTok / Amazon / Social Media aktif kaynakları
- Google Ads contract-only / future adapter state
- Yoksa kanal bazında `NO_DATA` / `WAITING_CONFIG` state

Mock veri dönme.

## Authorization

Admin:

- all Growth Hub clients.

Project Manager / Growth Lead:

- assigned GROWTH_HUB clients only.

Client:

- own clientProfile + ACTIVE GROWTH_HUB purchased service only.

## Permissions

Yeni permissionlar:

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

Admin:

```text
growthHub.config.read.any
growthHub.config.manage.any
growthHub.summary.read.any
```

Project Manager / Growth Lead:

```text
growthHub.config.read.assigned
growthHub.summary.read.assigned
growthHub.actions.read.assigned
```

Client:

```text
growthHub.config.read.own
growthHub.summary.read.own
growthHub.actions.read.own
```

## Admin Client Create/Edit Entegrasyonu

`GROWTH_HUB` purchased service seçilirse ek alanlar açılmalı:

- Primary Goal
- Target Leads
- Target ROAS
- Target CPA
- Target Revenue
- Reporting Day
- Notes

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Prisma schema’ya `ClientGrowthHubConfig`, `GrowthHubGoal`, `GrowthHubStatus` ekle.
2. Migration-first convention kullan; `db push` kullanma.
3. `server/src/growth-hub/` module oluştur.
4. Admin/employee config read/update endpointlerini ekle.
5. Client own config summary endpointini ekle.
6. Growth Hub summary/channels/actions/activity endpointlerini V1 data kaynaklarına bağla.
7. Permission ve seed mapping ekle.
8. Admin Clients create/edit flow’da GROWTH_HUB seçilince config alanlarını göster.
9. Backend ve frontend testleri ekle.
10. Shared memory dosyalarını güncelle.

## Validation Komutları

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

Client Panel touched ise:

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- Her müşteri için Growth Hub config tutulabiliyor.
- Admin create/edit sırasında Growth Hub hedefleri alınabiliyor.
- Growth Hub summary endpointleri gerçek kaynaklardan hesaplama yapıyor.
- Client yalnızca kendi Growth Hub summary’sini görebiliyor.
- Assigned employee sadece assigned Growth Hub müşterisini görebiliyor.
- Mock response yok.
- Testler geçiyor.
