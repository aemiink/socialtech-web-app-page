import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { AuthUserProfile } from "./authTypes";

export type AuthState = {
  accessToken: string | null;
  currentUser: AuthUserProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  error: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  currentUser: null,
  isAuthenticated: false,
  isBootstrapping: true,
  error: null,
};

type SetCredentialsPayload = {
  accessToken: string;
  currentUser?: AuthUserProfile | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.currentUser !== undefined) {
        state.currentUser = action.payload.currentUser;
      }
      state.isAuthenticated = Boolean(state.accessToken && state.currentUser);
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<AuthUserProfile | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = Boolean(state.accessToken && state.currentUser);
      state.error = null;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.isBootstrapping = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, setCurrentUser, clearAuth, setBootstrapping, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
