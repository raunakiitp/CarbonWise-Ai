import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Rate limiting (simple in-memory, use Redis for production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per hour per IP
const WINDOW_MS = 60 * 60 * 1000;

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// Input sanitization
function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML
    .replace(/[<>'"]/g, "") // Strip XSS chars
    .trim()
    .slice(0, 4000); // Max length
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed, remaining } = getRateLimitInfo(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "3600",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Parse request
  let body: { prompt?: string; systemPrompt?: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, systemPrompt, history = [] } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const sanitizedPrompt = sanitizeInput(prompt);

  // Validate API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    // Return demo response when API key not configured
    return NextResponse.json({
      text: "👋 I'm CarbonWise AI's Eco Coach! To enable full AI responses, please add your Gemini API key to .env.local (GEMINI_API_KEY). \n\nIn the meantime, here's a tip: The average person can reduce their carbon footprint by 20-30% by switching to public transport twice a week, eating plant-based 3 meals per week, and choosing renewable energy. That's approximately 600-900 kg CO₂e saved per year! 🌿",
      demo: true,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    // Build chat history
    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role as "user" | "model",
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(sanitizedPrompt);
    const text = result.response.text();

    return NextResponse.json(
      { text },
      {
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  } catch (error: unknown) {
    console.error("[Gemini API Error]", error);
    const message = error instanceof Error ? error.message : "AI service error";
    return NextResponse.json(
      { error: `Failed to get AI response: ${message}` },
      { status: 500 }
    );
  }
}
