"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  subscribeToGoals,
} from "@/lib/firebase/firestore";
import type { Goal } from "@/types";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for smart goals CRUD with real-time updates
 */
export function useGoals() {
  const { user } = useAuth();
  const [state, setState] = useState<GoalsState>({
    goals: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = subscribeToGoals(user.uid, (goals) => {
      setState({ goals, loading: false, error: null });
    });

    return unsubscribe;
  }, [user]);

  const addGoal = useCallback(
    async (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<string | null> => {
      if (!user) return null;
      try {
        return await createGoal(goal);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to create goal",
        }));
        return null;
      }
    },
    [user]
  );

  const editGoal = useCallback(async (id: string, updates: Partial<Goal>): Promise<void> => {
    try {
      await updateGoal(id, updates);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to update goal",
      }));
    }
  }, []);

  const removeGoal = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteGoal(id);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to delete goal",
      }));
    }
  }, []);

  const activeGoals = state.goals.filter((g) => g.status === "active");
  const completedGoals = state.goals.filter((g) => g.status === "completed");
  const totalCarbonSaved = state.goals.reduce((sum, g) => sum + (g.carbonSaved ?? 0), 0);

  return {
    ...state,
    activeGoals,
    completedGoals,
    totalCarbonSaved,
    addGoal,
    editGoal,
    removeGoal,
  };
}
