import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { levelTitle, keyTopics, sourceText } = body as {
      levelTitle?: string;
      keyTopics?: string[];
      sourceText?: string;
    };
    if (!levelTitle || !sourceText) {
      return NextResponse.json(
        { error: "levelTitle and sourceText are required" },
        { status: 400 }
      );
    }
    const topics = Array.isArray(keyTopics) ? keyTopics : [];
    const result = await generateQuestions(
      levelTitle,
      topics,
      typeof sourceText === "string" ? sourceText : ""
    );
    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { error: "No questions generated" },
        { status: 500 }
      );
    }
    return NextResponse.json({ questions: result });
  } catch (e) {
    console.error("Generate questions error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Question generation failed" },
      { status: 500 }
    );
  }
}
