"use client";

import { useState } from "react";
import type { Question as QuestionType } from "@/types";

interface QuestionCardProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

export function QuestionCard(props: QuestionCardProps) {
  const { question, questionNumber, totalQuestions, onAnswer } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const correctAnswer = question.answer.trim().toLowerCase();
  const normalized = (s: string) => s.trim().toLowerCase();

  function handleSelect(value: string) {
    if (showFeedback) return;
    setSelected(value);
    setShowFeedback(true);
    onAnswer(normalized(value) === correctAnswer);
  }

  function handleFitbSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input") as HTMLInputElement | null;
    const value = input?.value?.trim() ?? "";
    if (!value) return;
    setSelected(value);
    setShowFeedback(true);
    onAnswer(normalized(value) === correctAnswer);
  }

  const isCorrect = selected !== null && normalized(selected) === correctAnswer;

  const wrapperClassName = "rounded-2xl border-2 border-navy-light bg-navy-light/40 p-6 shadow-xl";
  return (
    <>
      <div className={wrapperClassName}>
        <div className="mb-4 text-sm text-white/60 font-body">
          Question {questionNumber} of {totalQuestions}
        </div>
        <p className="text-lg font-body text-white mb-6 leading-relaxed">
          {question.question}
        </p>

        {question.type === "mc" && question.options && (
          <ul className="space-y-2">
            {question.options.map((opt) => {
              const chosen = selected === opt;
              const correctOpt = normalized(opt) === correctAnswer;
              const showCorrect = showFeedback && correctOpt;
              const showWrong = showFeedback && chosen && !correctOpt;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={showFeedback}
                    className={
                      showCorrect
                        ? "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-teal bg-teal/20"
                        : showWrong
                          ? "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-red-500/80 bg-red-500/10"
                          : "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-white/20 hover:border-teal/50 hover:bg-white/5"
                    }
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {question.type === "tf" && (
          <div className="flex gap-3">
            {["True", "False"].map((opt) => {
              const chosen = selected === opt;
              const correctOpt = normalized(opt) === correctAnswer;
              const showCorrect = showFeedback && correctOpt;
              const showWrong = showFeedback && chosen && !correctOpt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  disabled={showFeedback}
                  className={
                    showCorrect
                      ? "flex-1 rounded-xl border-2 px-4 py-3 font-body border-teal bg-teal/20"
                      : showWrong
                        ? "flex-1 rounded-xl border-2 px-4 py-3 font-body border-red-500/80 bg-red-500/10"
                        : "flex-1 rounded-xl border-2 px-4 py-3 font-body border-white/20 hover:border-teal/50 hover:bg-white/5"
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "fitb" && (
          <form onSubmit={handleFitbSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Type your answer..."
              disabled={showFeedback}
              className="w-full rounded-xl border-2 border-navy-light bg-navy/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-teal focus:outline-none font-body"
            />
            <button
              type="submit"
              disabled={showFeedback}
              className="rounded-xl bg-teal px-4 py-2 text-navy font-heading font-bold hover:bg-teal/90 disabled:opacity-60"
            >
              Check
            </button>
          </form>
        )}

        {question.type === "matching" && question.options && (
          <ul className="space-y-2">
            {question.options.map((opt) => {
              const chosen = selected === opt;
              const correctOpt = normalized(opt) === correctAnswer;
              const showCorrect = showFeedback && correctOpt;
              const showWrong = showFeedback && chosen && !correctOpt;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={showFeedback}
                    className={
                      showCorrect
                        ? "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-teal bg-teal/20"
                        : showWrong
                          ? "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-red-500/80 bg-red-500/10"
                          : "w-full rounded-xl border-2 px-4 py-3 text-left font-body border-white/20 hover:border-teal/50 hover:bg-white/5"
                    }
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {showFeedback && (
          <div
            className={
              isCorrect
                ? "mt-6 rounded-xl p-4 bg-teal/20 border border-teal/50"
                : "mt-6 rounded-xl p-4 bg-amber/10 border border-amber/50"
            }
          >
            <p className={isCorrect ? "font-medium text-teal" : "font-medium text-amber"}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-sm text-white/80 mt-1 font-body">{question.explanation}</p>
          </div>
        )}
      </div>
    </>
  );
}
