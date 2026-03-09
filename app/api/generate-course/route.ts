import { NextResponse } from "next/server";
import { generateCourseStructure } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, text } = body as { subject?: string; text?: string };
    if (!subject || !text || typeof text !== "string") {
      return NextResponse.json(
        { error: "subject and text are required" },
        { status: 400 }
      );
    }
    const trimmed = text.trim();
    if (trimmed.length < 50) {
      return NextResponse.json(
        { error: "Text is too short to generate a course" },
        { status: 400 }
      );
    }
    const result = await generateCourseStructure(subject, trimmed);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Generate course error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Course generation failed" },
      { status: 500 }
    );
  }
}
