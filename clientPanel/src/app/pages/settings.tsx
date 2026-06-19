import { BadgeCheck, Bell, Lock, LockKeyhole, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMeQuery, useUpdateMeMutation, useChangePasswordMutation } from '../features/auth/authApi';
import { serviceLabels } from '../data/service-pages';
import type { PurchasedServiceStatus } from '../features/auth/authTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'profile' | 'brand' | 'notifications' | 'security';

type NotificationPrefs = {
  emailNotifications: boolean;
  campaignAlerts: boolean;
  weeklyReports: boolean;
  contentApprovals: boolean;
  meetingConfirmations: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'brand', label: 'Marka Bilgileri', icon: BadgeCheck },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'security', label: 'Güvenlik', icon: Lock },
];

const DEFAULT_PREFS: NotificationPrefs = {
  emailNotifications: true,
  campaignAlerts: true,
  weeklyReports: false,
  contentApprovals: true,
  meetingConfirmations: true,
};

const LS_KEY = 'st_notification_prefs';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Çalışan',
  CLIENT: 'Müşteri',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Yönetici',
  PROJECT_MANAGER: 'Proje Müdürü',
  PERFORMANCE_SPECIALIST: 'Performans Uzmanı',
  SOCIAL_MEDIA_SPECIALIST: 'Sosyal Medya Uzmanı',
  DESIGNER: 'Tasarımcı',
  DEVELOPER: 'Geliştirici',
  SUPPORT_SPECIALIST: 'Destek Uzmanı',
  SEO_SPECIALIST: 'SEO Uzmanı',
  CLIENT_OWNER: 'Hesap Sahibi',
  CLIENT_MEMBER: 'Hesap Üyesi',
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AAFF01]/50 ${
        checked ? 'bg-[#AAFF01]' : 'bg-white/[0.12]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white/70'
        }`}
      />
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
      <div className="h-11 w-full bg-white/[0.06] rounded-xl animate-pulse" />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all ${
        toast.type === 'success'
          ? 'bg-[#AAFF01]/10 border-[#AAFF01]/20 text-[#AAFF01]'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}
    >
      {toast.message}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  error?: boolean;
  rightIcon?: React.ReactNode;
  placeholder?: string;
}

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  readOnly = false,
  error = false,
  rightIcon,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#A0A0A0]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full bg-[#202020] border text-white rounded-xl px-4 py-2.5 transition-colors focus:outline-none pr-${rightIcon ? '10' : '4'} ${
            readOnly
              ? 'border-white/[0.08] text-white/50 cursor-not-allowed'
              : error
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/[0.12] focus:border-[#AAFF01]'
          }`}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Profil ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data, isLoading } = useMeQuery();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [displayName, setDisplayName] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (data?.displayName) {
      setDisplayName(data.displayName);
    }
  }, [data?.displayName]);

  function showToast(t: NonNullable<ToastState>) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  async function handleSave() {
    try {
      await updateMe({ displayName }).unwrap();
      showToast({ type: 'success', message: 'Profil güncellendi.' });
    } catch {
      showToast({ type: 'error', message: 'Profil güncellenemedi. Lütfen tekrar deneyin.' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Profil Ayarları</h2>
        <p className="text-sm text-[#A0A0A0] mt-1">Görünen adınızı ve hesap bilgilerinizi yönetin.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Badges */}
          {data && (
            <div className="flex flex-wrap gap-2 pb-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#AAFF01]/10 border border-[#AAFF01]/20 text-[#AAFF01] font-medium">
                {ACCOUNT_TYPE_LABELS[data.accountType] ?? data.accountType}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.10] text-white/60 font-medium">
                {ROLE_LABELS[data.role] ?? data.role}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  data.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {data.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          )}

          <InputField
            label="Görünen Ad"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Adınızı girin"
          />

          <InputField
            label="E-posta"
            type="email"
            value={data?.email ?? ''}
            readOnly
            rightIcon={<LockKeyhole className="w-4 h-4" />}
          />

          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !displayName.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#AAFF01] text-black font-semibold text-sm transition-all hover:bg-[#AAFF01]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(170,255,1,0.2)] hover:shadow-[0_0_30px_rgba(170,255,1,0.3)]"
            >
              {isSaving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
            </button>
            <Toast toast={toast} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Marka Bilgileri ─────────────────────────────────────────────────────

function serviceStatusColor(status: PurchasedServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'PAUSED':
      return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    case 'SUSPENDED':
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    default:
      return 'bg-white/[0.04] border-white/[0.10] text-white/40';
  }
}

function serviceStatusLabel(status: PurchasedServiceStatus): string {
  const map: Record<PurchasedServiceStatus, string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Pasif',
    SUSPENDED: 'Askıya Alındı',
    CANCELED: 'İptal Edildi',
    CANCELLED: 'İptal Edildi',
    PAUSED: 'Duraklatıldı',
  };
  return map[status] ?? status;
}

function BrandTab() {
  const { data, isLoading } = useMeQuery();
  const cp = data?.clientProfile ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Marka Bilgileri</h2>
        <p className="text-sm text-[#A0A0A0] mt-1">Şirketinize ait bilgiler ve aktif hizmetler.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cp ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Şirket Adı" value={cp.companyName} />
            <InfoCard label="İletişim E-postası" value={cp.contactEmail ?? '—'} />
            <InfoCard label="Müşteri ID" value={cp.id} mono />
            <InfoCard label="Slug" value={cp.slug} mono />
          </div>

          {cp.purchasedServices.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#A0A0A0]">Satın Alınan Hizmetler</p>
              <div className="flex flex-wrap gap-2">
                {cp.purchasedServices.map((s) => (
                  <span
                    key={s.serviceId}
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${serviceStatusColor(s.status)}`}
                  >
                    {serviceLabels[s.serviceId] ?? s.serviceId}
                    <span className="opacity-70">· {serviceStatusLabel(s.status)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-[#A0A0A0]">
              Bu bilgileri güncellemek için ajansınızla iletişime geçin.
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-[#A0A0A0]">Müşteri profili bulunamadı.</p>
      )}
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-[#202020] rounded-xl p-4 border border-white/[0.08] space-y-1">
      <p className="text-xs text-[#A0A0A0] font-medium">{label}</p>
      <p className={`text-white break-all ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}

// ─── Tab: Bildirimler ─────────────────────────────────────────────────────────

const PREF_ITEMS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'emailNotifications', label: 'E-posta bildirimleri', description: 'Tüm bildirimler e-posta ile iletilir.' },
  { key: 'campaignAlerts', label: 'Kampanya uyarıları', description: 'Kampanya durum değişikliklerinde anlık uyarı alın.' },
  { key: 'weeklyReports', label: 'Haftalık raporlar', description: 'Her hafta performans özetini e-posta ile alın.' },
  { key: 'contentApprovals', label: 'İçerik onayları', description: 'Onay bekleyen içerikler için bildirim alın.' },
  { key: 'meetingConfirmations', label: 'Toplantı onayları', description: 'Toplantı davetleri ve güncellemeleri için bildirim alın.' },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleToggle(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Bildirim Tercihleri</h2>
          <p className="text-sm text-[#A0A0A0] mt-1">Hangi bildirimler almak istediğinizi seçin.</p>
        </div>
        {saved && (
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#AAFF01]/10 border border-[#AAFF01]/20 text-[#AAFF01] font-medium whitespace-nowrap">
            Tercihler kaydedildi
          </span>
        )}
      </div>

      <div className="space-y-3">
        {PREF_ITEMS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 p-4 bg-[#202020] rounded-xl border border-white/[0.08]"
          >
            <div className="min-w-0">
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-xs text-[#A0A0A0] mt-0.5">{description}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={(v) => handleToggle(key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Güvenlik ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(t: NonNullable<ToastState>) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.currentPassword) next.currentPassword = 'Mevcut şifre zorunlu.';
    if (form.newPassword.length < 8) next.newPassword = 'En az 8 karakter olmalı.';
    if (form.newPassword !== form.confirmNewPassword) next.confirmNewPassword = 'Şifreler eşleşmiyor.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).unwrap();
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setErrors({});
      showToast({ type: 'success', message: 'Şifre başarıyla güncellendi.' });
    } catch {
      showToast({ type: 'error', message: 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.' });
    }
  }

  function field(key: keyof typeof form, label: string) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#A0A0A0]">{label}</label>
        <input
          type="password"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className={`w-full bg-[#202020] border text-white rounded-xl px-4 py-2.5 transition-colors focus:outline-none ${
            errors[key]
              ? 'border-red-500/50 focus:border-red-500'
              : 'border-white/[0.12] focus:border-[#AAFF01]'
          }`}
        />
        {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Güvenlik Ayarları</h2>
        <p className="text-sm text-[#A0A0A0] mt-1">Şifrenizi güncelleyerek hesabınızı güvende tutun.</p>
      </div>

      <div className="space-y-4 max-w-md">
        {field('currentPassword', 'Mevcut Şifre')}
        {field('newPassword', 'Yeni Şifre')}
        {field('confirmNewPassword', 'Yeni Şifre (Tekrar)')}

        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#AAFF01] text-black font-semibold text-sm transition-all hover:bg-[#AAFF01]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(170,255,1,0.2)]"
          >
            {isLoading ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
          </button>
          <Toast toast={toast} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="min-h-full bg-[#131313] px-6 py-8 md:px-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Ayarlar</h1>
        <p className="text-sm text-[#A0A0A0]">Hesap tercihlerinizi yönetin</p>
      </div>

      {/* Horizontal tab bar */}
      <div className="flex gap-1 p-1 bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#AAFF01]/10 text-[#AAFF01] ring-1 ring-[#AAFF01]/20'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-white/[0.08] max-w-3xl">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'brand' && <BrandTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
