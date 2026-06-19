/**
 * @fileoverview Google Gemini AI client with rate limiting and retry logic
 */

export interface GeminiResponse {
  text: string;
  tokensUsed?: number;
}

export interface CoachContext {
  totalAnnualCo2?: number;
  topCategory?: string;
  sustainabilityScore?: number;
  goals?: string[];
  recentActions?: string[];
}

/**
 * Build Eco Coach system prompt with user context
 */
export function buildCoachPrompt(userContext?: CoachContext): string {
  const contextStr = userContext
    ? `
User's current profile:
- Annual CO₂ footprint: ${userContext.totalAnnualCo2 ? Math.round(userContext.totalAnnualCo2) + " kg CO₂e" : "Not yet calculated"}
- Biggest emission source: ${userContext.topCategory ?? "Unknown"}
- Sustainability score: ${userContext.sustainabilityScore ?? "N/A"}/100
- Active goals: ${userContext.goals?.join(", ") ?? "None set"}
- Recent eco actions: ${userContext.recentActions?.join(", ") ?? "None logged"}
`
    : "";

  return `You are CarbonWise AI's Eco Coach — a friendly, knowledgeable, and encouraging personal sustainability advisor. 

Your mission is to help users understand and reduce their carbon footprint through:
1. Clear, jargon-free explanations of emissions
2. Personalized, realistic recommendations based on their lifestyle  
3. Measurable weekly improvements they can start immediately
4. Sustainability roadmaps with specific milestones
5. Positive reinforcement and motivation

${contextStr}

Guidelines:
- Be conversational and warm, never preachy or guilt-inducing
- Always quantify impact in kg CO₂e when possible (e.g., "saves ~120kg CO₂ annually")
- Prioritize high-impact changes over trivial ones
- Acknowledge trade-offs honestly (cost, convenience)
- Celebrate progress, no matter how small
- Keep responses concise and actionable (avoid walls of text)
- Use emojis sparingly to add warmth 🌿

Format recommendations as specific, measurable actions with estimated CO₂ savings.`;
}

/**
 * Prompt templates for different AI features
 */
export const PROMPT_TEMPLATES = {
  analyzeFootprint: (data: {
    annual: number;
    categories: Record<string, number>;
    score: number;
  }) => `
Based on this carbon footprint data, provide a personalized analysis:
- Annual footprint: ${Math.round(data.annual)} kg CO₂e
- Transportation: ${Math.round(data.categories.transportation)} kg/year
- Energy: ${Math.round(data.categories.energy)} kg/year
- Food: ${Math.round(data.categories.food)} kg/year
- Shopping: ${Math.round(data.categories.shopping)} kg/year
- Sustainability score: ${data.score}/100

Please:
1. Explain what this means in simple terms (compare to global average of 4,400 kg/year)
2. Identify the top 3 opportunities for reduction
3. Suggest 3 specific actions to start this week
4. Estimate the CO₂ savings if they implement these actions

Keep it encouraging and actionable.`,

  generateRoadmap: (goal: string, timeframe: string) => `
Create a sustainability roadmap to achieve: "${goal}" in ${timeframe}.

Include:
- Month-by-month milestones
- Specific actions for each milestone
- Expected CO₂ savings at each stage
- Tips for staying motivated
- What to do if they fall behind

Format as a clear, numbered plan.`,

  analyzeReceipt: (items: string) => `
Analyze these purchased items for carbon impact:
${items}

For each item:
1. Estimate carbon footprint (kg CO₂e)
2. Rate impact: Low (<1kg), Medium (1-5kg), High (>5kg)
3. Suggest a greener alternative with CO₂ savings

Respond in this exact JSON format:
{
  "items": [
    {
      "name": "item name",
      "estimatedCo2": 0.0,
      "impactLevel": "low|medium|high",
      "category": "food|clothing|electronics|household|other",
      "alternative": "greener alternative description",
      "co2Saved": 0.0
    }
  ],
  "totalCo2": 0.0,
  "summary": "brief summary"
}`,

  generateReport: (data: {
    month: string;
    total: number;
    previousTotal: number;
    categories: Record<string, number>;
    actionsCount: number;
    carbonSaved: number;
  }) => `
Generate a monthly sustainability report narrative for ${data.month}:

Stats:
- Total emissions: ${Math.round(data.total)} kg CO₂e
- Previous month: ${Math.round(data.previousTotal)} kg CO₂e
- Change: ${data.total < data.previousTotal ? "▼ reduced by" : "▲ increased by"} ${Math.abs(Math.round(data.total - data.previousTotal))} kg
- Eco actions taken: ${data.actionsCount}
- Carbon saved through actions: ${Math.round(data.carbonSaved)} kg

Category breakdown:
${Object.entries(data.categories)
  .map(([k, v]) => `- ${k}: ${Math.round(v)} kg CO₂e`)
  .join("\n")}

Write a 2-paragraph narrative that:
1. Highlights achievements and progress
2. Provides specific recommendations for next month

Tone: encouraging, data-driven, actionable.`,

  explainTopic: (topic: string) => `
Explain "${topic}" in the context of climate change and personal carbon footprint.
Keep it to 3-4 sentences, accessible to a general audience.
Include one surprising fact and one actionable tip.`,
} as const;
