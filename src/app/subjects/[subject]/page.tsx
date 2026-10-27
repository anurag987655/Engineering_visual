import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { TrackedProgress } from "@/components/progress/tracked-progress";
import {
  getChaptersForSubject,
  getLessonsForChapter,
  getLessonsForSubject,
  getSubject,
} from "@/lib/content";
import { subjects } from "@/content/library";

export function generateStaticParams() {
  return subjects.map((subject) => ({ subject: subject.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/subjects/[subject]">): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) return {};
  return { title: subject.title, description: subject.description };
}

/**
 * `params` is awaited outside `<Suspense>` so an unknown subject slug returns
 * a real `404` response instead of a streamed soft-404 with status 200.
 */
export default async function SubjectPage({
  params,
}: PageProps<"/subjects/[subject]">) {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) notFound();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <SubjectView subject={subject} />
    </Suspense>
  );
}

function SubjectView({
  subject,
}: {
  subject: NonNullable<ReturnType<typeof getSubject>>;
}) {
  const chaptersList = getChaptersForSubject(subject.id);
  const subjectLessons = getLessonsForSubject(subject.id);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 lg:px-8">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Subjects", href: "/subjects" },
          { label: subject.title },
        ]}
      />

      <header className="mt-8 max-w-3xl">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#181515] bg-[#181515] font-display text-3xl text-[#F7EBE1]">
            {subject.symbol}
          </span>
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
              {subject.title}
            </h1>
            <p className="mt-1 text-base text-[#181515]/55">{subject.tagline}</p>
          </div>
        </div>
        <p className="mt-6 text-lg leading-8 text-[#181515]/75">
          {subject.description}
        </p>
      </header>

      {subjectLessons.length > 0 && (
        <div className="mt-8 max-w-md rounded-2xl border border-[#2C2523]/20 bg-[#FBF4EC] p-5">
          <TrackedProgress lessons={subjectLessons} />
        </div>
      )}

      <div className="mt-12 flex flex-col gap-8">
        {chaptersList.map((chapter) => {
          const lessons = getLessonsForChapter(chapter.id);
          const hasLessons = lessons.length > 0;
          return (
            <section
              key={chapter.id}
              className="rounded-3xl border border-[#2C2523]/25 bg-[#FBF4EC] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#181515]/45">
                    Chapter {chapter.order}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#181515]">
                    {chapter.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#181515]/70">
                    {chapter.summary}
                  </p>
                </div>
                <Link
                  href={`/subjects/${subject.slug}/${chapter.slug}`}
                  className="rounded-full border border-[#181515] px-5 py-2 text-sm font-semibold text-[#181515] transition hover:border-[#B4552D] hover:bg-[#B4552D] hover:text-[#F7EBE1]"
                >
                  Open chapter
                </Link>
              </div>

              {hasLessons && (
                <div className="mt-6 border-t border-[#2C2523]/15 pt-5">
                  <TrackedProgress lessons={lessons} />
                  <ul className="mt-5 flex flex-col gap-2">
                    {lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="group flex items-baseline gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-[#2C2523]/20 hover:bg-[#F0E0D1]/60"
                        >
                          <span className="font-mono text-xs text-[#B4552D]">
                            {String(lesson.order).padStart(2, "0")}
                          </span>
                          <span className="flex-1">
                            <span className="block font-medium text-[#181515] transition group-hover:text-[#B4552D]">
                              {lesson.title}
                            </span>
                            <span className="block text-sm text-[#181515]/55">
                              {lesson.readingTime} min · {lesson.summary}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!hasLessons && (
                <p className="mt-5 rounded-xl border border-dashed border-[#2C2523]/25 px-4 py-3 text-sm text-[#181515]/50">
                  Lessons for this chapter are being written. Check back soon.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}