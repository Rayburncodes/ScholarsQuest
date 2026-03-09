import type { Course, Level, Question } from "@/types";
import { v4 as uuidv4 } from "uuid";

const COURSES_KEY = "scholarquest_courses";
const PROGRESS_KEY = "scholarquest_progress";
const QUESTIONS_KEY = "scholarquest_questions";

export function saveCourse(course: Course): void {
  if (typeof window === "undefined") return;
  const existing = getCourses();
  const index = existing.findIndex((c) => c.id === course.id);
  if (index >= 0) existing[index] = course;
  else existing.push(course);
  localStorage.setItem(COURSES_KEY, JSON.stringify(existing));
}

export function getCourses(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCourse(id: string): Course | null {
  return getCourses().find((c) => c.id === id) ?? null;
}

export function createCourseId(): string {
  return uuidv4();
}

export type ProgressState = Record<string, { completed: boolean; xpEarned: number }>;

export function getProgress(courseId: string): ProgressState {
  if (typeof window === "undefined") return {};
  try {
    const all = localStorage.getItem(PROGRESS_KEY);
    const parsed = all ? JSON.parse(all) : {};
    return parsed[courseId] ?? {};
  } catch {
    return {};
  }
}

export function setLevelProgress(
  courseId: string,
  levelId: string,
  completed: boolean,
  xpEarned: number
): void {
  if (typeof window === "undefined") return;
  const all = getProgressData();
  if (!all[courseId]) all[courseId] = {};
  all[courseId][levelId] = { completed, xpEarned };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

function getProgressData(): Record<string, ProgressState> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getStoredQuestions(courseId: string, levelId: string): Question[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const key = `${courseId}:${levelId}`;
    return parsed[key] ?? null;
  } catch {
    return null;
  }
}

export function setStoredQuestions(
  courseId: string,
  levelId: string,
  questions: Question[]
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[`${courseId}:${levelId}`] = questions;
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function getCourseWithProgress(courseId: string): Course | null {
  const course = getCourse(courseId);
  if (!course) return null;
  const progress = getProgress(courseId);
  const units = course.units.map((unit) => ({
    ...unit,
    levels: unit.levels.map((level) => ({
      ...level,
      completed: progress[level.id]?.completed ?? false,
      xpEarned: progress[level.id]?.xpEarned ?? 0,
    })),
  }));
  return { ...course, units };
}
