"use client";

import { useState } from "react";
import { useGemini } from "@/hooks/useGemini";
import { PROMPT_TEMPLATES } from "@/lib/gemini/client";
import type { EducationModule, QuizQuestion } from "@/types";
import { BookOpen, Brain, ChevronRight, Check, X, Loader2, ExternalLink } from "lucide-react";

const MODULES: EducationModule[] = [
  {
    id: "climate-101",
    title: "Climate Change 101",
    description: "Understand the basics of climate change and why it matters",
    category: "climate-basics",
    difficulty: "beginner",
    estimatedMinutes: 8,
    topics: [
      { id: "t1", title: "What is climate change?", content: "Climate change refers to long-term shifts in global temperatures and weather patterns. While natural factors play a role, human activities since the 1800s — especially burning fossil fuels — have become the main driver.", iconEmoji: "🌡️" },
      { id: "t2", title: "The greenhouse effect", content: "Greenhouse gases like CO₂ and methane trap heat in Earth's atmosphere. This is naturally essential for life, but excess emissions from human activities are amplifying this effect beyond safe limits.", iconEmoji: "🏭" },
      { id: "t3", title: "Your carbon footprint", content: "A carbon footprint measures the total greenhouse gas emissions caused by an individual's actions. The global average is 4.4 tonnes of CO₂e per year, but this varies widely — from under 1 tonne in some developing nations to over 14 tonnes in the US.", iconEmoji: "👣" },
    ],
    quizQuestions: [
      { id: "q1", question: "What is the global average carbon footprint per person per year?", options: ["1.5 tonnes", "4.4 tonnes", "10 tonnes", "20 tonnes"], correctIndex: 1, explanation: "The global average is approximately 4.4 tonnes of CO₂e per person per year, though this varies significantly by country." },
      { id: "q2", question: "Which is the most significant greenhouse gas emitted by human activities?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correctIndex: 2, explanation: "Carbon dioxide (CO₂) from burning fossil fuels is the largest contributor to human-caused greenhouse gas emissions." },
    ],
  },
  {
    id: "transport-impact",
    title: "Transport & Emissions",
    description: "How transportation affects your carbon footprint and what you can do",
    category: "transportation",
    difficulty: "beginner",
    estimatedMinutes: 6,
    topics: [
      { id: "t1", title: "Cars vs public transport", content: "A petrol car emits about 192g CO₂/km. A bus emits 89g CO₂/km per passenger, and a train just 41g. Switching your commute from car to train can save over 1 tonne of CO₂ per year.", iconEmoji: "🚗" },
      { id: "t2", title: "Electric vehicles", content: "EVs produce zero direct emissions, and with renewable energy charging, lifecycle emissions are 70-80% lower than petrol cars. Even with grid electricity, they emit about 53g CO₂/km — much lower than petrol.", iconEmoji: "⚡" },
      { id: "t3", title: "The hidden cost of flying", content: "Aviation accounts for about 2.5% of global CO₂ emissions but has a much larger warming impact due to contrails and high-altitude effects. One long-haul return flight can add 1.5-3 tonnes CO₂ to your footprint.", iconEmoji: "✈️" },
    ],
    quizQuestions: [
      { id: "q1", question: "Which transport method emits the least CO₂ per km per passenger?", options: ["Car (petrol)", "Electric car", "Train", "Bus"], correctIndex: 2, explanation: "Trains emit approximately 41g CO₂/km per passenger — significantly less than cars, EVs, or buses." },
    ],
  },
  {
    id: "food-footprint",
    title: "Food & Your Footprint",
    description: "How diet choices dramatically affect your carbon emissions",
    category: "food",
    difficulty: "intermediate",
    estimatedMinutes: 10,
    topics: [
      { id: "t1", title: "Meat and emissions", content: "Beef production generates about 27kg CO₂e per kg of food — more than 20× that of plant proteins. The livestock sector accounts for 14.5% of all global greenhouse gas emissions. Reducing meat consumption is one of the highest-impact individual actions.", iconEmoji: "🥩" },
      { id: "t2", title: "Plant-based diets", content: "A vegan diet has a carbon footprint about 2.9kg CO₂e/day vs. 9.1kg for a high-meat diet. Switching to plant-based meals just 3 times a week could save over 200kg CO₂ per year.", iconEmoji: "🌱" },
      { id: "t3", title: "Food waste and emissions", content: "About one-third of all food produced globally is wasted, generating 3.3 billion tonnes of CO₂e annually. Reducing food waste is one of the most powerful climate solutions available.", iconEmoji: "🗑️" },
    ],
    quizQuestions: [
      { id: "q1", question: "How much more CO₂e does beef produce vs. plant proteins per kg of food?", options: ["2×", "5×", "~20×", "50×"], correctIndex: 2, explanation: "Beef production generates approximately 27kg CO₂e/kg, while plant proteins like tofu generate about 1.5-2kg CO₂e/kg — roughly a 15-20× difference." },
    ],
  },
  {
    id: "home-energy",
    title: "Home Energy Efficiency",
    description: "Cut your energy bills and carbon emissions at the same time",
    category: "energy",
    difficulty: "intermediate",
    estimatedMinutes: 7,
    topics: [
      { id: "t1", title: "Renewable energy", content: "Switching to a renewable energy tariff can cut your electricity emissions by up to 90%. Solar panels can pay back their carbon cost within 1-4 years and generate clean power for 25+ years.", iconEmoji: "☀️" },
      { id: "t2", title: "Heating and insulation", content: "Heating and cooling account for about 42% of home energy use. Good insulation can reduce heating needs by 30-40%. Heat pumps are 3-4× more efficient than gas boilers and can run on renewable electricity.", iconEmoji: "🏠" },
    ],
    quizQuestions: [
      { id: "q1", question: "What percentage of home energy use typically goes to heating and cooling?", options: ["10%", "25%", "42%", "65%"], correctIndex: 2, explanation: "Heating and cooling account for approximately 42% of home energy consumption, making it the largest opportunity for reduction." },
    ],
  },
];

export default function EducationPage() {
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const { askQuestion } = useGemini();

  const handleModuleSelect = (module: EducationModule) => {
    setSelectedModule(module);
    setTopicIndex(0);
    setQuizMode(false);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setAiExplanation("");
  };

  const handleGetAiExplanation = async (topic: { title: string }) => {
    setLoadingExplanation(true);
    const explanation = await askQuestion(PROMPT_TEMPLATES.explainTopic(topic.title));
    setAiExplanation(explanation);
    setLoadingExplanation(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (!selectedModule) return;
    const q = selectedModule.quizQuestions[quizIndex];
    if (q && index === q.correctIndex) {
      setScores((prev) => ({ ...prev, [selectedModule.id]: (prev[selectedModule.id] ?? 0) + 1 }));
    }
  };

  const handleNextQuestion = () => {
    if (!selectedModule) return;
    if (quizIndex < selectedModule.quizQuestions.length - 1) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setCompletedModules((prev) => new Set([...prev, selectedModule.id]));
      setQuizMode(false);
    }
  };

  const difficultyColors: Record<string, string> = { beginner: "badge-green", intermediate: "badge-amber", advanced: "badge-red" };

  if (selectedModule) {
    const topic = selectedModule.topics[topicIndex];
    const q = selectedModule.quizQuestions[quizIndex];

    if (quizMode && q) {
      return (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button onClick={() => setQuizMode(false)} className="btn btn-ghost" style={{ marginBottom: "var(--space-6)" }}>← Back to topics</button>
          <div className="card">
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div className="badge badge-violet" style={{ marginBottom: "var(--space-4)" }} aria-label={`Question ${quizIndex + 1} of ${selectedModule.quizQuestions.length}`}>
                Question {quizIndex + 1}/{selectedModule.quizQuestions.length}
              </div>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)" }}>{q.question}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }} role="radiogroup" aria-label="Answer choices">
              {q.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === q.correctIndex;
                const showResult = selectedAnswer !== null;
                let bg = "var(--bg-muted)";
                let border = "var(--border-default)";
                if (showResult && isCorrect) { bg = "var(--color-primary-50)"; border = "var(--color-primary)"; }
                else if (showResult && isSelected && !isCorrect) { bg = "#fee2e2"; border = "var(--color-error)"; }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={selectedAnswer !== null}
                    style={{ textAlign: "left", padding: "var(--space-4)", background: bg, border: `2px solid ${border}`, borderRadius: "var(--radius-lg)", cursor: selectedAnswer === null ? "pointer" : "default", transition: "all var(--transition-base)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Answer: ${opt}${showResult && isCorrect ? " (correct)" : showResult && isSelected && !isCorrect ? " (incorrect)" : ""}`}
                  >
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{opt}</span>
                    {showResult && isCorrect && <Check size={16} style={{ color: "var(--color-primary)" }} aria-hidden="true" />}
                    {showResult && isSelected && !isCorrect && <X size={16} style={{ color: "var(--color-error)" }} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            {selectedAnswer !== null && (
              <div className="alert alert-info" style={{ marginTop: "var(--space-4)" }} role="alert">
                <Brain size={16} aria-hidden="true" /> <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
            {selectedAnswer !== null && (
              <button onClick={handleNextQuestion} className="btn btn-primary" style={{ marginTop: "var(--space-6)", width: "100%", justifyContent: "center" }}>
                {quizIndex < selectedModule.quizQuestions.length - 1 ? "Next Question" : "Complete Quiz 🎉"}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
          <button onClick={() => setSelectedModule(null)} className="btn btn-ghost btn-icon" aria-label="Back to modules">←</button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{selectedModule.title}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{selectedModule.estimatedMinutes} min · {selectedModule.topics.length} topics · {selectedModule.quizQuestions.length} quiz questions</p>
          </div>
        </div>

        {/* Topic navigation */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-6)", overflowX: "auto" }} role="tablist">
          {selectedModule.topics.map((t, i) => (
            <button key={t.id} onClick={() => setTopicIndex(i)} style={{ padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-full)", border: "none", cursor: "pointer", background: i === topicIndex ? "var(--color-primary)" : "var(--bg-muted)", color: i === topicIndex ? "white" : "var(--text-secondary)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }} role="tab" aria-selected={i === topicIndex} aria-controls={`topic-${t.id}`}>
              {t.iconEmoji} {t.title}
            </button>
          ))}
        </div>

        {topic && (
          <div className="card" id={`topic-${topic.id}`} role="tabpanel">
            <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }} aria-hidden="true">{topic.iconEmoji}</div>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-4)" }}>{topic.title}</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>{topic.content}</p>

            {/* AI Explanation */}
            <button onClick={() => handleGetAiExplanation(topic)} disabled={loadingExplanation} className="btn btn-secondary btn-sm" style={{ marginBottom: "var(--space-4)" }}>
              {loadingExplanation ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Brain size={14} aria-hidden="true" />}
              {loadingExplanation ? "Getting AI explanation..." : "Get AI Explanation"}
            </button>

            {aiExplanation && (
              <div style={{ padding: "var(--space-4)", background: "var(--color-primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-primary-200)", marginBottom: "var(--space-4)" }} role="region" aria-label="AI explanation">
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-primary-700)", lineHeight: "var(--leading-relaxed)" }}>
                  🤖 <strong>AI Explanation:</strong> {aiExplanation}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-4)" }}>
              <button onClick={() => setTopicIndex((i) => Math.max(0, i - 1))} disabled={topicIndex === 0} className="btn btn-secondary btn-sm">← Previous</button>
              {topicIndex < selectedModule.topics.length - 1 ? (
                <button onClick={() => setTopicIndex((i) => i + 1)} className="btn btn-primary btn-sm">Next →</button>
              ) : (
                <button onClick={() => setQuizMode(true)} className="btn btn-primary btn-sm">Take Quiz <ChevronRight size={14} aria-hidden="true" /></button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📚 Education Hub</h1>
        <p className="page-subtitle">Learn about climate change, sustainability, and how your daily choices impact the planet.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Modules", value: MODULES.length.toString(), icon: "📚" },
          { label: "Completed", value: completedModules.size.toString(), icon: "✅" },
          { label: "Quiz Score", value: `${Object.values(scores).reduce((a, b) => a + b, 0)} pts`, icon: "🏆" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${s.label}: ${s.value}`}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }} aria-hidden="true">{s.icon}</div>
            <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cards-grid">
        {MODULES.map((module) => {
          const completed = completedModules.has(module.id);
          const score = scores[module.id];
          return (
            <article key={module.id} className="card" style={{ cursor: "pointer" }} onClick={() => handleModuleSelect(module)} role="button" tabIndex={0} aria-label={`Open module: ${module.title}${completed ? " (completed)" : ""}`} onKeyDown={(e) => { if (e.key === "Enter") handleModuleSelect(module); }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <span className={`badge ${difficultyColors[module.difficulty]}`}>{module.difficulty}</span>
                  <span className="badge badge-gray">{module.estimatedMinutes} min</span>
                </div>
                {completed && <span className="badge badge-green" aria-label="Completed">✓ Done</span>}
              </div>
              <h2 style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>{module.title}</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-relaxed)" }}>{module.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                <span>{module.topics.length} topics · {module.quizQuestions.length} questions</span>
                {score !== undefined && <span style={{ color: "var(--color-primary)", fontWeight: "var(--weight-semibold)" }}>Score: {score}/{module.quizQuestions.length}</span>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
