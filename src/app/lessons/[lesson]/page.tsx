import type { Metadata } from "next";
import { Suspense, type ComponentType } from "react";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/content";
import { lessons } from "@/content/library";
import { LessonShell } from "@/components/lesson/lesson-shell";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const LESSON_LOADERS: Record<string, () => Promise<{ default: ComponentType }>> =
  {
    "geometric-series": () =>
      import("@/content/lessons/mathematics/geometric-series.mdx"),
    continuity: () => import("@/content/lessons/mathematics/continuity.mdx"),
    "continuity-practice-questions": () =>
      import("@/content/lessons/mathematics/continuity-practice-questions.mdx"),
    "taylor-series": () =>
      import("@/content/lessons/mathematics/taylor-series.mdx"),
    "coordinate-systems": () =>
      import("@/content/lessons/engineering/coordinate-systems.mdx"),
    "coordinate-past-year-questions": () =>
      import("@/content/lessons/engineering/coordinate-past-year-questions.mdx"),
    "coulombs-law": () =>
      import("@/content/lessons/engineering/coulombs-law.mdx"),
  };

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lesson: lesson.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lessons/[lesson]">): Promise<Metadata> {
  const { lesson } = await params;
  const meta = getLesson(lesson);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: {
      title: meta.title,
      description: meta.summary,
      type: "article",
    },
  };
}

async function LessonBody({ id }: { id: string }) {
  const load = LESSON_LOADERS[id];
  if (!load) return null;
  const { default: Lesson } = await load();
  return <Lesson />;
}

/**
 * `params` is awaited inside the `<Suspense>` boundary so the App Shell stays
 * free of URL data (see the `instant-shell-url-data` insight). Real `404`s for
 * unknown lesson URLs are guaranteed by `src/proxy.ts`, which rewrites them
 * to `/_not-found` before any response is written; the `notFound()` call here
 * is defense in depth.
 */
export default function LessonPage({
  params,
}: PageProps<"/lessons/[lesson]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LessonView params={params} />
    </Suspense>
  );
}

async function LessonView({
  params,
}: {
  params: PageProps<"/lessons/[lesson]">["params"];
}) {
  const { lesson } = await params;
  const meta = getLesson(lesson);
  if (!meta) notFound();

  return (
    <LessonShell meta={meta} key={meta.id}>
      <LessonBody id={meta.id} />
    </LessonShell>
  );
}