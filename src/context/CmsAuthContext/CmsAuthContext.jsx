"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { onIdTokenChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

export const CmsAuthContext = createContext(undefined);
const TOKEN_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

async function syncSessionCookie(idToken) {
  if (!idToken) {
    await fetch("/api/cms/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
    return;
  }

  const response = await fetch("/api/cms/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Failed to sync auth session");
  }
}

export function CmsAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getFirebaseClientAuth();

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser || null);

      try {
        const token = nextUser ? await nextUser.getIdToken() : "";
        await syncSessionCookie(token);
        setError("");
      } catch (sessionError) {
        setError(sessionError?.message || "Failed to sync auth session");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    let isDisposed = false;

    const refreshSession = async () => {
      try {
        const refreshedToken = await user.getIdToken(true);
        if (isDisposed) return;
        await syncSessionCookie(refreshedToken);
        if (!isDisposed) setError("");
      } catch (refreshError) {
        if (!isDisposed) {
          setError(refreshError?.message || "Failed to refresh auth session");
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSession();
      }
    };

    refreshSession();
    const intervalId = window.setInterval(refreshSession, TOKEN_REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const signInWithEmail = useCallback(async ({ email, password }) => {
    setError("");
    const auth = getFirebaseClientAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (signInError) {
      setError(signInError?.message || "Email/password sign-in failed");
      throw signInError;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError("");
    const auth = getFirebaseClientAuth();

    try {
      await firebaseSignOut(auth);
      await syncSessionCookie("");
    } catch (signOutError) {
      setError(signOutError?.message || "Sign-out failed");
      throw signOutError;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      signInWithEmail,
      signOut,
    }),
    [user, isLoading, error, signInWithEmail, signOut]
  );

  return <CmsAuthContext.Provider value={value}>{children}</CmsAuthContext.Provider>;
}
