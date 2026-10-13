import type { ReactNode } from "react";

type CalloutProps = {
  title?: string;
  variant?: "note" | "warn";
  children: ReactNode;
};

const STYLES = {
  note: {
    box: "border-[#2C2523]/30 bg-[#FBF4EC]",
    label: "text-[#181515]/55",
  },
  warn: {
    box: "border-l-4 border-l-[#B4552D] bg-[#F0E0D1]/70",
    label: "text-[#B4552D]",
  },
} as const;

export function Callout({
  title = "Note",
  variant = "note",
  children,
}: CalloutProps) {
  const styles = STYLES[variant];
  return (
    <div className={`my-8 rounded-2xl p-6 ${styles.box}`}>
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.18em] ${styles.label}`}
      >
        {title}
      </p>
      <div className="mt-3 text-[17px] leading-8 text-[#181515]/85">
        {children}
      </div>
    </div>
  );
}