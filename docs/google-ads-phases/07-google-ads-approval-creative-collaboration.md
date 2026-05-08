<!-- docs/google-ads-phases/07-google-ads-approval-creative-collaboration.md -->

# FAZ 7 — Google Ads Approval, Creative ve Client Collaboration

## Amaç

Google Ads operasyonunda müşteri onayı gereken alanları standart approval sistemiyle birleştirmek.

## Onay Türleri

Yeni veya mevcut approval type’larına bağlanacak:

- GOOGLE_ADS_CAMPAIGN_APPROVAL
- GOOGLE_ADS_BUDGET_CHANGE_APPROVAL
- GOOGLE_ADS_REPORT_ACKNOWLEDGEMENT
- GOOGLE_ADS_STRATEGY_APPROVAL
- GOOGLE_ADS_CREATIVE_APPROVAL
- GOOGLE_ADS_KEYWORD_PLAN_APPROVAL

Eğer genel approval sistemi enum genişletmeye uygunsa ekle.

Değilse `entityType=GOOGLE_ADS_*` yaklaşımı kullanılabilir.

## Approval Trigger Örnekleri

### Campaign Launch Approval

- Yeni kampanya yayına alınmadan müşteri onayı.
- Campaign summary göster.
- Budget, channel type, bidding strategy ve hedef bilgileri göster.

### Budget Change Approval

- Performance specialist bütçe artışı/azalışı önerir.
- Müşteri onaylar/reddeder.

### Keyword Plan Approval

- Yeni keyword seti veya search term negatifleme önerisi için onay alınabilir.
- V1’de sadece summary text ile ilerleyebilir.

### Creative Approval

- Display/Performance Max creative asset yüklenirse müşteri onayı istenebilir.
- Client preview görür.
- Onayla / Revize iste.

### Report Acknowledgement

- Haftalık/aylık rapor paylaşıldığında “Okudum” flow.

## Client Panel

Google Ads panelinde:

- Pending approvals card.
- Campaign launch confirmation.
- Budget approval modal.
- Keyword plan approval.
- Creative preview, varsa.
- Approval history.

## Admin/Employee Panel

Google Ads workspace içinde:

- approval create
- approval status
- rejection note
- revision/task create

## Creative Asset Flow

Mevcut project files / design asset yapısı kullanılsın.

Creative asset alanları:

- image/video/file
- clientVisible
- approvalRequired
- approvalStatus
- campaign/ad/ad group reference optional
- performance summary optional

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut client approval workflow’u incele.
2. Google Ads approval type/entity mapping ekle.
3. Google Ads creative asset flow’u project files/design asset sistemiyle bağla.
4. Google Ads Client Panel içine approval cards/modal ekle.
5. Admin/Employee Google Ads workspace içine approval create/status UI ekle.
6. Budget change, campaign launch ve report acknowledgement flowlarını bağla.
7. Keyword plan approval V1 için text/summary tabanlı olabilir.
8. Creative approval red note -> revision/task create flow mümkünse bağla; büyükse follow-up olarak bırak.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Google Ads campaign approval create.
- Google Ads budget approval create.
- Google Ads report acknowledgement create.
- Client approval approve/reject/acknowledge.
- Rejection note kaydedilir.
- Employee/admin status görür.
- Client başka client approval göremez.
- Internal creative client’a görünmez.

Frontend:

- Client pending Google Ads approval popup görür.
- Campaign/budget approval content render.
- Approve/reject mutation.
- Acknowledge mutation.
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

- Google Ads approval flow mevcut approval sistemiyle entegre.
- Müşteri campaign/budget/report onayı verebilir.
- Çalışan müşteri cevabını görür.
- Rejection note task/revision akışına dönüşebilir veya follow-up olarak açıkça işaretlenir.
- Testler geçer.