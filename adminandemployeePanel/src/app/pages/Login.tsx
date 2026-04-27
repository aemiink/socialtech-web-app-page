import { FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
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
import {
  AccountType,
  DEMO_PASSWORD,
  DEMO_USERS,
  DemoUser,
  useRole,
} from "../contexts/RoleContext";

const accountTypeLabels: Record<AccountType, string> = {
  admin: "Admin",
  employee: "Çalışan",
};

const accountTypeDescriptions: Record<AccountType, string> = {
  admin: "Ajans operasyon, müşteri ve finans yönetimi",
  employee: "Rol bazlı görev, müşteri ve uzmanlık panelleri",
};

const roleLabels: Record<DemoUser["role"], string> = {
  admin: "Admin",
  "project-manager": "Project Manager",
  "performance-specialist": "Performance Specialist",
  "social-media-specialist": "Social Media Specialist",
  designer: "Designer",
  developer: "Developer",
  "support-specialist": "Support Specialist",
  "seo-specialist": "SEO Specialist",
};

export function Login() {
  const { currentUser, login } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountType, setAccountType] = useState<AccountType>("admin");
  const [email, setEmail] = useState("admin@socialtech.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleUsers = useMemo(
    () => DEMO_USERS.filter((user) => user.accountType === accountType),
    [accountType],
  );

  if (currentUser) {
    return (
      <Navigate
        to={currentUser.accountType === "admin" ? "/" : "/employee/dashboard"}
        replace
      />
    );
  }

  const handleAccountTypeChange = (type: AccountType) => {
    const firstUser = DEMO_USERS.find((user) => user.accountType === type);
    setAccountType(type);
    setEmail(firstUser?.email ?? "");
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleDemoUserSelect = (user: DemoUser) => {
    setAccountType(user.accountType);
    setEmail(user.email);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
    const result = login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(getRedirectPath(result.user.accountType, location.state), { replace: true });
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
              Demo güvenli erişim
            </Badge>
            <h1 className="mb-4 text-4xl font-semibold leading-tight">
              Social Tech operasyon panellerine tek giriş.
            </h1>
            <p className="max-w-md text-sm leading-6 text-[#A0A0A0]">
              Admin ve çalışan ekipleri aynı premium giriş deneyiminden geçer;
              yetki ve rol demo kullanıcı e-postasına göre atanır.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Admin paneli artık login olmadan açılmaz.",
              "Çalışan rolleri demo kullanıcı hesabından atanır.",
              "Bu akış frontend demo state kullanır; gerçek auth değildir.",
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
                  Demo bilgilerinizle panel erişimini başlatın.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-[#131313] p-1">
              {(["admin", "employee"] as const).map((type) => {
                const isActive = accountType === type;
                const Icon = type === "admin" ? ShieldCheck : UserCheck;

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
              disabled={isSubmitting || !email.trim() || !password.trim()}
              className="h-12 w-full rounded-xl bg-[#AAFF01] text-[#131313] hover:bg-[#AAFF01]/90"
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Panele Giriş Yap"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#202020] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Badge className="border-[#AAFF01]/20 bg-[#AAFF01]/10 text-[#AAFF01]">
                Demo erişim
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
                      {roleLabels[user.role]}
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

function getRedirectPath(accountType: AccountType, locationState: unknown) {
  const fallback = accountType === "admin" ? "/" : "/employee/dashboard";

  if (!isRedirectState(locationState)) return fallback;

  const from = locationState.from;
  if (accountType === "admin" && !from.startsWith("/employee") && from !== "/login") {
    return from;
  }

  if (accountType === "employee" && from.startsWith("/employee") && from !== "/employee/login") {
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
