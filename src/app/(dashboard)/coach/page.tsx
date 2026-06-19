"use client";

import { useState, useRef, useEffect } from "react";
import { useGemini } from "@/hooks/useGemini";
import { useCarbonData } from "@/hooks/useCarbonData";
import { PROMPT_TEMPLATES } from "@/lib/gemini/client";
import { formatCo2 } from "@/lib/carbon/calculator";
import { Send, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { CoachContext } from "@/lib/gemini/client";

const SUGGESTED_PROMPTS = [
  "What are my top 3 ways to reduce emissions?",
  "Create a 30-day sustainability roadmap for me",
  "Explain my carbon footprint in simple terms",
  "What's the impact of switching to plant-based meals twice a week?",
  "How do I reduce my energy bills and carbon footprint at the same time?",
  "Suggest a weekly green challenge for me",
];

export default function CoachPage() {
  const { latest } = useCarbonData();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context: CoachContext | undefined = latest
    ? {
        totalAnnualCo2: latest.totalAnnualCo2,
        topCategory: latest.hotspots[0]?.category,
        sustainabilityScore: latest.sustainabilityScore,
      }
    : undefined;

  const { messages, loading, error, sendMessage, clearChat } = useGemini(context);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">🤖 Eco Coach</h1>
          <p className="page-subtitle">Your AI-powered sustainability advisor, personalized to your lifestyle.</p>
        </div>
        {latest && (
          <div className="badge badge-green" aria-label={`Your carbon score: ${formatCo2(latest.totalAnnualCo2)}/year`}>
            🌿 {formatCo2(latest.totalAnnualCo2)}/yr
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <section aria-label="Suggested questions" style={{ marginBottom: "var(--space-6)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
            <Sparkles size={14} style={{ display: "inline", marginRight: 4 }} aria-hidden="true" />
            Suggested questions to get started:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "var(--text-xs)" }}
                aria-label={`Ask: ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Chat */}
      <div className="chat-container" role="log" aria-label="Eco Coach conversation" aria-live="polite">
        <div className="chat-messages" id="chat-messages">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="chat-message" aria-label="Welcome message from Eco Coach">
              <div className="chat-avatar ai" aria-hidden="true">🌿</div>
              <div className="chat-bubble ai">
                <strong>Hey! I&apos;m your CarbonWise Eco Coach 🌿</strong>
                <br /><br />
                I&apos;m here to help you understand and reduce your carbon footprint through personalized, actionable advice.
                {latest ? (
                  <>
                    <br /><br />
                    I can see your annual footprint is <strong>{formatCo2(latest.totalAnnualCo2)}</strong> and your sustainability score is <strong>{latest.sustainabilityScore}/100</strong>. Let&apos;s work on improving that together!
                  </>
                ) : (
                  <>
                    <br /><br />
                    I don&apos;t have your carbon data yet. Try completing the <strong>Carbon Analyzer</strong> first for personalized advice, or ask me any sustainability question!
                  </>
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message ${msg.role === "user" ? "user" : ""}`}
              aria-label={`${msg.role === "user" ? "You" : "Eco Coach"}: ${msg.content.slice(0, 50)}...`}
            >
              {msg.role === "model" && (
                <div className="chat-avatar ai" aria-hidden="true">🌿</div>
              )}
              <div className={`chat-bubble ${msg.role === "model" ? "ai" : "user"}`}
                style={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="chat-avatar user-avatar-chat" aria-hidden="true">U</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-message" aria-label="Eco Coach is typing">
              <div className="chat-avatar ai" aria-hidden="true">🌿</div>
              <div className="chat-bubble ai">
                <div className="typing-indicator" role="status" aria-label="Typing">
                  <div className="typing-dot" aria-hidden="true" />
                  <div className="typing-dot" aria-hidden="true" />
                  <div className="typing-dot" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="alert alert-error" style={{ margin: "var(--space-4)" }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area" role="form" aria-label="Message input">
          <button
            onClick={clearChat}
            className="btn btn-ghost btn-icon"
            aria-label="Clear conversation"
            title="Clear conversation"
            disabled={messages.length === 0}
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Eco Coach anything..."
            className="chat-input"
            disabled={loading}
            aria-label="Type your sustainability question"
            aria-describedby="send-hint"
            maxLength={500}
          />
          <span id="send-hint" className="sr-only">Press Enter or click Send to submit</span>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn btn-primary btn-icon"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Context card */}
      <div className="card" style={{ marginTop: "var(--space-6)", background: "var(--color-primary-50)" }}>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-primary-700)" }}>
          💡 <strong>Tip:</strong> Complete the <a href="/analyzer" style={{ color: "var(--color-primary-700)", textDecoration: "underline" }}>Carbon Analyzer</a> first to unlock fully personalized AI recommendations based on your actual lifestyle data.
        </p>
      </div>
    </div>
  );
}
