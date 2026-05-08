<!-- docs/meta-ads-phases/09-meta-ads-reporting-export-layer.md -->

# FAZ 9 — Reporting, Export ve Agency Deliverable Layer

## Amaç

Meta Ads paneli sadece dashboard değil, müşteri rapor ve ajans deliverable üretim sistemiyle entegre olmalı.

## Rapor Tipleri

- Weekly Meta Ads Report
- Monthly Meta Ads Report
- Campaign Performance Report
- Creative Performance Report
- Budget Recommendation Report

## Backend Model

```prisma
model MetaAdsReport {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  periodStart     DateTime
  periodEnd       DateTime
  type            MetaAdsReportType
  status          ReportStatus
  summary         String?
  metricsSnapshot Json?
  createdByUserId String?
  clientVisible   Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enum:

```prisma
enum MetaAdsReportType {
  WEEKLY
  MONTHLY
  CAMPAIGN_PERFORMANCE
  CREATIVE_PERFORMANCE
  BUDGET_RECOMMENDATION
}
```

Eğer mevcut generic report model varsa onu kullan; duplicate model üretme.

## Backend Endpointler

```http
GET /api/v1/meta-ads/clients/:clientId/reports
POST /api/v1/meta-ads/clients/:clientId/reports
PATCH /api/v1/meta-ads/reports/:id
GET /api/v1/client/meta-ads/reports
```

## Client Panel

Meta Ads > Reports:

- report list
- period
- summary
- metrics snapshot
- PDF/export link, ileriki faz
- acknowledged status

## Admin/Employee

- report draft
- publish to client
- approval/acknowledgement request

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut report altyapısını incele.
2. Generic report modeli varsa Meta Ads reportları oraya bağla.
3. Yoksa minimal `MetaAdsReport` modeli ekle.
4. Admin/employee report draft/publish endpoints ekle.
5. Client own visible reports endpoint ekle.
6. Meta Ads Client Panel Reports sekmesini API-driven yap.
7. Report publish sonrası approval/acknowledgement request opsiyonunu ekle.
8. Tests ekle.
9. Shared memory güncelle.

## Testler

Backend:

- Admin report create.
- Employee assigned client report create, permission varsa.
- Draft client’a görünmez.
- clientVisible report client’a görünür.
- Other client report inaccessible.
- Publish report approval/acknowledgement oluşturabilir.

Frontend:

- Client reports list render.
- Empty/loading/error states.
- Admin report draft form.
- Publish action.
- Report status badge.
- Acknowledgement request render.

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

- Meta Ads report entity veya generic report integration var.
- Client-visible report client panelde görünür.
- Internal draft client’a görünmez.
- Report publish/acknowledgement flow çalışır.
- Testler geçer.