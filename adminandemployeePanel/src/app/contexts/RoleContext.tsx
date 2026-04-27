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

interface RoleContextType {
  selectedRole: EmployeeRole | null;
  setSelectedRole: (role: EmployeeRole | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRole] = useState<EmployeeRole | null>(null);

  return (
    <RoleContext.Provider value={{ selectedRole, setSelectedRole }}>
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
