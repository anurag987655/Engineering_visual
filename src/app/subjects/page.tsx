import type { Metadata } from "next";
import Link from "next/link";
import {
  getChaptersForSubject,
  getLessonsForSubject,
  getSubjects,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "Browse Engineering Visual's ever-growing library of subjects, chapters, and lessons.",
};

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
          The library
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
          Subjects
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#181515]/70">
          Everything is taught intuition-first: a picture, a playground, then
          the mathematics. Pick a subject to begin.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {subjects.map((subject) => {
          const chaptersList = getChaptersForSubject(subject.id);
          const lessonsList = getLessonsForSubject(subject.id);
          const authored = chaptersList.filter(
            (chapter) => chapter.lessonIds.length > 0,
          );

          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="group flex flex-col rounded-3xl border border-[#2C2523]/25 bg-[#FBF4EC] p-8 transition hover:-translate-y-1 hover:border-[#181515]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#181515] bg-[#181515] font-display text-2xl text-[#F7EBE1]">
                  {subject.symbol}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-[#181515] transition group-hover:text-[#B4552D]">
                    {subject.title}
                  </h2>
                  <p className="text-sm text-[#181515]/55">{subject.tagline}</p>
                </div>
              </div>

              <p className="mt-5 text-[15px] leading-7 text-[#181515]/70">
                {subject.description}
              </p>

              <div className="mt-6 flex items-center gap-3 text-sm text-[#181515]/65">
                <span className="rounded-full border border-[#2C2523]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">
                  {chaptersList.length} chapters
                </span>
                <span className="rounded-full border border-[#2C2523]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">
                  {lessonsList.length} lessons
                </span>
              </div>

              {authored.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {authored.map((chapter) => (
                    <li
                      key={chapter.id}
                      className="rounded-lg bg-[#F0E0D1] px-3 py-1.5 text-xs font-medium text-[#181515]/75"
                    >
                      {chapter.title}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-auto pt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#B4552D] transition group-hover:translate-x-1">
                Browse subject →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}