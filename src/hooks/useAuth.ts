"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { createUserProfile, getUserProfile } from "@/lib/firebase/auth";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for Firebase authentication state management
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            // Ensure user profile exists
            await createUserProfile(user);
            const profile = await getUserProfile(user.uid);
            setState({ user, profile, loading: false, error: null });
          } catch (err) {
            setState({
              user,
              profile: null,
              loading: false,
              error: err instanceof Error ? err.message : "Failed to load profile",
            });
          }
        } else {
          setState({ user: null, profile: null, loading: false, error: null });
        }
      },
      (error) => {
        setState({ user: null, profile: null, loading: false, error: error.message });
      }
    );

    return unsubscribe;
  }, []);

  return state;
}
