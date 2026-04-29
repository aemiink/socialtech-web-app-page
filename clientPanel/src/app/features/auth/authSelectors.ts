import type { RootState } from "../../store/store";

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsBootstrapping = (state: RootState) => state.auth.isBootstrapping;
export const selectAuthError = (state: RootState) => state.auth.error;
