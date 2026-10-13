import type { ReactNode } from "react";

export function KeyIdea({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 rounded-2xl border-l-4 border-l-[#B4552D] bg-[#F0E0D1]/70 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B4552D]">
        Key idea
      </p>
      <div className="mt-3 text-[17px] leading-8 text-[#181515]/85">
        {children}
      </div>
    </div>
  );
}