Revise the existing Social Tech Admin Panel design.

Current state:

* Main admin pages exist.
* Visual style is good.
* Sidebar exists.
* Most pages are designed.
* But some pages are still too generic, detail pages are not dynamic enough, and several operational sections are missing.

Your task:
Improve the admin panel into a more complete, realistic agency operations panel.

Do NOT redesign everything from scratch.
Keep the current dark premium Social Tech style.
Improve the existing pages and add missing operational details.

---

# DESIGN STYLE TO KEEP

Use the same visual style:

* Dark premium SaaS / agency operations aesthetic
* Background: #131313
* Card surfaces: #1A1A1A / #202020
* Accent color: #AAFF01
* Text primary: #FFFFFF
* Text secondary: #A0A0A0
* Subtle borders #FFFFFF10
* Rounded cards 16–24px
* Clean, structured layout
* Turkish UI labels

The panel must feel:

* operational
* executive
* dense but readable
* internal admin-focused
* agency-grade

---

# GLOBAL FIXES

Apply these fixes across the whole admin panel:

1. Detail pages must feel dynamic.
   Do not show the same hardcoded detail content for every item.

2. Every detail page must show:

* item-specific header
* status badge
* responsible person
* related client/service/project
* timeline/activity
* internal notes
* action buttons

3. Sidebar active state must work visually on detail pages.
   Example:
   If user is on “Müşteri Detay”, the sidebar item “Müşteriler” must still appear active.

4. Buttons must feel actionable.
   Add modal/drawer examples where relevant:

* Yeni Müşteri Ekle
* Görev Oluştur
* Rapor Oluştur
* Toplantı Planla
* Detay
* Yönet
* Hatırlat

5. Avoid empty placeholder content.
   Every page and detail preview must contain meaningful operational data.

---

# PAGE-SPECIFIC REVISIONS

---

## 1. ADMIN DASHBOARD REVISION

Improve the dashboard with stronger operational signals.

Add / improve:

1. Agency Health Score
   A large executive card:

* Operasyon Sağlığı: 82/100
* Riskli Alanlar: 5 geciken görev, 3 müşteri yanıtı bekliyor

2. Riskli Müşteriler
   Make this more detailed:

* Müşteri
* Risk sebebi
* Son aktivite
* Sorumlu kişi
* Aksiyon button: “İncele”

3. Today’s Command Center
   Add:

* Bugünkü toplantılar
* Bugün teslim edilecek işler
* Bugün gönderilecek raporlar
* Bugün müşteri onayı bekleyen içerikler

4. Ekip Yoğunluğu
   Show workload cards:

* Çalışan adı
* Rol
* Aktif görev
* Geciken görev
* Kapasite durumu

5. Quick Actions
   Buttons:

* Yeni Müşteri
* Yeni Görev
* Yeni Rapor
* Toplantı Planla

---

## 2. MÜŞTERİLER PAGE REVISION

Improve client management.

Add:

* Advanced filter bar
* Search by client name
* Service filter
* Package filter
* Responsible manager filter
* Payment status filter

Client table must include:

* Firma
* Aktif Hizmetler
* Paket
* Sorumlu
* Durum
* Ödeme Durumu
* Son Aktivite
* Bekleyen Aksiyon
* Detay button

Add status badges:

* Aktif
* Riskli
* Beklemede
* Pasif

Add a right-side client quick preview drawer design:
When clicking a client:

* Company info
* Active services
* Last report
* Pending actions
* Button: “Müşteri Detayına Git”

---

## 3. MÜŞTERİ DETAY PAGE REVISION

This page must be a true 360° client view.

Header:

* Client name
* Status badge
* Package
* Responsible manager
* Monthly value
* Quick actions:
  Edit Client
  Create Task
  Create Report
  View Client Panel

Sections:

1. Client Overview

* Company info
* Contact person
* Email / phone
* Current package
* Payment status
* Contract status

2. Active Services
   Show service cards:

* Service name
* Status
* Responsible employee
* Latest update
* Pending action
* Button: “Hizmeti Yönet”

3. Client Panel Preview
   This is critical.
   Add a section showing what the client sees:

* Active dashboards
* Last report visible to client
* Pending approvals visible to client
* Button: “Müşteri Panelini Görüntüle”

