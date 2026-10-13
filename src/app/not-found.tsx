import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-28 pt-24 text-center lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
        Error 404
      </p>
      <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-[#181515]">
        This page hasn&apos;t been written yet
      </h1>
      <p className="mt-5 max-w-md text-lg leading-8 text-[#181515]/65">
        The page you followed doesn&apos;t exist — or its lesson is still being
        authored. Here are some places that do exist:
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-[#181515] px-6 py-3 font-display text-sm font-semibold text-[#F7EBE1] transition hover:bg-[#B4552D]"
        >
          Home
        </Link>
        <Link
          href="/subjects"
          className="rounded-full border border-[#181515] px-6 py-3 font-display text-sm font-semibold text-[#181515] transition hover:text-[#B4552D]"
        >
          Browse subjects
        </Link>
        <Link
          href="/feedback"
          className="rounded-full border border-[#181515] px-6 py-3 font-display text-sm font-semibold text-[#181515] transition hover:text-[#B4552D]"
        >
          Feedback
        </Link>
      </div>
    </div>
  );
}