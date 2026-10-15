import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";
import CodeBlock from "@/components/mdx/code-block";
import { Equation } from "@/components/mdx/equation";
import { Figure } from "@/components/mdx/figure";
import { KeyIdea } from "@/components/mdx/key-idea";
import { PracticeQuestion } from "@/components/mdx/practice-question";
import { Playground } from "@/components/playgrounds/registry";

const components = {
  h2: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h2
      id={id}
      className="mt-12 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-[#181515] sm:text-3xl"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children?: React.ReactNode; id?: string }) => (
    <h3
      id={id}
      className="mt-9 scroll-mt-24 font-display text-xl font-semibold tracking-tight text-[#181515]"
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-5 text-[17px] leading-8 text-[#181515]/85">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 text-[17px] leading-7 text-[#181515]/85 marker:text-[#B4552D]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 text-[17px] leading-7 text-[#181515]/85 marker:font-mono marker:text-[#B4552D]">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      className="underline decoration-[#B4552D]/60 underline-offset-[3px] transition hover:text-[#B4552D]"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[#181515]">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  hr: () => (
    <hr className="my-10 border-t border-dashed border-[#2C2523]/30" aria-hidden="true" />
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-[#B4552D]/70 bg-[#F0E0D1]/50 py-3 pl-5 pr-4 text-[17px] italic leading-8 text-[#181515]/80">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-[#2C2523]/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#181515]">
      {children}
    </code>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div
      role="region"
      aria-label="Lesson table; scroll horizontally to view all columns"
      tabIndex={0}
      className="my-8 overflow-x-auto rounded-xl border border-[#2C2523]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4552D]"
    >
      <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0 text-left text-sm leading-6">
        {children}
      </table>
      <p className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/50 px-4 py-2 text-xs text-[#181515]/55 sm:hidden">
        Swipe sideways to see every column.
      </p>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-[#F0E0D1]/80">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="break-words border-b border-r border-[#2C2523]/15 px-6 py-5 align-top font-semibold leading-6 text-[#181515] last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="break-words border-b border-r border-[#2C2523]/10 px-6 py-5 align-top leading-6 text-[#181515]/80 last:border-r-0">
      {children}
    </td>
  ),
  Callout,
  KeyIdea,
  Figure,
  Equation,
  PracticeQuestion,
  Playground,
  CodeBlock,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
