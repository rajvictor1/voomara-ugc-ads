import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRuntimeMode } from "@/lib/runtime";

export const runtime = "nodejs";

const inputSchema = z.object({ prompt: z.string().trim().min(12).max(1200) });

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a little more creative direction first." }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    if (getRuntimeMode() === "public-demo") {
      const improved = `Open with a scroll-stopping product reveal in the first two seconds. ${parsed.data.prompt} Show the product naturally in use with close-up detail shots, warm handheld creator energy, and an honest conversational delivery. Finish with a clear, confident recommendation and simple call to action without inventing any product claims.`;
      return NextResponse.json({ prompt: improved, demo: true });
    }
    return NextResponse.json({ error: "OpenAI prompt improvement is not configured. Add OPENAI_API_KEY to .env.local and restart the studio." }, { status: 503 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: "https://api.openai.com/v1" });
    const response = await client.responses.create({
      model: process.env.OPENAI_PROMPT_MODEL || "gpt-5.6-sol",
      reasoning: { effort: "none" },
      max_output_tokens: 220,
      store: false,
      instructions: "Rewrite the user's rough direction into one production-ready prompt for a 15-second vertical UGC product video. Preserve intent and factual claims. Add a clear hook, natural creator behavior, product demonstration, camera direction, and a concise call to action. Do not invent product features. Return only one compact paragraph.",
      input: parsed.data.prompt,
    });
    const improved = response.output_text.trim();
    if (!improved) throw new Error("Empty model response");
    return NextResponse.json({ prompt: improved });
  } catch {
    return NextResponse.json({ error: "Prompt improvement is temporarily unavailable. Your original prompt is unchanged." }, { status: 502 });
  }
}
