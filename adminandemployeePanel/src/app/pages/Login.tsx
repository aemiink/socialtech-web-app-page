import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearAuth, setAuthError, setCredentials } from "../features/auth/authSlice";
import { selectCurrentUser, selectIsAuthenticated } from "../features/auth/authSelectors";
import { useLoginMutation, useLogoutMutation } from "../features/auth/authApi";
import type { AccountType, UserRole } from "../features/auth/authTypes";
import { getBackendRoleLabel } from "../features/auth/roleMapping";

type LoginAccountType = Exclude<AccountType, "CLIENT">;

type DemoSeedUser = {
  email: string;
  accountType: LoginAccountType;
  role: UserRole;
};

const DEMO_PASSWORD = "demo123";

const SEEDED_DEMO_USERS: DemoSeedUser[] = [
  { email: "admin@socialtech.com", accountType: "ADMIN", role: "ADMIN" },
  { email: "project@socialtech.com", accountType: "EMPLOYEE", role: "PROJECT_MANAGER" },
  {
    email: "performance@socialtech.com",
    accountType: "EMPLOYEE",
    role: "PERFORMANCE_SPECIALIST",
  },
  {
    email: "social@socialtech.com",
    accountType: "EMPLOYEE",
    role: "SOCIAL_MEDIA_SPECIALIST",
  },
  { email: "designer@socialtech.com", accountType: "EMPLOYEE", role: "DESIGNER" },
  { email: "developer@socialtech.com", accountType: "EMPLOYEE", role: "DEVELOPER" },
  { email: "support@socialtech.com", accountType: "EMPLOYEE", role: "SUPPORT_SPECIALIST" },
  { email: "seo@socialtech.com", accountType: "EMPLOYEE", role: "SEO_SPECIALIST" },
  { email: "crm@socialtech.com", accountType: "EMPLOYEE", role: "CRM_SPECIALIST" },
];

const accountTypeLabels: Record<LoginAccountType, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Çalışan",
};

