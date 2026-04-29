import { mapBackendRoleToEmployeeRole } from "./roleMapping";
import type { RootState } from "../../store/store";
import type { AuthUserProfile } from "./authTypes";

export const selectAuthState = (state: RootState) => state.auth;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsBootstrapping = (state: RootState) => state.auth.isBootstrapping;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectCurrentEmployeeRole = (state: RootState) => {
  const user = state.auth.currentUser;
  if (!user || user.accountType !== "EMPLOYEE") {
    return null;
  }

  return mapBackendRoleToEmployeeRole(user.role);
};

export function hasAdminPermission(
  user: AuthUserProfile | null,
  permissions: readonly string[],
): boolean {
  if (!user || user.accountType !== "ADMIN" || user.role !== "ADMIN") {
    return false;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
}