4. Client Timeline

* Meeting completed
* Report sent
* Content approved
* Payment received
* Campaign optimized

5. Open Tasks
6. Pending Approvals
7. Reports
8. Internal Notes
9. Files

---

## 4. HİZMETLER PAGE REVISION

Improve service management.

Show all 13 services clearly:

* Growth & Hub
* Sosyal Medya Yönetimi
* Medya Hub
* Meta ADS
* TikTok ADS
* Google ADS
* Amazon ADS
* Web APP
* Mobil APP
* Landing Pages
* Web & Mobil Tasarımlar
* Teknik Destek
* SEO Denetimi

Each service card must include:

* Active client count
* Monthly revenue
* Open tasks
* Delayed tasks
* Main responsible team
* Category badge
* Button: “Detay”

Add category filters:

* Growth
* Ads
* Social
* Development
* Design
* Support
* SEO

Add service summary:

* Most requested service
* Highest revenue service
* Most delayed service
* Most profitable service

---

## 5. HİZMET DETAY PAGE REVISION

This page must be service-specific.

Create visual examples for multiple service detail variations, not just one generic service.

Create at least these service detail examples:

1. Meta ADS Service Detail
2. Web APP Service Detail
3. SEO Denetimi Service Detail
4. Teknik Destek Service Detail

Each must have different workflow and deliverables.

---

### Meta ADS Service Detail

Sections:

* Clients using Meta ADS
* Standard Workflow:
  Brief → Pixel Check → Campaign Setup → Creative Testing → Optimization → Reporting
* Task Templates:
  Pixel kontrolü
  Kreatif talebi
  Kampanya kurulumu
  Haftalık optimizasyon
  Raporlama
* Deliverables:
  Campaign setup
  Audience setup
  Creative test plan
  Pixel/event check
  Weekly optimization notes
* Team Responsibilities:
  Performance Specialist
  Designer
  Account Manager

---

### Web APP Service Detail

Sections:

* Clients using Web APP
* Standard Workflow:
  Brief → Architecture → UI/UX → Frontend → Backend/API → Testing → Launch
* Task Templates:
  UI approval
  Frontend development
  Backend API setup
  Admin panel modules
  Testing checklist
* Deliverables:
  UI screens
  Frontend
  Backend/API
  Admin panel
  Deployment
* Team Responsibilities:
  Developer
  Designer
  Project Manager

---

### SEO Denetimi Service Detail

Sections:

* Clients using SEO Denetimi
* Standard Workflow:
  Crawl → Technical Audit → Keyword Review → Speed Check → Index Review → Action Plan
* Task Templates:
  Teknik hata kontrolü
  Search Console inceleme
  Sayfa hızı kontrolü
  Keyword fırsat analizi
  Aksiyon planı
* Deliverables:
  SEO audit report
  Technical issue list
  Keyword opportunity list
  Page speed notes
  Action plan
* Team Responsibilities:
  SEO Specialist
  Technical Specialist
  Project Manager

---

### Teknik Destek Service Detail

Sections:

* Clients using Teknik Destek
* Standard Workflow:
  Ticket → Priority → Fix → Test → Client Confirmation
* Task Templates:
  Backup kontrolü
  Güvenlik kontrolü
  CMS/plugin update
  Bug fix
  Support request resolution
* Deliverables:
  Monthly maintenance
  Backup status
  Security check
  Resolved tickets
  Technical activity log
* Team Responsibilities:
  Support Specialist
  Developer
  Project Manager

---

## 6. PROJELER PAGE REVISION

Improve project management.

Add:

* Project type filters:
  Web APP
  Mobil APP
  Landing Pages
  Web & Mobil Tasarımlar

Project table must include:

* Project
* Client
* Service
* Phase
* Progress
* Deadline
* Responsible
* Risk

Add Kanban view:

* Planlandı
* Devam Ediyor
* Müşteri Bekleniyor
* İncelemede
* Tamamlandı

Add project risk badges:

* Normal
* Dikkat
* Riskli
* Gecikmiş

---

## 7. PROJE DETAY PAGE REVISION

Make project detail operational.

Sections:

