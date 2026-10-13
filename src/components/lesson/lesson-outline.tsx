import type { LessonMeta } from "@/content/library";

export function LessonOutline({ meta }: { meta: LessonMeta }) {
  if (meta.outline.length === 0) return null;
  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#181515]/50">
        On this page
      </p>
      <div className="mt-4 flex flex-col border-l border-[#2C2523]/20">
        {meta.outline.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="-ml-px border-l border-transparent py-2 pl-4 text-sm text-[#181515]/65 transition hover:border-[#B4552D] hover:text-[#B4552D]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}