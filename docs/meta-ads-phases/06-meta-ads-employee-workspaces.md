<!-- docs/meta-ads-phases/06-meta-ads-employee-workspaces.md -->

# FAZ 6 — Employee Meta Ads Workspaces: Social Media Specialist, Performance Specialist, Designer

## Amaç

Meta Ads operasyonu admin ve client panelle sınırlı kalmamalı. İlgili çalışan rolleri kendi scope’larında Meta Ads müşterilerini yönetebilmeli.

Kural:

Meta Ads paneli şu roller üzerinde çalışacak:

- Admin
- Social Media Specialist
- Performance Specialist
- Designer
- Client

## Role-Based Görünümler

### Social Media Specialist

Görebilmeli:

- assigned Meta Ads clients
- campaign summary
- campaign calendar
- copy/content notes
- approval requests
- client messages
- reports

Aksiyon:

- agency note ekleme
- creative/copy task oluşturma
- approval request oluşturma
- client message cevaplama

### Performance Specialist

Görebilmeli:

- campaign/adset/ad performance
- spend/result/CPA/CTR/CPM trend
- budget pacing
- optimization notes
- anomalies

Aksiyon:

- optimization note
- report preparation
- approval request for budget/campaign changes
- task create/update

### Designer

Görebilmeli:

- creative requests
- design tasks
- creative performance
- client-approved creatives
- pending design approvals

Aksiyon:

- creative asset upload
- client-visible creative share
- design approval request
- task todo update

## Employee Panel Pages

Mevcut employee role-based pages korunmalı.

Yeni generic component önerisi:

```text
adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx
```

Sayfalar:

- Meta Ads Müşterilerim
- Kampanyalar
- Kreatifler
- Raporlar
- Onaylar

Eğer role-specific sayfa açmak büyürse:

- tek `MetaAdsWorkspace` component
- role prop/permission’a göre görünüm değişir.

## Backend Authorization

Yeni permissions:

```text
metaAds.reporting.read.assigned
metaAds.creatives.manage.assigned
metaAds.notes.manage.assigned
metaAds.approvals.create.assigned
metaAds.sync.read.assigned
```

Social Media Specialist:

- reporting read assigned
- notes manage assigned
- approvals create assigned

Performance Specialist:

- reporting read assigned
- notes manage assigned
- approvals create assigned

Designer:

- creative/design asset manage assigned
- design approval create assigned
- limited reporting read assigned

## Data Scope

Employee sadece:

- kendisine assigned client
- client’ın ACTIVE META_ADS service’i
- serviceKey=META_ADS project

verisini görmeli.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Employee role mapping ve sidebar yapısını incele.
2. Social Media Specialist, Performance Specialist ve Designer için Meta Ads workspace entry ekle.
3. Assigned Meta Ads clients listesi oluştur.
4. Generic `MetaAdsWorkspace` component oluştur.
5. Role-specific sections ekle:
   - Social Media: campaign/copy/approval/messages
   - Performance: metrics/optimization/reporting
   - Designer: creative/design approvals/assets
6. Existing task/project/files/approval APIs ile bağla.
7. Meta Ads reporting endpointlerini assigned scope ile bağla.
8. Permission-aware UX ekle.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

- Social media specialist assigned Meta Ads müşterilerini görür.
- Performance specialist assigned Meta Ads metrics görür.
- Designer creative/design asset upload action görür.
- Employee out-of-scope client data göremez.
- Non-Meta purchased service clients listelenmez.
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

- Social media specialist assigned Meta Ads müşterilerini görür.
- Designer creative/design asset yükleyebilir.
- Performance specialist performance metriklerini görür.
- Employee out-of-scope client data göremez.
- Testler geçer.