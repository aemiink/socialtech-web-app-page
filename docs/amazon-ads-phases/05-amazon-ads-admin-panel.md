<!-- docs/amazon-ads-phases/05-amazon-ads-admin-panel.md -->

# FAZ 5 — Admin Amazon Ads Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında her müşteri için Amazon Ads yapılandırma, bağlantı, sync, raporlama ve panel yönetimi yapılabilmeli.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Services / Amazon Ads admin page
4. Reports
5. Approvals
6. Employee assignment

## Admin Client Create/Edit

`AMAZON_ADS` seçildiğinde:

- Amazon Ads Profile ID
- Advertiser ID
- Marketplace ID
- Region
- Country Code
- Account Type
- Currency
- Connection mode
- Initial sync option

Alanlar required mı?

- Faz 1’de optional.
- Faz 3 sonrası profileId + connectionStatus warning olabilir.

## ClientDetail Amazon Ads Tab

Gösterilecek:

- Amazon Ads config
- connection status
- profile id
- marketplace id
- region
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

## Admin Amazon Ads Global Page

Route:

```text
/amazon-ads
```

Gösterilecek:

- Amazon Ads hizmeti alan tüm müşteriler
- connection status
- spend summary
- sales summary
- ACOS/ROAS summary
- last sync
- error clients
- pending approvals
- assigned employees

## Permissions

Yeni permissions:

```text
amazonAds.config.read.any
amazonAds.config.manage.any
amazonAds.reporting.read.any
amazonAds.sync.run.any
amazonAds.approvals.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin ClientDetail içinde Amazon Ads tab/section oluştur.
2. Global admin `/amazon-ads` route/page ekle.
3. Amazon Ads hizmeti alan müşterileri listele.
4. Connection status, last sync, spend/sales/ACOS/ROAS summary, pending approvals göster.
5. Config edit modal bağla.
6. Test connection / sync / disconnect actions bağla.
7. Approval request create action ekle.
8. Employee assignment veya assigned employees visibility ekle.
9. Permission-aware UX ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Frontend:

- Admin Amazon Ads global page loading/error/empty/success.
- Amazon Ads client list render.
- Config edit action.
- Manual sync action.
- Test connection action.
- Pending approvals render.
- Permission disabled state.

Backend:

- Admin Amazon Ads clients list.
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

- Admin her müşteri için Amazon Ads yapılandırmasını yönetebilir.
- Admin global Amazon Ads panelinden tüm müşteri durumlarını görür.
- Müşteri create/edit akışında Amazon Ads bilgileri alınır.
- Testler geçer.