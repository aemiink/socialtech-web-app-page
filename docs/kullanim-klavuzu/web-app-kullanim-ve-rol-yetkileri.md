# Web App Kullanım Kılavuzu ve Rol Yetkileri

Bu doküman, `WEB_APP` service workspace için kimlerin hangi işlemleri yapabildiğini açıklar.

## 1) Bölüm Nereden Kullanılır?

- Admin/Employee: proje bazlı workspace endpointleri (`/projects/:projectId/web-app-workspace`).
- Employee PM odaklı ekran: `/employee/project-manager/clients/:clientId/services/web-app`.
- Client panel: web app dashboard + service tab workspace (`messages`, `revisions`, `reports`, `meetings`).

## 2) Scope ve Güvenlik Kuralları

- Workspace sadece `serviceKey = WEB_APP` projelerde çalışır.
- Employee için aktif assignment zorunludur (`PROJECT`, `DEVELOPMENT`, `DESIGN` scope).
- Client, sadece kendi client profile'ına bağlı projelerde işlem yapabilir.
- Client internal mesaj göremez/yazamaz.

## 3) Access Level Modeli

- `read`: Workspace görüntüleme.
- `interact`: Mesaj, revizyon talebi, toplantı talebi gibi etkileşim aksiyonları.
- `manage`: Section/item yönetimi, revizyon statü güncelleme, weekly report üretimi, meeting request update.

## 4) Rol Bazlı Yetki Matrisi

| Rol | Read | Interact | Manage | Not |
|---|---|---|---|---|
| `ADMIN` | Evet (`read.any`/`manage.any`) | Evet | Evet (`manage.any`) | Full scope |
| `PROJECT_MANAGER` | Evet | Evet | Evet | PM workspace ana kullanıcı |
| `DESIGNER` | Evet | Evet | Evet | Atama scope içindeyse |
| `DEVELOPER` | Evet | Evet | Evet | Atama scope içindeyse |
| `PERFORMANCE_SPECIALIST` | Evet | Evet | Hayır | Manage gerektiren işlemleri yapamaz |
| `SOCIAL_MEDIA_SPECIALIST` | Evet | Evet | Hayır | Manage gerektiren işlemleri yapamaz |
| `SUPPORT_SPECIALIST` | Evet | Evet | Hayır | Manage gerektiren işlemleri yapamaz |
| `SEO_SPECIALIST` | Evet | Evet | Hayır | Manage gerektiren işlemleri yapamaz |
| `CLIENT_OWNER` / `CLIENT_MEMBER` | Evet (`read.own`) | Evet (`interact.own`) | Hayır | Sadece own scope |
| `CRM_SPECIALIST` | Hayır | Hayır | Hayır | Workspace permission yok |

## 5) Hangi İşlem Hangi Seviyede?

- `read`: workspace, messages, revisions, weekly reports, meeting requests listeleme.
- `interact`: mesaj gönderme, revizyon talebi oluşturma, meeting request oluşturma.
- `manage`: section/create-update, content item/create-update, revision status update, weekly report create, meeting request update.

## 6) Client Tarafı Pratik Akış

1. Client dashboard'da web app proje ilerleme, son revizyon ve mesajları görür.
2. Service tab üzerinden mesaj gönderir/reply yapar.
3. Revizyon talebi oluşturur ve izin verilen lifecycle geçişlerinde revizyon statüsüne aksiyon alır.
4. Toplantı talebi oluşturur; haftalık raporları okur.

## 7) Kod Referansları

- `server/src/web-app-workspace/web-app-workspace.controller.ts`
- `server/src/web-app-workspace/web-app-workspace.service.ts`
- `server/prisma/seed.ts`
- `clientPanel/src/app/features/webAppWorkspace/webAppWorkspaceApi.ts`
- `clientPanel/src/app/pages/services/web-app-dashboard.tsx`
