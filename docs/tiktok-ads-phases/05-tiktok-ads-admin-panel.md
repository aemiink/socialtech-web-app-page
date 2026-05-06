<!-- docs/tiktok-ads-phases/05-tiktok-ads-admin-panel.md -->

# FAZ 5 — Admin TikTok Ads Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında her müşteri için TikTok Ads yapılandırma, bağlantı, sync, raporlama ve panel yönetimi yapılabilmeli.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Services / TikTok Ads admin page
4. Reports
5. Approvals
6. Employee assignment

## Admin Client Create/Edit

`TIKTOK_ADS` seçildiğinde:

- TikTok Advertiser ID
- Business Center ID
- Pixel ID
- Advertiser Name
- Currency
- Timezone
- Connection mode
- Initial sync option

Alanlar required mı?

- Faz 1’de optional.
- Faz 3 sonrası advertiserId + connectionStatus warning olabilir.

## ClientDetail TikTok Ads Tab

Gösterilecek:

- TikTok Ads config
- connection status
- advertiser id
- business center id
- pixel id
- last sync
- sync error
- summary metrics
- active campaigns
- top creatives
- assigned employees
- approval queue

Actions:

- Config düzenle
- Test connection
- Manual sync
- Disconnect
- Approval request create
- Employee assign

## Admin TikTok Ads Global Page

Route:

```text
/tiktok-ads
```

Gösterilecek:

- TikTok Ads hizmeti alan tüm müşteriler
- connection status
- spend summary
- conversions summary
- video performance summary
- last sync
- error clients
- pending approvals
- assigned employees

## Permissions

Yeni permissions:

```text
tiktokAds.config.read.any
tiktokAds.config.manage.any
tiktokAds.reporting.read.any
tiktokAds.sync.run.any
tiktokAds.approvals.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin ClientDetail içinde TikTok Ads tab/section oluştur.
2. Global admin `/tiktok-ads` route/page ekle.
3. TikTok Ads hizmeti alan müşterileri listele.
4. Connection status, last sync, spend/conversion/video summary, pending approvals göster.
5. Config edit modal bağla.
6. Test connection / sync / disconnect actions bağla.
7. Approval request create action ekle.
8. Employee assignment veya assigned employees visibility ekle.
9. Permission-aware UX ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Frontend:

- Admin TikTok Ads global page loading/error/empty/success.
- TikTok Ads client list render.
- Config edit action.
- Manual sync action.
- Test connection action.
- Pending approvals render.
- Permission disabled state.

Backend:

- Admin TikTok Ads clients list.
- Admin sync run.
- Admin config update.
- Token response’ta yok.
- Non-admin global page endpoint erişemez.

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

- Admin her müşteri için TikTok Ads yapılandırmasını yönetebilir.
- Admin global TikTok Ads panelinden tüm müşteri durumlarını görür.
- Müşteri create/edit akışında TikTok Ads bilgileri alınır.
- Testler geçer.