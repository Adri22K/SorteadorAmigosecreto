import { ReactNode } from 'react';

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {steps.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="text-line">—</span>}
            <span
              className={`flex items-center gap-1.5 rounded-pill px-3 py-1 font-semibold transition ${
                isCurrent
                  ? 'bg-accent text-white shadow-accentSoft'
                  : isDone
                  ? 'bg-accent-soft text-accent-deep'
                  : 'bg-surface text-muted border border-line'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  isCurrent
                    ? 'bg-white/25 text-white'
                    : isDone
                    ? 'bg-accent text-white'
                    : 'bg-line text-muted'
                }`}
              >
                {i + 1}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
