"use client";

import { useEffect } from "react";
import type { LessonMeta } from "@/content/library";
import { lessonProgressKey } from "@/lib/progress/keys";
import { useProgress, useProgressStore } from "@/lib/progress/provider";
import type { LessonStatus } from "@/lib/progress/store";

const LABELS: Record<LessonStatus, string> = {
  "not-started": "Not started",
  started: "In progress",
  completed: "Completed",
};

const DOT_STYLES: Record<LessonStatus, string> = {
  "not-started": "border-[#2C2523]/40 bg-transparent",
  started: "border-[#B4552D] bg-[#B4552D]/25",
  completed: "border-[#181515] bg-[#181515]",
};

export function LessonStatusDot({
  lesson,
  withLabel = true,
}: {
  lesson: LessonMeta;
  withLabel?: boolean;
}) {
  const { progress } = useProgress();
  const status = progress[lessonProgressKey(lesson)]?.status ?? "not-started";

  return (
    <span className="inline-flex items-center gap-2 text-xs text-[#181515]/65">
      <span
        className={`h-2.5 w-2.5 rounded-full border ${DOT_STYLES[status]}`}
        aria-hidden="true"
      />
      {withLabel ? LABELS[status] : <span className="sr-only">{LABELS[status]}</span>}
    </span>
  );
}

export function CompletionToggle({ lesson }: { lesson: LessonMeta }) {
  const store = useProgressStore();
  const { progress, setStatus } = useProgress();
  const key = lessonProgressKey(lesson);
  const status = progress[key]?.status ?? "not-started";

  useEffect(() => {
    // Read the store directly: during hydration `status` still reflects the
    // server snapshot (empty), and acting on it would overwrite saved
    // progress — including a lesson already marked completed.
    if (store.get(key) === "not-started") store.setStatus(key, "started");
    // Mark as started once when the student first opens the lesson.
  }, [key, store]);

  const completed = status === "completed";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-4">
      <span className="flex items-center gap-2 text-sm text-[#181515]/70">
        <span
          className={`h-2.5 w-2.5 rounded-full border ${DOT_STYLES[status]}`}
          aria-hidden="true"
        />
        {LABELS[status]}
      </span>
      <button
        type="button"
        onClick={() => setStatus(key, completed ? "started" : "completed")}
        className={`ml-auto rounded-full border px-4 py-2 text-sm font-semibold transition ${
          completed
            ? "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
            : "border-[#181515] bg-[#181515] text-[#F7EBE1] hover:border-[#B4552D] hover:bg-[#B4552D]"
        }`}
      >
        {completed ? "Mark as incomplete" : "Mark as complete"}
      </button>
    </div>
  );
}
