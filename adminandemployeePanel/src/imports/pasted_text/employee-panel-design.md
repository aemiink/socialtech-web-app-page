Design a premium dark-theme EMPLOYEE PANEL for a digital growth agency called “Social Tech”.

This is NOT the client panel.
This is NOT the admin panel.
This is the internal employee workspace used by Social Tech team members to see their assigned work, clients, tasks, approvals, meetings, files, and performance.

The panel must support role-based access.

For now, create a role selection login screen where the user can choose a role manually.
After role selection, the dashboard and sidebar must change based on the selected role.

---

# DESIGN SYSTEM

Use Social Tech brand style:

* Dark premium SaaS / internal workspace aesthetic
* Background: #131313
* Card surfaces: #1A1A1A / #202020
* Accent color: #AAFF01
* Text primary: #FFFFFF
* Text secondary: #A0A0A0
* Borders: subtle #FFFFFF10
* Rounded cards: 16–24px
* Clean 12-column layout
* Premium, minimal, structured, professional
* Use geometric sans typography similar to Satoshi / Space Grotesk

The panel must feel:

* focused
* operational
* clean
* role-specific
* task-oriented
* internal agency-grade

Use Turkish UI copy.

---

# CORE CONCEPT

The employee panel must work like:

Login / Role Selection
→ Role-based Dashboard
→ Role-specific Sidebar
→ Assigned work and operational pages

The employee should immediately understand:

1. What do I need to do today?
2. Which clients am I responsible for?
3. Which tasks are late or urgent?
4. What is waiting for my input?
5. What do I need to deliver this week?

---

# PAGE 1 — ROLE ACCESS LOGIN SCREEN

Create a login / role selection screen.

Title:
“Social Tech Çalışan Paneli”

Subtitle:
“Rolünüzü seçerek çalışma alanınıza devam edin.”

Layout:

* Centered login card
* Social Tech logo
* Role selection cards or dropdown
* Continue button

Roles to include:

1. Admin
2. Project Manager
3. Performance Specialist
4. Social Media Specialist
5. Designer
6. Developer
7. Support Specialist
8. SEO Specialist

Each role card must include:

* Role name
* Short description
* Icon
* Access level badge

Example role descriptions:

Admin:
“Tüm operasyon, müşteri, çalışan ve finans görünümü”

Project Manager:
“Müşteri süreçleri, görev takibi, onaylar ve teslimatlar”

Performance Specialist:
“Reklam kampanyaları, optimizasyonlar ve performans notları”

Social Media Specialist:
“İçerik takvimi, caption, DM/yorum ve yayın akışı”

Designer:
“Tasarım görevleri, kreatifler, UI ekranları ve revizyonlar”

Developer:
“Web/app geliştirme, teknik görevler, sprint ve test süreçleri”

Support Specialist:
“Destek talepleri, bakım, güvenlik ve teknik aksiyonlar”

SEO Specialist:
“SEO audit, teknik hatalar, keywordler ve aksiyon planı”

Add:

* Selected role state
* Continue button
* Small note:
  “Bu ekran şimdilik demo Role Access seçimi için tasarlanmıştır.”

---

# GLOBAL LAYOUT AFTER LOGIN

Every role-based panel must include:

1. Left Sidebar
2. Topbar
3. Main content area

Topbar:

* Search
* Current role badge
* Today’s date
* Notification icon
* User avatar
* Quick action button depending on role

Sidebar:
Must change according to selected role.

All roles should have:

* Dashboard
* Görevlerim
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

But each role must also have role-specific menu items.

---

# ROLE-BASED SIDEBARS

Create separate sidebar variants for these roles.

---

## ADMIN SIDEBAR

Admin can access almost everything, but this is employee panel view, not full admin panel.

Items:

* Dashboard
* Görevlerim
* Müşterilerim
* Onaylar
* Ekip
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## PROJECT MANAGER SIDEBAR

Items:

* Dashboard
* Görevlerim
* Müşterilerim
* Projeler
* Onaylar
* Teslimatlar
* Toplantılar
* Rapor Takibi
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## PERFORMANCE SPECIALIST SIDEBAR

Items:

* Dashboard
* Görevlerim
* Kampanyalar
* Optimizasyonlar
* Kreatif Talepleri
* Pixel & Tracking
* Rapor Notları
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## SOCIAL MEDIA SPECIALIST SIDEBAR

Items:

* Dashboard
* Görevlerim
* İçerik Takvimi
* Captionlar
* Onay Bekleyenler
* Yayın Akışı
* DM & Yorumlar
* Trend Notları
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## DESIGNER SIDEBAR

Items:

* Dashboard
* Görevlerim
* Kreatifler
* UI Tasarımlar
* Revizyonlar
* Teslim Dosyaları
* Marka Dosyaları
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## DEVELOPER SIDEBAR

Items:

