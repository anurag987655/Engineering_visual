"use client";

import type { LessonMeta } from "@/content/library";
import { useProgress } from "@/lib/progress/provider";
import { summarizeLessons } from "@/lib/progress/selectors";
import { ProgressBar } from "@/components/progress/progress-bar";

export function TrackedProgress({
  lessons,
  className = "",
}: {
  lessons: LessonMeta[];
  className?: string;
}) {
  const { progress } = useProgress();
  const summary = summarizeLessons(lessons, progress);

  if (lessons.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-[#181515]/65">
        <span>
          {summary.completed} of {summary.total} complete
        </span>
        <span className="font-mono text-[#B4552D]">{summary.percent}%</span>
      </div>
      <ProgressBar percent={summary.percent} className="mt-2" />
    </div>
  );
}
