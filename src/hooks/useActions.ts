"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { logGreenAction, subscribeToActions } from "@/lib/firebase/firestore";
import { ACTION_SAVINGS } from "@/constants/emissions";
import type { GreenAction, ActionType, ActionStreak } from "@/types";
import { format, isYesterday, isToday } from "date-fns";

interface ActionsState {
  actions: GreenAction[];
  streaks: Record<string, ActionStreak>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for green action tracking with streak calculation
 */
export function useActions() {
  const { user } = useAuth();
  const [state, setState] = useState<ActionsState>({
    actions: [],
    streaks: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribe = subscribeToActions(user.uid, (actions) => {
      const streaks = calculateStreaks(actions);
      setState({ actions, streaks, loading: false, error: null });
    });

    return unsubscribe;
  }, [user]);

  const logAction = useCallback(
    async (actionType: ActionType, value?: number, notes?: string): Promise<void> => {
      if (!user) return;
      const carbonSaved = (ACTION_SAVINGS[actionType] ?? 0) * (value ?? 1);
      try {
        await logGreenAction({
          userId: user.uid,
          actionType,
          date: new Date(),
          value,
          carbonSaved,
          notes,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to log action",
        }));
      }
    },
    [user]
  );

  const totalCarbonSaved = state.actions.reduce((sum, a) => sum + (a.carbonSaved ?? 0), 0);
  const totalActions = state.actions.length;

  return { ...state, totalCarbonSaved, totalActions, logAction };
}

/**
 * Calculate streaks for each action type
 */
function calculateStreaks(actions: GreenAction[]): Record<string, ActionStreak> {
  const byType = new Map<ActionType, GreenAction[]>();

  for (const action of actions) {
    if (!byType.has(action.actionType)) {
      byType.set(action.actionType, []);
    }
    byType.get(action.actionType)!.push(action);
  }

  const streaks: Record<string, ActionStreak> = {};

  for (const [type, typeActions] of byType) {
    const sorted = typeActions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let current = 0;
    let longest = 0;
    let prev: Date | null = null;

    for (const action of sorted) {
      const d = new Date(action.date);
      if (!prev || isToday(d) || isYesterday(d)) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
      prev = d;
    }

    streaks[type] = {
      actionType: type,
      currentStreak: current,
      longestStreak: longest,
      lastActionDate: sorted[0] ? new Date(sorted[0].date) : new Date(),
      totalActions: sorted.length,
      totalCarbonSaved: sorted.reduce((sum, a) => sum + (a.carbonSaved ?? 0), 0),
    };
  }

  return streaks;
}