* Dashboard
* Görevlerim
* Sprintler
* Projeler
* Frontend
* Backend / API
* Buglar
* Test & Yayın
* Revizyonlar
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## SUPPORT SPECIALIST SIDEBAR

Items:

* Dashboard
* Görevlerim
* Destek Talepleri
* Açık İşler
* Çözülen İşler
* Bakım
* Güvenlik
* Yedekleme
* Güncellemeler
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

## SEO SPECIALIST SIDEBAR

Items:

* Dashboard
* Görevlerim
* SEO Audit
* Teknik Hatalar
* Anahtar Kelimeler
* Sayfa Hızı
* Index Durumu
* Search Console
* Aksiyon Planı
* Müşterilerim
* Takvim
* Bildirimler
* Dosyalar
* Ayarlar

---

# CREATE THESE FRAMES

You MUST create these frames:

1. Role Access Login
2. Admin Employee Dashboard
3. Project Manager Dashboard
4. Performance Specialist Dashboard
5. Social Media Specialist Dashboard
6. Designer Dashboard
7. Developer Dashboard
8. Support Specialist Dashboard
9. SEO Specialist Dashboard
10. Görevlerim Page
11. Müşterilerim Page
12. Takvim Page
13. Bildirimler Page
14. Dosyalar Page
15. Ayarlar Page

Do not stop after the login screen.
Do not create only one generic employee dashboard.
Create role-specific dashboards.

---

# SHARED PAGE STRUCTURE

These pages exist for all employees, but content can adapt to role.

---

## GÖREVLERİM PAGE

Purpose:
Show only the logged-in employee’s assigned tasks.

Sections:

* Task KPI cards:

  * Bugünkü Görev
  * Geciken Görev
  * Bu Hafta Teslim
  * İncelemede
  * Tamamlanan

* Filters:

  * Client
  * Service
  * Priority
  * Status
  * Deadline

* Task table:

  * Görev
  * Müşteri
  * Hizmet
  * Öncelik
  * Deadline
  * Durum

* Kanban board:

  * Yeni
  * Devam Ediyor
  * Müşteri Bekleniyor
  * İncelemede
  * Tamamlandı

* Task detail drawer example:

  * Description
  * Subtasks
  * Attachments
  * Comments
  * Change status button

---

## MÜŞTERİLERİM PAGE

Purpose:
Show clients assigned to the employee.

Sections:

* Assigned clients cards/table
* Client name
* Active services
* Employee responsibility
* Pending tasks
* Last activity
* Risk status

Add client quick preview drawer:

* Client overview
* Assigned services
* Related tasks
* Notes
* Files
* Button: “Müşteri Detayını Gör”

---

## TAKVİM PAGE

Purpose:
Employee calendar.

Sections:

* Weekly calendar
* Today’s meetings
* Deadlines
* Scheduled content
* Report dates
* Personal reminders

Event types:

* Meeting
* Deadline
* Content publish
* Report
* Internal review

---

## BİLDİRİMLER PAGE

Purpose:
Notifications relevant to employee.

Sections:

* Unread notifications
* Task updates
* Client comments
* Approval updates
* Meeting reminders
* System alerts

Notification examples:

* “Miramob yeni revizyon yorumu ekledi.”
* “Meta ADS raporu inceleme bekliyor.”
* “Bugün 15:00 müşteri toplantısı var.”

---

## DOSYALAR PAGE

Purpose:
Employee can access assigned files.

Sections:

* Recent files
* Client folders
* Design files
* Reports
* Contracts
* Brand assets

Filters:

* Client
* File type
* Date
* Service

---

## AYARLAR PAGE

Purpose:
Employee profile and preferences.

Sections:

* Profile
* Role & permissions
* Notification preferences
* Password / security
* Calendar sync
* Workload preferences

---

# ROLE-SPECIFIC DASHBOARDS

Each dashboard must be different.

---

## ADMIN EMPLOYEE DASHBOARD

Purpose:
Admin employee view inside employee panel.

Sections:

1. My Operational Summary

* Assigned tasks
* Pending approvals
* Meetings today
* Overdue items

2. Team Alerts

* Tasks blocked
* Client waiting
* Internal review needed

3. My Clients

* Assigned clients summary

4. Quick Actions

* Create task
* Review approval
* Join meeting

This is lighter than the full admin panel.

---

## PROJECT MANAGER DASHBOARD

Purpose:
Manage client delivery flow.

Sections:

1. Delivery Health
   KPI cards:

* Aktif Müşteri
* Açık Proje
* Bekleyen Onay
* Geciken Teslimat

2. Client Delivery Board
   Cards:

* Client
* Active services
* Current blockers
* Next delivery

3. Pending Approvals

* Content
* Design
* Report
* Revision

4. Upcoming Meetings
5. Client Follow-up Queue
6. Agency Comment / Internal Notes

