"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LevelNode } from "./LevelNode";
import { ProgressBar } from "./ProgressBar";
import { isLevelUnlocked } from "@/lib/courseStore";
import type { Course } from "@/types";

interface CourseMapProps {
  course: Course;
}

export function CourseMap({ course }: CourseMapProps) {
  const allLevels = course.units.flatMap((u) => u.levels);
  const completedCount = allLevels.filter((l) => l.completed).length;

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-20 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm font-body"
          >
            ← Back
          </Link>
          <ProgressBar completed={completedCount} total={allLevels.length} />
        </div>
        <h1 className="font-heading text-xl font-bold mt-2 text-center text-white max-w-2xl mx-auto">
          {course.name}
        </h1>
        <p className="text-center text-white/60 text-sm font-body mt-0.5">
          {course.subject}
        </p>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        {course.units.map((unit, unitIndex) => (
          <motion.section
            key={unit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: unitIndex * 0.05 }}
            className="mb-10"
          >
            <h2 className="font-heading text-lg font-bold text-teal mb-6 pl-2">
              Unit {unitIndex + 1}: {unit.title}
            </h2>

            {/* Winding path: alternate left/right for each level */}
            <div className="relative">
              {/* Vertical dashed path behind nodes */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-white/15"
                aria-hidden
              />

              <div className="flex flex-col gap-0">
                {unit.levels.map((level, levelIndex) => (
                  <div key={level.id} className="flex justify-center">
                    <LevelNode
                      level={level}
                      courseId={course.id}
                      index={levelIndex}
                      isLast={levelIndex === unit.levels.length - 1}
                      isUnlocked={isLevelUnlocked(course, level.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
