"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import type { UserProfile } from "@/types";
import { User } from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}
