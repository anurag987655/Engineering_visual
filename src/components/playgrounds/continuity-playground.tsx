"use client";

import { useState, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Continuity explorer: pick a shape, drag the point a, read the test   */
/* ------------------------------------------------------------------ */

type PresetId = "continuous" | "removable" | "jump" | "infinite";

type Preset = {
  id: PresetId;
  chip: string;
  formula: string;
  hotX: number | null;
  xDomain: [number, number];
  yDomain: [number, number];
  aMin: number;
  aMax: number;
  sample: (x: number) => number | null;
  leftLimit: (a: number) => number;
  rightLimit: (a: number) => number;
  valueAt: (a: number) => number | null;
  story: string;
  hotStory: string;
  markers: "removable" | "jump" | "asymptote" | "none";
  special?: { c: number };
};

const PRESETS: Preset[] = [
  {
    id: "continuous",
    chip: "Continuous",
    formula: "f(x) = −(x−2)²∕2 + 3",
    hotX: null,
    xDomain: [-1.5, 5.5],
    yDomain: [-4, 4],
    aMin: -1,
    aMax: 5,
    sample: (x) => -((x - 2) ** 2) / 2 + 3,
    leftLimit: (a) => -((a - 2) ** 2) / 2 + 3,
    rightLimit: (a) => -((a - 2) ** 2) / 2 + 3,
    valueAt: (a) => -((a - 2) ** 2) / 2 + 3,
    story: "Every test passes at every point: the curve never breaks.",
    hotStory: "",
    markers: "none",
  },
  {
    id: "removable",
    chip: "Removable hole",
    formula: "f(x) = (x²−4)∕(x−2), f(2) = 5",
    hotX: 2,
    xDomain: [-1, 5],
    yDomain: [0, 8],
    aMin: -0.5,
    aMax: 4.5,
    sample: (x) => (Math.abs(x - 2) < 0.04 ? null : x + 2),
    leftLimit: (a) => a + 2,
    rightLimit: (a) => a + 2,
    valueAt: (a) => (Math.abs(a - 2) < 1e-9 ? 5 : a + 2),
    story: "Away from x = 2 the line behaves perfectly — drag a to 2.",
    hotStory:
      "At a = 2 the two sides agree on height 4, but f(2) was set to 5 — the dot sits above the hole.",
    markers: "removable",
    special: { c: 2 },
  },
  {
    id: "jump",
    chip: "Jump",
    formula: "f(x) = 0.5x+1 (x<2), 0.5x+3.5 (x≥2)",
    hotX: 2,
    xDomain: [-1.5, 5.5],
    yDomain: [0, 7],
    aMin: -1,
    aMax: 5,
    sample: (x) =>
      Math.abs(x - 2) < 0.02 ? null : x < 2 ? 0.5 * x + 1 : 0.5 * x + 3.5,
    leftLimit: (a) => (a <= 2 ? 0.5 * a + 1 : 0.5 * a + 3.5),
    rightLimit: (a) => (a < 2 ? 0.5 * a + 1 : 0.5 * a + 3.5),
    valueAt: (a) => (a < 2 ? 0.5 * a + 1 : 0.5 * a + 3.5),
    story: "Each branch is smooth on its own — drag a onto the step at 2.",
    hotStory:
      "At a = 2 the left side aims at 2 while the right side aims at 4.5 — one point cannot hold both heights.",
    markers: "jump",
    special: { c: 2 },
  },
  {
    id: "infinite",
    chip: "Vertical asymptote",
    formula: "f(x) = 1∕(x−3) + 1.5",
    hotX: 3,
    xDomain: [-1.5, 5.5],
    yDomain: [-4, 6],
    aMin: -1,
    aMax: 5,
    sample: (x) => (Math.abs(x - 3) < 0.05 ? null : 1 / (x - 3) + 1.5),
    leftLimit: (a) => (Math.abs(a - 3) < 1e-9 ? -Infinity : 1 / (a - 3) + 1.5),
    rightLimit: (a) => (Math.abs(a - 3) < 1e-9 ? Infinity : 1 / (a - 3) + 1.5),
    valueAt: (a) => (Math.abs(a - 3) < 1e-9 ? null : 1 / (a - 3) + 1.5),
    story: "Away from x = 3 the curve is perfectly smooth — drag a to 3.",
    hotStory:
      "At a = 3 the function is undefined and the sides race off to −∞ and +∞ — no finite limit exists.",
    markers: "asymptote",
    special: { c: 3 },
  },
];

type TestState = {
  left: number | null;
  right: number | null;
  value: number | null;
  limitExists: boolean;
  continuous: boolean;
  reason: string;
};

function runTest(preset: Preset, a: number): TestState {
  const left = preset.leftLimit(a);
  const right = preset.rightLimit(a);
  const value = preset.valueAt(a);
  const limitExists =
    Number.isFinite(left) &&
    Number.isFinite(right) &&
    Math.abs(left - right) < 1e-9;
  const finiteValue = value !== null && Number.isFinite(value);
  const continuous =
    limitExists && finiteValue && Math.abs((left as number) - (value as number)) < 1e-9;

  let reason: string;
  if (continuous) {
    reason = "left limit = right limit = f(a)";
  } else if (!Number.isFinite(left) || !Number.isFinite(right)) {
    reason = "the limit is infinite — it does not exist";
  } else if (!limitExists) {
    reason = "left and right limits disagree";
  } else if (value === null) {
    reason = "f(a) is undefined";
  } else {
    reason = "limit exists, but it misses f(a)";
  }

  return { left, right, value, limitExists, continuous, reason };
}

function fmt(v: number | null): string {
  if (v === null) return "undefined";
  if (v === Number.POSITIVE_INFINITY) return "+∞";
  if (v === Number.NEGATIVE_INFINITY) return "−∞";
  if (!Number.isFinite(v)) return "∞";
  return v.toFixed(2);
}

function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return {
    "--pulse": `${Math.max(0, Math.min(100, pct))}%`,
  } as CSSProperties;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

const PLOT = { left: 46, right: 588, top: 16, bottom: 224 };
const VIEW = { w: 600, h: 252 };

export function ContinuityPlayground() {
  const [presetId, setPresetId] = useState<PresetId>("continuous");
  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
  const [a, setA] = useState(1);

  const activeA = Math.min(preset.aMax, Math.max(preset.aMin, a));
  const state = runTest(preset, activeA);
  const atHot =
    preset.hotX !== null && Math.abs(activeA - preset.hotX) < 1e-9;

  const [x0, x1] = preset.xDomain;
  const [y0, y1] = preset.yDomain;
  const px = (x: number) =>
    PLOT.left + ((x - x0) / (x1 - x0)) * (PLOT.right - PLOT.left);
  const py = (y: number) =>
    PLOT.top + ((y1 - y) / (y1 - y0)) * (PLOT.bottom - PLOT.top);

  const segments: string[][] = [];
  let current: string[] = [];
  const STEPS = 700;
  for (let i = 0; i <= STEPS; i += 1) {
    const x = x0 + ((x1 - x0) * i) / STEPS;
    const y = preset.sample(x);
    if (y === null || y < y0 - 0.001 || y > y1 + 0.001) {
      if (current.length > 1) segments.push(current);
      current = [];
      continue;
    }
    current.push(`${px(x).toFixed(2)},${py(y).toFixed(2)}`);
  }
  if (current.length > 1) segments.push(current);

  const zeroInY = y0 < 0 && y1 > 0;
  const zeroInX = x0 < 0 && x1 > 0;

  const markerY = state.value;
  const story = atHot ? preset.hotStory : preset.story;

  return (
    <div className="my-10 overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_24px_60px_-30px_rgba(24,21,21,0.5)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2523]/20 bg-[#F0E0D1] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515] font-mono text-xs text-[#F7EBE1]">
            ∿
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">
              Interactive visual
            </p>
            <p className="mt-1 text-xs text-[#181515]/60">
              The three-condition test at a point — drag a across each shape.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[#B4552D]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#B4552D]">
          Pick a case · drag a
        </span>
      </div>

      <div className="px-5 pb-5 pt-6 sm:px-6">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          role="img"
          aria-label={`Graph of ${preset.formula} with the test point a equals ${activeA.toFixed(2)}`}
          className="block w-full"
        >
          {zeroInY && (
            <line
              x1={PLOT.left}
              x2={PLOT.right}
              y1={py(0).toFixed(2)}
              y2={py(0).toFixed(2)}
              stroke="#181515"
              strokeWidth="1"
              style={{ opacity: 0.35 }}
            />
          )}
          {zeroInX && (
            <line
              x1={px(0).toFixed(2)}
              x2={px(0).toFixed(2)}
              y1={PLOT.top}
              y2={PLOT.bottom}
              stroke="#181515"
              strokeWidth="1"
              style={{ opacity: 0.35 }}
            />
          )}

          {preset.markers === "asymptote" && (
            <line
              x1={px(3).toFixed(2)}
              x2={px(3).toFixed(2)}
              y1={PLOT.top}
              y2={PLOT.bottom}
              stroke="#B4552D"
              strokeWidth="1.4"
              strokeDasharray="5 5"
              style={{ opacity: 0.8 }}
            />
          )}

          {segments.map((points, index) => (
            <polyline
              key={index}
              points={points.join(" ")}
              fill="none"
              stroke="#181515"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {preset.markers === "removable" && (
            <>
              <circle
                cx={px(2).toFixed(2)}
                cy={py(4).toFixed(2)}
                r="6"
                fill="#FBF4EC"
                stroke="#181515"
                strokeWidth="2.2"
              />
              <circle
                cx={px(2).toFixed(2)}
                cy={py(5).toFixed(2)}
                r="4.5"
                fill="#B4552D"
              />
            </>
          )}
          {preset.markers === "jump" && (
            <>
              <circle
                cx={px(2).toFixed(2)}
                cy={py(2).toFixed(2)}
                r="5.5"
                fill="#FBF4EC"
                stroke="#181515"
                strokeWidth="2.2"
              />
              <circle
                cx={px(2).toFixed(2)}
                cy={py(4.5).toFixed(2)}
                r="5.5"
                fill="#181515"
              />
            </>
          )}

          <line
            x1={px(activeA).toFixed(2)}
            x2={px(activeA).toFixed(2)}
            y1={PLOT.top}
            y2={PLOT.bottom}
            stroke="#B4552D"
            strokeWidth="1.4"
            strokeDasharray="4 4"
          />
          {markerY !== null &&
            Number.isFinite(markerY) &&
            markerY >= y0 &&
            markerY <= y1 && (
              <circle
                cx={px(activeA).toFixed(2)}
                cy={py(markerY).toFixed(2)}
                r="5.5"
                fill="#B4552D"
                stroke="#FBF4EC"
                strokeWidth="1.6"
              />
            )}
          {state.value === null && (
            <text
              x={px(activeA).toFixed(2)}
              y={PLOT.top + 14}
              textAnchor="middle"
              fontSize="12"
              className="font-mono"
              fill="#B4552D"
            >
              f(a) undefined
            </text>
          )}

          <text
            x={PLOT.right}
            y={PLOT.bottom + 16}
            textAnchor="end"
            fontSize="11"
            className="font-mono"
            fill="#181515"
            style={{ opacity: 0.5 }}
          >
            x → {x1}
          </text>
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm">
          <span className="rounded-full border border-[#181515]/70 px-3 py-1 text-xs font-semibold text-[#181515]">
            a = {activeA.toFixed(2)}
          </span>
          <span className="rounded-full border border-[#2C2523]/35 px-3 py-1 text-xs text-[#181515]/75">
            lim<sub>x→a⁻</sub> = <b className="text-[#181515]">{fmt(state.left)}</b>
          </span>
          <span className="rounded-full border border-[#2C2523]/35 px-3 py-1 text-xs text-[#181515]/75">
            lim<sub>x→a⁺</sub> = <b className="text-[#181515]">{fmt(state.right)}</b>
          </span>
          <span className="rounded-full border border-[#2C2523]/35 px-3 py-1 text-xs text-[#181515]/75">
            f(a) = <b className="text-[#181515]">{fmt(state.value)}</b>
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              state.continuous
                ? "border-[#B4552D] bg-[#B4552D]/10 text-[#B4552D]"
                : "border-[#181515] bg-[#181515] text-[#F7EBE1]"
            }`}
          >
            {state.continuous ? "Continuous at a" : "Discontinuous at a"}
          </span>
          {!state.continuous && (
            <span className="text-[#181515]/65">{state.reason}</span>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-[#181515]/65">
          {story}{" "}
          {atHot && preset.hotX !== null && (
            <span className="font-semibold text-[#B4552D]">
              Watch the three chips disagree.
            </span>
          )}
        </p>
      </div>

      <div className="border-t border-[#2C2523]/15 bg-[#F0E0D1]/50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[#181515]">
            Try a case
          </span>
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === presetId}
              onClick={() => {
                setPresetId(item.id);
                setA(item.hotX !== null ? item.hotX : 1);
              }}
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
          htmlFor="continuity-point-a"
          className="mt-4 block text-sm font-semibold text-[#181515]"
        >
          Drag the point a — can you break the test?
        </label>
        <input
          id="continuity-point-a"
          type="range"
          min={preset.aMin}
          max={preset.aMax}
          step={0.05}
          value={activeA}
          style={rangeStyle(activeA, preset.aMin, preset.aMax)}
          onChange={(event) => setA(Number(event.target.value))}
          className="mt-3 w-full pulse-range"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#181515]/40">
          <span>{preset.aMin}</span>
          <span>{preset.formula}</span>
          <span>{preset.aMax}</span>
        </div>
      </div>
    </div>
  );
}
