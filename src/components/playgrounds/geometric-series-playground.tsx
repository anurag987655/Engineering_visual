"use client";

import { useState, type CSSProperties } from "react";

function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return {
    "--pulse": `${Math.max(0, Math.min(100, pct))}%`,
  } as CSSProperties;
}

function format(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

/* ------------------------------------------------------------------ */
/* Convergence & divergence: running total vs n                         */
/* ------------------------------------------------------------------ */

const N = 40;
const MAX_DOMAIN = 12;

function partialSum(rho: number, n: number, a: number): number {
  if (Math.abs(rho - 1) < 1e-9) return a * n;
  return (a * (1 - Math.pow(rho, n))) / (1 - rho);
}

function verdict(rho: number): { text: string; diverge: boolean } {
  if (rho > 1) return { text: "Diverges · grows without bound", diverge: true };
  if (rho === 1) return { text: "Diverges · grows linearly", diverge: true };
  if (rho === -1)
    return { text: "Diverges · oscillates between a and 0", diverge: true };
  if (rho < -1)
    return { text: "Diverges · oscillates, growing amplitude", diverge: true };
  return { text: "Converges", diverge: false };
}

const PRESETS: { label: string; rho: number }[] = [
  { label: "0.5 · settles", rho: 0.5 },
  { label: "−0.5 · zigzag-settles", rho: -0.5 },
  { label: "1 · grows linearly", rho: 1 },
  { label: "−1 · flips", rho: -1 },
  { label: "1.2 · grows", rho: 1.2 },
  { label: "−1.2 · grows, swinging", rho: -1.2 },
];

export function GeometricSeriesConvergence() {
  const [rho, setRho] = useState(0.5);
  const a = 1;
  const S = a / (1 - rho);
  const v = verdict(rho);

  const ys: number[] = [];
  for (let n = 1; n <= N; n += 1) ys.push(partialSum(rho, n, a));

  const diverging = v.diverge;
  let yMin: number;
  let yMax: number;
  if (diverging) {
    yMin = -MAX_DOMAIN;
    yMax = MAX_DOMAIN;
  } else {
    yMin = Math.min(0, ...ys);
    yMax = Math.max(0, ...ys);
    const range = Math.max(yMax - yMin, 2);
    const pad = range * 0.12;
    yMin -= pad;
    yMax += pad;
  }

  const top = 16;
  const bottom = 236;
  const left = 34;
  const right = 590;

  const px = (n: number) => left + ((n - 1) / (N - 1)) * (right - left);
  const py = (y: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, y));
    return top + ((yMax - clamped) / (yMax - yMin)) * (bottom - top);
  };

  const line = ys
    .map((y, idx) => `${px(idx + 1).toFixed(2)},${py(y).toFixed(2)}`)
    .join(" ");

  const asympY = !diverging && Number.isFinite(S) ? py(S) : null;

  return (
    <VisualCard
      emoji="📈"
      title="The first term is fixed at a = 1"
      subtitle="Run the total and watch it decide — the common ratio ρ is the only dial."
    >
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <svg
          viewBox="0 0 600 252"
          role="img"
          aria-label="Line plot of the running total of the geometric series against the number of terms"
          className="block w-full"
        >
          <text
            x={left}
            y="14"
            className="font-mono"
            fontSize="11"
            fill="#181515"
            style={{ opacity: 0.5 }}
          >
            Sₙ vs n
          </text>

          {py(0) > top && py(0) < bottom && (
            <line
              x1={left}
              x2={right}
              y1={py(0).toFixed(2)}
              y2={py(0).toFixed(2)}
              stroke="#181515"
              strokeDasharray="3 5"
              strokeWidth="1"
              style={{ opacity: 0.25 }}
            />
          )}

          {asympY !== null && (
            <>
              <line
                x1={left}
                x2={right}
                y1={asympY.toFixed(2)}
                y2={asympY.toFixed(2)}
                stroke="#B4552D"
                strokeDasharray="6 4"
                strokeWidth="1.5"
              />
              <text
                x={right}
                y={asympY.toFixed(2)}
                fontSize="11"
                className="font-mono"
                fill="#B4552D"
                textAnchor="end"
                dy={-4}
              >
                S = {format(S)}
              </text>
            </>
          )}

          <polyline
            points={line}
            fill="none"
            stroke="#181515"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {Array.from({ length: Math.ceil(N / 5) }, (_, i) => {
            const n = i * 5 + 1;
            return (
              <circle
                key={n}
                cx={px(n).toFixed(2)}
                cy={py(ys[n - 1]).toFixed(2)}
                r="2.6"
                fill="#B4552D"
              />
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
          <span className="inline-block rounded-full border border-solid border-[#181515]/70 px-3 py-1 text-xs font-semibold text-[#181515]">
            First term a = {format(a)}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              v.diverge
                ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                : "border-[#B4552D] bg-[#B4552D]/10 text-[#B4552D]"
            }`}
          >
            {v.text}
          </span>
          <span className="text-[#181515]/70">
            S₄₀ = <b className="text-[#181515]">{format(ys[N - 1])}</b>
          </span>
          {!v.diverge && (
            <span className="text-[#181515]/70">
              limit S ={" "}
              <b className="text-[#B4552D]">{format(S)}</b>
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-[#181515]/65">
          {v.diverge
            ? rho === -1
              ? "The total never settles: it flips between a and 0 forever."
              : "Once |ρ| ≥ 1 the running total escapes the frame — the clip you are seeing is the only trace of it."
            : rho < 0
              ? "Negative ratios make the total zigzag, but each swing is quieter than the last until it settles on S."
              : "Each new term is smaller than the last, so the running total crowds closer and closer to S."}
        </p>
      </div>

      <div className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[#181515]">
            Try a case
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.rho}
              type="button"
              aria-pressed={rho === preset.rho}
              onClick={() => setRho(preset.rho)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                rho === preset.rho
                  ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                  : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label
          htmlFor="convergence-rho"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          Or drag the common ratio ρ
        </label>
        <input
          id="convergence-rho"
          type="range"
          min={-1.4}
          max={1.4}
          step={0.05}
          value={rho}
          style={rangeStyle(rho, -1.4, 1.4)}
          onChange={(event) => setRho(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>−1.4</span>
          <span>0</span>
          <span>+1.4</span>
        </div>
      </div>
    </VisualCard>
  );
}

/* ------------------------------------------------------------------ */
/* Shared card                                                          */
/* ------------------------------------------------------------------ */

function VisualCard({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-10 overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_24px_60px_-30px_rgba(24,21,21,0.5)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2523]/20 bg-[#F0E0D1] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515] font-mono text-xs text-[#F7EBE1]">
            {emoji}
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">
              Interactive visual
            </p>
            <p className="mt-1 text-xs text-[#181515]/60">
              {title} — {subtitle}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#B4552D]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4552D]">
          Pick a case or drag ρ
        </span>
      </div>
      {children}
    </div>
  );
}