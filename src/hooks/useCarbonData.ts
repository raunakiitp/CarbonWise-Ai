"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  saveCarbonResult,
  subscribeToCarbonResults,
} from "@/lib/firebase/firestore";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import type { CarbonInput, CarbonResult } from "@/types";

interface CarbonDataState {
  latest: CarbonResult | null;
  history: CarbonResult[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

/**
 * Hook for managing user carbon footprint data
 */
export function useCarbonData() {
  const { user } = useAuth();
  const [state, setState] = useState<CarbonDataState>({
    latest: null,
    history: [],
    loading: true,
    saving: false,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => setState((prev) => ({ ...prev, loading: false })), 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = subscribeToCarbonResults(user.uid, (results) => {
      setState((prev) => ({
        ...prev,
        latest: results[0] ?? null,
        history: results,
        loading: false,
      }));
    });

    return unsubscribe;
  }, [user]);

  const calculateAndSave = useCallback(
    async (input: CarbonInput): Promise<CarbonResult | null> => {
      if (!user) return null;

      setState((prev) => ({ ...prev, saving: true, error: null }));
      try {
        const result = calculateCarbonFootprint(input, user.uid);
        const id = await saveCarbonResult(result);
        const savedResult = { ...result, id };
        setState((prev) => ({ ...prev, saving: false }));
        return savedResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save";
        setState((prev) => ({ ...prev, saving: false, error: message }));
        return null;
      }
    },
    [user]
  );

  return { ...state, calculateAndSave };
}
