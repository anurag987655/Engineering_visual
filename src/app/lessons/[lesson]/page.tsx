import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/content";
import { LessonShell } from "@/components/lesson/lesson-shell";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import GeometricSeries from "@/content/lessons/mathematics/geometric-series.mdx";
import Continuity from "@/content/lessons/mathematics/continuity.mdx";
import ContinuityPracticeQuestions from "@/content/lessons/mathematics/continuity-practice-questions.mdx";
import ElectricField from "@/content/lessons/engineering/electric-field.mdx";
import CoordinateSystems from "@/content/lessons/engineering/coordinate-systems.mdx";
import CoordinateQuestions from "@/content/lessons/engineering/coordinate-past-year-questions.mdx";

type LessonParams = PageProps<"/lessons/[lesson]">["params"];

export function generateStaticParams() {
  return [
    { lesson: "geometric-series" },
    { lesson: "continuity" },
    { lesson: "continuity-practice-questions" },
    { lesson: "electric-field" },
    { lesson: "coordinate-systems" },
    { lesson: "coordinate-past-year-questions" },
  ];
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

function LessonBody({ id }: { id: string }) {
  if (id === "electric-field") return <ElectricField />;
  if (id === "geometric-series") return <GeometricSeries />;
  if (id === "continuity") return <Continuity />;
  if (id === "continuity-practice-questions") return <ContinuityPracticeQuestions />;
  if (id === "coordinate-systems") return <CoordinateSystems />;
  if (id === "coordinate-past-year-questions") return <CoordinateQuestions />;
  return null;
}

export default function LessonPage({ params }: PageProps<"/lessons/[lesson]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LessonView params={params} />
    </Suspense>
  );
}

async function LessonView({ params }: { params: LessonParams }) {
  const { lesson } = await params;
  const meta = getLesson(lesson);
  if (!meta) notFound();

  return (
    <LessonShell meta={meta} key={meta.id}>
      <LessonBody id={meta.id} />
    </LessonShell>
  );
}