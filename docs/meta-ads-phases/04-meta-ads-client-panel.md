<!-- docs/meta-ads-phases/04-meta-ads-client-panel.md -->

# FAZ 4 — Meta Ads Client Panel: Yönetilebilir ve Sürdürülebilir Sekme Yapısı

## Amaç

Client Panel’deki Meta Ads panelinin tüm sekmeleri yönetilebilir, sürdürülebilir ve API-driven hale gelmeli.

Mevcut tasarım korunacak; mock veriler gerçek data contract ile beslenecek.

## Client Panel Ana Sayfa

Dosya:

```text
clientPanel/src/app/pages/services/meta-ads-dashboard.tsx
```

Bu dosya korunacak; sadece data source değişecek.

## Sekmeler

Önerilen Meta Ads sekmeleri:

1. Genel Bakış
2. Kampanyalar
3. Reklam Setleri
4. Reklamlar / Kreatifler
5. Kitleler
6. Pixel / Event Durumu
7. Raporlar
8. Ajans Notları
9. Onaylar

## Her Sekmenin Backend Karşılığı

### Genel Bakış

Endpoint:

```http
GET /api/v1/client/meta-ads/summary
```

Gösterilecek:

- spend
- impressions
- reach
- clicks
- ctr
- cpc
- cpm
- results
- cost per result
- ROAS
- trend chart

### Kampanyalar

Endpoint:

```http
GET /api/v1/client/meta-ads/campaigns
```

Gösterilecek:

- campaign name
- objective
- status
- spend
- results
- cost per result
- ctr
- cpm

### Reklam Setleri

Endpoint:

```http
GET /api/v1/client/meta-ads/adsets
```

Gösterilecek:

- campaign
- adset name
- targeting summary
- budget summary
- result metrics

### Reklamlar / Kreatifler

Endpoint:

```http
GET /api/v1/client/meta-ads/ads
```

Gösterilecek:

- ad name
- creative thumbnail, API sağlıyorsa
- status
- spend
- ctr
- result
- creative notes

### Pixel / Event Durumu

Endpoint:

```http
GET /api/v1/client/meta-ads/pixel-status
```

Gösterilecek:

- pixel id
- event status
- last event time
- event match quality, erişilebiliyorsa
- setup warning

### Raporlar

Mevcut reports altyapısı kullanılabilir.

Meta Ads report entity bağlanmalı.

### Ajans Notları

Project/task/workspace message veya özel `MetaAdsNote` modeliyle ilerlenebilir.

V1’de client approval/info sistemi kullanılabilir.

### Onaylar

Client approval workflow ile entegre:

- campaign launch approval
- creative approval
- budget change approval
- report acknowledgement

## UI Davranışı

- Loading / error / empty state.
- Connection not configured state.
- Last sync date.
- “Veriler Meta’dan alınmıştır” bilgilendirmesi.
- Büyük teknik hata yerine sade client-facing mesaj.
- Mock fallback yok.
- Tasarım korunmalı.

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. `clientPanel` Meta Ads dashboard ve tab yapısını incele.
2. Mevcut mock tasarımı koru.
3. Meta Ads client RTK Query feature oluştur veya mevcut feature’ı genişlet.
4. Summary, campaigns, adsets, ads, pixel-status endpointlerini bağla.
5. Loading/error/empty/connection-missing states ekle.
6. Purchased service authorization restore logic bozulmasın.
7. Client only own scope data görsün.
8. Onaylar sekmesini mevcut client approvals sistemiyle bağla.
9. Reports sekmesini mevcut reports veya Meta Ads report endpointine bağlamaya hazır hale getir.
10. Tests ekle.
11. Shared memory güncelle.

## Testler

ClientPanel:

- META_ADS purchased service varsa panel görünür.
- META_ADS yoksa panel görünmez.
- Summary endpoint data render eder.
- Connection missing empty state.
- Campaign list render.
- API error state.
- Tab switching data query.
- Unauthorized client başka client data göremez.
- Approvals tab pending approval gösterir.
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

- Client Panel Meta Ads tasarımı korunur.
- Sekmeler API-driven olur.
- Mock fallback kaldırılır.
- Müşteri sadece kendi Meta Ads verisini görür.
- Testler geçer.