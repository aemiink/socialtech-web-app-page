<!-- docs/social-media-phases/01-social-media-backend-foundation.md -->

# FAZ 1 — Social Media Backend Foundation: Config, Summary API ve Permissions

## Amaç

Social Media hizmeti alan her müşteri için backend’de müşteri bazlı Social Media yapılandırması ve summary API altyapısını kurmak.

Bu fazda amaç tüm içerik takvimini bitirmek değil; Social Media panelinin gerçek API contract üzerinden çalışacağı temel backend yapısını oluşturmaktır.

## Ürün Kararı

Social Media bir purchased service olarak çalışacak.

Bir müşteri için `SOCIAL_MEDIA` hizmeti ACTIVE ise:

- Client Panel’de Social Media dashboard görünecek.
- Admin Client create/edit ekranında Social Media configuration alanları açılacak.
- Social Media Specialist / Designer / Project Manager assigned scope içinde müşterinin Social Media operasyonunu görebilecek.
- Client yalnızca kendi Social Media summary’sini görebilecek.

## Backend Model

Yeni model ekle:

```prisma
model ClientSocialMediaConfig {
  id                 String   @id @default(uuid())
  clientProfileId    String   @unique
  instagramUsername  String?
  instagramAccountId String?
  facebookPageId     String?
  tiktokUsername     String?
  linkedinPageUrl    String?
  contentFrequency   String?
  primaryGoal        SocialMediaGoal?
  toneOfVoice        String?
  hashtags           String[]
  connectionStatus   SocialMediaConnectionStatus @default(NOT_CONNECTED)
  lastSyncAt         DateTime?
  syncError          String?
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  clientProfile ClientProfile @relation(fields: [clientProfileId], references: [id])
}
```

Enumlar:

```prisma
enum SocialMediaGoal {
  BRAND_AWARENESS
  COMMUNITY_GROWTH
  ENGAGEMENT
  LEAD_GENERATION
  SALES_SUPPORT
  REPUTATION
  MIXED
}

enum SocialMediaConnectionStatus {
  NOT_CONNECTED
  PENDING
  CONNECTED
  ERROR
  DISCONNECTED
}
```

## Backend Module

Yeni module:

```text
server/src/social-media/
```

Önerilen dosyalar:

```text
server/src/social-media/social-media.module.ts
server/src/social-media/social-media.service.ts
server/src/social-media/social-media-summary.service.ts
server/src/social-media/admin-social-media.controller.ts
server/src/social-media/client-social-media.controller.ts
server/src/social-media/dto/*
```

## Backend Endpointler

Admin / Employee:

```http
GET /api/v1/social-media/clients/:clientId/config
PATCH /api/v1/social-media/clients/:clientId/config
GET /api/v1/social-media/clients/:clientId/summary
```

Client:

```http
GET /api/v1/client/social-media/config
GET /api/v1/client/social-media/summary
```

## Summary Kaynakları

Social Media summary V1’de şu kaynaklardan hesaplanmalı:

- ClientPurchasedService
- Project.serviceKey
- Task / TaskTodo
- ClientApprovalRequest
- ProjectFile
- Reports
- SocialMediaPost, Faz 2’den sonra
- SocialMediaPostInsight, Faz 8’den sonra

Mock veri dönme.

Veri yoksa şu state dönmeli:

```text
NO_DATA
WAITING_CONFIG
WAITING_CONTENT_PLAN
```

## Authorization

Admin:

- all Social Media clients.

Project Manager / Social Media Specialist / Designer:

- assigned SOCIAL_MEDIA clients only.

Client:

- own clientProfile + ACTIVE SOCIAL_MEDIA purchased service only.

## Permissions

Yeni permissionlar:

```text
socialMedia.config.read.any
socialMedia.config.manage.any
socialMedia.config.read.assigned
socialMedia.summary.read.any
socialMedia.summary.read.assigned
```

Admin:

```text
socialMedia.config.read.any
socialMedia.config.manage.any
socialMedia.summary.read.any
```

Project Manager / Social Media Specialist / Designer:

```text
socialMedia.config.read.assigned
socialMedia.summary.read.assigned
```

Client:

- own client scope endpoint üzerinden readonly.

## Admin Client Create/Edit Entegrasyonu

`SOCIAL_MEDIA` purchased service seçilirse ek alanlar açılmalı:

- Instagram username
- Instagram account ID
- Facebook page ID
- TikTok username
- LinkedIn page URL
- Content frequency
- Primary goal
- Tone of voice
- Hashtags
- Notes

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Prisma schema’ya `ClientSocialMediaConfig`, `SocialMediaGoal`, `SocialMediaConnectionStatus` ekle.
2. Migration-first convention kullan; `db push` kullanma.
3. `server/src/social-media/` module oluştur.
4. Admin/employee config read/update endpointlerini ekle.
5. Client own config summary endpointini ekle.
6. Social Media summary endpointini V1 data kaynaklarına bağla.
7. Permission ve seed mapping ekle.
8. Admin Clients create/edit flow’da SOCIAL_MEDIA seçilince config alanlarını göster.
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

- Her müşteri için Social Media config tutulabiliyor.
- Admin create/edit sırasında Social Media bilgileri alınabiliyor.
- Social Media summary endpointleri gerçek kaynaklardan hesaplama yapıyor.
- Client yalnızca kendi Social Media summary’sini görebiliyor.
- Assigned employee sadece assigned Social Media müşterisini görebiliyor.
- Mock response yok.
- Testler geçiyor.