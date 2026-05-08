<!-- docs/amazon-ads-phases/07-amazon-ads-approval-product-collaboration.md -->

# FAZ 7 — Amazon Ads Approval, Product ve Client Collaboration

## Amaç

Amazon Ads operasyonunda müşteri onayı gereken alanları standart approval sistemiyle birleştirmek.

## Onay Türleri

Yeni veya mevcut approval type’larına bağlanacak:

- AMAZON_ADS_CAMPAIGN_APPROVAL
- AMAZON_ADS_BUDGET_CHANGE_APPROVAL
- AMAZON_ADS_REPORT_ACKNOWLEDGEMENT
- AMAZON_ADS_STRATEGY_APPROVAL
- AMAZON_ADS_CREATIVE_APPROVAL
- AMAZON_ADS_PRODUCT_PROMOTION_APPROVAL
- AMAZON_ADS_SEARCH_TERM_ACTION_APPROVAL

Eğer genel approval sistemi enum genişletmeye uygunsa ekle.

Değilse `entityType=AMAZON_ADS_*` yaklaşımı kullanılabilir.

## Approval Trigger Örnekleri

### Campaign Launch Approval

- Yeni kampanya yayına alınmadan müşteri onayı.
- Campaign summary göster.
- Ad product type, budget, ASIN/SKU, targeting ve hedef bilgileri göster.

### Budget Change Approval

- Performance specialist bütçe artışı/azalışı önerir.
- Müşteri onaylar/reddeder.

### Product Promotion Approval

- Belirli ASIN/SKU için reklam bütçesi veya kampanya önerisi.
- Müşteri onaylar/reddeder.

### Search Term Action Approval

- Search term negatifleme veya keyword ekleme önerisi.
- V1’de sadece summary text ile ilerleyebilir.

### Creative Approval

- Sponsored Brands / Sponsored Display creative asset yüklenirse müşteri onayı istenebilir.
- Client preview görür.
- Onayla / Revize iste.

### Report Acknowledgement

- Haftalık/aylık rapor paylaşıldığında “Okudum” flow.

## Client Panel

Amazon Ads panelinde:

- Pending approvals card.
- Campaign launch confirmation.
- Budget approval modal.
- Product promotion approval.
- Search term action approval.
- Creative preview, varsa.
- Approval history.

## Admin/Employee Panel

Amazon Ads workspace içinde:

- approval create
- approval status
- rejection note
- revision/task create

## Creative / Product Asset Flow

Mevcut project files / design asset yapısı kullanılsın.

Creative/product asset alanları:

- image/video/file
- ASIN/SKU reference optional
- clientVisible
- approvalRequired
- approvalStatus
- campaign/ad group reference optional
- performance summary optional

## Codex Görevi

Aynı repository context’i üzerinden devam et.

Bu görev gerçek implementasyon görevidir.

Şunları yap:

1. Mevcut client approval workflow’u incele.
2. Amazon Ads approval type/entity mapping ekle.
3. Amazon Ads creative/product asset flow’u project files/design asset sistemiyle bağla.
4. Amazon Ads Client Panel içine approval cards/modal ekle.
5. Admin/Employee Amazon Ads workspace içine approval create/status UI ekle.
6. Budget change, campaign launch, product promotion ve report acknowledgement flowlarını bağla.
7. Search term action approval V1 için text/summary tabanlı olabilir.
8. Creative approval red note -> revision/task create flow mümkünse bağla; büyükse follow-up olarak bırak.
9. Tests ekle.
10. Shared memory güncelle.

## Testler

Backend:

- Amazon Ads campaign approval create.
- Amazon Ads budget approval create.
- Amazon Ads product promotion approval create.
- Amazon Ads report acknowledgement create.
- Client approval approve/reject/acknowledge.
- Rejection note kaydedilir.
- Employee/admin status görür.
- Client başka client approval göremez.
- Internal creative/product asset client’a görünmez.

Frontend:

- Client pending Amazon Ads approval popup görür.
- Campaign/budget/product approval content render.
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

- Amazon Ads approval flow mevcut approval sistemiyle entegre.
- Müşteri campaign/budget/product/report onayı verebilir.
- Çalışan müşteri cevabını görür.
- Rejection note task/revision akışına dönüşebilir veya follow-up olarak açıkça işaretlenir.
- Testler geçer.