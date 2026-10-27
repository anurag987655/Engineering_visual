import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { TrackedProgress } from "@/components/progress/tracked-progress";
import {
  getChapterInSubject,
  getChaptersForSubject,
  getLessonsForChapter,
  getSubject,
} from "@/lib/content";
import { chapters, subjects } from "@/content/library";

type Chapter = NonNullable<ReturnType<typeof getChapterInSubject>>;
type Subject = NonNullable<ReturnType<typeof getSubject>>;

export function generateStaticParams() {
  const subjectSlugById = new Map(
    subjects.map((subject) => [subject.id, subject.slug]),
  );
  return chapters
    .map((chapter) => {
      const slug = subjectSlugById.get(chapter.subjectId);
      return slug ? { subject: slug, chapter: chapter.slug } : null;
    })
    .filter(
      (entry): entry is { subject: string; chapter: string } => entry !== null,
    );
}

export async function generateMetadata({
  params,
}: PageProps<"/subjects/[subject]/[chapter]">): Promise<Metadata> {
  const { subject: subjectSlug, chapter: chapterSlug } = await params;
  const subject = getSubject(subjectSlug);
  const chapter = subject && getChapterInSubject(subjectSlug, chapterSlug);
  if (!subject || !chapter) return {};
  return {
    title: chapter.title,
    description: chapter.summary,
  };
}

/**
 * `params` is awaited outside `<Suspense>` so unknown subject/chapter slugs
 * return a real `404` response instead of a streamed soft-404 with status 200.
 */
export default async function ChapterPage({
  params,
}: PageProps<"/subjects/[subject]/[chapter]">) {
  const { subject: subjectSlug, chapter: chapterSlug } = await params;
  const subject = getSubject(subjectSlug);
  const chapter = subject && getChapterInSubject(subjectSlug, chapterSlug);
  if (!subject || !chapter) notFound();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChapterView subject={subject} chapter={chapter} />
    </Suspense>
  );
}

function ChapterView({ subject, chapter }: { subject: Subject; chapter: Chapter }) {
  const lessons = getLessonsForChapter(chapter.id);
  const nextInSubject = getSubjectNextChapter(subject.id, chapter.order);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Subjects", href: "/subjects" },
          { label: subject.title, href: `/subjects/${subject.slug}` },
          { label: chapter.title },
        ]}
      />

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
          {subject.title} · Chapter {chapter.order}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
          {chapter.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#181515]/70">
          {chapter.summary}
        </p>
      </header>

      {chapter.outcomes.length > 0 && (
        <div className="mt-8 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/55">
            Outcomes
          </p>
          <ul className="mt-3 space-y-2 text-[15px] leading-6 text-[#181515]/80">
            {chapter.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2.5">
                <span className="text-[#B4552D]" aria-hidden="true">
                  ▸
                </span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="mt-8 max-w-sm rounded-2xl border border-[#2C2523]/20 bg-[#FBF4EC] p-5">
          <TrackedProgress lessons={lessons} />
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-6 transition hover:-translate-y-0.5 hover:border-[#181515] sm:flex-row sm:items-center"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B4552D]/40 font-mono text-sm font-bold text-[#B4552D]">
              {String(lesson.order).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-[#181515] transition group-hover:text-[#B4552D]">
                {lesson.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#181515]/60">
                {lesson.summary}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#181515]/45">
                {lesson.readingTime} min · {lesson.level}
                {lesson.playgrounds.length > 0 &&
                  ` · ${lesson.playgrounds.length} interactive${lesson.playgrounds.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <span className="font-mono text-xs text-[#181515]/40 transition group-hover:text-[#B4552D] group-hover:translate-x-1">
              Read →
            </span>
          </Link>
        ))}

        {lessons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2C2523]/25 bg-[#FBF4EC]/60 p-10 text-center">
            <p className="font-display text-xl font-semibold text-[#181515]">
              Coming soon
            </p>
            <p className="mt-2 text-[15px] text-[#181515]/60">
              Lessons for this chapter are being written. They will appear here
              as they are published.
            </p>
          </div>
        )}
      </div>

      {nextInSubject && (
        <div className="mt-12 border-t border-[#2C2523]/20 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/50">
            Up next in {subject.title}
          </p>
          <p className="mt-1 text-lg text-[#181515]/70">
            Chapter {nextInSubject.order}:{" "}
            <Link
              href={`/subjects/${subject.slug}/${nextInSubject.slug}`}
              className="font-medium text-[#B4552D] transition hover:underline"
            >
              {nextInSubject.title}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function getSubjectNextChapter(subjectId: string, order: number) {
  return getChaptersForSubject(subjectId).find((item) => item.order === order + 1);
}