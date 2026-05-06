<!-- docs/social-media-phases/08-social-media-insights-reporting.md -->

# FAZ 8 — Social Media Insights ve Reporting

## Amaç

Social Media Panel’de post ve kanal performansını API-driven raporlayabilecek altyapıyı kurmak.

Bu fazda gerçek Instagram/Facebook API insight entegrasyonu yapılabilir veya V1’de manuel/snapshot model kurulup dış entegrasyon follow-up’a bırakılabilir.

## Backend Model

### SocialMediaPostInsight

```prisma
model SocialMediaPostInsight {
  id              String @id @default(uuid())
  postId          String
  clientProfileId String
  platform        SocialMediaPlatform
  date            DateTime
  impressions     Int?
  reach           Int?
  likes           Int?
  comments        Int?
  shares          Int?
  saves           Int?
  profileVisits   Int?
  follows         Int?
  clicks          Int?
  engagementRate  Decimal?
  raw             Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### SocialMediaReport

Eğer mevcut generic report model varsa onu kullan.

Yoksa minimal model:

```prisma
model SocialMediaReport {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  periodStart     DateTime
  periodEnd       DateTime
  type            SocialMediaReportType
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
enum SocialMediaReportType {
  WEEKLY
  MONTHLY
  POST_PERFORMANCE
  CONTENT_CALENDAR
  CREATIVE_PERFORMANCE
  ENGAGEMENT_REPORT
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/social-media/clients/:clientId/insights
POST /api/v1/social-media/posts/:postId/insights
GET /api/v1/social-media/clients/:clientId/reports
POST /api/v1/social-media/clients/:clientId/reports
PATCH /api/v1/social-media/reports/:id
POST /api/v1/social-media/reports/:id/publish
```

Client:

```http
GET /api/v1/client/social-media/insights
GET /api/v1/client/social-media/reports
```

## Metrics

Gösterilecek metrikler:

- reach
- impressions
- likes
- comments
- shares
- saves
- profile visits
- follows
- clicks
- engagement rate
- top posts
- posting consistency
- content type breakdown

## Client Panel

Social Media > Performans:

- KPI cards
- top posts
- content type performance
- engagement trend
- platform breakdown

Social Media > Reports:

- weekly/monthly reports
- report acknowledgement
- client-visible reports only

## Admin/Employee Panel

Social Media workspace:

- post performance input/sync
- report draft
- report publish
- client-visible toggle
- acknowledgement request

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `SocialMediaPostInsight` modelini ekle.
2. Generic report modeli varsa Social Media reports oraya bağla.
3. Yoksa minimal `SocialMediaReport` modeli ekle.
4. Insight create/list endpointleri ekle.
5. Report draft/publish endpointleri ekle.
6. Client own visible insights/reports endpointleri ekle.
7. Client Panel performans ve rapor sekmelerini API-driven yap.
8. Admin/Employee report/insight UI ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Admin post insight create.
- Employee assigned post insight create.
- Client own visible insights görür.
- Other client insights inaccessible.
- Report draft client’a görünmez.
- clientVisible report client’a görünür.
- Publish report acknowledgement oluşturabilir.

Frontend:

- Client performance section render.
- Top posts render.
- Reports list render.
- Admin report draft form.
- Insight input/list render.
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

- Social Media insight snapshot sistemi çalışır.
- Client-visible report client panelde görünür.
- Internal draft client’a görünmez.
- Performans sekmesi API-driven çalışır.
- Testler geçer.