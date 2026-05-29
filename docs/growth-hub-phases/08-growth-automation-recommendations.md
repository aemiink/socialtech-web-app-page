<!-- docs/growth-hub-phases/08-growth-automation-recommendations.md -->

# FAZ 8 — Growth Automation ve Recommendation Layer

## Amaç

Growth Hub’ın yalnızca veri gösteren bir dashboard değil, aksiyon öneren bir büyüme sistemi haline gelmesini sağlamak.

Bu fazda AI zorunlu değildir. İlk etapta rule-based recommendation sistemi kurulmalı.

## Recommendation Kaynakları

Öneriler şu kaynaklardan üretilebilir:

- channel summaries
- pending approvals
- overdue tasks
- sprint/release delays
- low ROAS
- high CPA
- low conversion rate
- no recent report
- no recent action
- client waiting state
- design approval pending
- platform config missing
- sync error

## Backend Model

```prisma
model GrowthHubRecommendation {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  type            GrowthHubRecommendationType
  priority        GrowthHubActionPriority
  title           String
  description     String?
  source          String?
  relatedEntityType String?
  relatedEntityId   String?
  status          GrowthHubRecommendationStatus @default(OPEN)
  clientVisible   Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enumlar:

```prisma
enum GrowthHubRecommendationType {
  CHANNEL_OPTIMIZATION
  BUDGET_SHIFT
  CREATIVE_REFRESH
  LANDING_PAGE_REVIEW
  APPROVAL_REMINDER
  REPORTING_REQUIRED
  TECHNICAL_FIX
  STRATEGY_REVIEW
}

enum GrowthHubRecommendationStatus {
  OPEN
  ACCEPTED
  DISMISSED
  CONVERTED_TO_TASK
  DONE
}
```

## Rule Examples

Örnek kurallar:

```text
pending approvals > 3
→ Müşteri onay bekleyenleri hatırlatma önerisi

channel status = WAITING_CONFIG
→ Platform bağlantısı tamamlanmalı

open tasks overdue > 0
→ Geciken operasyon taskları için aksiyon önerisi

ROAS target altında
→ Kreatif / bütçe / landing page optimizasyon önerisi

No weekly note this week
→ Haftalık growth yorumu hazırlanmalı

No client-visible report this month
→ Aylık growth raporu hazırlanmalı
```

## Endpointler

Admin / Employee:

```http
GET /api/v1/growth-hub/clients/:clientId/recommendations
POST /api/v1/growth-hub/clients/:clientId/recommendations/generate
PATCH /api/v1/growth-hub/recommendations/:id
POST /api/v1/growth-hub/recommendations/:id/convert-to-task
```

Client:

```http
GET /api/v1/clients/me/growth-hub/recommendations
```

Client sadece `clientVisible=true` önerileri görmeli.

## UI

### Admin/Employee

Growth Hub workspace:

- recommendations list
- priority
- source
- accept/dismiss
- convert to task
- client visible toggle

### Client Panel

Growth Hub dashboard:

- “Önerilen Sonraki Adımlar”
- sadece client-visible recommendations
- teknik/internal detay yok

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Recommendation model ve enumları ekle.
2. Rule-based recommendation service oluştur.
3. Generate endpoint ekle.
4. Convert to task flow ekle.
5. Admin/employee recommendation UI ekle.
6. Client Panel’de client-visible recommendations göster.
7. Tests ekle.
8. Shared memory güncelle.

## Testler

Backend:

- Rule-based generate öneri üretir.
- Client sadece clientVisible recommendations görür.
- Internal recommendations client’a görünmez.
- PM assigned client recommendation update yapabilir.
- Out-of-scope blocked.
- Recommendation convert-to-task task oluşturur.

Frontend:

- Admin/PM recommendations render.
- Generate action.
- Convert to task action.
- Client recommendations render.
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

- Rule-based Growth recommendations çalışır.
- PM/Admin önerileri yönetebilir.
- Öneri task’a dönüşebilir.
- Client sadece client-visible önerileri görür.
- Testler geçer.
