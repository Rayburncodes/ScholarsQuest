import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeCourseResponse, ClaudeQuestionsResponse } from "@/types";

const MODEL = "claude-sonnet-4-20250514";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("rate limit") || msg.includes("overloaded") || msg.includes("529")) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const arrayStart = trimmed.indexOf("[");
  let jsonStr: string;
  if (arrayStart >= 0 && (start < 0 || arrayStart < start)) {
    const end = trimmed.lastIndexOf("]") + 1;
    jsonStr = trimmed.slice(arrayStart, end);
  } else if (start >= 0) {
    const end = trimmed.lastIndexOf("}") + 1;
    jsonStr = trimmed.slice(start, end);
  } else {
    throw new Error("No JSON object or array found in response");
  }
  return JSON.parse(jsonStr) as T;
}

export async function generateCourseStructure(
  subject: string,
  extractedText: string
): Promise<ClaudeCourseResponse> {
  const client = getClient();
  const system = `You are an expert educator. Given study material, extract key topics and subtopics and organize them into a structured course with units and levels. Return ONLY a valid JSON object—no markdown, no code fences, no extra text. Use this exact shape: { "courseName": string, "units": [ { "unitTitle": string, "levels": [ { "levelId": string (unique across the whole course, e.g. "L1", "L2", "L3"), "title": string, "description": string, "keyTopics": string[] } ] } ] }. Create 2-5 units and 6-12 levels per unit so each topic has plenty of levels. Use unique levelIds (e.g. L1 through L50) across all units. Keep level titles concise.`;
  const user = `Subject: ${subject}\n\nMaterial:\n${extractedText.slice(0, 120000)}`;

  const response = await withRetry(async () => {
    const stream = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });
    const textBlock = stream.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text in Claude response");
    return textBlock.text;
  });

  return extractJson<ClaudeCourseResponse>(response);
}

export async function generateQuestions(
  levelTitle: string,
  keyTopics: string[],
  sourceExcerpt: string
): Promise<ClaudeQuestionsResponse[]> {
  const client = getClient();
  const topicsStr = keyTopics.length ? keyTopics.join(", ") : levelTitle;
  const system = `You are a quiz generator. Based on the given topics and source material, generate exactly 7 quiz questions. Mix multiple choice (4 options), true/false, and fill-in-the-blank. Return ONLY a valid JSON array—no markdown, no code fences. Each item: { "type": "mc" | "tf" | "fitb", "question": string, "options": string[] (only for "mc", exactly 4), "answer": string, "explanation": string }. For "tf" use answer "true" or "false". Be concise and accurate.`;
  const user = `Level: ${levelTitle}\nTopics: ${topicsStr}\n\nSource:\n${sourceExcerpt.slice(0, 25000)}`;

  const response = await withRetry(async () => {
    const stream = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });
    const textBlock = stream.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text in Claude response");
    return textBlock.text;
  });

  return extractJson<ClaudeQuestionsResponse[]>(response);
}
