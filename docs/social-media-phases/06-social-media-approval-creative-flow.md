<!-- docs/social-media-phases/06-social-media-approval-creative-flow.md -->

# FAZ 6 — Social Media Approval ve Creative Flow

## Amaç

Social Media operasyonunda müşteri onayı gereken alanları standart approval sistemiyle birleştirmek.

Bu fazda post, caption, kreatif ve içerik takvimi onay süreçleri client panelde görünür ve yönetilebilir hale gelecek.

## Onay Türleri

Yeni veya mevcut approval type’larına bağlanacak:

- SOCIAL_MEDIA_POST_APPROVAL
- SOCIAL_MEDIA_CREATIVE_APPROVAL
- SOCIAL_MEDIA_CAPTION_APPROVAL
- SOCIAL_MEDIA_CALENDAR_APPROVAL
- SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT

Eğer genel approval sistemi enum genişletmeye uygunsa ekle.

Değilse `entityType=SOCIAL_MEDIA_*` yaklaşımı kullanılabilir.

## Approval Trigger Örnekleri

### Post Approval

- Social Media Specialist postu hazırlar.
- Caption + creative + platform + scheduledAt gösterilir.
- Client onaylar veya revize ister.

### Creative Approval

- Designer creative yükler.
- Client preview görür.
- Onayla / Revize iste.

### Caption Approval

- Caption/copy müşteri onayına gönderilir.
- Client red note girebilir.

### Calendar Approval

- Haftalık/aylık içerik takvimi müşteri onayına gönderilebilir.
- V1’de summary text + post list ile ilerleyebilir.

### Report Acknowledgement

- Sosyal medya raporu paylaşıldığında “Okudum” flow.

## Client Panel

Social Media panelinde:

- Pending approvals card.
- Post preview.
- Creative preview.
- Caption preview.
- Calendar approval modal.
- Approval history.

## Admin/Employee Panel

Social Media workspace içinde:

- approval create
- approval status
- rejection note
- revision task create
- post status update

## Creative Asset Flow

Mevcut ProjectFiles / design asset yapısı kullanılsın.

Creative asset alanları:

- image/video file
- clientVisible
- approvalRequired
- approvalStatus
- postId reference optional
- platform optional
- caption/copy optional

## Status Update Rules

Approval sonucu post status’u etkileyebilir:

```text
APPROVED → post status APPROVED
REJECTED → post status REVISION_REQUIRED veya REJECTED
ACKNOWLEDGED → report/calendar info acknowledged
```

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut client approval workflow’u incele.
2. Social Media approval type/entity mapping ekle.
3. Social Media post/creative asset flow’u ProjectFiles sistemiyle bağla.
4. Social Media Client Panel içine approval cards/modal ekle.
5. Admin/Employee Social Media workspace içine approval create/status UI ekle.
6. Approval response sonrası post status update bağla.
7. Creative approval red note -> revision/task create flow mümkünse bağla; büyükse follow-up olarak bırak.
8. Tests ekle.
9. Shared memory güncelle.

## Testler

Backend:

- Social Media post approval create.
- Social Media creative approval create.
- Caption approval create.
- Client approval approve/reject.
- Rejection note kaydedilir.
- Approval result post status günceller.
- Employee/admin status görür.
- Client başka client approval göremez.
- Internal creative client’a görünmez.

Frontend:

- Client pending Social Media approval popup görür.
- Post preview render.
- Creative preview render.
- Caption render.
- Approve/reject mutation.
- Admin/employee approval status render.
- Rejection note render.
- Permission disabled state.

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

```bash
cd clientPanel
npm run build
npm run check
npm run test:run
```

## Kabul Kriterleri

- Social Media approval flow mevcut approval sistemiyle entegre.
- Müşteri post/caption/creative/calendar onayı verebilir.
- Çalışan müşteri cevabını görür.
- Approval sonucu post status’a yansır.
- Rejection note task/revision akışına dönüşebilir veya follow-up olarak açıkça işaretlenir.
- Testler geçer.

## 2026-05-29 Implementation Checkpoint

Faz 6 uygulama kapsamı:

- Shared `MetaAdsApprovalType` enumu Social Media approval değerleriyle genişletildi:
  - `SOCIAL_MEDIA_POST_APPROVAL`
  - `SOCIAL_MEDIA_CREATIVE_APPROVAL`
  - `SOCIAL_MEDIA_CAPTION_APPROVAL`
  - `SOCIAL_MEDIA_CALENDAR_APPROVAL`
  - `SOCIAL_MEDIA_REPORT_ACKNOWLEDGEMENT`
- Client approval response guard’ı `SOCIAL_MEDIA` project serviceKey’ini kabul eder hale getirildi.
- Linked Social Media post approval response sonucu post status’a bağlandı:
  - `APPROVED` -> `APPROVED`
  - `CHANGES_REQUESTED` / `REJECTED` -> `REVISION_REQUIRED`
- Rejection/revision response note mevcut shared task akışıyla follow-up revision task üretir.
- Employee Social Media workspace’te calendar approval create artık `SOCIAL_MEDIA_CALENDAR_APPROVAL` üretir.
- Onay bekleyen post satırlarına `SOCIAL_MEDIA_POST_APPROVAL` task create + `approvalTaskId` link + `clientVisible=true` aksiyonu eklendi.
- Employee approval task listesi approval type ve rejection note bilgisini gösterir.
- Client portal Social Media approvals tabı yeni Social Media approval type değerlerini normalize eder, pending task’ı gösterir ve approve/revision mutation akışını kullanır.

Kapsam dışı / follow-up:

- Creative asset approval ayrı ProjectFile-level approval UI olarak genişletilmedi; mevcut creative preview + task reference altyapısı kullanılabilir durumda bırakıldı.
- Calendar approval modalı V1’de shared pending approvals paneli üzerinden ilerler; dedicated modal ayrı UX follow-up olabilir.

Doğrulama:

- `server`: `npm run prisma:generate`
- `server`: `npm run check`
- `server`: `DATABASE_URL=<.../socialtech_server_test> ALLOW_E2E_DB_RESET=true npm run test:e2e -- social-media-authz.e2e-spec.ts` (`15/15`)
- `adminandemployeePanel`: `npm run test:run -- src/app/employee/pages/__tests__/SocialMediaWorkspace.test.tsx` (`7/7`)
- `adminandemployeePanel`: `npm run check`
- `clientPanel`: `npm test -- src/app/pages/__tests__/service-tab-page.social-media.test.tsx` (`3/3`)
- `clientPanel`: `npm run check`
