"use client";

import { useState, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Epsilon-delta challenger                                             */
/* ε is the player's tolerance on the output; δ is the window on the    */
/* input. The verdict says whether this δ answers this ε.               */
/* ------------------------------------------------------------------ */

type PresetId = "linear" | "quadratic";

type Preset = {
  id: PresetId;
  chip: string;
  formula: string;
  a: number;
  fa: number;
  f: (x: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
  deltaMax: number;
  worstError: (delta: number) => number;
  suggested: (eps: number) => number;
  law: string;
};

const PRESETS: Preset[] = [
  {
    id: "linear",
    chip: "f(x) = 2x + 3 at a = 1",
    formula: "f(x) = 2x + 3, a = 1, f(a) = 5",
    a: 1,
    fa: 5,
    f: (x) => 2 * x + 3,
    xDomain: [-1.2, 3.4],
    yDomain: [0, 10],
    deltaMax: 1.5,
    worstError: (delta) => 2 * delta,
    suggested: (eps) => eps / 2,
    law: "the output moves twice as fast as the input, so half the ε always works",
  },
  {
    id: "quadratic",
    chip: "f(x) = x² at a = 2",
    formula: "f(x) = x², a = 2, f(a) = 4",
    a: 2,
    fa: 4,
    f: (x) => x * x,
    xDomain: [0.4, 3.6],
    yDomain: [0, 13],
    deltaMax: 1.2,
    worstError: (delta) => Math.abs((2 + delta) ** 2 - 4),
    suggested: (eps) => Math.sqrt(4 + eps) - 2,
    law: "the slope steepens as you move away from a, so δ must shrink with ε",
  },
];

function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return {
    "--pulse": `${Math.max(0, Math.min(100, pct))}%`,
  } as CSSProperties;
}

function fmt(value: number): string {
  return value.toFixed(2);
}

const PLOT = { left: 50, right: 588, top: 18, bottom: 236 };
const VIEW = { w: 600, h: 272 };

export function EpsilonDeltaPlayground() {
  const [presetId, setPresetId] = useState<PresetId>("linear");
  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
  const [eps, setEps] = useState(1);
  const [delta, setDelta] = useState(0.4);

  const suggestedRaw = preset.suggested(eps);
  const suggested = Math.min(
    preset.deltaMax,
    Math.max(0.01, Math.floor(suggestedRaw * 100) / 100),
  );

  const worst = preset.worstError(delta);
  const pass = worst <= eps + 1e-12;

  const { a, fa, f } = preset;
  const [x0, x1] = preset.xDomain;
  const [y0, y1] = preset.yDomain;
  const px = (x: number) =>
    PLOT.left + ((x - x0) / (x1 - x0)) * (PLOT.right - PLOT.left);
  const py = (y: number) =>
    PLOT.top + ((y1 - y) / (y1 - y0)) * (PLOT.bottom - PLOT.top);

  const points: string[] = [];
  const STEPS = 320;
  for (let i = 0; i <= STEPS; i += 1) {
    const x = x0 + ((x1 - x0) * i) / STEPS;
    const y = f(x);
    if (y < y0 || y > y1) continue;
    points.push(`${px(x).toFixed(2)},${py(y).toFixed(2)}`);
  }

  const xLo = Math.max(x0, a - delta);
  const xHi = Math.min(x1, a + delta);
  const yLo = Math.max(y0, fa - eps);
  const yHi = Math.min(y1, fa + eps);

  const leftPoint = f(a - delta);
  const rightPoint = f(a + delta);
  const leftInBand = Math.abs(leftPoint - fa) <= eps + 1e-12;
  const rightInBand = Math.abs(rightPoint - fa) <= eps + 1e-12;

  return (
    <div className="my-10 overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_24px_60px_-30px_rgba(24,21,21,0.5)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2523]/20 bg-[#F0E0D1] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515] font-mono text-xs text-[#F7EBE1]">
            ε
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">
              Interactive visual
            </p>
            <p className="mt-1 text-xs text-[#181515]/60">
              First choose an output band, then find an input window that stays
              inside it.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#B4552D]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4552D]">
          Set ε · answer with δ
        </span>
      </div>

      <div className="px-5 pb-5 pt-6 sm:px-6">
        <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-[#B4552D]/30 bg-[#B4552D]/[0.06] p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#B4552D] font-mono text-xs text-[#FBF4EC]">
              1
            </span>
            <span>
              <b className="text-[#B4552D]">Choose ε:</b> the horizontal band
              of allowed output values around f(a).
            </span>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#181515]/20 bg-[#181515]/[0.04] p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#181515] font-mono text-xs text-[#FBF4EC]">
              2
            </span>
            <span>
              <b>Choose δ:</b> the input window around a. The curve inside it
              must stay in the ε band.
            </span>
          </div>
        </div>
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          role="img"
          aria-label={`Epsilon delta diagram for ${preset.formula}`}
          className="block w-full"
        >
          <rect
            x={PLOT.left}
            y={py(yHi).toFixed(2)}
            width={PLOT.right - PLOT.left}
            height={Math.max(0, py(yLo) - py(yHi)).toFixed(2)}
            fill="#B4552D"
            style={{ opacity: 0.14 }}
          />
          <text
            x={PLOT.right - 4}
            y={Math.max(PLOT.top + 12, py(yHi) - 5)}
            textAnchor="end"
            fontSize="10"
            className="font-mono"
            fill="#B4552D"
          >
            ε band: allowed outputs
          </text>
          <rect
            x={px(xLo).toFixed(2)}
            y={PLOT.top}
            width={Math.max(0, px(xHi) - px(xLo)).toFixed(2)}
            height={PLOT.bottom - PLOT.top}
            fill="#181515"
            style={{ opacity: 0.08 }}
          />
          <text
            x={px(xLo) + 5}
            y={PLOT.top + 13}
            fontSize="10"
            className="font-mono"
            fill="#181515"
          >
            δ window
          </text>
          <rect
            x={px(xLo).toFixed(2)}
            y={py(yHi).toFixed(2)}
            width={Math.max(0, px(xHi) - px(xLo)).toFixed(2)}
            height={Math.max(0, py(yLo) - py(yHi)).toFixed(2)}
            fill="none"
            stroke="#B4552D"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />

          <line
            x1={PLOT.left}
            x2={PLOT.right}
            y1={py(fa).toFixed(2)}
            y2={py(fa).toFixed(2)}
            stroke="#B4552D"
            strokeWidth="1.2"
            strokeDasharray="2 4"
          />
          <text
            x={PLOT.left - 6}
            y={py(fa + eps).toFixed(2)}
            textAnchor="end"
            fontSize="11"
            className="font-mono"
            fill="#B4552D"
          >
            f(a)+ε
          </text>
          <text
            x={PLOT.left - 6}
            y={py(fa - eps).toFixed(2)}
            textAnchor="end"
            fontSize="11"
            className="font-mono"
            fill="#B4552D"
          >
            f(a)−ε
          </text>

          <line
            x1={px(a).toFixed(2)}
            x2={px(a).toFixed(2)}
            y1={PLOT.top}
            y2={PLOT.bottom}
            stroke="#181515"
            strokeWidth="1.2"
            strokeDasharray="2 4"
          />
          <text
            x={px(a - delta).toFixed(2)}
            y={PLOT.bottom + 15}
            textAnchor="middle"
            fontSize="11"
            className="font-mono"
            fill="#181515"
            style={{ opacity: 0.7 }}
          >
            a−δ
          </text>
          <text
            x={px(a + delta).toFixed(2)}
            y={PLOT.bottom + 15}
            textAnchor="middle"
            fontSize="11"
            className="font-mono"
            fill="#181515"
            style={{ opacity: 0.7 }}
          >
            a+δ
          </text>
          <text
            x={px(a).toFixed(2)}
            y={PLOT.bottom + 15}
            textAnchor="middle"
            fontSize="11"
            className="font-mono"
            fill="#181515"
          >
            a
          </text>

          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#181515"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx={px(a).toFixed(2)}
            cy={py(fa).toFixed(2)}
            r="5"
            fill="#181515"
          />
          <circle
            cx={px(a - delta).toFixed(2)}
            cy={py(leftPoint).toFixed(2)}
            r="5"
            fill={leftInBand ? "#B4552D" : "#181515"}
            stroke={leftInBand ? "#FBF4EC" : "#B4552D"}
            strokeWidth="2"
          />
          <circle
            cx={px(a + delta).toFixed(2)}
            cy={py(rightPoint).toFixed(2)}
            r="5"
            fill={rightInBand ? "#B4552D" : "#181515"}
            stroke={rightInBand ? "#FBF4EC" : "#B4552D"}
            strokeWidth="2"
          />
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
          <span className="rounded-full border border-[#181515]/70 px-3 py-1 text-xs font-semibold text-[#181515]">
            {preset.formula}
          </span>
          <span className="rounded-full border border-[#B4552D]/60 px-3 py-1 text-xs text-[#B4552D]">
            ε = {eps.toFixed(2)}
          </span>
          <span className="rounded-full border border-[#181515]/50 px-3 py-1 text-xs text-[#181515]/75">
            δ = {delta.toFixed(2)}
          </span>
          <span className="text-[#181515]/75">
            largest change shown ={" "}
            <b className="text-[#181515]">{fmt(worst)}</b> vs ε ={" "}
            <b className="text-[#B4552D]">{fmt(eps)}</b>
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              pass
                ? "border-[#B4552D] bg-[#B4552D]/10 text-[#B4552D]"
                : "border-[#181515] bg-[#181515] text-[#F7EBE1]"
            }`}
          >
            {pass ? "δ answers this ε" : "δ fails this ε"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#181515]/65">
          {pass
            ? `Every x inside the δ-window lands inside the ε-band, because ${preset.law}.`
            : "Some x inside the δ-window escapes the ε-band — the window is too wide for this tolerance. Shrink δ."}
        </p>
      </div>

      <div className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[#181515]">
            Try a function
          </span>
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === presetId}
              onClick={() => setPresetId(item.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs transition ${
                item.id === presetId
                  ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                  : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
              }`}
            >
              {item.chip}
            </button>
          ))}
        </div>

        <label
          htmlFor="epsilon-value"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          The challenge: your tolerance ε on the output
        </label>
        <input
          id="epsilon-value"
          type="range"
          min={0.1}
          max={2}
          step={0.05}
          value={eps}
          style={rangeStyle(eps, 0.1, 2)}
          onChange={(event) => setEps(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>0.10 (strict)</span>
          <span>2.00 (loose)</span>
        </div>

        <label
          htmlFor="delta-value"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          Your response: the window radius δ around a
        </label>
        <input
          id="delta-value"
          type="range"
          min={0.01}
          max={preset.deltaMax}
          step={0.01}
          value={delta}
          style={rangeStyle(delta, 0.01, preset.deltaMax)}
          onChange={(event) => setDelta(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>0.01 (tight)</span>
          <span>{preset.deltaMax.toFixed(2)} (wide)</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDelta(suggested)}
            className="rounded-full border border-[#B4552D] bg-[#B4552D]/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#B4552D] transition hover:bg-[#B4552D]/20"
          >
            Use a winning δ = {suggested.toFixed(2)}
          </button>
          <span className="text-xs text-[#181515]/60">
            One δ wins for this ε — continuity demands a winning δ for{" "}
            <b>every</b> ε, no matter how small.
          </span>
        </div>
      </div>
    </div>
  );
}
