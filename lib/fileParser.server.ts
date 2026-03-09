import mammoth from "mammoth";

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ text: string; error?: string }> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "txt") {
    const text = buffer.toString("utf-8");
    return { text: text.trim() };
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value.trim(),
      error: result.messages.length ? result.messages[0].message : undefined,
    };
  }

  if (ext === "pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return { text: (data.text || "").trim() };
    } catch (e) {
      return {
        text: "",
        error: e instanceof Error ? e.message : "Failed to parse PDF",
      };
    }
  }

  return { text: "", error: `Unsupported file type: .${ext}` };
}
