<!-- docs/growth-hub-phases/04-growth-hub-employee-workspace.md -->

# FAZ 4 — Employee Growth Hub Workspace: Project Manager / Growth Lead

## Amaç

Growth Hub operasyonu admin ve client panelle sınırlı kalmamalı. Project Manager / Growth Lead assigned scope içinde Growth Hub müşterilerini yönetebilmeli.

## Role-Based Görünümler

### Project Manager / Growth Lead

Görebilmeli:

- assigned Growth Hub clients
- client growth summary
- channel summaries
- pending approvals
- open tasks
- weekly actions
- reports
- client messages
- recent activity
- risks and recommendations

Aksiyon:

- growth action oluşturma
- task oluşturma
- approval request oluşturma
- weekly note yazma
- client message cevaplama
- report publish flow
- employee assignment visibility

### Performance Specialist

Growth Hub içinde performance kanallarında görünür olabilir:

- Meta / Google / TikTok / Amazon channel summaries
- performance notes
- optimization recommendations

### Social Media Specialist

Growth Hub içinde social/content kanalında görünür olabilir:

- content actions
- creative approvals
- social media progress

### Designer

Growth Hub içinde creative/design actionlarında görünür olabilir:

- pending design approvals
- creative requests
- design asset status

## Employee Panel Pages

Mevcut employee role-based pages korunmalı.

Yeni generic component önerisi:

```text
adminandemployeePanel/src/app/employee/components/GrowthHubWorkspace.tsx
```

Sayfalar:

- Growth Hub Müşterilerim
- Growth Özeti
- Kanallar
- Haftalık Aksiyonlar
- Onaylar
- Raporlar
- Mesajlar

Eğer role-specific sayfa açmak büyürse:

- tek `GrowthHubWorkspace` component
- role/permission’a göre görünüm değişir.

## Backend Authorization

Yeni permissions:

```text
growthHub.summary.read.assigned
growthHub.actions.manage.assigned
growthHub.notes.manage.assigned
growthHub.approvals.create.assigned
growthHub.reports.manage.assigned
```

Project Manager / Growth Lead:

- summary read assigned
- actions manage assigned
- notes manage assigned
- approvals create assigned
- reports manage assigned

Performance Specialist / Social Media Specialist / Designer:

- limited summary read assigned
- own domain action visibility
- approval creation if permission exists

## Data Scope

Employee sadece:

- kendisine assigned client
- client’ın ACTIVE GROWTH_HUB service’i
- serviceKey=GROWTH_HUB project veya client-level Growth Hub context

verisini görmeli.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Employee role mapping ve sidebar yapısını incele.
2. Project Manager / Growth Lead için Growth Hub workspace entry ekle.
3. Assigned Growth Hub clients listesi oluştur.
4. Generic `GrowthHubWorkspace` component oluştur.
5. Sections ekle:
   - summary
   - channels
   - weekly actions
   - approvals
   - reports
   - messages
   - activity
6. Existing task/project/files/approval/report APIs ile bağla.
7. Growth Hub summary endpointlerini assigned scope ile bağla.
8. Permission-aware UX ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

- Project Manager assigned Growth Hub müşterilerini görür.
- Growth Hub workspace açılır.
- Channel summaries render olur.
- Weekly actions render olur.
- Approval create action görünür.
- Employee out-of-scope client data göremez.
- Non-Growth purchased service clients listelenmez.
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

- Project Manager / Growth Lead assigned Growth Hub müşterilerini görür.
- Growth Hub workspace API-driven çalışır.
- Employee out-of-scope client data göremez.
- Testler geçer.