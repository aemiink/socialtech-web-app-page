<!-- docs/google-ads-phases/05-google-ads-admin-panel.md -->

# FAZ 5 — Admin Google Ads Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında her müşteri için Google Ads yapılandırma, bağlantı, sync, raporlama ve panel yönetimi yapılabilmeli.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Services / Google Ads admin page
4. Reports
5. Approvals
6. Employee assignment

## Admin Client Create/Edit

`GOOGLE_ADS` seçildiğinde:

- Google Ads Customer ID
- Manager Customer ID
- Account Name
- Currency
- Timezone
- Connection mode
- Initial sync option

Alanlar required mı?

- Faz 1’de optional.
- Faz 3 sonrası customerId + connectionStatus warning olabilir.

## ClientDetail Google Ads Tab

Gösterilecek:

- Google Ads config
- connection status
- customer id
- manager customer id
- last sync
- sync error
- summary metrics
- active campaigns
- assigned employees
- approval queue

Actions:

- Config düzenle
- Test connection
- Manual sync
- Disconnect
- Approval request create
- Employee assign

## Admin Google Ads Global Page

Route:

```text
/google-ads
```

Gösterilecek:

- Google Ads hizmeti alan tüm müşteriler
- connection status
- cost summary
- conversions summary
- last sync
- error clients
- pending approvals
- assigned employees

## Permissions

Yeni permissions:

```text
googleAds.config.read.any
googleAds.config.manage.any
googleAds.reporting.read.any
googleAds.sync.run.any
googleAds.approvals.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin ClientDetail içinde Google Ads tab/section oluştur.
2. Global admin `/google-ads` route/page ekle.
3. Google Ads hizmeti alan müşterileri listele.
4. Connection status, last sync, cost summary, conversion summary, pending approvals göster.
5. Config edit modal bağla.
6. Test connection / sync / disconnect actions bağla.
7. Approval request create action ekle.
8. Employee assignment veya assigned employees visibility ekle.
9. Permission-aware UX ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Frontend:

- Admin Google Ads global page loading/error/empty/success.
- Google Ads client list render.
- Config edit action.
- Manual sync action.
- Test connection action.
- Pending approvals render.
- Permission disabled state.

Backend:

- Admin Google Ads clients list.
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

- Admin her müşteri için Google Ads yapılandırmasını yönetebilir.
- Admin global Google Ads panelinden tüm müşteri durumlarını görür.
- Müşteri create/edit akışında Google Ads bilgileri alınır.
- Testler geçer.