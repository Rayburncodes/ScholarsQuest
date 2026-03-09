"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadZone } from "@/components/UploadZone";
import { saveCourse, createCourseId } from "@/lib/courseStore";
import type { Course, Unit } from "@/types";
import type { ClaudeCourseResponse } from "@/types";

function buildCourseFromClaude(
  response: ClaudeCourseResponse,
  subject: string,
  sourceText: string
): Course {
  const id = createCourseId();
  const units: Unit[] = response.units.map((u, ui) => ({
    id: `unit-${ui + 1}`,
    title: u.unitTitle,
    levels: u.levels.map((l) => ({
      id: l.levelId,
      title: l.title,
      description: l.description,
      keyTopics: l.keyTopics ?? [],
      completed: false,
      xpEarned: 0,
    })),
  }));
  return {
    id,
    name: response.courseName || subject,
    subject,
    sourceText,
    units,
    createdAt: Date.now(),
  };
}

export default function HomePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [status, setStatus] = useState<"idle" | "extracting" | "generating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const textToUse = pastedText.trim();
    if (!subject.trim()) {
      setError("Please enter a subject name.");
      return;
    }
    if (!file && !textToUse) {
      setError("Please upload a file or paste text.");
      return;
    }

    let text = textToUse;

    if (file && !textToUse) {
      setStatus("extracting");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Extraction failed");
        text = data.text;
        if (!text?.trim()) throw new Error("No text could be extracted from the file.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Extraction failed");
        setStatus("idle");
        return;
      }
    }

    setStatus("generating");
    try {
      const res = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Course generation failed");

      const course = buildCourseFromClaude(
        data as ClaudeCourseResponse,
        subject.trim(),
        text
      );
      saveCourse(course);
      router.push(`/course/${course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Course generation failed");
    } finally {
      setStatus("idle");
    }
  }

  const loading = status === "extracting" || status === "generating";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <h1 className="font-heading text-4xl font-bold text-center text-white mb-2">
          ScholarQuest
        </h1>
        <p className="text-center text-white/70 font-body mb-8">
          Learn any subject from your syllabus, textbook, or notes.
        </p>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border-2 border-navy-light bg-navy-light/40 p-8 text-center"
          >
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent mb-4" />
            <p className="font-body text-white">
              {status === "extracting" ? "Extracting text…" : "Building your course…"}
            </p>
            <p className="text-sm text-white/50 mt-1">This may take a moment.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <UploadZone
              subject={subject}
              onSubjectChange={setSubject}
              onFileSelect={(f, pasted) => {
                setFile(f);
                setPastedText(pasted);
              }}
              disabled={loading}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber text-sm font-body"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !subject.trim() || (!file && !pastedText.trim())}
              className="w-full rounded-xl bg-teal py-3.5 text-navy font-heading font-bold text-lg hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Create course
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
