import type { LessonMeta } from "@/content/library";
import { getLessonSiblings } from "@/lib/content";
import Link from "next/link";

export function LessonNav({ meta }: { meta: LessonMeta }) {
  const { previous, next } = getLessonSiblings(meta);

  function card(side: "previous" | "next") {
    const lesson = side === "previous" ? previous : next;
    const textAlign = side === "next" ? "text-right" : "";
    const arrow = side === "next" ? "Next →" : "← Previous";

    if (!lesson) {
      return (
        <div
          className={`rounded-2xl border border-[#2C2523]/20 bg-[#FBF4EC]/60 p-5 opacity-55 ${textAlign}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/50">
            {arrow}
          </span>
          <p className="mt-2 font-display text-base font-semibold text-[#181515]/60">
            {side === "next" ? "End of the chapter" : "Start of the chapter"}
          </p>
        </div>
      );
    }

    return (
      <Link
        href={`/lessons/${lesson.slug}`}
        className={`rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-5 transition hover:-translate-y-0.5 hover:border-[#181515] ${textAlign} group`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/50">
          {arrow}
        </span>
        <p className="mt-2 font-display text-base font-semibold text-[#181515] transition group-hover:text-[#B4552D]">
          {lesson.title}
        </p>
      </Link>
    );
  }

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-12 grid gap-4 border-t border-[#2C2523]/20 pt-6 sm:grid-cols-2"
    >
      {card("previous")}
      {card("next")}
    </nav>
  );
}