# Google Ads Kullanım Kılavuzu ve Rol Yetkileri

Bu doküman, mevcut kod durumuna göre Google Ads modülünde kimlerin ne yapabildiğini açıklar.

## 1) Bölüm Nereden Kullanılır?

- Admin panel: `/google-ads` ve müşteri detayındaki Google Ads kartı (`/musteriler/:id`).
- Employee panel: `/employee/google-ads` (workspace).
- Client panel: `Google Ads Dashboard` (own-client scope).

## 2) Erişim Modeli

- Tüm employee işlemleri `assigned client` scope ile çalışır.
- Employee workspace'te müşteri listesi sadece `ACTIVE GOOGLE_ADS` servisi olan ve çalışana atanmış müşterileri gösterir.
- Client panel sadece kendi müşteri profili (`own`) verisini okuyabilir.

## 3) Rol Bazlı Yetki Matrisi

| Rol | Neler yapabilir? |
|---|---|
| `ADMIN` | Tüm client'larda config oku/güncelle, manual connect, test, disconnect, sync/retry, global liste/sync log, admin report akışları |
| `PROJECT_MANAGER` | Assigned Google Ads config + raporlama okuma, sync tetikleme, not/mesaj, onay akışları, workspace operasyonları |
| `PERFORMANCE_SPECIALIST` | Assigned raporlama + config okuma, sync tetikleme, not/rapor akışı, recommendation aksiyonları (workspace içinde) |
| `DESIGNER` | Assigned raporlama görünümü ve onay geçmişi/görünürlüğü (daha sınırlı); config/sync/report-manage işlemleri sınırlı |
| `CLIENT_OWNER` / `CLIENT_MEMBER` | Sadece own Google Ads config/summary/campaign/ad-group/ads/keywords/conversions/search terms/insights ve own report okuma |
| Diğer employee rolleri | Google Ads workspace rol eşlemesi yok, erişim yok |

## 4) Permission -> Aksiyon Eşleşmesi (Özet)

- `googleAds.config.read.any`: Admin client config/connection/summary okumaları.
- `googleAds.config.manage.any`: Admin config update, manual connect/test/disconnect.
- `googleAds.sync.run.any`: Admin sync/retry.
- `googleAds.config.read.assigned`: Employee assigned config endpointleri.
- `googleAds.reporting.read.assigned`: Employee assigned reporting endpointleri.
- `googleAds.sync.read.assigned`: Employee assigned sync.
- `googleAds.notes.manage.assigned`: Employee report create/update ve not işlemlerinde kullanılır.
- `googleAds.approvals.create.assigned`: Approval/ack talep akışları.
- `googleAds.config.read.own` + `reports.read.own`: Client own görünümü.

## 5) Tipik Kullanım Akışı

1. Admin müşteri Google Ads bağlantısını config + token ile hazırlar.
2. Employee (PM/Performance/Designer) atanmış müşteri workspace'inde raporlama ve rolüne uygun aksiyonları yürütür.
3. Client panelde sadece own rapor/özet verisini görür, onay ve ack sürecine dahil olur.

## 6) Kod Referansları

- `server/src/google-ads/google-ads.controller.ts`
- `server/prisma/seed.ts`
- `adminandemployeePanel/src/app/employee/components/GoogleAdsWorkspace.tsx`
