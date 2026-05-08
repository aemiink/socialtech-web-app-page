<!-- docs/meta-ads-phases/07-meta-ads-approval-creative-collaboration.md -->

# FAZ 7 — Meta Ads Approval, Creative ve Client Collaboration

## Amaç

Meta Ads operasyonunda müşteri onayı gereken alanları standart approval sistemiyle birleştirmek.

## Onay Türleri

Yeni veya mevcut approval type’larına bağlanacak:

- META_ADS_CAMPAIGN_APPROVAL
- META_ADS_CREATIVE_APPROVAL
- META_ADS_BUDGET_CHANGE_APPROVAL
- META_ADS_REPORT_ACKNOWLEDGEMENT
- META_ADS_STRATEGY_APPROVAL

Eğer genel approval sistemi enum genişletmeye uygunsa ekle.

Değilse `entityType=META_ADS_*` yaklaşımı kullanılabilir.

## Approval Trigger Örnekleri

### Campaign Launch Approval

- Yeni kampanya yayına alınmadan müşteri onayı.
- Campaign summary göster.
- Budget, objective, audience summary.

### Creative Approval

- Designer creative yükler.
- Client preview görür.
- Onayla / Revize iste.

### Budget Change Approval

- Performance specialist bütçe artışı önerir.
- Müşteri onaylar/reddeder.

### Report Acknowledgement

- Aylık rapor paylaşıldığında “Okudum” flow.

## Client Panel

Meta Ads panelinde:

- Pending approvals card.
- Creative preview.
- Campaign launch confirmation.
- Budget approval modal.
- Approval history.

## Admin/Employee Panel

Meta Ads workspace içinde:

- approval create
- approval status
- rejection note
- revision task create

## Creative Asset Flow

Mevcut project files / design asset yapısı kullanılsın.

Creative asset alanları:

- image/video file
- clientVisible
- approvalRequired
- approvalStatus
- campaign/ad/adset reference optional
- performance summary optional

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut client approval workflow’u incele.
2. Meta Ads approval type/entity mapping ekle.
3. Meta Ads creative asset flow’u project files/design asset sistemiyle bağla.
4. Meta Ads Client Panel içine approval cards/modal ekle.
5. Admin/Employee Meta Ads workspace içine approval create/status UI ekle.
6. Creative approval red note -> revision/task create flow mümkünse bağla; büyükse follow-up olarak bırak.
7. Tests ekle.
8. Shared memory güncelle.

## Testler

Backend:

- Meta Ads campaign approval create.
- Meta Ads creative approval create.
- Client approval approve/reject.
- Rejection note kaydedilir.
- Employee/admin status görür.
- Client başka client approval göremez.
- Internal creative client’a görünmez.

Frontend:

- Client pending Meta Ads approval popup görür.
- Creative preview render.
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

- Meta Ads approval flow mevcut approval sistemiyle entegre.
- Müşteri creative/campaign/budget onayı verebilir.
- Çalışan müşteri cevabını görür.
- Rejection note task/revision akışına dönüşebilir veya follow-up olarak açıkça işaretlenir.
- Testler geçer.