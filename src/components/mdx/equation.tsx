import katex from "katex";
import type { ReactNode } from "react";

type EquationProps = {
  tex: string;
  display?: boolean;
  label?: string;
  annotation?: ReactNode;
};

/**
 * Renders a LaTeX string with KaTeX. Display equations get the vintage framed
 * treatment; inline equations flow with the text.
 */
export function Equation({
  tex,
  display = true,
  label,
  annotation,
}: EquationProps) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    strict: false,
    output: "html",
  });

  if (!display) {
    return (
      <span
        className="align-middle"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <figure className="my-9 overflow-hidden rounded-2xl border border-[#2C2523] bg-[#FBF4EC]">
      {label && (
        <div className="flex items-center justify-between border-b border-[#2C2523]/20 px-5 py-2.5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#181515]/55">
            {label}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full border border-[#181515]/40" />
            <span className="h-2 w-2 rounded-full border border-[#181515]/40" />
            <span className="h-2 w-2 rounded-full bg-[#B4552D]/70" />
          </span>
        </div>
      )}
      <div className="overflow-x-auto px-5 py-7 text-[#181515] sm:px-8">
        <div
          className="flex min-w-max justify-center text-lg"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {annotation && (
        <figcaption className="border-t border-[#2C2523]/15 px-5 py-3 text-sm leading-6 text-[#181515]/65 sm:px-8">
          {annotation}
        </figcaption>
      )}
    </figure>
  );
}
