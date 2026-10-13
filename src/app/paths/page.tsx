import type { Metadata } from "next";
import Link from "next/link";
import { getPaths, getPathLessons } from "@/lib/content";

export const metadata: Metadata = {
  title: "Learning Paths",
  description:
    "Curated step-by-step sequences. Follow a path from first principles to fluency.",
};

export default function PathsPage() {
  const paths = getPaths();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
          Guided learning
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
          Learning paths
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#181515]/70">
          A path is a curated order of lessons that builds understanding
          without gaps. Follow one from start to finish, or wander on your own.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-6">
        {paths.map((path) => {
          const lessons = getPathLessons(path);
          return (
            <Link
              key={path.id}
              href={`/paths/${path.slug}`}
              className="group flex flex-col gap-5 rounded-3xl border border-[#2C2523]/25 bg-[#FBF4EC] p-8 transition hover:-translate-y-1 hover:border-[#181515] sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#181515]/45">
                  {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#181515] transition group-hover:text-[#B4552D]">
                  {path.title}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#181515]/70">
                  {path.description}
                </p>
                <p className="mt-3 text-sm text-[#181515]/50">
                  For: {path.audience}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#B4552D] transition group-hover:translate-x-1">
                  Start path →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}