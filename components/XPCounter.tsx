"use client";

import { motion } from "framer-motion";

interface XPCounterProps {
  value: number;
  delta?: number;
  className?: string;
}

export function XPCounter({ value, delta, className = "" }: XPCounterProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-3 py-1.5 text-amber font-heading font-bold ${className}`}
      initial={false}
      animate={delta ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <span className="text-lg">✦</span>
      <span>{value}</span>
      {delta != null && delta > 0 && (
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-teal"
        >
          +{delta}
        </motion.span>
      )}
    </motion.div>
  );
}
