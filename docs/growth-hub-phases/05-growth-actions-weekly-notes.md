<!-- docs/growth-hub-phases/05-growth-actions-weekly-notes.md -->

# FAZ 5 — Growth Actions ve Weekly Notes

## Amaç

Growth Hub’ın en önemli operasyonel katmanını oluşturmak:

- haftalık aksiyonlar
- müşteri bekleyenleri
- ajans yorumu
- büyüme notları
- riskler
- gelecek hafta odağı

Bu fazda Growth Hub müşteriye “ne oldu, ne yapılacak, ne bekleniyor?” sorusunu net cevaplamalı.

## Backend Models

### GrowthHubAction

```prisma
model GrowthHubAction {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  title           String
  description     String?
  ownerUserId     String?
  status          GrowthHubActionStatus @default(TODO)
  priority        GrowthHubActionPriority @default(MEDIUM)
  dueAt           DateTime?
  clientVisible   Boolean @default(true)
  relatedEntityType String?
  relatedEntityId   String?
  createdByUserId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Enumlar:

```prisma
enum GrowthHubActionStatus {
  TODO
  IN_PROGRESS
  DONE
  BLOCKED
  CANCELLED
}

enum GrowthHubActionPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### GrowthHubWeeklyNote

```prisma
model GrowthHubWeeklyNote {
  id              String @id @default(uuid())
  clientProfileId String
  projectId       String?
  weekStart       DateTime
  weekEnd         DateTime
  summary         String
  nextFocus       String?
  risks           Json?
  clientVisible   Boolean @default(true)
  createdByUserId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/growth-hub/clients/:clientId/actions
POST /api/v1/growth-hub/clients/:clientId/actions
PATCH /api/v1/growth-hub/actions/:id
DELETE /api/v1/growth-hub/actions/:id

GET /api/v1/growth-hub/clients/:clientId/weekly-notes
POST /api/v1/growth-hub/clients/:clientId/weekly-notes
PATCH /api/v1/growth-hub/weekly-notes/:id
```

Client:

```http
GET /api/v1/client/growth-hub/actions
GET /api/v1/client/growth-hub/weekly-notes
```

## UI

### Client Panel

Growth Hub dashboard’da:

- Ajans Yorumu
- Haftalık Özet
- Gelecek Hafta Odağı
- Bekleyen Aksiyonlar
- Tamamlanan Aksiyonlar
- Riskler

Client sadece `clientVisible=true` olan action/note görmeli.

### Admin/Employee Panel

Growth Hub workspace içinde:

- action create/edit
- status update
- priority
- owner assignment
- weekly note create/edit
- clientVisible toggle
- related entity link

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `GrowthHubAction` ve `GrowthHubWeeklyNote` modellerini ekle.
2. Migration-first convention kullan.
3. Backend endpoints ekle.
4. Assigned scope authorization ekle.
5. Client visible filtering ekle.
6. Admin/PM/Growth Lead UI action/note yönetimi ekle.
7. Client Panel Growth Hub dashboard’da weekly note ve actions alanlarını API’ye bağla.
8. Tests ekle.
9. Shared memory güncelle.

## Testler

Backend:

- Admin action create/update/delete.
- PM assigned client action create/update.
- PM out-of-scope action create blocked.
- Client only clientVisible actions görür.
- Client internal actions görmez.
- Weekly note clientVisible true ise client görür.
- Internal weekly note client’a görünmez.

Frontend:

- Client weekly note render.
- Client visible actions render.
- Admin/PM action create form.
- Status update.
- Weekly note create/edit.
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

- Growth actions yönetilebilir.
- Weekly agency note yönetilebilir.
- Client yalnızca client-visible içerikleri görür.
- Growth Hub dashboard ajans yorumu ve aksiyonları API-driven gösterir.
- Testler geçer.