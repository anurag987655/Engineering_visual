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
  if (value !== 0 && Math.abs(value) < 0.001) return value.toExponential(1);
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
}

/* ------------------------------------------------------------------ */
/* Functions the reader can approximate                                */
/* ------------------------------------------------------------------ */

type Preset = {
  id: string;
  label: string;
  window: [number, number];
  x0: number;
  f: (x: number) => number;
  /** Taylor coefficient f^(k)(x0) / k! around the preset expansion point. */
  coefficient: (k: number, x0: number) => number;
};

const PRESETS: Preset[] = [
  {
    id: "exp",
    label: "eˣ",
    window: [-1.5, 3],
    x0: 0,
    f: (x) => Math.exp(x),
    coefficient: (k, x0) => Math.exp(x0) / factorial(k),
  },
  {
    id: "sin",
    label: "sin x",
    window: [-3.2, 3.2],
    x0: 0,
    f: (x) => Math.sin(x),
    coefficient: (k, x0) => sinDerivative(k, x0) / factorial(k),
  },
  {
    id: "cos",
    label: "cos x",
    window: [-3.2, 3.2],
    x0: 0,
    f: (x) => Math.cos(x),
    coefficient: (k, x0) => cosDerivative(k, x0) / factorial(k),
  },
  {
    id: "ln",
    label: "ln(1+x)",
    window: [-0.8, 3],
    x0: 0,
    f: (x) => (x > -1 ? Math.log(1 + x) : NaN),
    coefficient: (k, x0) => {
      if (k === 0) return Math.log(1 + x0);
      return Math.pow(-1, k - 1) / (k * Math.pow(1 + x0, k));
    },
  },
];

function factorial(k: number): number {
  let out = 1;
  for (let i = 2; i <= k; i += 1) out *= i;
  return out;
}

function sinDerivative(k: number, x: number): number {
  const s = Math.sin(x);
  const c = Math.cos(x);
  switch (k % 4) {
    case 0:
      return s;
    case 1:
      return c;
    case 2:
      return -s;
    default:
      return -c;
  }
}

function cosDerivative(k: number, x: number): number {
  const s = Math.sin(x);
  const c = Math.cos(x);
  switch (k % 4) {
    case 0:
      return c;
    case 1:
      return -s;
    case 2:
      return -c;
    default:
      return s;
  }
}

/* ------------------------------------------------------------------ */
/* Playground                                                           */
/* ------------------------------------------------------------------ */

const SAMPLES = 240;
const MAX_DEGREE = 12;

