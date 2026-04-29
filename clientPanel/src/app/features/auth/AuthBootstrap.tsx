import { ReactNode, useEffect, useRef } from "react";
import { useLazyMeQuery, useLogoutMutation, useRefreshMutation } from "./authApi";
import { clearAuth, setBootstrapping, setCredentials, setCurrentUser } from "./authSlice";
import { selectAccessToken, selectIsBootstrapping } from "./authSelectors";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { AuthUserProfile } from "./authTypes";

type AuthBootstrapProps = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const isBootstrapping = useAppSelector(selectIsBootstrapping);
  const [refresh] = useRefreshMutation();
  const [fetchMe] = useLazyMeQuery();
  const [logout] = useLogoutMutation();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }

    bootstrappedRef.current = true;
    let cancelled = false;

    const bootstrap = async () => {
      dispatch(setBootstrapping(true));

      try {
        if (accessToken) {
          const me = await fetchMe().unwrap();
          if (cancelled) return;

          if (!isSupportedClientPortalUser(me)) {
            await logout().unwrap().catch(() => undefined);
            dispatch(clearAuth());
            return;
          }

          dispatch(setCurrentUser(me));
        } else {
          const refreshed = await refresh().unwrap();
          if (cancelled) return;

          if (!isSupportedClientPortalUser(refreshed.user)) {
            await logout().unwrap().catch(() => undefined);
            dispatch(clearAuth());
            return;
          }

          dispatch(
            setCredentials({
              accessToken: refreshed.accessToken,
              currentUser: refreshed.user,
            }),
          );
        }
      } catch {
        if (cancelled) return;
        dispatch(clearAuth());
      } finally {
        if (!cancelled) {
          dispatch(setBootstrapping(false));
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [accessToken, dispatch, fetchMe, logout, refresh]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-[#131313] text-white flex items-center justify-center p-6">
        <div className="rounded-xl border border-white/[0.08] bg-[#1A1A1A] px-6 py-4 text-sm text-[#A0A0A0]">
          Oturum kontrol ediliyor...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function isSupportedClientPortalUser(user: AuthUserProfile): boolean {
  if (user.accountType !== "CLIENT") {
    return false;
  }

  if (user.status !== "ACTIVE") {
    return false;
  }

  return user.role === "CLIENT_OWNER" || user.role === "CLIENT_MEMBER";
}
