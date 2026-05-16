# Meta Ads Kullanım Kılavuzu ve Rol Yetkileri

Bu doküman, mevcut kod durumuna göre Meta Ads modülünde kimlerin ne yapabildiğini açıklar.

## 1) Bölüm Nereden Kullanılır?

- Admin panel: `/meta-ads` ve müşteri detayındaki Meta Ads kartı.
- Employee panel: `/employee/meta-ads` (workspace).
- Client panel: `Meta Ads Dashboard` (own-client scope).

## 2) Erişim Modeli

- Employee işlemleri assigned client scope ile çalışır.
- Workspace'te sadece `ACTIVE META_ADS` servisi olan ve atama kapsamında kalan müşteriler listelenir.
- Client panel only-own prensibiyle çalışır.

## 3) Rol Bazlı Yetki Matrisi

| Rol | Neler yapabilir? |
|---|---|
| `ADMIN` | Tüm client'larda config/connect/test/disconnect/sync/retry, global client listesi + sync log, admin report lifecycle |
| `PROJECT_MANAGER` | Assigned config+reporting, notes, approvals, creatives, sync; workspace operasyonları |
| `PERFORMANCE_SPECIALIST` | Assigned config+reporting, optimization odaklı aksiyonlar, notes/approvals/sync; rolüne uygun workspace sekmeleri |
| `SOCIAL_MEDIA_SPECIALIST` | Assigned config+reporting, sosyal kampanya odaklı rapor/onay/not/sync aksiyonları |
| `DESIGNER` | Creatives + approvals odaklı kullanım, assigned rapor görüntüleme; notes/sync tarafı daha sınırlı |
| `CLIENT_OWNER` / `CLIENT_MEMBER` | Sadece own Meta Ads config/summary/campaign/adset/ads/pixel/insights ve own report okuma |

## 4) Permission -> Aksiyon Eşleşmesi (Özet)

- `metaAds.config.read.any`: Admin read endpointleri.
- `metaAds.config.manage.any`: Admin config/manage/connect/test/disconnect.
- `metaAds.sync.run.any` (veya manage akışı): Admin sync/retry.
- `metaAds.config.read.assigned`: Employee assigned read endpointleri.
- `metaAds.reporting.read.assigned`: Employee report read endpointleri.
- `metaAds.sync.read.assigned`: Employee assigned sync.
- `metaAds.notes.manage.assigned`: Rapor taslağı/not operasyonları.
- `metaAds.approvals.create.assigned`: Approval ve ack talep akışları.
- `metaAds.creatives.manage.assigned`: Creative asset operasyonları.
- `metaAds.config.read.own` + `reports.read.own`: Client own görünümü.

## 5) Tipik Kullanım Akışı

1. Admin bağlantıyı yapılandırır ve ilk sync doğrulamasını yapar.
2. Employee rolüne göre (social/performance/designer/pm) workspace sekmelerinde görev, rapor, approval ve creative süreçlerini yürütür.
3. Client panelde sadece own veriyi takip eder.

## 6) Kod Referansları

- `server/src/meta-ads/meta-ads.controller.ts`
- `server/prisma/seed.ts`
- `adminandemployeePanel/src/app/employee/components/MetaAdsWorkspace.tsx`
