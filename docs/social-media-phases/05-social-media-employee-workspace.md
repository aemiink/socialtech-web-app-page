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

## 2026-05-28 Implementation Checkpoint

Faz 5 uygulama kapsamı:

- Employee `/employee/social-media` rotası eklendi.
- `SocialMediaWorkspace` componenti Social Media Specialist, Designer ve Project Manager için rol bazlı tab setiyle çalışır.
- Assigned client listesi `clients.read.assigned` + aktif `social-media` purchased service filtresiyle oluşturulur.
- Summary/posts/projects/tasks RTK Query hookları assigned scope üzerinden tüketilir.
- Content calendar sekmesi mevcut shared `SocialMediaContentCalendar` bileşenini embedded kullanır.
- Designer creative action `socialMedia.creatives.manage.assigned` / asset manage permission ile görünür.
- Social Media approval task create akışı `socialMedia.approvals.create.assigned` permission bridge’i ile shared task endpointine bağlandı; Faz 5 checkpointinde `approvalType=null` bırakıldı, Faz 6 ile bu karar `SOCIAL_MEDIA_*` approval type değerleriyle superseded oldu.
- `socialMedia.reports.manage.assigned` ve `socialMedia.notes.manage.assigned` seed permissionları workspace aksiyon zemini için eklendi.

Doğrulama:

- `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true npm run test:e2e -- social-media-authz.e2e-spec.ts` (`14/14`)
- `server`: `npm run check`
- `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx` (`6/6`)
- `adminandemployeePanel`: `npm run check`
- Browser smoke: `/employee/social-media` unauthenticated durumda `/login` redirect eder.

## 2026-05-29 Manual Role Matrix Checkpoint

Faz 6 öncesi `socialtech_server_test` seed DB üstünde manuel UI turu tamamlandı:

- Social Media Specialist (`social@socialtech.com`): `/employee/social-media` sadece assigned Acme Social Media workspace’i gösterdi; `Onaylar` tabında approval create aksiyonu çalıştı.
- Designer (`designer@socialtech.com`): assigned Acme Social Media workspace’i gördü; `Kreatifler` tabı, `Kreatif İşler`, `Asset Havuzu` ve `Creative Asset Yükle` aksiyonu görünür oldu.
- Project Manager (`project@socialtech.com`): workspace overview’da Acme Social Media özetini, aktif proje/content calendar/report aksiyonlarını gördü.
- Out-of-scope kontrolü: Nova Performance ve Mavi Sosyal bu seed kullanıcı turunda görünmedi.

Seed hizalaması:

- Acme için kalıcı `SOCIAL_MEDIA` purchased service ve `acme-social-media-calendar` projesi eklendi.
- Designer için Acme `DESIGN` assignment fixture’ı eklendi.

Not:

- Faz 6 ile Social Media approval task’ları artık `approvalType=null` yerine `SOCIAL_MEDIA_*` approval type değerleriyle oluşturulur.
