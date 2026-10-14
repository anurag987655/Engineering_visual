"use client";

import { useRef, useState } from "react";

import {
  HALF,
  PAPER,
  RUST,
  AXIS_COLOR,
  axes,
  dashed,
  dot3,
  easeInOut,
  fmt,
  label,
  line,
  lerp,
  makeProjector,
  quad,
  sceneScale,
  solid,
  spaceGrid,
  type Projector,
} from "./iso";
import {
  Chip,
  PrimaryButton,
  Readout,
  SceneShell,
  useOrbit,
  useSceneCanvas,
} from "./scene";

type Pt = { x: number; y: number; z: number };
type Axis = "x" | "y" | "z";

type Leg = { from: Pt; to: Pt; start: number; dur: number; axis: Axis };

type Anim = { legs: Leg[]; total: number; target: Pt };

const EMPTY: Pt = { x: 0, y: 0, z: 0 };

function buildAnim(target: Pt): Anim {
  const corners: Pt[] = [
    { x: 0, y: 0, z: 0 },
    { x: target.x, y: 0, z: 0 },
    { x: target.x, y: target.y, z: 0 },
    { x: target.x, y: target.y, z: target.z },
  ];
  const axesOrder: Axis[] = ["x", "y", "z"];
  const legs: Leg[] = [];
  let cursor = 0;
  for (let i = 0; i < 3; i += 1) {
    const from = corners[i];
    const to = corners[i + 1];
    const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    const dur = distance < 1e-6 ? 0 : 480 + 90 * distance;
    legs.push({ from, to, start: cursor, dur, axis: axesOrder[i] });
    cursor += dur + (dur > 0 ? 150 : 0);
  }
  return { legs, total: cursor, target };
}

function positionAt(anim: Anim, ms: number): Pt {
  if (ms <= 0) return EMPTY;
  for (const leg of anim.legs) {
    if (ms < leg.start) return leg.from;
    if (ms <= leg.start + leg.dur) {
      const t = easeInOut((ms - leg.start) / leg.dur);
      return {
        x: lerp(leg.from.x, leg.to.x, t),
        y: lerp(leg.from.y, leg.to.y, t),
        z: lerp(leg.from.z, leg.to.z, t),
      };
    }
  }
  return anim.legs[anim.legs.length - 1].to;
}

function parseCoordinate(raw: string): number | null {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  if (value < -HALF || value > HALF) return null;
  return value;
}

function NumberField({
  id,
  label: labelText,
  value,
  onChange,
  accent,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-sm font-semibold text-[#181515]"
      >
        {labelText}
        <span className="font-mono text-[11px] font-normal text-[#181515]/50">
          −6 … 6
        </span>
      </label>
      <input
        id={id}
        type="number"
        min={-HALF}
        max={HALF}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ borderColor: accent }}
        className="mt-2 w-full rounded-xl border-2 bg-[#F7EBE1] px-3 py-2 font-mono text-lg font-semibold text-[#181515] outline-none focus:bg-white"
      />
    </div>
  );
}

