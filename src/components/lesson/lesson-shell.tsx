import type { ReactNode } from "react";
import type { LessonMeta } from "@/content/library";
import {
  getChapterForLesson,
  getSubjectForChapter,
} from "@/lib/content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CompletionToggle } from "@/components/progress/lesson-status";
import { LessonFeedback } from "@/components/feedback/lesson-feedback";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { LessonOutline } from "@/components/lesson/lesson-outline";

const LEVEL_LABELS = {
  intro: "Introduction",
  core: "Core",
  advanced: "Advanced",
} as const;

export function LessonShell({
  meta,
  children,
}: {
  meta: LessonMeta;
  children: ReactNode;
}) {
  const chapter = getChapterForLesson(meta);
  const subject = chapter ? getSubjectForChapter(chapter) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 lg:px-8">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          ...(subject
            ? [{ label: subject.title, href: `/subjects/${subject.slug}` }]
            : []),
          ...(chapter && subject
            ? [
                {
                  label: chapter.title,
                  href: `/subjects/${subject.slug}/${chapter.slug}`,
                },
              ]
            : []),
          { label: meta.title },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <header>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
              {subject?.title ?? "Lesson"} · {chapter?.title ?? "Chapter"}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-[#181515] sm:text-5xl">
              {meta.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#181515]/70">
              {meta.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#2C2523]/20 py-4 text-sm text-[#181515]/65">
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#181515] font-display text-xs text-[#F7EBE1]">
                  EV
                </span>
                {meta.author}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-[#181515]/30 sm:block" />
              <span>{meta.readingTime} min read</span>
              <span className="hidden h-1 w-1 rounded-full bg-[#181515]/30 sm:block" />
              <span>{LEVEL_LABELS[meta.level]}</span>
              <span className="ml-auto rounded-full border border-[#2C2523]/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                Updated {meta.updated}
              </span>
            </div>
          </header>

          {meta.objectives.length > 0 && (
            <div className="mt-7 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/55">
                What you will learn
              </p>
              <ul className="mt-3 space-y-2 text-[15px] leading-6 text-[#181515]/80">
                {meta.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2.5">
                    <span className="text-[#B4552D]" aria-hidden="true">
                      ▸
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <CompletionToggle lesson={meta} />
          </div>

          <article className="mt-10">{children}</article>

          <div className="mt-12">
            <LessonFeedback lessonId={meta.id} />
          </div>

          <LessonNav meta={meta} />
        </div>

        <aside className="hidden lg:block">
          <LessonOutline meta={meta} />
        </aside>
      </div>
    </div>
  );
}