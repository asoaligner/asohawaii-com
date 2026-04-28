"use client";

type Props = {
  current: 1 | 2 | 3;
  /** Visited = step has been completed at least once. Lets the user
   *  jump back without invalidating progress. */
  visited: Set<number>;
  onJump: (step: 1 | 2 | 3) => void;
};

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: "Practice" },
  { n: 2, label: "Appliance" },
  { n: 3, label: "Files & delivery" },
];

export default function StepIndicator({ current, visited, onJump }: Props) {
  return (
    <ol className="flex items-center justify-between gap-2 sm:gap-4">
      {STEPS.map((s, i) => {
        const isCurrent = s.n === current;
        const isDone = visited.has(s.n) && s.n < current;
        const clickable = isDone || s.n === current;
        return (
          <li key={s.n} className="flex-1 flex items-center min-w-0">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(s.n)}
              className={`flex items-center gap-2.5 min-w-0 ${
                clickable ? "cursor-pointer" : "cursor-default"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-[13px] font-semibold transition-colors ${
                  isCurrent
                    ? "bg-brandOrange text-white"
                    : isDone
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                ) : (
                  s.n
                )}
              </span>
              <span
                className={`text-[12.5px] truncate ${
                  isCurrent
                    ? "text-navy font-medium"
                    : isDone
                      ? "text-navy"
                      : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`mx-2 sm:mx-3 flex-1 h-px ${
                  isDone ? "bg-navy" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
