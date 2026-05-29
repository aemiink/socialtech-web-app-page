<!-- docs/social-media-phases/10-social-media-v2-integration-backlog.md -->

# FAZ 10 — Social Media V2 Integration Backlog Decision

## Amaç

Social Media V1 tamamlandıktan sonra gerçek platform entegrasyonu için sıradaki uygulama kararını netleştirmek.

Bu faz kod implementasyonu değil, V2 backlog contract fazıdır. Amaç publishing ve insight sync seçenekleri arasında önceliği belirleyip sonraki gerçek implementasyon fazını risksiz başlatmaktır.

## Karar

V2'nin ilk gerçek platform entegrasyonu:

```text
Instagram/Facebook Graph API publishing first
```

Insight sync:

```text
V2.1 follow-up
```

## Neden Publishing Önce?

- Faz 7 ile manual publishing lifecycle zaten kuruldu: `APPROVED -> SCHEDULED -> PUBLISHED`.
- `SocialMediaPost` modeli API publishing için gereken `externalPostId` ve `externalPostUrl` alanlarını taşıyor.
- Admin/employee UI zaten schedule ve mark-published aksiyonlarını kullanıyor; Graph API publishing bu aksiyonların arkasına provider adapter olarak eklenebilir.
- Client portal published post ve external link görünürlüğü hazır.
- Insight sync güvenilir çalışmak için platform post id eşleşmesine ihtiyaç duyar; bu eşleşme publishing entegrasyonu sonrası daha stabil olur.
- Instagram/Facebook resmi API izinleri TikTok/LinkedIn'e göre V2 başlangıcı için daha net bir ilk hedef sağlar.

## V2 Publishing Scope

İlk implementasyon hedefi Instagram ve Facebook'tur.

Backend:

- Facebook Login / Graph API credential flow için ayrı credential storage kararı.
- Token response/log leak guard.
- Instagram Business Account ve Facebook Page bağlantı doğrulaması.
- `SocialMediaPublisher` adapter sınırı.
- `publishNow` veya existing `mark-published` action arkasında provider-aware publishing.
- Başarılı publish sonrası `externalPostId`, `externalPostUrl`, `publishedAt`, `clientVisible` update.
- Provider hata normalizasyonu.
- Out-of-scope employee/client publish denemelerinde safe 403/404.

Frontend:

- Admin config içinde Instagram/Facebook connection readiness state.
- Employee workspace'te API publish hazır/değil göstergesi.
- Publish modalında manual fallback korunur.
- Client portalda yalnızca published/client-visible external link görünür.

Tests:

- Token safety.
- Admin connect/readiness.
- Assigned employee publish.
- Out-of-scope publish block.
- Provider error normalization.
- Client visibility.
- Manual fallback regression.

## V2.1 Insight Sync Scope

Publishing entegrasyonu tamamlandıktan sonra:

- Graph API insight fetch job.
- `externalPostId` -> `SocialMediaPost` eşleşmesi.
- Snapshot yazımı mevcut `SocialMediaPostInsight` modeline yapılır.
- Manual snapshot girişi fallback olarak kalır.
- Client performance tabı aynı read model'i tüketmeye devam eder.

## Out Of Scope

- Bu fazda Graph API OAuth/token implementation yok.
- Bu fazda yeni Prisma migration yok.
- TikTok ve LinkedIn publishing, resmi API izin ve app review durumuna göre ayrı follow-up'tır.
- Insight sync, publishing V2 tamamlanmadan başlatılmayacak.

## Kabul Kriterleri

- V2 önceliği dokümante edilir.
- ROAD_MAP V2 backlog'u bu phase doc'a bağlanır.
- DECISIONS içinde publishing-first kararı kayda geçer.
- Faz 7 manual publishing ve Faz 8 manual insight snapshot kararlarıyla çelişki kalmaz.
