<!-- docs/amazon-ads-phases/06-amazon-ads-employee-workspaces.md -->

# FAZ 6 — Employee Amazon Ads Workspaces: Performance Specialist, Project Manager, Designer

## Amaç

Amazon Ads operasyonu admin ve client panelle sınırlı kalmamalı. İlgili çalışan rolleri kendi scope’larında Amazon Ads müşterilerini yönetebilmeli.

Kural:

Amazon Ads paneli şu roller üzerinde çalışacak:

- Admin
- Project Manager
- Performance Specialist
- Designer, sınırlı creative/asset görünürlüğü için
- Client

## Role-Based Görünümler

### Performance Specialist

Görebilmeli:

- assigned Amazon Ads clients
- Sponsored Products performance
- Sponsored Brands performance
- Sponsored Display performance
- ASIN/SKU performance
- search terms
- ACOS/ROAS
- budget pacing
- optimization notes
- anomalies

Aksiyon:

- optimization note
- report preparation
- approval request for budget/campaign changes
- task create/update
- performance recommendation create

### Project Manager

Görebilmeli:

- assigned Amazon Ads clients
- project/service workspace
- active tasks
- reports
- approvals
- client messages
- sprint/release, mevcut delivery yapısı uygunsa

Aksiyon:

- task create/update
- approval request oluşturma
- client message cevaplama
- report publish flow
- employee assignment visibility

### Designer

Görebilmeli:

- creative asset requests
- Sponsored Brands creative tasks
- Store/creative assets, varsa
- approved visual assets
- pending creative approvals

Aksiyon:

- creative asset upload
- client-visible creative share
- design approval request
- task todo update

## Employee Panel Pages

Mevcut employee role-based pages korunmalı.

Yeni generic component önerisi:

```text
adminandemployeePanel/src/app/employee/components/AmazonAdsWorkspace.tsx
```

Sayfalar:

- Amazon Ads Müşterilerim
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- Ürünler / ASIN
- Arama Terimleri
- Raporlar
- Onaylar

Eğer role-specific sayfa açmak büyürse:

- tek `AmazonAdsWorkspace` component
- role prop/permission’a göre görünüm değişir.

## Backend Authorization

Yeni permissions:

```text
amazonAds.reporting.read.assigned
amazonAds.notes.manage.assigned
amazonAds.approvals.create.assigned
amazonAds.sync.read.assigned
amazonAds.recommendations.manage.assigned
```

Performance Specialist:

- reporting read assigned
- notes manage assigned
- approvals create assigned
- recommendations manage assigned

Project Manager:

- reporting read assigned
- notes manage assigned
- approvals create assigned
- project/task/workspace management assigned

Designer:

- creative/design asset manage assigned
- design approval create assigned
- limited reporting read assigned

## Data Scope

Employee sadece:

- kendisine assigned client
- client’ın ACTIVE AMAZON_ADS service’i
- serviceKey=AMAZON_ADS project

verisini görmeli.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Employee role mapping ve sidebar yapısını incele.
2. Performance Specialist, Project Manager ve Designer için Amazon Ads workspace entry ekle.
3. Assigned Amazon Ads clients listesi oluştur.
4. Generic `AmazonAdsWorkspace` component oluştur.
5. Role-specific sections ekle:
   - Performance: metrics/optimization/reporting/search terms/ASIN
   - Project Manager: project/tasks/reports/approvals/messages
   - Designer: creative/design approvals/assets
6. Existing task/project/files/approval APIs ile bağla.
7. Amazon Ads reporting endpointlerini assigned scope ile bağla.
8. Permission-aware UX ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

- Performance specialist assigned Amazon Ads müşterilerini görür.
- Performance specialist Amazon Ads metrics görür.
- Project Manager Amazon Ads service workspace açar.
- Designer creative/design asset upload action görür.
- Employee out-of-scope client data göremez.
- Non-Amazon purchased service clients listelenmez.
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

- Performance specialist assigned Amazon Ads müşterilerini görür.
- Project Manager assigned Amazon Ads workspace yönetebilir.
- Designer creative/design asset yükleyebilir.
- Employee out-of-scope client data göremez.
- Testler geçer.