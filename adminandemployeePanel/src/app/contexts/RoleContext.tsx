import { createContext, useContext, useState, ReactNode } from "react";

export type EmployeeRole =
  | "admin"
  | "project-manager"
  | "performance-specialist"
  | "social-media-specialist"
  | "designer"
  | "developer"
  | "support-specialist"
  | "seo-specialist";

export type AccountType = "admin" | "employee";

export interface DemoUser {
  email: string;
  password: string;
  accountType: AccountType;
  role: EmployeeRole;
  name: string;
  title: string;
  initials: string;
}

export type AuthenticatedUser = Omit<DemoUser, "password">;

interface RoleContextType {
  selectedRole: EmployeeRole | null;
  setSelectedRole: (role: EmployeeRole | null) => void;
  currentUser: AuthenticatedUser | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  isAuthenticated: boolean;
}

type LoginResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; message: string };

const STORAGE_KEY = "socialtech-admin-employee-demo-auth";

export const DEMO_PASSWORD = "demo123";

export const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "admin",
    role: "admin",
    name: "Social Tech Admin",
    title: "Yönetici",
    initials: "ST",
  },
  {
    email: "project@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "project-manager",
    name: "Proje Yöneticisi",
    title: "Project Manager",
    initials: "PY",
  },
  {
    email: "performance@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "performance-specialist",
    name: "Performance Specialist",
    title: "Performance Specialist",
    initials: "PS",
  },
  {
    email: "social@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "social-media-specialist",
    name: "Social Media Specialist",
    title: "Social Media Specialist",
    initials: "SM",
  },
  {
    email: "designer@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "designer",
    name: "Designer",
    title: "Designer",
    initials: "DS",
  },
  {
    email: "developer@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "developer",
    name: "Developer",
    title: "Developer",
    initials: "DV",
  },
  {
    email: "support@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "support-specialist",
    name: "Support Specialist",
    title: "Support Specialist",
    initials: "SS",
  },
  {
    email: "seo@socialtech.com",
    password: DEMO_PASSWORD,
    accountType: "employee",
    role: "seo-specialist",
    name: "SEO Specialist",
    title: "SEO Specialist",
    initials: "SE",
  },
];

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => readStoredUser());

  const selectedRole = currentUser?.role ?? null;

  const persistUser = (user: AuthenticatedUser | null) => {
    setCurrentUser(user);

    if (typeof window === "undefined") return;

    if (!user) {
      removeStoredUser();
      return;
    }

    writeStoredUser(user.email);
  };

  const login = (email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS.find((user) => user.email === normalizedEmail);

    if (!demoUser || demoUser.password !== password) {
      return {
        success: false,
        message: "E-posta veya şifre hatalı. Demo giriş bilgilerini kontrol edin.",
      };
    }

    const authenticatedUser = toAuthenticatedUser(demoUser);
    persistUser(authenticatedUser);
    return { success: true, user: authenticatedUser };
  };

  const logout = () => {
    persistUser(null);
  };

  const setSelectedRole = (role: EmployeeRole | null) => {
    if (!role) {
      logout();
      return;
    }

    const demoUser = DEMO_USERS.find((user) => user.role === role);
    if (demoUser) {
      persistUser(toAuthenticatedUser(demoUser));
    }
  };

  return (
    <RoleContext.Provider
      value={{
        selectedRole,
        setSelectedRole,
        currentUser,
        login,
        logout,
        isAuthenticated: Boolean(currentUser),
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}

function toAuthenticatedUser(user: DemoUser): AuthenticatedUser {
  const { password, ...authenticatedUser } = user;
  return authenticatedUser;
}

function readStoredUser(): AuthenticatedUser | null {
  if (typeof window === "undefined") return null;

  try {
    const email = window.localStorage.getItem(STORAGE_KEY);
    if (!email) return null;

    const demoUser = DEMO_USERS.find((user) => user.email === email);
    return demoUser ? toAuthenticatedUser(demoUser) : null;
  } catch {
    removeStoredUser();
    return null;
  }
}

function writeStoredUser(email: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, email);
  } catch {
    // Demo auth can continue in memory if browser storage is unavailable.
  }
}

function removeStoredUser() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors for frontend-only demo auth.
  }
}