---

## PERFORMANCE SPECIALIST DASHBOARD

Purpose:
Manage ad campaigns and optimization tasks.

Sections:

1. Performance Workload
   KPI cards:

* Aktif Kampanya
* Optimizasyon Bekleyen
* Rapor Notu Bekleyen
* Pixel Sorunu

2. Campaign Optimization Queue
   Table:

* Client
* Platform
* Campaign
* Issue
* Suggested action
* Priority

3. Creative Requests

* New creative needed
* Fatigue detected
* Waiting for design

4. Pixel & Tracking Alerts

* Pixel inactive
* Event mismatch
* CAPI issue

5. Report Notes

* Weekly optimization notes to write

6. Assigned Clients

---

## SOCIAL MEDIA SPECIALIST DASHBOARD

Purpose:
Manage social media content operation.

Sections:

1. Content Workload
   KPI cards:

* Bugün Yayınlanacak
* Caption Bekleyen
* Onay Bekleyen
* DM/Yorum Bekleyen

2. Content Calendar Preview
3. Caption Tasks
4. Approval Queue
5. DM & Comment Queue
6. Trend Notes
7. Assigned Clients

---

## DESIGNER DASHBOARD

Purpose:
Manage design and creative production.

Sections:

1. Design Workload
   KPI cards:

* Açık Tasarım
* Revizyon Bekleyen
* Bugün Teslim
* Onay Bekleyen

2. Creative Production Queue
   Table:

* Client
* Asset type
* Service
* Deadline
* Status

3. Revision Board
4. Brand Assets
5. UI Design Tasks
6. Delivery Files
7. Assigned Clients

---

## DEVELOPER DASHBOARD

Purpose:
Manage development work.

Sections:

1. Development Workload
   KPI cards:

* Aktif Sprint
* Açık Task
* Bug
* Test Bekleyen
* Yayına Hazır

2. Sprint Board
   Columns:

* Planned
* In Progress
* Blocked
* Review
* Done

3. Project Modules

* Frontend
* Backend/API
* Admin panel
* Deployment

4. Bug Queue
5. Test & Launch Checklist
6. Assigned Projects
7. Client Dependencies

---

## SUPPORT SPECIALIST DASHBOARD

Purpose:
Manage technical support and maintenance.

Sections:

1. Support Workload
   KPI cards:

* Açık Talep
* Acil Talep
* Çözülen Talep
* Bakım Bekleyen
* Güvenlik Uyarısı

2. Support Request Queue
3. Open Issues Board
4. Maintenance Checklist
5. Backup & Security Status
6. Update Log
7. Assigned Clients

---

## SEO SPECIALIST DASHBOARD

Purpose:
Manage SEO audit and SEO action work.

Sections:

1. SEO Workload
   KPI cards:

* Aktif Audit
* Kritik Hata
* Keyword İncelemesi
* Sayfa Hızı Sorunu
* Aksiyon Planı Bekleyen

2. SEO Audit Queue
3. Technical Issues Board
4. Keyword Opportunity Table
5. Page Speed Alerts
6. Search Console Notes
7. Assigned Clients

---

# ROLE-BASED ACCESS BEHAVIOR

Design the screens so it is clear that:

* Role selection controls the sidebar
* Role selection controls the dashboard content
* Shared pages adapt to role
* Employees only see their assigned work, not the whole agency operation

Show this through:

* Role badge in topbar
* Role-specific sidebar items
* Role-specific dashboard title
* Different KPI cards per role
* Different quick action buttons per role

---

# INTERACTION EXAMPLES

Add visual examples of:

1. Task detail drawer
2. Client quick preview drawer
3. Create task modal
4. Notification panel
5. Status change dropdown
6. Comment thread on a task

---

# UX RULES

1. Employee should not feel overwhelmed.
2. Prioritize “what should I do today?”
3. Use task-first hierarchy.
4. Keep pages role-specific.
5. Do not expose finance/admin-level data except Admin role.
6. Use realistic agency examples.
7. Use Turkish UI labels.
8. Keep the interface clean and premium.
9. Avoid empty placeholder sections.
10. Do not create only generic dashboard cards.

---

# FINAL OUTPUT REQUIREMENTS

Generate all requested frames:

1. Role Access Login
2. Admin Employee Dashboard
3. Project Manager Dashboard
4. Performance Specialist Dashboard
5. Social Media Specialist Dashboard
6. Designer Dashboard
7. Developer Dashboard
8. Support Specialist Dashboard
9. SEO Specialist Dashboard
10. Görevlerim Page
11. Müşterilerim Page
12. Takvim Page
13. Bildirimler Page
14. Dosyalar Page
15. Ayarlar Page

Every role dashboard must be different.
Every sidebar must change by role.
The login screen must allow choosing a role visually.
Do not stop after creating only the login screen.