* Project header
* Phase tracker:
  Brief → Planlama → Tasarım → Geliştirme → Test → Yayın → Teslim
* Sprint board
* Deliverables checklist
* Revision requests
* Files
* Internal notes
* Client visible summary

Add buttons:

* Görev Ekle
* Revizyon Ekle
* Dosya Yükle
* Müşteri Özetini Güncelle

---

## 8. GÖREVLER PAGE REVISION

Improve task system.

Add:

* Advanced filters
* Client filter
* Service filter
* Assigned employee filter
* Priority filter
* Status filter
* Deadline filter

Task table:

* Task
* Client
* Service
* Assigned
* Priority
* Deadline
* Status
* Related project
* Detail button

Add Kanban board:

* Yeni
* Devam Ediyor
* Müşteri Bekleniyor
* İncelemede
* Tamamlandı

Add priority badges:

* Low
* Medium
* High
* Urgent

---

## 9. GÖREV DETAY PAGE REVISION

Make it action-oriented.

Sections:

* Task info
* Subtasks checklist
* Activity timeline
* Client dependency block
* Internal comments
* Attachments

If waiting for client:
Show:

* What is needed?
* Send reminder button
* Last reminder date

Add buttons:

* Assign employee
* Change status
* Add comment
* Upload file

---

## 10. ONAYLAR PAGE REVISION

Improve approval workflow.

Tabs:

* İçerik
* Kreatif
* Reklam Metni
* Tasarım
* Rapor
* Revizyon

Approval table:

* Type
* Client
* Service
* Title
* Status
* Responsible
* Deadline
* Detail

Add a right-side Approval Detail Drawer:

* Preview
* Notes
* Current status
* Client comments
* Internal comments
* Buttons:
  Send to Client
  Approve Internally
  Request Revision

Status badges:

* Ajans İncelemesinde
* Müşteri Bekleniyor
* Revizyon İstendi
* Onaylandı
* Gecikti

---

## 11. KAMPANYALAR PAGE REVISION

Improve central campaign management.

Tabs:

* Meta
* Google
* TikTok
* Amazon

Campaign table:

* Campaign
* Client
* Platform
* Objective
* Budget
* Performance
* Status
* Last optimization
* Responsible

Add Optimization Queue:

* Campaigns needing action
* Reason
* Suggested action
* Assigned specialist

Add campaign preview drawer:

* KPI summary
* Creative status
* Audience/keyword notes
* Optimization history

---

## 12. İÇERİKLER PAGE REVISION

Improve content operations.

Sections:

* Calendar
* Content table
* Approval queue
* Content detail drawer

Content table:

* Content
* Client
* Platform
* Format
* Status
* Publish date
* Responsible

Content detail drawer:

* Visual preview
* Caption
* Objective
* Platform
* Approval status
* Client comments
* Buttons:
  Send to Client
  Mark as Ready
  Request Revision

---

## 13. RAPORLAR PAGE REVISION

Improve report management.

Report table:

* Report
* Client
* Service
* Period
* Status
* Created by
* Send date
* Detail button

Statuses:

* Taslak
* Hazırlanıyor
* İncelemede
* Müşteriye Gönderildi
* Gecikti

Add report template cards:

* Ads Report
* Social Media Report
* SEO Report
* Project Report
* Growth Report

Add quick action:

* Rapor Oluştur

---

## 14. RAPOR DETAY PAGE REVISION

Make report detail feel editable and reviewable.

Sections:

* Report header
* KPI summary
* What worked
* What is being improved
* Next actions
* Internal review
* Client preview

Buttons:

* Save Draft
* Send for Review
* Send to Client
* Download PDF

---

## 15. TOPLANTILAR PAGE REVISION

Improve meetings.

Sections:

* Weekly calendar
* Meeting table
* Meeting notes panel

Meeting table:

* Title
* Client
* Participants
* Date
* Type
* Status

Meeting types:

* Kickoff
* Rapor Sunumu
* Strateji
* İç Ekip
* Müşteri Görüşmesi

Meeting notes panel:

* Notes
* Action items
* Responsible people
* Follow-up date

Buttons:

* Toplantı Planla
* Not Ekle
* Aksiyon Maddesi Oluştur

---

## 16. ÇALIŞANLAR PAGE REVISION

