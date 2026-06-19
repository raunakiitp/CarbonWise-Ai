"use client";

import { useState, useCallback } from "react";
import { buildCoachPrompt } from "@/lib/gemini/client";
import type { CoachContext } from "@/lib/gemini/client";
import type { GeminiMessage } from "@/types";

interface GeminiState {
  messages: GeminiMessage[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for interacting with the Gemini AI Eco Coach
 */
export function useGemini(context?: CoachContext) {
  const [state, setState] = useState<GeminiState>({
    messages: [],
    loading: false,
    error: null,
  });

  const sendMessage = useCallback(
    async (userMessage: string): Promise<void> => {
      const userMsg: GeminiMessage = {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg],
        loading: true,
        error: null,
      }));

      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userMessage,
            systemPrompt: buildCoachPrompt(context),
            history: state.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const modelMsg: GeminiMessage = {
          role: "model",
          content: data.text,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, modelMsg],
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to get AI response",
        }));
      }
    },
    [state.messages, context]
  );

  const askQuestion = useCallback(
    async (prompt: string): Promise<string> => {
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, systemPrompt: buildCoachPrompt(context) }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.text ?? "";
      } catch {
        return "Unable to get AI response. Please check your API key configuration.";
      }
    },
    [context]
  );

  const clearChat = useCallback(() => {
    setState({ messages: [], loading: false, error: null });
  }, []);

  return { ...state, sendMessage, askQuestion, clearChat };
}
