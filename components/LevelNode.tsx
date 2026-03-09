"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Level } from "@/types";

interface LevelNodeProps {
  level: Level;
  courseId: string;
  index: number;
  isLast?: boolean;
  isUnlocked: boolean;
}

const XP_PER_LEVEL = 25;

export function LevelNode({ level, courseId, index, isLast = false, isUnlocked }: LevelNodeProps) {
  const completed = level.completed ?? false;
  const xp = level.xpEarned ?? 0;

  return (
    <div className="relative flex flex-col items-center">
      {/* Dashed connector line (downward) */}
      {!isLast && (
        <div
          className="absolute left-1/2 top-14 -translate-x-1/2 w-0.5 h-8 border-l-2 border-dashed border-white/20"
          style={{ height: "2rem" }}
        />
      )}

      {isUnlocked ? (
        <Link
          href={`/course/${courseId}/lesson/${level.id}`}
          className="relative z-10 flex flex-col items-center gap-1 group"
        >
          <motion.div
            className={`
              flex h-14 w-14 rounded-2xl items-center justify-center font-heading font-bold text-sm
              shadow-lg transition-colors
              ${completed ? "bg-teal text-navy" : "bg-navy-light border-2 border-teal/50 text-teal"}
              group-hover:scale-105 group-hover:border-teal
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {completed ? "✓" : index + 1}
          </motion.div>
          <span className="text-xs font-body text-white/90 max-w-[100px] text-center leading-tight">
            {level.title}
          </span>
          <span className="text-[10px] text-amber font-medium">+{XP_PER_LEVEL} XP</span>
        </Link>
      ) : (
        <div
          className="relative z-10 flex flex-col items-center gap-1 cursor-not-allowed"
          title="Complete the previous level first"
        >
          <div
            className="
              flex h-14 w-14 rounded-2xl items-center justify-center font-heading font-bold text-sm
              bg-navy-light border-2 border-white/20 text-white/40
            "
          >
            🔒
          </div>
          <span className="text-xs font-body text-white/50 max-w-[100px] text-center leading-tight">
            {level.title}
          </span>
          <span className="text-[10px] text-white/40 font-medium">+{XP_PER_LEVEL} XP</span>
        </div>
      )}
    </div>
  );
}
