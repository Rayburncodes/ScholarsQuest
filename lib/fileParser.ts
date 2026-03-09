import mammoth from "mammoth";

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; error?: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt") {
    const text = await file.text();
    return { text: text.trim() };
  }

  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: result.value.trim(), error: result.messages.length ? result.messages[0].message : undefined };
  }

  if (ext === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const data = await pdfParse(buffer);
      return { text: (data.text || "").trim() };
    } catch (e) {
      return { text: "", error: e instanceof Error ? e.message : "Failed to parse PDF" };
    }
  }

  return { text: "", error: `Unsupported file type: .${ext}` };
}

export function getAcceptedFileTypes(): Record<string, string[]> {
  return {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  };
}

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];