export function CartesianPointPlayground() {
  const [xRaw, setXRaw] = useState("4");
  const [yRaw, setYRaw] = useState("-3");
  const [zRaw, setZRaw] = useState("5");
  const [showGrid, setShowGrid] = useState(true);
  const [showPlanes, setShowPlanes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Enter a point, then press Show.");

  const animRef = useRef<Anim | null>(null);
  const startRef = useRef(0);
  const statusRef = useRef(status);
  const { orbit, reset, pointer } = useOrbit({ yaw: -0.72, elev: 0.58 });

  const run = () => {
    const x = parseCoordinate(xRaw);
    const y = parseCoordinate(yRaw);
    const z = parseCoordinate(zRaw);
    if (x === null || y === null || z === null) {
      setError("Enter three numbers between −6 and 6.");
      return;
    }
    setError(null);
    animRef.current = buildAnim({ x, y, z });
    startRef.current = performance.now();
    statusRef.current = "";
    setStatus("Dot at origin.");
  };

  const canvasRef = useSceneCanvas((ctx, w, h) => {
    const p = makeProjector(
      orbit.current.yaw,
      orbit.current.elev,
      sceneScale(w, h),
      w / 2,
      h / 2 + h * 0.02,
    );

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    const anim = animRef.current;
    const now = performance.now();
    const elapsed = anim ? now - startRef.current : 0;
    const current = anim ? positionAt(anim, elapsed) : EMPTY;
    const running = Boolean(anim && elapsed < anim.total);

    if (showPlanes) {
      planes(ctx, p, current);
    }

    if (showGrid) {
      spaceGrid(ctx, p, HALF);
    }

    axes(ctx, p, HALF);

    if (anim) {
      ctx.strokeStyle = "rgba(44,37,35,0.35)";
      ctx.lineWidth = 1.3;
      for (const leg of anim.legs) {
        dashed(ctx, [5, 6]);
        line(
          ctx,
          p,
          [leg.from.x, leg.from.y, leg.from.z],
          [leg.to.x, leg.to.y, leg.to.z],
        );
      }
      solid(ctx);

      const trail: Pt[] = [EMPTY];
      for (const leg of anim.legs) {
        if (elapsed >= leg.start + leg.dur) trail.push(leg.to);
        else if (elapsed > leg.start) {
          trail.push(current);
          break;
        } else break;
      }
      ctx.strokeStyle = RUST;
      ctx.lineWidth = 2.6;
      for (let i = 0; i < trail.length - 1; i += 1) {
        line(ctx, p, [trail[i].x, trail[i].y, trail[i].z], [
          trail[i + 1].x,
          trail[i + 1].y,
          trail[i + 1].z,
        ]);
      }

      ctx.strokeStyle = "rgba(44,37,35,0.4)";
      ctx.lineWidth = 1.1;
      dashed(ctx, [3, 5]);
      const here: [number, number, number] = [current.x, current.y, current.z];
      if (Math.abs(current.x) > 1e-6) line(ctx, p, [current.x, 0, 0], here);
      if (Math.abs(current.y) > 1e-6) line(ctx, p, [0, current.y, 0], here);
      if (Math.abs(current.z) > 1e-6) line(ctx, p, [0, 0, current.z], here);
      solid(ctx);
    }

    dot3(
      ctx,
      p,
      [current.x, current.y, current.z],
      7,
      anim ? "#BF4326" : "rgba(44,37,35,0.45)",
      anim ? "rgba(191,67,38,0.16)" : undefined,
    );

    if (anim) {
      const [dx, dy] = p.to2d(current.x, current.y, current.z);
      label(
        ctx,
        `(${fmt(current.x)}, ${fmt(current.y)}, ${fmt(current.z)})`,
        dx + 13,
        dy - 10,
        { color: "#181515", font: '600 12px var(--font-mono), monospace' },
      );
    }

    const nextStatus = !anim
      ? "Enter a point, then press Show."
      : running
        ? describePhase(anim, elapsed)
        : `Landed at (${fmt(anim.target.x)}, ${fmt(anim.target.y)}, ${fmt(
            anim.target.z,
          )})`;
    if (nextStatus !== statusRef.current) {
      statusRef.current = nextStatus;
      setStatus(nextStatus);
    }

    label(ctx, "drag to orbit", w - 14, h - 14, {
      color: "rgba(24,21,21,0.4)",
      align: "right",
      font: '500 11px var(--font-mono), monospace',
    });
  });

  const target = {
    x: parseCoordinate(xRaw) ?? 0,
    y: parseCoordinate(yRaw) ?? 0,
    z: parseCoordinate(zRaw) ?? 0,
  };

  return (
    <SceneShell
      title="Interactive Cartesian coordinates"
      subtitle="Enter x, y, z — the dot walks axis by axis."
      badge="x,y,z"
      ariaLabel="Three dimensional Cartesian coordinate system with an animated point walk"
      canvasRef={canvasRef}
      pointer={pointer}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#BF4326]" /> Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#B4552D]" /> Walked path
          </span>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <NumberField
          id="cart-x"
          label="x"
          value={xRaw}
          onChange={setXRaw}
          accent={AXIS_COLOR.x}
        />
        <NumberField
          id="cart-y"
          label="y"
          value={yRaw}
          onChange={setYRaw}
          accent={AXIS_COLOR.y}
        />
        <NumberField
          id="cart-z"
          label="z"
          value={zRaw}
          onChange={setZRaw}
          accent={AXIS_COLOR.z}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <PrimaryButton onClick={run}>Show</PrimaryButton>
          <Chip
            onClick={() => {
              animRef.current = null;
              setStatus("Enter a point, then press Show.");
              statusRef.current = "Enter a point, then press Show.";
            }}
          >
            Clear
          </Chip>
          <Chip onClick={reset}>Reset view</Chip>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <Chip active={showGrid} onClick={() => setShowGrid((v) => !v)}>
            Grid
          </Chip>
          <Chip active={showPlanes} onClick={() => setShowPlanes((v) => !v)}>
            Coordinate planes
          </Chip>
          <span className="text-xs text-[#181515]/55">
            Constant planes through the dot: x, y and z.
          </span>
        </div>
        <div className="text-sm font-medium text-[#181515]/75">{status}</div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-[#B4552D]/40 bg-[#B4552D]/10 px-4 py-2 text-sm text-[#B4552D]">
          {error}
        </p>
      )}

      <div className="mt-5">
        <Readout
          items={[
            { label: "target", value: `(${fmt(target.x)}, ${fmt(target.y)}, ${fmt(target.z)})` },
            { label: "range", value: "−6 … 6 on every axis" },
          ]}
        />
      </div>
    </SceneShell>
  );
}

function describePhase(anim: Anim, elapsed: number): string {
  const leg = anim.legs.find(
    (item) => elapsed < item.start + item.dur || item.dur === 0,
  );
  if (!leg || elapsed > anim.total) return "Walking the path…";
  const t = leg.dur === 0 ? 1 : easeInOut((elapsed - leg.start) / leg.dur);
  const from = leg.from[leg.axis];
  const to = leg.to[leg.axis];
  const value = lerp(from, to, t);
  return `Moving along ${leg.axis}: ${fmt(from)} → ${fmt(to)}  ·  now ${fmt(value)}`;
}

function planes(ctx: CanvasRenderingContext2D, p: Projector, at: Pt) {
  const s = HALF;
  if (Math.abs(at.x) > 1e-6) {
    quad(
      ctx,
      p,
      [at.x, -s, -s],
      [at.x, s, -s],
      [at.x, s, s],
      [at.x, -s, s],
      "rgba(180,85,45,0.10)",
      "rgba(180,85,45,0.45)",
    );
  }
  if (Math.abs(at.y) > 1e-6) {
    quad(
      ctx,
      p,
      [-s, at.y, -s],
      [s, at.y, -s],
      [s, at.y, s],
      [-s, at.y, s],
      "rgba(51,80,110,0.10)",
      "rgba(51,80,110,0.45)",
    );
  }
  if (Math.abs(at.z) > 1e-6) {
    quad(
      ctx,
      p,
      [-s, -s, at.z],
      [s, -s, at.z],
      [s, s, at.z],
      [-s, s, at.z],
      "rgba(24,21,21,0.06)",
      "rgba(24,21,21,0.35)",
    );
  }
}

export default CartesianPointPlayground;
