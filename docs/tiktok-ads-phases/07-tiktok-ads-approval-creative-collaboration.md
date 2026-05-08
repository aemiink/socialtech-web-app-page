<!-- docs/tiktok-ads-phases/06-tiktok-ads-employee-workspaces.md -->

# FAZ 6 — Employee TikTok Ads Workspaces: Social Media Specialist, Performance Specialist, Designer

## Amaç

TikTok Ads operasyonu admin ve client panelle sınırlı kalmamalı. İlgili çalışan rolleri kendi scope’larında TikTok Ads müşterilerini yönetebilmeli.

Kural:

TikTok Ads paneli şu roller üzerinde çalışacak:

- Admin
- Project Manager
- Social Media Specialist
- Performance Specialist
- Designer
- Client

## Role-Based Görünümler

### Social Media Specialist

Görebilmeli:

- assigned TikTok Ads clients
- campaign summary
- ad group summary
- ad/creative performance
- content/copy notes
- approvals
- client messages
- reports

Aksiyon:

- creative/copy task oluşturma
- agency note ekleme
- approval request oluşturma
- client message cevaplama

### Performance Specialist

Görebilmeli:

- campaign/ad group/ad performance
- spend/result/CPA/CTR/CPM trend
- conversion metrics
- video performance
- budget pacing
- optimization notes
- anomalies

Aksiyon:

- optimization note
- report preparation
- approval request for budget/campaign changes
- task create/update
- performance recommendation create

### Designer

Görebilmeli:

- creative asset requests
- TikTok video/material tasks
- approved visual/video assets
- creative performance
- pending creative approvals

Aksiyon:

- creative asset upload
- client-visible creative share
- design/creative approval request
- task todo update

## Employee Panel Pages

Mevcut employee role-based pages korunmalı.

Yeni generic component önerisi:

```text
adminandemployeePanel/src/app/employee/components/TikTokAdsWorkspace.tsx
```

Sayfalar:

- TikTok Ads Müşterilerim
- Kampanyalar
- Ad Groups
- Ads
- Creatives
- Video Performance
- Raporlar
- Onaylar

Eğer role-specific sayfa açmak büyürse:

- tek `TikTokAdsWorkspace` component
- role prop/permission’a göre görünüm değişir.

## Backend Authorization

Yeni permissions:

```text
tiktokAds.reporting.read.assigned
tiktokAds.creatives.manage.assigned
tiktokAds.notes.manage.assigned
tiktokAds.approvals.create.assigned
tiktokAds.sync.read.assigned
tiktokAds.recommendations.manage.assigned
```

Social Media Specialist:

- reporting read assigned
- creatives/notes manage assigned
- approvals create assigned

Performance Specialist:

- reporting read assigned
- notes manage assigned
- approvals create assigned
- recommendations manage assigned

Designer:

- creative/design asset manage assigned
- design approval create assigned
- limited reporting read assigned

Project Manager:

- reporting read assigned
- project/task/workspace management assigned
- approvals create assigned

## Data Scope

Employee sadece:

- kendisine assigned client
- client’ın ACTIVE TIKTOK_ADS service’i
- serviceKey=TIKTOK_ADS project

verisini görmeli.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Employee role mapping ve sidebar yapısını incele.
2. Social Media Specialist, Performance Specialist, Designer ve Project Manager için TikTok Ads workspace entry ekle.
3. Assigned TikTok Ads clients listesi oluştur.
4. Generic `TikTokAdsWorkspace` component oluştur.
5. Role-specific sections ekle:
   - Social Media: campaign/copy/approval/messages
   - Performance: metrics/optimization/reporting/video performance
   - Designer: creative/design approvals/assets
   - Project Manager: project/tasks/reports/approvals/messages
6. Existing task/project/files/approval APIs ile bağla.
7. TikTok Ads reporting endpointlerini assigned scope ile bağla.
8. Permission-aware UX ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

- Social media specialist assigned TikTok Ads müşterilerini görür.
- Performance specialist TikTok Ads metrics görür.
- Designer creative/design asset upload action görür.
- Project Manager TikTok Ads service workspace açar.
- Employee out-of-scope client data göremez.
- Non-TikTok purchased service clients listelenmez.
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

- Social media specialist assigned TikTok Ads müşterilerini görür.
- Performance specialist assigned TikTok Ads metrics görür.
- Designer creative/design asset yükleyebilir.
- Project Manager assigned TikTok Ads workspace yönetebilir.
- Employee out-of-scope client data göremez.
- Testler geçer.