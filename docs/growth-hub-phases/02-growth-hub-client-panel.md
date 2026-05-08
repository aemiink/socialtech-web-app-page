<!-- docs/growth-hub-phases/02-growth-hub-client-panel.md -->

# FAZ 2 — Growth Hub Client Panel: API-driven Dashboard

## Amaç

Client Panel’deki Growth Hub dashboard’u mock/static veriden çıkarıp gerçek API-driven hale getirmek.

Mevcut tasarım korunacak; data source değişecek.

## Mevcut Dosya

Öncelikle şu dosyaları incele:

```text
clientPanel/src/app/pages/services/growth-hub-dashboard.tsx
clientPanel/src/app/data/service-pages.ts
clientPanel/src/app/pages/service-tab-page.tsx
clientPanel/src/app/features/*
```

## Client Panel Sekmeleri

Growth Hub için önerilen sekmeler:

1. Genel Bakış
2. Kanallar
3. Haftalık Aksiyonlar
4. Onaylar
5. Raporlar
6. Ajans Yorumu
7. Son Aktiviteler

## Backend Endpointler

Client:

```http
GET /api/v1/client/growth-hub/summary
GET /api/v1/client/growth-hub/channels
GET /api/v1/client/growth-hub/actions
GET /api/v1/client/growth-hub/activity
GET /api/v1/client/growth-hub/config
```

## Dashboard Alanları

Mevcut mock tasarım korunarak şu alanlar API-driven olmalı:

### KPI Cards

- total leads
- total spend
- blended ROAS
- pending approvals
- open tasks
- completed actions this week

### Growth Health

- health score
- health status
- risks
- opportunities

### Weekly Growth Summary

- weekly note
- completed actions
- next focus
- agency comment

### Channel Performance

- Meta Ads
- Google Ads
- TikTok Ads
- Amazon Ads
- Social Media
- Web App / Landing Page
- SEO Audit

Kanal data yoksa mock gösterme. Şu state kullanılmalı:

```text
Veri henüz bağlanmadı
Bağlantı bekleniyor
Bu hizmet aktif değil
Bu kanal için henüz rapor yok
```

### Client Actions

- pending approvals
- client-visible tasks/actions
- meeting confirmations
- report acknowledgements

### Recent Activity

- completed tasks
- new reports
- approvals
- files
- messages
- sprint/release events

## RTK Query

Yeni feature oluştur:

```text
clientPanel/src/app/features/growthHub/
  growthHubApi.ts
  growthHubTypes.ts
  growthHubUtils.ts
```

Hooks:

```ts
useGetClientGrowthHubSummaryQuery
useGetClientGrowthHubChannelsQuery
useGetClientGrowthHubActionsQuery
useGetClientGrowthHubActivityQuery
```

## UI Davranışı

- Loading state.
- Error state.
- Empty state.
- Connection/config missing state.
- Purchased service restore logic bozulmasın.
- Client yalnızca kendi Growth Hub verisini görsün.
- Mock fallback yok.
- Mevcut görsel düzen korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `GrowthHubDashboard` içindeki static/mock dataları tespit et.
2. Mevcut tasarımı koru.
3. Client Growth Hub RTK Query feature oluştur.
4. Summary/channels/actions/activity endpointlerini bağla.
5. Loading/error/empty states ekle.
6. Client purchased service authorization restore logic bozulmasın.
7. Mock fallback kaldır.
8. Onaylar bölümü mevcut client approvals sistemiyle bağlansın.
9. Raporlar bölümü mevcut report/client-visible report sistemiyle bağlansın, endpoint yoksa explicit empty-state.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

ClientPanel:

- GROWTH_HUB purchased service varsa panel görünür.
- GROWTH_HUB yoksa panel görünmez.
- Summary endpoint data render eder.
- Channel list render eder.
- Actions render eder.
- Recent activity render eder.
- Pending approvals render eder.
- API error state.
- Empty/no data state.
- Unauthorized client başka client data göremez.
- Mock fallback yok.

## Validation Komutları

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

Backend touched ise:

```bash
cd server
npm run prisma:generate
npm run prisma:seed
npm run build
npm run check
ALLOW_E2E_DB_RESET=true npm run test:e2e:authz
```

## Kabul Kriterleri

- Client Panel Growth Hub tasarımı korunur.
- Dashboard API-driven olur.
- Mock fallback kaldırılır.
- Müşteri sadece kendi Growth Hub verisini görür.
- Testler geçer.