"use client";

import { useState, type ReactNode } from "react";

export function PracticeQuestion({
  number,
  children,
  solution,
}: {
  number?: number;
  children: ReactNode;
  solution: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={number ? `practice-${number}` : undefined}
      className="my-6 overflow-hidden rounded-2xl border border-[#2C2523]/35 bg-[#FBF4EC]"
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B4552D] font-mono text-xs font-bold text-[#B4552D]">
          {number ?? "?"}
        </span>
        <div className="text-[16px] leading-7 text-[#181515]/85">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border-t border-[#2C2523]/15 px-5 py-2.5 text-sm font-semibold text-[#B4552D] transition hover:bg-[#F0E0D1]/60"
      >
        {open ? "Hide solution" : "Show solution"}
        <span aria-hidden="true" className="transition-transform">
          {open ? "↑" : "↓"}
        </span>
      </button>
      {open && (
        <div className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/40 px-5 py-4 text-[16px] leading-7 text-[#181515]/85">
          {solution}
        </div>
      )}
    </div>
  );
}