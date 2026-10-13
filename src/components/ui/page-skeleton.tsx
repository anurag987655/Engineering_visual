export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 lg:px-8">
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#181515]/45">
        <span className="font-mono text-xs uppercase tracking-[0.18em]">Home</span>
        <span aria-hidden="true">/</span>
        <span className="font-mono text-xs uppercase tracking-[0.18em]">Subject</span>
      </nav>

      <div className="mt-8 flex max-w-3xl flex-col gap-5">
        <div className="flex items-center gap-5">
          <span className="h-16 w-16 shrink-0 rounded-2xl border border-[#2C2523]/15 bg-[#2C2523]/5" />
          <div className="flex flex-col gap-3">
            <span className="h-8 w-48 rounded-md bg-[#2C2523]/10" />
            <span className="h-4 w-64 rounded-md bg-[#2C2523]/8" />
          </div>
        </div>
        <span className="h-4 w-3/4 rounded-md bg-[#2C2523]/8" />
        <span className="h-4 w-2/3 rounded-md bg-[#2C2523]/8" />
      </div>

      <div className="mt-12 flex flex-col gap-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#2C2523]/10 bg-[#FBF4EC] p-6 sm:p-8"
          >
            <span className="h-6 w-40 rounded-md bg-[#2C2523]/10" />
            <div className="mt-5 flex flex-col gap-3">
              <span className="h-4 w-5/6 rounded-md bg-[#2C2523]/8" />
              <span className="h-4 w-4/6 rounded-md bg-[#2C2523]/8" />
              <span className="h-4 w-24 rounded-full border border-[#2C2523]/15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}