"use client";

import { useRef, useState } from "react";

import {
  BLUE,
  HALF,
  PAPER,
  POSITIVE,
  RUST,
  axes,
  arrow3,
  dashed,
  dot3,
  easeInOut,
  fmt,
  label,
  lerp,
  line,
  makeProjector,
  sceneScale,
  solid,
  spaceGrid,
} from "./iso";
import {
  Chip,
  PrimaryButton,
  Readout,
  SceneShell,
  Slider,
  useOrbit,
  useSceneCanvas,
} from "./scene";

type Mode = "both-positive" | "both-negative" | "opposite";

const K = 8.988e9;
const Q = 1e-6; // both charges are 1 µC in magnitude
const F_REF = (K * Q * Q) / 4; // reference force at R = 2 m
const R_MIN = 1.2;
const R_MAX = 8;
const NEAR = 1.4;
const FAR = 7;
const SWEEP_TOTAL = 7200;

function sweepTarget(t: number): number | null {
  if (t < 600) return FAR;
  if (t < 3000) return lerp(FAR, NEAR, easeInOut((t - 600) / 2400));
  if (t < 4000) return NEAR;
  if (t < 6400) return lerp(NEAR, FAR, easeInOut((t - 4000) / 2400));
  if (t < SWEEP_TOTAL) return FAR;
  return null;
}

function signsFor(mode: Mode): [number, number] {
  if (mode === "both-negative") return [-1, -1];
  if (mode === "opposite") return [1, -1];
  return [1, 1];
}