Improve employee management.

Employee cards:

* Name
* Role
* Active tasks
* Late tasks
* Responsible clients
* Workload %
* Capacity status

Add:

* Workload chart
* Role filter
* Service expertise filter

Roles:

* Admin
* Project Manager
* Performance Specialist
* Social Media Specialist
* Designer
* Developer
* Support Specialist
* SEO Specialist

---

## 17. ÇALIŞAN DETAY PAGE REVISION

Make it workload-focused.

Sections:

* Employee header
* Assigned clients
* Active tasks
* Late tasks
* Completed this month
* Workload trend
* Performance summary
* Permissions
* Internal notes

Add:

* Service expertise
* Weekly capacity
* Task completion rate
* Delay rate

---

## 18. FİNANS PAGE REVISION

Improve finance page with agency profitability.

Add KPI cards:

* Aylık Retainer Geliri
* Tek Seferlik Proje Geliri
* Bekleyen Ödeme
* Geciken Ödeme
* Tahsilat Riski

Add sections:

1. Revenue Chart
2. Client Revenue Table
   Columns:

* Client
* Package/Service
* Monthly amount
* One-time amount
* Payment status
* Last payment
* Next payment

3. Service Revenue Breakdown

* Growth & Hub
* Ads
* Social Media
* Development
* Support
* SEO

4. Overdue Payments

* Client
* Amount
* Days overdue
* Send reminder button

5. Profitability Notes

* Most profitable client
* Low-margin service
* Payment risk

---

## 19. OTOMASYONLAR PAGE REVISION

Improve automation access/status management.

This is not a full automation builder.

Sections:

1. Automation KPI Cards

* Aktif Otomasyon
* Growth/Scale Müşterisi
* Giriş Bilgisi Verildi
* Hata Veren Akış
* Bu Hafta Tetiklenen

2. Client Automation Table
   Columns:

* Müşteri
* Paket
* Automation Hub URL
* Giriş Bilgisi
* Erişim Durumu
* Son Tetiklenme
* Akış Sağlığı
* Aksiyonlar

Actions:

* Create Login
* Reset Password
* Send Access
* Revoke Access

3. Automation Types
   Cards:

* PromptIMG
* PromptVisual
* PromptAnalysis
* PromptWhatsApp
* PromptCommander

4. Automation Health

* Working
* Warning
* Error

5. Subdomain / Hub Note
   Show clearly:
   “Otomasyonlar ayrı subdomainlerde çalışır. Growth ve Scale müşterilerine erişim açılır.”

---

## 20. AYARLAR PAGE REVISION

Settings must include all 13 active services.

Make sure this list includes:

* Growth & Hub
* Sosyal Medya Yönetimi
* Medya Hub
* Meta ADS
* TikTok ADS
* Google ADS
* Amazon ADS
* Web APP
* Mobil APP
* Landing Pages
* Web & Mobil Tasarımlar
* Teknik Destek
* SEO Denetimi

Sections:

* Agency Profile
* Roles & Permissions
* Service Configuration
* Package Definitions
* Default Workflows
* Notification Settings
* Security
* Integrations

---

# COMPONENT / INTERACTION DESIGN ADDITIONS

Add examples of:

1. Drawer pattern
   Used for:

* Client quick preview
* Approval detail
* Campaign preview
* Content preview

2. Modal pattern
   Used for:

* Create task
* Create meeting
* Create report
* Add client

3. Toast / feedback pattern
   Examples:

* “Görev oluşturuldu”
* “Hatırlatma gönderildi”
* “Rapor müşteriye gönderildi”

4. Empty state pattern
   For pages with no data:

* Explain what should happen next
* Add action button

---

# FINAL OUTPUT REQUIREMENTS

1. Keep current visual design.
2. Improve existing screens instead of recreating from scratch.
3. Add missing operational details.
4. Make detail pages feel item-specific.
5. Make service detail examples service-specific.
6. Add client panel preview section inside client detail.
7. Improve automation page with access/subdomain management.
8. Improve finance with retainer/project revenue and profitability.
9. Add drawer/modal examples.
10. Use Turkish UI copy everywhere.
11. Do not leave generic placeholder sections.
12. Keep Social Tech dark premium design.
