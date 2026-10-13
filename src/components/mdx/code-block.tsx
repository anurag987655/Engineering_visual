import type { ReactNode } from "react";

const TOKEN =
  /(\/\/[^\n]*)|('[^']*'|"[^"]*"|`[^`]*`)|\b(function|const|let|var|return|for|of|in|if|else|new|Math|class)\b|\b(\d+\.?\d*)\b/g;

function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(TOKEN.source, "g");
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  const wrap = (text: string, className?: string) =>
    nodes.push(
      <span key={key++} className={className}>
        {text}
      </span>,
    );

  while ((match = re.exec(code)) !== null) {
    if (match.index > last) wrap(code.slice(last, match.index));
    if (match[1]) wrap(match[0], "italic text-[#B4552D]");
    else if (match[2]) wrap(match[0], "text-[#33506E]");
    else if (match[3]) wrap(match[0], "font-semibold text-[#B4552D]");
    else wrap(match[0], "text-[#BF4326]");
    last = match.index + match[0].length;
  }
  if (last < code.length) wrap(code.slice(last));
  return nodes;
}

type CodeBlockProps = {
  filename?: string;
  code: string;
};

export default function CodeBlock({ filename, code }: CodeBlockProps) {
  return (
    <div className="my-9 overflow-hidden rounded-2xl border border-[#2C2523] bg-[#F0E0D1]">
      <div className="flex items-center gap-3 border-b border-[#2C2523]/20 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full border border-[#181515]/35 bg-[#F7EBE1]" />
          <span className="h-3 w-3 rounded-full border border-[#181515]/35 bg-[#F7EBE1]" />
          <span className="h-3 w-3 rounded-full bg-[#B4552D]/75" />
        </span>
        {filename && (
          <span className="font-mono text-xs text-[#181515]/65">{filename}</span>
        )}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-[#181515]/45">
          JavaScript
        </span>
      </div>

      <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-6 text-[#181515]">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
