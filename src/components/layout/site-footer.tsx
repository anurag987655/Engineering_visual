import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#2C2523]/20 bg-[#F0E0D1]/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between lg:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-[#181515]">
            Engineering Visual
          </p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-[#181515]/60">
            Understand deeply, see clearly. Intuition-first lessons for
            engineering students.
          </p>
        </div>

        <div className="flex gap-10 text-sm">
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/45">
              Browse
            </p>
            <Link href="/subjects" className="text-[#181515]/70 transition hover:text-[#B4552D]">
              Subjects
            </Link>
            <Link href="/paths" className="text-[#181515]/70 transition hover:text-[#B4552D]">
              Learning paths
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/45">
              Contribute
            </p>
            <Link href="/feedback" className="text-[#181515]/70 transition hover:text-[#B4552D]">
              Send feedback
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#2C2523]/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-[#181515]/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>Made for curious engineers.</p>
          <p>A growing library, one concept at a time.</p>
        </div>
      </div>
    </footer>
  );
}