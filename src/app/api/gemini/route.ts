import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// ─── Request schema (Zod) ──────────────────────────────────────────────────
const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(8000),
});

const GeminiRequestSchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(4000, "prompt too long"),
  systemPrompt: z.string().max(8000).optional(),
  history: z.array(ChatMessageSchema).max(50).optional().default([]),
});

type GeminiRequest = z.infer<typeof GeminiRequestSchema>;

// ─── Rate limiting (in-memory; use Upstash Redis in production) ───────────
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

// ─── Input sanitization ────────────────────────────────────────────────────
function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[<>'"]/g, "") // Strip XSS-prone chars
    .replace(/javascript:/gi, "") // Block JS injection
    .replace(/on\w+\s*=/gi, "") // Block event handlers
    .trim()
    .slice(0, 4000);
}

// ─── CORS headers ─────────────────────────────────────────────────────────
function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ─── OPTIONS handler (preflight) ──────────────────────────────────────────
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
}

// ─── POST handler ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = getCorsHeaders();

  // Rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const { allowed, remaining } = getRateLimitInfo(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "3600",
          "X-RateLimit-Remaining": "0",
          ...corsHeaders,
        },
      }
    );
  }

  // Parse and validate request body with Zod
  let parsed: GeminiRequest;
  try {
    const rawBody = await request.json();
    const result = GeminiRequestSchema.safeParse(rawBody);

    if (!result.success) {
      const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400, headers: corsHeaders }
      );
    }

    parsed = result.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { prompt, systemPrompt, history } = parsed;
  const sanitizedPrompt = sanitizeInput(prompt);

  // Validate API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json(
      {
        text: "👋 I'm CarbonWise AI's Eco Coach! To enable full AI responses, please add your Gemini API key to .env.local (GEMINI_API_KEY). \n\nIn the meantime, here's a tip: The average person can reduce their carbon footprint by 20-30% by switching to public transport twice a week, eating plant-based 3 meals per week, and choosing renewable energy. That's approximately 600-900 kg CO₂e saved per year! 🌿",
        demo: true,
      },
      { headers: corsHeaders }
    );
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
        role: h.role,
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
          "Cache-Control": "no-store",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    // Don't leak internal error details to client
    const isDev = process.env.NODE_ENV === "development";
    const message = isDev && error instanceof Error ? error.message : "AI service temporarily unavailable";

    return NextResponse.json(
      { error: message },
      { status: 503, headers: corsHeaders }
    );
  }
}
