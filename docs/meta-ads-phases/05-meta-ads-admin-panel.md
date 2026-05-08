<!-- docs/meta-ads-phases/05-meta-ads-admin-panel.md -->

# FAZ 5 — Admin Meta Ads Paneli ve Müşteri Bazlı Yönetim

## Amaç

Admin tarafında her müşteri için Meta Ads yapılandırma, bağlantı, sync, raporlama ve panel yönetimi yapılabilmeli.

## Admin Panel Alanları

Eklenecek/güncellenecek yerler:

1. Clients create/edit
2. ClientDetail
3. Services / Meta Ads admin page
4. Reports
5. Approvals
6. Employee assignment

## Admin Client Create/Edit

`META_ADS` seçildiğinde:

- Business ID
- Ad Account ID
- Pixel ID
- Page ID
- Instagram Account ID
- Currency
- Timezone
- Connection mode
- Initial sync option

Alanlar required mı?

- Faz 1’de optional.
- Faz 3 sonrası adAccountId + connectionStatus warning olabilir.

## ClientDetail Meta Ads Tab

Gösterilecek:

- Meta Ads config
- connection status
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

## Admin Meta Ads Global Page

Route:

```text
/meta-ads
```

Gösterilecek:

- Meta Ads hizmeti alan tüm müşteriler
- connection status
- spend summary
- last sync
- error clients
- pending approvals
- assigned employees

## Permissions

Yeni permissions:

```text
metaAds.config.read.any
metaAds.config.manage.any
metaAds.reporting.read.any
metaAds.sync.run.any
metaAds.approvals.manage.any
```

Admin bunların tamamını alır.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Admin ClientDetail içinde Meta Ads tab/section oluştur.
2. Global admin `/meta-ads` route/page ekle.
3. Meta Ads hizmeti alan müşterileri listele.
4. Connection status, last sync, spend summary, pending approvals göster.
5. Config edit modal bağla.
6. Test connection / sync / disconnect actions bağla.
7. Approval request create action ekle.
8. Employee assignment veya assigned employees visibility ekle.
9. Permission-aware UX ekle.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

Frontend:

- Admin Meta Ads global page loading/error/empty/success.
- Meta Ads client list render.
- Config edit action.
- Manual sync action.
- Test connection action.
- Pending approvals render.
- Permission disabled state.

Backend:

- Admin Meta Ads clients list.
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

- Admin her müşteri için Meta Ads yapılandırmasını yönetebilir.
- Admin global Meta Ads panelinden tüm müşteri durumlarını görür.
- Müşteri create/edit akışında Meta Ads bilgileri alınır.
- Testler geçer.