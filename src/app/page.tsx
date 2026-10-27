import Link from "next/link";
import {
  getChaptersForSubject,
  getLesson,
  getLessonsForSubject,
  getPathLessons,
  getPaths,
  getSubjects,
} from "@/lib/content";

const STEPS = [
  {
    number: "01",
    title: "Start with a picture",
    text: "Every concept opens with an intuition — a diagram, a playground, a mental model — before any formula appears.",
  },
  {
    number: "02",
    title: "Build the mathematics",
    text: "Then we derive the exact statement from that intuition, so the formula stops being memorized and starts being obvious.",
  },
  {
    number: "03",
    title: "Apply it for real",
    text: "Worked examples from engineering and economics show the same result doing real work in the world.",
  },
];

export default function Home() {
  const featured = [getLesson("geometric-series")].filter(
    (lesson) => lesson !== undefined,
  );

  const paths = getPaths();

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="border-b border-[#2C2523]/20 bg-[#FBF4EC]">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
            Engineering Visual
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-[#181515] sm:text-6xl">
            See the math <em className="text-[#B4552D]">before</em> you
            compute it.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#181515]/70">
            Intuition-first lessons for engineering students: every concept
            starts as a picture and ends as a tool. No skipped steps, no
            borrowed formulas — just understanding.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/lessons/geometric-series"
              className="inline-flex items-center gap-2 rounded-full bg-[#181515] px-7 py-3.5 font-display text-base font-semibold text-[#F7EBE1] transition hover:bg-[#B4552D]"
            >
              Start with a lesson
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 rounded-full border border-[#181515] px-7 py-3.5 font-display text-base font-semibold text-[#181515] transition hover:border-[#B4552D] hover:text-[#B4552D]"
            >
              Browse subjects
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col">
              <span className="font-mono text-sm font-bold text-[#B4552D]">
                {step.number}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-[#181515]">
                {step.title}
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-[#181515]/65">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured lessons */}
      <section className="border-y border-[#2C2523]/20 bg-[#FBF4EC]">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
                Featured lessons
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#181515]">
                Start here
              </h2>
            </div>
            <Link
              href="/subjects"
              className="font-mono text-xs uppercase tracking-[0.18em] text-[#181515]/60 transition hover:text-[#B4552D]"
            >
              All subjects →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featured.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group flex flex-col rounded-3xl border border-[#2C2523]/25 bg-[#F7EBE1] p-8 transition hover:-translate-y-1 hover:border-[#181515]"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-[#B4552D]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#B4552D]">
                    {chapterLabel(lesson.chapterId)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/45">
                    {lesson.readingTime} min
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-[#181515] transition group-hover:text-[#B4552D]">
                  {lesson.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#181515]/65">
                  {lesson.summary}
                </p>
                <span className="mt-auto pt-6 font-mono text-xs uppercase tracking-[0.18em] text-[#181515]/50 transition group-hover:translate-x-1 group-hover:text-[#B4552D]">
                  Read lesson →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {getSubjects().map((subject) => {
            const chapters = getChaptersForSubject(subject.id);
            const lessons = getLessonsForSubject(subject.id);
            return (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group rounded-3xl border border-[#2C2523]/25 bg-[#FBF4EC] p-8 transition hover:-translate-y-1 hover:border-[#181515]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#181515] bg-[#181515] font-display text-xl text-[#F7EBE1]">
                      {subject.symbol}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[#181515]">
                        {subject.title}
                      </h3>
                      <p className="text-xs text-[#181515]/55">
                        {subject.tagline}
                      </p>
                    </div>
                  </div>
                  <span
                    className="font-mono text-xs text-[#181515]/45 transition group-hover:text-[#B4552D]"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#181515]/60">
                  {lessons.length} lessons · {chapters.length} chapters
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Learning paths */}
      <section className="border-t border-[#2C2523]/20 bg-[#F0E0D1]/60">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
            Learning paths
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#181515]">
            Follow a route, not a wall
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {paths.map((path) => {
              const lessons = getPathLessons(path);
              return (
                <Link
                  key={path.id}
                  href={`/paths/${path.slug}`}
                  className="group rounded-3xl border border-[#2C2523]/25 bg-[#FBF4EC] p-8 transition hover:-translate-y-1 hover:border-[#181515]"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/45">
                    {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-[#181515] transition group-hover:text-[#B4552D]">
                    {path.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-[#181515]/65">
                    {path.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function chapterLabel(chapterId: string) {
  const label = getSubjects()
    .flatMap((subject) => getChaptersForSubject(subject.id))
    .find((chapter) => chapter.id === chapterId)?.title;
  return label ?? "Lesson";
}