<!-- docs/social-media-phases/05-social-media-employee-workspace.md -->

# FAZ 5 — Employee Social Media Workspace: Social Media Specialist / Designer / Project Manager

## Amaç

Social Media operasyonu admin ve client panelle sınırlı kalmamalı. Social Media Specialist, Designer ve Project Manager assigned scope içinde Social Media müşterilerini yönetebilmeli.

## Role-Based Görünümler

### Social Media Specialist

Görebilmeli:

- assigned Social Media clients
- content calendar
- posts
- captions
- pending approvals
- client messages
- reports
- recent activity

Aksiyon:

- post idea oluşturma
- caption yazma/güncelleme
- post status güncelleme
- approval request oluşturma
- client message cevaplama
- weekly/social note yazma

### Designer

Görebilmeli:

- creative asset requests
- posts in DESIGN / REVISION_REQUIRED status
- approved/rejected creatives
- project files
- pending creative approvals

Aksiyon:

- creative asset upload
- post asset bağlama
- client-visible creative share
- design approval request
- task todo update

### Project Manager

Görebilmeli:

- assigned Social Media clients
- project/service workspace
- post calendar health
- geciken postlar
- pending approvals
- reports
- messages
- tasks

Aksiyon:

- post/task oluşturma
- approval request oluşturma
- client message cevaplama
- report publish flow
- employee assignment visibility

## Employee Panel Pages

Mevcut employee role-based pages korunmalı.

Yeni generic component önerisi:

```text
adminandemployeePanel/src/app/employee/components/SocialMediaWorkspace.tsx
```

Sayfalar:

- Social Media Müşterilerim
- İçerik Takvimi
- Postlar
- Kreatifler
- Onaylar
- Raporlar
- Mesajlar

Eğer role-specific sayfa açmak büyürse:

- tek `SocialMediaWorkspace` component
- role/permission’a göre görünüm değişir.

## Backend Authorization

Yeni permissions:

```text
socialMedia.summary.read.assigned
socialMedia.posts.manage.assigned
socialMedia.creatives.manage.assigned
socialMedia.approvals.create.assigned
socialMedia.reports.manage.assigned
socialMedia.notes.manage.assigned
```

Social Media Specialist:

- summary read assigned
- posts manage assigned
- approvals create assigned
- notes manage assigned

Designer:

- creatives manage assigned
- limited post read assigned
- creative approval create assigned

Project Manager:

- posts manage assigned
- approvals create assigned
- reports manage assigned
- project/task/workspace management assigned

## Data Scope

Employee sadece:

- kendisine assigned client
- client’ın ACTIVE SOCIAL_MEDIA service’i
- serviceKey=SOCIAL_MEDIA project veya client-level Social Media context

verisini görmeli.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Employee role mapping ve sidebar yapısını incele.
2. Social Media Specialist / Designer / Project Manager için Social Media workspace entry ekle.
3. Assigned Social Media clients listesi oluştur.
4. Generic `SocialMediaWorkspace` component oluştur.
5. Sections ekle:
   - summary
   - content calendar
   - posts
   - creatives
   - approvals
   - reports
   - messages
6. Existing task/project/files/approval/report APIs ile bağla.
7. Social Media endpoints assigned scope ile bağla.
8. Permission-aware UX ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

- Social Media Specialist assigned Social Media müşterilerini görür.
- Designer creative/design asset upload action görür.
- Project Manager Social Media service workspace açar.
- Employee out-of-scope client data göremez.
- Non-Social-Media purchased service clients listelenmez.
- Permission yoksa action disabled.
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

- Social Media Specialist assigned Social Media müşterilerini görür.
- Designer creative/design asset yükleyebilir.
- Project Manager assigned Social Media workspace yönetebilir.
- Employee out-of-scope client data göremez.
- Testler geçer.