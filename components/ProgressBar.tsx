"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export function ProgressBar({ completed, total, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2.5 w-full rounded-full bg-navy-light overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-teal"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="text-sm text-white/70 mt-1 font-body">
        {completed} of {total} levels complete
      </p>
    </div>
  );
}