export function CoulombForcePlayground() {
  const [mode, setMode] = useState<Mode>("both-positive");
  const [r, setR] = useState(4);
  const [sweeping, setSweeping] = useState(false);
  const [status, setStatus] = useState(
    "Like charges — press Sweep distance or drag the slider.",
  );

  const rTargetRef = useRef(4);
  const rDisplayRef = useRef(4);
  const rBeforeSweepRef = useRef(4);
  const lastReportedRef = useRef(4);
  const signedFRef = useRef((K * Q * Q) / 16);
  const lastFrameRef = useRef<number | null>(null);
  const sweepStartRef = useRef<number | null>(null);
  const statusRef = useRef(status);

  const { orbit, reset, pointer } = useOrbit({ yaw: -0.62, elev: 0.52 });

  const onSlider = (value: number) => {
    sweepStartRef.current = null;
    setSweeping(false);
    rTargetRef.current = value;
    setR(value);
    setStatus(describe(value, mode));
    statusRef.current = describe(value, mode);
  };

  const pickMode = (next: Mode) => {
    setMode(next);
    setStatus(describe(rTargetRef.current, next));
    statusRef.current = describe(rTargetRef.current, next);
  };

  const startSweep = () => {
    rBeforeSweepRef.current = rTargetRef.current;
    lastReportedRef.current = rTargetRef.current;
    sweepStartRef.current = performance.now();
    setSweeping(true);
  };

  const canvasRef = useSceneCanvas((ctx, w, h) => {
    const now = performance.now();
    const dt = lastFrameRef.current === null ? 1 / 60 : (now - lastFrameRef.current) / 1000;
    lastFrameRef.current = now;

    const sweepStart = sweepStartRef.current;
    if (sweepStart !== null) {
      const target = sweepTarget(now - sweepStart);
      if (target === null) {
        sweepStartRef.current = null;
        rTargetRef.current = rBeforeSweepRef.current;
        if (Math.abs(lastReportedRef.current - rBeforeSweepRef.current) > 1e-6) {
          lastReportedRef.current = rBeforeSweepRef.current;
          setR(rBeforeSweepRef.current);
        }
        setSweeping(false);
        const msg = describe(rBeforeSweepRef.current, mode);
        statusRef.current = msg;
        setStatus(msg);
      } else {
        rTargetRef.current = target;
        if (Math.abs(target - lastReportedRef.current) > 0.02) {
          lastReportedRef.current = target;
          setR(target);
          const msg = describe(target, mode);
          statusRef.current = msg;
          setStatus(msg);
        }
      }
    }

    // Smooth the separation and the signed force toward their targets.
    rDisplayRef.current += (rTargetRef.current - rDisplayRef.current) * Math.min(1, dt * 9);
    const rNow = rDisplayRef.current;

    const [s1, s2] = signsFor(mode);
    const fTarget = (K * (s1 * Q) * (s2 * Q)) / (rNow * rNow);
    signedFRef.current += (fTarget - signedFRef.current) * Math.min(1, dt * 10);
    const fSigned = signedFRef.current;

    const p = makeProjector(
      orbit.current.yaw,
      orbit.current.elev,
      sceneScale(w, h),
      w / 2,
      h / 2 + h * 0.03,
    );

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    spaceGrid(ctx, p, HALF);
    axes(ctx, p, HALF, { alpha: 0.6 });

    const q1x = -rNow / 2;
    const q2x = rNow / 2;

    // Separation line and label.
    ctx.save();
    ctx.strokeStyle = "rgba(44,37,35,0.45)";
    ctx.lineWidth = 1.3;
    dashed(ctx, [5, 6]);
    line(ctx, p, [q1x, 0, 0], [q2x, 0, 0]);
    solid(ctx);
    ctx.restore();
    const [mx, my] = p.to2d(0, 0, 0.85);
    label(ctx, `R = ${fmt(rNow)} m`, mx, my, {
      align: "center",
      font: '600 12px var(--font-mono), monospace',
    });

    // Force arrows: length grows with |F|, direction follows the sign.
    const len = Math.min(6.4, (4.2 * Math.abs(fSigned)) / F_REF);
    const dir = fSigned >= 0 ? 1 : -1;
    // Repel: F12 on Q2 points +x (away from Q1), F21 on Q1 points −x.
    // Attract: both flip.
    const f12Tip: [number, number, number] = [q2x + dir * len, 0, 0];
    const f21Tip: [number, number, number] = [q1x - dir * len, 0, 0];

    if (len > 0.05) {
      ctx.strokeStyle = RUST;
      arrow3(ctx, p, [q2x, 0, 0], f12Tip, 2.6, 11);
      arrow3(ctx, p, [q1x, 0, 0], f21Tip, 2.6, 11);
    }

    // Charges (drawn on top of the arrow tails).
    const c1 = s1 > 0 ? POSITIVE : BLUE;
    const c2 = s2 > 0 ? POSITIVE : BLUE;
    dot3(ctx, p, [q1x, 0, 0], 9, c1, "rgba(24,21,21,0.08)");
    dot3(ctx, p, [q2x, 0, 0], 9, c2, "rgba(24,21,21,0.08)");

    const [l1x, l1y] = p.to2d(q1x, 0, -0.85);
    label(ctx, `Q₁ ${s1 > 0 ? "+1 µC" : "−1 µC"}`, l1x, l1y + 14, {
      color: c1,
      align: "center",
      font: '700 12px var(--font-mono), monospace',
    });
    const [l2x, l2y] = p.to2d(q2x, 0, -0.85);
    label(ctx, `Q₂ ${s2 > 0 ? "+1 µC" : "−1 µC"}`, l2x, l2y + 14, {
      color: c2,
      align: "center",
      font: '700 12px var(--font-mono), monospace',
    });

    // Force labels near the arrow tips.
    if (len > 0.45) {
      const [t2x, t2y] = p.to2d(f12Tip[0], 0, 0.35);
      label(ctx, "F₁₂", t2x + 6, t2y, {
        color: RUST,
        font: '700 13px var(--font-mono), monospace',
      });
      const [t1x, t1y] = p.to2d(f21Tip[0], 0, 0.35);
      label(ctx, "F₂₁", t1x - 6, t1y, {
        color: RUST,
        align: "right",
        font: '700 13px var(--font-mono), monospace',
      });
    }

    label(ctx, "drag to orbit", w - 14, h - 14, {
      color: "rgba(24,21,21,0.4)",
      align: "right",
      font: '500 11px var(--font-mono), monospace',
    });
  });

  const fNow = (K * Q * Q) / (r * r);
  const fMN = fNow * 1000;
  const [s1, s2] = signsFor(mode);

  return (
    <SceneShell
      title="Force between two point charges"
      subtitle="Two 1 µC charges on a line — like charges repel, opposite charges attract."
      badge="F"
      ariaLabel="Two point charges with force arrows that grow as the charges are brought closer"
      canvasRef={canvasRef}
      pointer={pointer}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#BF4326]" /> + charge
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#33506E]" /> − charge
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#B4552D]" /> force
          </span>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <Slider
          id="coulomb-r"
          label="Separation R"
          value={r}
          display={`${fmt(r)} m`}
          min={R_MIN}
          max={R_MAX}
          step={0.1}
          onChange={onSlider}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <PrimaryButton onClick={startSweep}>
            {sweeping ? "Sweeping…" : "Sweep distance"}
          </PrimaryButton>
          <Chip onClick={reset}>Reset view</Chip>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Chip active={mode === "both-positive"} onClick={() => pickMode("both-positive")}>
          + and +
        </Chip>
        <Chip active={mode === "both-negative"} onClick={() => pickMode("both-negative")}>
          − and −
        </Chip>
        <Chip active={mode === "opposite"} onClick={() => pickMode("opposite")}>
          + and −
        </Chip>
        <span className="text-xs text-[#181515]/55">
          Watch the arrows shrink to nothing and flip as the charges cross
          from push to pull.
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="text-sm font-medium text-[#181515]/75">{status}</div>
      </div>

      <div className="mt-5">
        <Readout
          items={[
            { label: "R", value: `${fmt(r)} m` },
            { label: "|F|", value: `${fMN >= 10 ? fMN.toFixed(1) : fMN.toFixed(2)} mN`, color: RUST },
            {
              label: "Q₁ · Q₂",
              value: `${s1 * s2 > 0 ? "positive — repel" : "negative — attract"}`,
              color: s1 * s2 > 0 ? POSITIVE : BLUE,
            },
          ]}
        />
      </div>
    </SceneShell>
  );
}

function describe(r: number, mode: Mode): string {
  const [s1, s2] = signsFor(mode);
  const kind = s1 * s2 > 0 ? "Like charges push apart" : "Opposite charges pull together";
  const fMN = ((K * Q * Q) / (r * r)) * 1000;
  return `${kind} — R = ${fmt(r)} m, F = ${fMN >= 10 ? fMN.toFixed(1) : fMN.toFixed(2)} mN`;
}

export default CoulombForcePlayground;
