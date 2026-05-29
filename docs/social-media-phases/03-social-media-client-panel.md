<!-- docs/social-media-phases/03-social-media-client-panel.md -->

# FAZ 3 — Social Media Client Panel: API-driven Dashboard

## Amaç

Client Panel’deki Social Media dashboard’u gerçek API-driven hale getirmek.

Mevcut tasarım korunacak; data source değişecek.

## Client Panel Sekmeleri

Social Media için önerilen sekmeler:

1. Genel Bakış
2. İçerik Takvimi
3. Postlar
4. Onaylar
5. Kreatifler
6. Performans
7. Raporlar
8. Ajans Notları

## Backend Endpointler

Client:

```http
GET /api/v1/client/social-media/summary
GET /api/v1/client/social-media/posts
GET /api/v1/client/social-media/calendar
GET /api/v1/client/social-media/approvals
GET /api/v1/client/social-media/reports
GET /api/v1/client/social-media/config
```

## Dashboard Alanları

### KPI Cards

- planned posts
- published posts
- waiting approval posts
- rejected/revision required posts
- creative assets
- reports

### İçerik Takvimi

- upcoming posts
- scheduled posts
- status badges
- platform badges
- post type badges

### Onay Bekleyenler

- waiting approval posts
- creative approvals
- caption approvals
- calendar approvals

### Kreatifler

- client-visible creative assets
- post-linked assets
- image/video preview
- approval status

### Ajans Notları

- weekly note
- next content focus
- risk/warning notes

### Raporlar

- published reports
- report acknowledgement

## RTK Query

Yeni feature oluştur:

```text
clientPanel/src/app/features/socialMedia/
  socialMediaApi.ts
  socialMediaTypes.ts
  socialMediaUtils.ts
```

Hooks:

```ts
useGetClientSocialMediaSummaryQuery
useGetClientSocialMediaPostsQuery
useGetClientSocialMediaCalendarQuery
useGetClientSocialMediaConfigQuery
```

## UI Davranışı

- Loading state.
- Error state.
- Empty state.
- Connection/config missing state.
- Purchased service restore logic bozulmasın.
- Client yalnızca kendi Social Media verisini görsün.
- Client internal draft postları görmesin.
- Mock fallback yok.
- Mevcut görsel düzen korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Client Panel Social Media dashboard/service page yapısını incele.
2. Mevcut tasarımı koru.
3. Client Social Media RTK Query feature oluştur.
4. Summary/posts/calendar/config endpointlerini bağla.
5. Loading/error/empty states ekle.
6. Client purchased service authorization restore logic bozulmasın.
7. Mock fallback kaldır.
8. Onaylar bölümü mevcut client approvals sistemiyle bağlansın.
9. Kreatifler bölümü ProjectFiles/client-visible asset sistemiyle bağlansın.
10. Raporlar bölümü mevcut report/client-visible report sistemiyle bağlansın.
11. Tests ekle.
12. Shared memory güncelle.

## Testler

ClientPanel:

- SOCIAL_MEDIA purchased service varsa panel görünür.
- SOCIAL_MEDIA yoksa panel görünmez.
- Summary endpoint data render eder.
- Calendar posts render eder.
- Waiting approval posts render eder.
- Creative assets render eder.
- Internal draft postlar görünmez.
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

- Client Panel Social Media tasarımı korunur.
- Dashboard API-driven olur.
- Mock fallback kaldırılır.
- Client yalnızca kendi Social Media verisini görür.
- Internal content client’a sızmaz.
- Testler geçer.

---

# Faz 3 Çıktısı — 2026-05-28

## Durum

- Faz durumu: **Tamamlandı**
- Sonuç: Client Panel Social Media dashboard ve sekmeleri API-driven hale getirildi.

## Uygulananlar

- Own-client summary güvenliği sıkılaştırıldı: client summary post/asset read modelinde yalnızca `clientVisible=true` postlar ve `CLIENT_VISIBLE` project file kayıtları döner.
- Client Portal Social Media RTK Query feature’ı `config`, `summary`, `posts` ve `calendar` hook’larını kapsayacak şekilde genişletildi.
- `social-media-dashboard` KPI, strateji, ajans notu, kreatif ve takvim alanlarını API verisinden render eder; static DM/trend/competitor fallback blokları kaldırıldı.
- `ServiceTabPage` Social Media tabları generic static renderer yerine dedicated API/empty-state workspace kullanır.
- Pending approvals tabı mevcut client task approval sistemiyle `social-media` project service tasklarını gösterir.
- Reports/performance gibi kalıcı data source’u Faz 8’e bırakılan alanlarda mock içerik yerine açık empty/no-source state gösterilir.

## Doğrulama

- `clientPanel`: Social Media dashboard + service tab tests (`6/6`) ✅
- `clientPanel`: `npm run typecheck` ✅
- `clientPanel`: `npm run build` ✅
- `server`: `npm run typecheck` ✅
- `server`: `npm run typecheck:spec` ✅
- `server`: `npm run check` ✅
- `server`: `socialtech_server_test` e2e `social-media-authz.e2e-spec.ts` (`11/11`) ✅
