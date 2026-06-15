import { FormEvent, useMemo, useState } from "react";
import { Bell, CheckCircle2, Key, Shield, User } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useChangeOwnPasswordMutation } from "../../features/auth/authApi";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import { getBackendRoleLabel, getUserDisplayName } from "../../features/auth/roleMapping";
import { extractApiErrorMessage, validatePassword } from "../../features/adminUsers/adminUsersUtils";
import { useAppSelector } from "../../store/hooks";

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const INITIAL_PASSWORD_FORM: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function Ayarlar() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(INITIAL_PASSWORD_FORM);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [passwordFeedbackType, setPasswordFeedbackType] = useState<"success" | "error" | null>(null);
  const [changePassword, { isLoading: isChangingPassword }] = useChangeOwnPasswordMutation();

  const displayName = currentUser ? getUserDisplayName(currentUser) : "";
  const email = currentUser?.email ?? "";
  const roleLabel = currentUser ? getBackendRoleLabel(currentUser.role) : "";
  const accountStatus = currentUser?.status === "ACTIVE" ? "Aktif" : "Pasif";
  const currentDeviceLabel = useMemo(() => getCurrentDeviceLabel(), []);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordFeedback(null);
    setPasswordFeedbackType(null);

    if (!passwordForm.currentPassword.trim()) {
      setPasswordFeedback("Mevcut şifrenizi girin.");
      setPasswordFeedbackType("error");
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (passwordValidation) {
      setPasswordFeedback(passwordValidation);
      setPasswordFeedbackType("error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback("Yeni şifre ve tekrar alanı eşleşmiyor.");
      setPasswordFeedbackType("error");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();
      setPasswordForm(INITIAL_PASSWORD_FORM);
      setPasswordFeedback("Şifre güncellendi. Güvenlik için bir sonraki işlemde tekrar giriş istenebilir.");
      setPasswordFeedbackType("success");
    } catch (error) {
      setPasswordFeedback(extractApiErrorMessage(error, "Şifre güncellenemedi."));
      setPasswordFeedbackType("error");
    }
  }

  function updatePasswordField(field: keyof PasswordFormState, value: string) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordFeedback(null);
    setPasswordFeedbackType(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Ayarlar</h1>
        <p className="text-[#A0A0A0]">Hesap, güvenlik ve panel durumu</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Profil Bilgileri</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 text-sm text-[#A0A0A0]">Ad Soyad</Label>
              <Input value={displayName} readOnly className="border-white/[0.06] bg-[#202020]" />
            </div>
            <div>
              <Label className="mb-2 text-sm text-[#A0A0A0]">E-posta</Label>
              <Input value={email} readOnly className="border-white/[0.06] bg-[#202020]" />
            </div>
            <div>
              <Label className="mb-2 text-sm text-[#A0A0A0]">Rol</Label>
              <Input value={roleLabel} readOnly className="border-white/[0.06] bg-[#202020]" />
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#A0A0A0]">Hesap Durumu</p>
              <Badge className="mt-2 bg-[#AAFF01] text-[#131313]">{accountStatus}</Badge>
            </div>
          </div>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Güvenlik</h3>
          </div>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <Label htmlFor="current-password" className="mb-2 text-sm text-[#A0A0A0]">
                Mevcut Şifre
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
                className="border-white/[0.06] bg-[#202020]"
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-2 text-sm text-[#A0A0A0]">
                Yeni Şifre
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => updatePasswordField("newPassword", event.target.value)}
                className="border-white/[0.06] bg-[#202020]"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="mb-2 text-sm text-[#A0A0A0]">
                Yeni Şifre Tekrarı
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
                className="border-white/[0.06] bg-[#202020]"
                autoComplete="new-password"
              />
            </div>
            {passwordFeedback ? (
              <p
                className={
                  passwordFeedbackType === "success"
                    ? "text-sm text-[#AAFF01]"
                    : "text-sm text-red-300"
                }
              >
                {passwordFeedback}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </form>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#AAFF01]" />
            <h3 className="text-lg font-semibold">Bildirim Kaynağı</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
                <p className="text-sm font-medium">Görev ve deadline bildirimleri</p>
              </div>
              <p className="text-xs leading-5 text-[#A0A0A0]">
                Bildirimler canlı görev, proje ve toplantı kayıtlarından üretilir.
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#A0A0A0]">Panel Oturumu</p>
              <p className="mt-1 text-sm font-medium">{currentDeviceLabel}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-white/[0.06] bg-[#1A1A1A] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-[#AAFF01]" />
          <h3 className="text-lg font-semibold">Erişim Özeti</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <AccessSummaryItem label="Hesap Tipi" value={getAccountTypeLabel(currentUser?.accountType)} />
          <AccessSummaryItem label="Rol" value={roleLabel || "-"} />
          <AccessSummaryItem label="Yetki Sayısı" value={`${currentUser?.permissions.length ?? 0}`} />
        </div>
      </Card>
    </div>
  );
}

function AccessSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="text-xs text-[#A0A0A0]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function getCurrentDeviceLabel() {
  if (typeof navigator === "undefined") {
    return "Aktif panel oturumu";
  }

  if (/Safari/i.test(navigator.userAgent) && !/Chrome|Chromium/i.test(navigator.userAgent)) {
    return "Safari tarayıcı";
  }

  if (/Chrome|Chromium/i.test(navigator.userAgent)) {
    return "Chrome tarayıcı";
  }

  if (/Firefox/i.test(navigator.userAgent)) {
    return "Firefox tarayıcı";
  }

  return "Aktif tarayıcı oturumu";
}

function getAccountTypeLabel(accountType: string | undefined) {
  if (accountType === "ADMIN") return "Yönetici";
  if (accountType === "EMPLOYEE") return "Çalışan";
  if (accountType === "CLIENT") return "Müşteri";
  return "-";
}
