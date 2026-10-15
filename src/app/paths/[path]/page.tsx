import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TrackedProgress } from "@/components/progress/tracked-progress";
import {
  getChapterForLesson,
  getPath,
  getPathLessons,
  getSubjectForChapter,
} from "@/lib/content";

export function generateStaticParams() {
  return [
    { path: "mathematics-foundations" },
    { path: "electromagnetism-foundations" },
  ];
}

export async function generateMetadata({
  params,
}: PageProps<"/paths/[path]">): Promise<Metadata> {
  const { path: slug } = await params;
  const path = getPath(slug);
  if (!path) return {};
  return { title: path.title, description: path.description };
}

export default function PathPage({ params }: PageProps<"/paths/[path]">) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          aria-label="Loading learning path"
          className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8"
        >
          <div className="h-4 w-40 animate-pulse rounded bg-[#2C2523]/10" />
          <div className="mt-10 h-12 max-w-lg animate-pulse rounded bg-[#2C2523]/10" />
          <div className="mt-5 h-6 max-w-2xl animate-pulse rounded bg-[#2C2523]/10" />
          <div className="mt-10 h-36 rounded-2xl bg-[#2C2523]/10" />
        </div>
      }
    >
      <PathContent params={params} />
    </Suspense>
  );
}

async function PathContent({
  params,
}: {
  params: PageProps<"/paths/[path]">["params"];
}) {
  const { path: slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  const lessons = getPathLessons(path);
  const firstLesson = lessons[0];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Learning paths", href: "/paths" },
          { label: path.title },
        ]}
      />

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
          Learning path
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
          {path.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#181515]/70">
          {path.description}
        </p>
        <p className="mt-3 text-sm text-[#181515]/55">{path.audience}</p>
      </header>

      {lessons.length > 0 ? (
        <>
          <div className="mt-8 max-w-sm rounded-2xl border border-[#2C2523]/20 bg-[#FBF4EC] p-5">
            <TrackedProgress lessons={lessons} />
          </div>

          <ol className="mt-10 flex flex-col gap-4">
            {lessons.map((lesson, index) => {
              const chapter = getChapterForLesson(lesson);
              const subject = chapter
                ? getSubjectForChapter(chapter)
                : undefined;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC] p-5 transition hover:-translate-y-0.5 hover:border-[#181515]"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B4552D]/50 font-mono text-sm font-bold text-[#B4552D]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold text-[#181515] transition group-hover:text-[#B4552D]">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#181515]/60">
                        {lesson.summary}
                      </p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#181515]/45">
                        {subject && chapter
                          ? `${subject.title} · ${chapter.title}`
                          : "Lesson"}{" "}
                        · {lesson.readingTime} min
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          {firstLesson && (
            <div className="mt-12">
              <Link
                href={`/lessons/${firstLesson.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#181515] px-7 py-3.5 font-display text-base font-semibold text-[#F7EBE1] transition hover:bg-[#B4552D]"
              >
                Begin the path
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-[#2C2523]/25 bg-[#FBF4EC]/60 p-8 text-[15px] text-[#181515]/60">
          This path is being assembled. Check back soon.
        </p>
      )}
    </div>
  );
}