export function TaylorApproximation() {
  const [presetId, setPresetId] = useState("exp");
  const [degree, setDegree] = useState(3);
  const [x0, setX0] = useState(0);

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [w0, w1] = preset.window;

  const xs: number[] = [];
  const ysF: number[] = [];
  const ysP: number[] = [];
  let yMin = Infinity;
  let yMax = -Infinity;

  for (let i = 0; i < SAMPLES; i += 1) {
    const x = w0 + ((w1 - w0) * i) / (SAMPLES - 1);
    xs.push(x);
    const yf = preset.f(x);
    ysF.push(yf);
    if (Number.isFinite(yf)) {
      yMin = Math.min(yMin, yf);
      yMax = Math.max(yMax, yf);
    }

    let sum = 0;
    let power = 1;
    const dx = x - x0;
    for (let k = 0; k <= degree; k += 1) {
      if (k > 0) power *= dx;
      sum += preset.coefficient(k, x0) * power;
    }
    ysP.push(sum);
  }

  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    yMin = -1;
    yMax = 1;
  }
  const span = Math.max(yMax - yMin, 0.5);
  yMin -= span * 0.15;
  yMax += span * 0.15;

  let maxError = 0;
  for (let i = 0; i < SAMPLES; i += 1) {
    const yf = ysF[i];
    const yp = ysP[i];
    if (Number.isFinite(yf) && Number.isFinite(yp)) {
      maxError = Math.max(maxError, Math.abs(yf - yp));
    }
  }

  const top = 18;
  const bottom = 236;
  const left = 34;
  const right = 590;

  const px = (x: number) => left + ((x - w0) / (w1 - w0)) * (right - left);
  const py = (y: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, y));
    return top + ((yMax - clamped) / (yMax - yMin)) * (bottom - top);
  };

  const lineF = xs
    .map((x, i) => `${px(x).toFixed(2)},${py(ysF[i]).toFixed(2)}`)
    .join(" ");
  const lineP = xs
    .map((x, i) => `${px(x).toFixed(2)},${py(ysP[i]).toFixed(2)}`)
    .join(" ");
  const band = [
    ...xs.map((x, i) => `${px(x).toFixed(2)},${py(ysF[i]).toFixed(2)}`),
    ...[...xs]
      .reverse()
      .map((x, i) => {
        const idx = xs.length - 1 - i;
        return `${px(x).toFixed(2)},${py(ysP[idx]).toFixed(2)}`;
      }),
  ].join(" ");

  const y0 = preset.f(x0);
  const x0Px = px(x0).toFixed(2);
  const x0LabelX =
    x0Px > String(right - 120) ? Number(x0Px) - 8 : Number(x0Px) + 8;
  const x0Anchor = x0Px > String(right - 120) ? "end" : "start";

  const hint =
    degree <= 1
      ? "Value and slope match at x₀ — then the line peels away from the curve within a step or two."
      : degree <= 3
        ? "Curvature (and the next twist) now match too, so the fit hugs the curve noticeably longer."
        : degree <= 7
          ? "Each new term fixes one more detail around x₀; the match spreads outward as n grows."
          : "Deep terms are tiny near x₀ thanks to k!, so the polynomial is nearly indistinguishable in view.";

  return (
    <VisualCard
      emoji="📈"
      title="Watch Pₙ catch up to f as n grows"
      subtitle="pick a function, raise the degree n, drag the expansion point x₀"
    >
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <svg
          viewBox="0 0 600 252"
          role="img"
          aria-label="Plot of a function together with its Taylor polynomial approximation"
          className="block w-full"
        >
          <text
            x={left}
            y="13"
            className="font-mono"
            fontSize="11"
            fill="#181515"
            style={{ opacity: 0.5 }}
          >
            f(x) vs Pₙ(x)
          </text>

          <polygon points={band} fill="#B4552D" style={{ opacity: 0.13 }} />

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

          <line
            x1={x0Px}
            x2={x0Px}
            y1={top}
            y2={bottom}
            stroke="#181515"
            strokeDasharray="5 5"
            strokeWidth="1.2"
            style={{ opacity: 0.45 }}
          />

          <polyline
            points={lineF}
            fill="none"
            stroke="#181515"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={lineP}
            fill="none"
            stroke="#B4552D"
            strokeWidth="2.2"
            strokeDasharray="7 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {Number.isFinite(y0) && (
            <>
              <circle
                cx={x0Px}
                cy={py(y0).toFixed(2)}
                r="5"
                fill="#B4552D"
                stroke="#FBF4EC"
                strokeWidth="1.8"
              />
              <text
                x={x0LabelX}
                y={py(y0) - 10}
                fontSize="11"
                className="font-mono"
                fill="#B4552D"
                textAnchor={x0Anchor}
              >
                x₀ = {format(x0)}
              </text>
            </>
          )}
        </svg>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
          <span className="inline-flex items-center gap-2 text-xs text-[#181515]/70">
            <span className="inline-block h-0.5 w-5 rounded bg-[#181515]" />
            f(x)
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-[#181515]/70">
            <span className="inline-block h-0.5 w-5 rounded bg-[#B4552D]" />
            Pₙ(x)
          </span>
          <span className="inline-block rounded-full border border-[#181515]/70 px-3 py-1 text-xs font-semibold text-[#181515]">
            n = {degree}
          </span>
          <span className="rounded-full border border-[#B4552D] bg-[#B4552D]/10 px-3 py-1 text-xs font-semibold text-[#B4552D]">
            x₀ = {format(x0)}
          </span>
          <span className="text-[#181515]/70">
            max |f − Pₙ| in view ={" "}
            <b className="text-[#181515]">{format(maxError)}</b>
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#181515]/65">{hint}</p>
      </div>

      <div className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[#181515]">
            Function
          </span>
          {PRESETS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === preset.id}
              onClick={() => {
                setPresetId(option.id);
                setX0(option.x0);
              }}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                option.id === preset.id
                  ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                  : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label
          htmlFor="taylor-degree"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          Raise the degree n of the Taylor polynomial
        </label>
        <input
          id="taylor-degree"
          type="range"
          min={0}
          max={MAX_DEGREE}
          step={1}
          value={degree}
          style={rangeStyle(degree, 0, MAX_DEGREE)}
          onChange={(event) => setDegree(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>0 · flat</span>
          <span>6</span>
          <span>12 · near exact</span>
        </div>

        <label
          htmlFor="taylor-x0"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          Or drag the expansion point x₀
        </label>
        <input
          id="taylor-x0"
          type="range"
          min={w0 + 0.1}
          max={w1 - 0.1}
          step={0.05}
          value={x0}
          style={rangeStyle(x0, w0 + 0.1, w1 - 0.1)}
          onChange={(event) => setX0(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>{format(w0 + 0.1)}</span>
          <span>{format((w0 + w1) / 2)}</span>
          <span>{format(w1 - 0.1)}</span>
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
          Pick a function or drag n
        </span>
      </div>
      {children}
    </div>
  );
}
