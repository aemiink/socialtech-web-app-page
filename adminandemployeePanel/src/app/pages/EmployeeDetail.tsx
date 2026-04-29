import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarClock, Mail, Shield } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "../features/auth/authSelectors";
import { useGetAdminUserQuery } from "../features/adminUsers/adminUsersApi";
import {
  extractApiErrorMessage,
  formatDateTime,
  getRoleLabel,
  getStatusLabel,
  isActiveStatus,
} from "../features/adminUsers/adminUsersUtils";

export function EmployeeDetail() {
  const { id } = useParams();
  const currentUser = useAppSelector(selectCurrentUser);
  const canManageUsers =
    currentUser?.accountType === "ADMIN" &&
    currentUser.role === "ADMIN" &&
    currentUser.permissions.includes("users.manage");

  const isValidId = typeof id === "string" && isUuid(id);

  const {
    data: user,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminUserQuery(id ?? "", {
    skip: !canManageUsers || !isValidId,
  });

  if (!canManageUsers) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
        Bu sayfaya erişim yetkiniz bulunmuyor.
      </Card>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Link to="/calisanlar">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Çalışanlara Dön
          </Button>
        </Link>
        <Card className="border-orange-500/30 bg-orange-500/10 p-6 text-orange-200">
          Geçersiz çalışan kimliği.
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
        Çalışan detayı yükleniyor...
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to="/calisanlar">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Çalışanlara Dön
          </Button>
        </Link>
        <Card className="border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {extractApiErrorMessage(
            error,
            "Çalışan detayı yüklenemedi. Lütfen tekrar deneyin.",
          )}
          <div className="mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Link to="/calisanlar">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Çalışanlara Dön
          </Button>
        </Link>
        <Card className="border-white/[0.08] bg-[#1A1A1A] p-6 text-[#A0A0A0]">
          Çalışan kaydı bulunamadı.
        </Card>
      </div>
    );
  }

  const isActive = isActiveStatus(user.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/calisanlar">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Çalışanlara Dön
          </Button>
        </Link>
        {isFetching && <span className="text-xs text-[#d2ff8a]">Güncelleniyor...</span>}
      </div>

      <Card className="border-white/[0.08] bg-[#1A1A1A] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {user.displayName?.trim() || "İsimsiz Kullanıcı"}
            </h1>
            <p className="mt-1 text-sm text-[#A0A0A0]">{user.email}</p>
          </div>
          <Badge
            className={
              isActive
                ? "bg-[#AAFF01] text-[#131313]"
                : "border-white/[0.12] bg-white/[0.08] text-[#E5E5E5]"
            }
          >
            {getStatusLabel(user.status)}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <Mail className="h-4 w-4 text-[#AAFF01]" />
            E-posta
          </div>
          <p className="text-sm text-white">{user.email}</p>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <Shield className="h-4 w-4 text-[#AAFF01]" />
            Rol
          </div>
          <p className="text-sm text-white">{getRoleLabel(user.role)}</p>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <Shield className="h-4 w-4 text-[#AAFF01]" />
            Hesap Tipi
          </div>
          <p className="text-sm text-white">{user.accountType}</p>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <CalendarClock className="h-4 w-4 text-[#AAFF01]" />
            Son Giriş
          </div>
          <p className="text-sm text-white">{formatDateTime(user.lastLoginAt)}</p>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <CalendarClock className="h-4 w-4 text-[#AAFF01]" />
            Oluşturulma
          </div>
          <p className="text-sm text-white">{formatDateTime(user.createdAt)}</p>
        </Card>

        <Card className="border-white/[0.06] bg-[#1A1A1A] p-5">
          <div className="mb-2 flex items-center gap-2 text-[#A0A0A0]">
            <CalendarClock className="h-4 w-4 text-[#AAFF01]" />
            Güncellenme
          </div>
          <p className="text-sm text-white">{formatDateTime(user.updatedAt)}</p>
        </Card>
      </div>
    </div>
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
