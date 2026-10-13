import type { ReactNode } from "react";

export function Figure({
  children,
  caption,
}: {
  children: ReactNode;
  caption?: string;
}) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-2xl border border-[#2C2523]/30 bg-[#FBF4EC]">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-2.5 px-1 text-sm leading-6 text-[#181515]/60">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}