const accountTypeDescriptions: Record<LoginAccountType, string> = {
  ADMIN: "Ajans operasyon, müşteri ve finans yönetimi",
  EMPLOYEE: "Rol bazlı görev, müşteri ve uzmanlık panelleri",
};

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login] = useLoginMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [accountType, setAccountType] = useState<LoginAccountType>("ADMIN");
  const [email, setEmail] = useState("admin@socialtech.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleUsers = useMemo(
    () => SEEDED_DEMO_USERS.filter((user) => user.accountType === accountType),
    [accountType],
  );

  useEffect(() => {
    if (!currentUser || !isAuthenticated || currentUser.accountType !== "CLIENT") {
      return;
    }

    void logout()
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        dispatch(clearAuth());
        dispatch(setAuthError(null));
        setError("Client hesapları bu panelde kullanılamaz. Lütfen Client Portal üzerinden giriş yapın.");
      });
  }, [currentUser, dispatch, isAuthenticated, logout]);

  if (currentUser && isAuthenticated && currentUser.accountType !== "CLIENT") {
    return (
      <Navigate
        to={currentUser.accountType === "ADMIN" ? "/" : "/employee/dashboard"}
        replace
      />
    );
  }

  const handleAccountTypeChange = (type: LoginAccountType) => {
    const firstUser = SEEDED_DEMO_USERS.find((user) => user.accountType === type);
    setAccountType(type);
    setEmail(firstUser?.email ?? "");
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleDemoUserSelect = (user: DemoSeedUser) => {
    setAccountType(user.accountType);
    setEmail(user.email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("E-posta adresi gerekli.");
      return;
    }

    if (!password.trim()) {
      setError("Şifre gerekli.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await login({ email: normalizedEmail, password }).unwrap();

      if (result.user.accountType === "CLIENT") {
        await logout().unwrap().catch(() => undefined);
        dispatch(clearAuth());
        setError("Client hesapları bu panelde kullanılamaz. Lütfen Client Portal üzerinden giriş yapın.");
        return;
      }

      if (result.user.accountType !== "ADMIN" && result.user.accountType !== "EMPLOYEE") {
        dispatch(clearAuth());
        setError("Bu hesap tipi Admin + Employee panelinde desteklenmiyor.");
        return;
      }

      dispatch(
        setCredentials({
          accessToken: result.accessToken,
          currentUser: result.user,
        }),
      );
      dispatch(setAuthError(null));
      navigate(getRedirectPath(result.user.accountType, location.state), { replace: true });
    } catch (apiError) {
      dispatch(clearAuth());
      setError(getAuthErrorMessage(apiError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:flex rounded-2xl border border-white/[0.08] bg-[#1A1A1A] p-8 flex-col justify-between shadow-[0_0_40px_rgba(170,255,1,0.06)]">
          <div>
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#AAFF01] text-xl font-semibold text-[#131313]">
              ST
            </div>
            <Badge className="mb-5 border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]">
              Güvenli panel erişimi
            </Badge>
            <h1 className="mb-4 text-4xl font-semibold leading-tight">
              Social Tech operasyon panellerine tek giriş.
            </h1>
            <p className="max-w-md text-sm leading-6 text-[#A0A0A0]">
              Admin ve çalışan ekipleri aynı premium giriş deneyiminden geçer; erişim
              backend auth + role yetkisine göre belirlenir.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Admin paneli login olmadan açılmaz.",
              "Çalışan menüleri backend rol bilgisine göre şekillenir.",
              "Oturum yenileme HttpOnly refresh cookie ile yapılır.",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#A0A0A0]">
                <CheckCircle2 className="h-4 w-4 text-[#AAFF01]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-white/[0.08] bg-[#1A1A1A] p-5 shadow-[0_0_40px_rgba(170,255,1,0.06)] sm:p-8">
          <div className="mb-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#AAFF01] text-base font-semibold text-[#131313]">
                ST
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Social Tech Panel Girişi</h1>
                <p className="text-sm text-[#A0A0A0]">
                  Seed kullanıcılar veya kendi backend hesabınızla giriş yapın.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-[#131313] p-1">
              {(["ADMIN", "EMPLOYEE"] as const).map((type) => {
                const isActive = accountType === type;
                const Icon = type === "ADMIN" ? ShieldCheck : UserCheck;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAccountTypeChange(type)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-[#AAFF01] text-[#131313]"
                        : "text-[#A0A0A0] hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {accountTypeLabels[type]}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#A0A0A0]">
              {accountTypeDescriptions[accountType]}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F5F5F5]">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                  className="h-12 rounded-xl border-white/[0.08] bg-[#131313] pl-10 text-white focus-visible:border-[#AAFF01]/60 focus-visible:ring-[#AAFF01]/30"
                  placeholder="admin@socialtech.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F5F5F5]">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  className="h-12 rounded-xl border-white/[0.08] bg-[#131313] pl-10 text-white focus-visible:border-[#AAFF01]/60 focus-visible:ring-[#AAFF01]/30"
                  placeholder="demo123"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLogoutLoading || !email.trim() || !password.trim()}
              className="h-12 w-full rounded-xl bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Panele Giriş Yap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge className="border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]">
                Seed demo erişim
              </Badge>
              <span className="text-xs text-[#A0A0A0]">Şifre: {DEMO_PASSWORD}</span>
            </div>
            <div className="grid gap-2">
              {visibleUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleDemoUserSelect(user)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                    email === user.email
                      ? "border-[#AAFF01]/40 bg-[#AAFF01]/10"
                      : "border-white/[0.06] bg-[#1A1A1A] hover:border-white/[0.14]"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{user.email}</span>
                    <span className="block text-xs text-[#A0A0A0]">
                      {getBackendRoleLabel(user.role)}
                    </span>
                  </span>
                  <Briefcase className="h-4 w-4 flex-shrink-0 text-[#AAFF01]" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function getRedirectPath(accountType: LoginAccountType, locationState: unknown) {
  const fallback = accountType === "ADMIN" ? "/" : "/employee/dashboard";

  if (!isRedirectState(locationState)) return fallback;

  const from = locationState.from;
  if (accountType === "ADMIN" && !from.startsWith("/employee") && from !== "/login") {
    return from;
  }

  if (accountType === "EMPLOYEE" && from.startsWith("/employee") && from !== "/employee/login") {
    return from;
  }

  return fallback;
}

function isRedirectState(value: unknown): value is { from: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "from" in value &&
    typeof (value as { from?: unknown }).from === "string"
  );
}

function getAuthErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    const message = extractMessageFromErrorData(error.data);
    if (message) {
      return message;
    }

    if (error.status === 401) {
      return "E-posta veya şifre hatalı.";
    }

    if (error.status === 403) {
      return "Hesabınız pasif durumda. Yöneticinizle iletişime geçin.";
    }
  }

  if (isSerializedError(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.";
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status !== "undefined"
  );
}

function isSerializedError(error: unknown): error is SerializedError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("message" in error || "code" in error || "name" in error)
  );
}

function extractMessageFromErrorData(data: unknown): string | null {
  if (typeof data === "string" && data.length > 0) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const candidate = data as { message?: unknown };
  if (typeof candidate.message === "string" && candidate.message.length > 0) {
    return candidate.message;
  }

  if (Array.isArray(candidate.message)) {
    const textMessages = candidate.message.filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );

    if (textMessages.length > 0) {
      return textMessages.join(", ");
    }
  }

  return null;
}
