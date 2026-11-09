"use client";

import { motion, useReducedMotion } from "framer-motion";
import { btnText } from "./styles";

interface Props {
  step: number;
  total: number;
  title: string;
  onBack?: () => void;
}

export default function ProgressBar({ step, total, title, onBack }: Props) {
  const reduce = useReducedMotion();
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="sticky top-0 z-10 -mx-4 bg-paper px-4 pt-2 pb-3">
      <div className="flex h-11 items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className={`${btnText} -ml-2`}>
            <span aria-hidden>←</span> Back
          </button>
        ) : (
          <span className="font-display text-base font-semibold tracking-tight">Counter</span>
        )}
        <span className="font-display text-[13px] font-medium text-ink">
          Step {step + 1} of {total}
          <span className="sr-only">: {title}</span>
        </span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-lavender"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
      >
        <motion.div
          className="h-full rounded-full bg-violet"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
