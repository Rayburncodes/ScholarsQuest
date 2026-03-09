"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { XPCounter } from "@/components/XPCounter";
import {
  getCourseWithProgress,
  getStoredQuestions,
  setStoredQuestions,
  setLevelProgress,
} from "@/lib/courseStore";
import type { Question } from "@/types";

const XP_PER_CORRECT = 10;
const LEVEL_COMPLETE_BONUS = 25;

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const levelId = params.levelId as string;

  const course = useMemo(() => getCourseWithProgress(courseId), [courseId]);
  const level = useMemo(
    () => course?.units.flatMap((u) => u.levels).find((l) => l.id === levelId),
    [course, levelId]
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const stored = getStoredQuestions(courseId, levelId);
    if (stored && stored.length > 0) {
      setQuestions(stored);
      setLoading(false);
      return;
    }
    if (!level || !course) return;
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelTitle: level.title,
          keyTopics: level.keyTopics,
          sourceText: course.sourceText.slice(0, 30000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load questions");
      const list = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(list);
      setStoredQuestions(courseId, levelId, list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [course, courseId, level, levelId]);

  useEffect(() => {
    if (!course) {
      setLoading(false);
      setLoadError("Course not found");
      return;
    }
    if (!level) {
      setLoading(false);
      setLoadError("Level not found");
      return;
    }
    fetchQuestions();
  }, [course, level, fetchQuestions]);

  const handleAnswer = useCallback((correct: boolean) => {
    setAnsweredCurrent(true);
    if (correct) {
      setSessionXP((p) => p + XP_PER_CORRECT);
      setTotalXP((p) => p + XP_PER_CORRECT);
    }
  }, []);

  const goNext = useCallback(() => {
    if (!answeredCurrent) return;
    if (index + 1 >= questions.length) {
      const bonus = LEVEL_COMPLETE_BONUS;
      setTotalXP((p) => p + bonus);
      setSessionXP((p) => p + bonus);
      setLevelProgress(courseId, levelId, true, totalXP + sessionXP + bonus);
      setCompleted(true);
    } else {
      setAnsweredCurrent(false);
      setIndex((i) => i + 1);
    }
  }, [answeredCurrent, index, questions.length, totalXP, sessionXP, courseId, levelId]);

  if (!course || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/70">Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent mb-4" />
        <p className="font-body text-white">Preparing your lesson…</p>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-white/70 font-body">{loadError || "No questions available."}</p>
        <Link href={`/course/${courseId}`} className="mt-4 text-teal hover:underline font-body">
          Back to course
        </Link>
      </div>
    );
  }

  if (completed) {
    const totalEarned = totalXP;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4"
      >
        <div className="rounded-2xl border-2 border-teal bg-navy-light/60 p-8 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="font-heading text-2xl font-bold text-white mb-2">Level complete!</h2>
          <XPCounter value={totalEarned} className="text-2xl my-4" />
          <p className="text-white/70 font-body text-sm mb-6">XP earned this lesson</p>
          <Link
            href={`/course/${courseId}`}
            className="inline-block rounded-xl bg-teal px-6 py-3 text-navy font-heading font-bold hover:bg-teal/90"
          >
            Continue
          </Link>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[index];

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/course/${courseId}`)}
            className="text-white/70 hover:text-white text-sm font-body"
          >
            ← Exit
          </button>
          <XPCounter value={totalXP} delta={sessionXP > 0 ? XP_PER_CORRECT : undefined} />
        </div>
        <h1 className="font-heading text-lg font-bold text-center text-white mt-1 truncate max-w-[200px] mx-auto">
          {level.title}
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={index}
            question={currentQuestion}
            questionNumber={index + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>

        {index < questions.length && answeredCurrent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-end"
          >
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl bg-teal px-5 py-2.5 text-navy font-heading font-bold hover:bg-teal/90"
            >
              {index + 1 >= questions.length ? "Finish" : "Next"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
