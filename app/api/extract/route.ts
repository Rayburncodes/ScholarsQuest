import { NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/fileParser.server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      return NextResponse.json(
        { error: "Unsupported file type. Use .pdf, .docx, or .txt" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await extractTextFromBuffer(buffer, file.name);
    if (result.error && !result.text) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ text: result.text });
  } catch (e) {
    console.error("Extract error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
