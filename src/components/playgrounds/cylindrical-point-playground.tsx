"use client";

import { useRef, useState } from "react";

import {
  AXIS_COLOR,
  HALF,
  PAPER,
  RUST,
  BLUE,
  arcXY,
  axes,
  dashed,
  dot3,
  easeInOut,
  fmt,
  label,
  line,
  makeProjector,
  sceneScale,
  solid,
  spaceGrid,
  arrow3,
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

type Timing = { circle: number; sweep: number; lift: number; total: number };

function timings(r: number, theta: number, z: number): Timing {
  const circle = r < 0.05 ? 0 : 700 + r * 60;
  const sweep = r < 0.05 ? 0 : 260 + (theta / (Math.PI * 2)) * 900;
  const lift = 260 + Math.abs(z) * 90;
  const rest = 160;
  const startSweep = circle + (circle > 0 ? rest : 0);
  const startLift = startSweep + sweep + (sweep > 0 ? rest : 0);
  return {
    circle,
    sweep,
    lift,
    total: startLift + lift,
  };
}

function progressAt(elapsed: number, t: Timing) {
  const startSweep = t.circle + (t.circle > 0 ? 160 : 0);
  const startLift = startSweep + t.sweep + (t.sweep > 0 ? 160 : 0);
  return {
    circle: t.circle <= 0 ? 1 : easeInOut(clamp01(elapsed / t.circle)),
    sweep:
      t.sweep <= 0
        ? 1
        : easeInOut(clamp01((elapsed - startSweep) / t.sweep)),
    lift: t.lift <= 0 ? 1 : easeInOut(clamp01((elapsed - startLift) / t.lift)),
    done: elapsed >= t.total,
  };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function CylindricalPointPlayground() {
  const [r, setR] = useState(2.5);
  const [thetaDeg, setThetaDeg] = useState(120);
  const [z, setZ] = useState(3);
  const [showVectors, setShowVectors] = useState(true);
  const [status, setStatus] = useState("Press Show to build the point.");

  const animRef = useRef<{ start: number; timing: Timing } | null>(null);
  const statusRef = useRef(status);
  const { orbit, reset, pointer } = useOrbit({ yaw: -0.72, elev: 0.58 });

  const theta = (thetaDeg * Math.PI) / 180;

  const run = () => {
    animRef.current = { start: performance.now(), timing: timings(r, theta, z) };
    statusRef.current = "";
    setStatus("Drawing the circle…");
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

    spaceGrid(ctx, p, HALF);
    axes(ctx, p, HALF);

    const anim = animRef.current;
    const timing = anim ? anim.timing : timings(r, theta, z);
    const elapsed = anim ? performance.now() - anim.start : timing.total;
    const prog = anim
      ? progressAt(elapsed, timing)
      : { circle: 1, sweep: 1, lift: 1, done: true };

    const sweepAngle = theta * prog.sweep;
    const dotZ = z * prog.lift;

    if (prog.circle > 0) {
      ctx.strokeStyle = "rgba(44,37,35,0.45)";
      ctx.lineWidth = 1.6;
      arcXY(ctx, p, r, 0, Math.PI * 2 * prog.circle, 0);
    }

    if (prog.sweep > 0 && r >= 0.05) {
      ctx.strokeStyle = RUST;
      ctx.lineWidth = 2;
      arcXY(ctx, p, r, 0, sweepAngle, 0);

      ctx.strokeStyle = "rgba(180,85,45,0.9)";
      ctx.lineWidth = 2.4;
      line(ctx, p, [0, 0, 0], [
        r * Math.cos(sweepAngle),
        r * Math.sin(sweepAngle),
        0,
      ]);
    }

    if (prog.lift > 0 && r >= 0.05) {
      const footX = r * Math.cos(theta);
      const footY = r * Math.sin(theta);
      ctx.strokeStyle = "rgba(51,80,110,0.8)";
      ctx.lineWidth = 1.6;
      dashed(ctx, [4, 5]);
      line(ctx, p, [footX, footY, 0], [footX, footY, dotZ]);
      solid(ctx);
    }

    const dot: [number, number, number] =
      prog.done || !anim
        ? [
            r * Math.cos(theta),
            r * Math.sin(theta),
            z,
          ]
        : prog.sweep < 1
          ? [r * Math.cos(sweepAngle), r * Math.sin(sweepAngle), 0]
          : [r * Math.cos(theta), r * Math.sin(theta), dotZ];

    const showDot = prog.circle >= 1;

    if (showDot && r >= 0.05) {
      dot3(ctx, p, dot, 7, "#BF4326", "rgba(191,67,38,0.16)");

      if (showVectors && prog.lift >= 1) {
        drawUnitVectors(ctx, p, dot, theta);
      }

      const [dx, dy] = p.to2d(dot[0], dot[1], dot[2]);
      label(
        ctx,
        `(${fmt(dot[0])}, ${fmt(dot[1])}, ${fmt(dot[2])})`,
        dx + 13,
        dy - 10,
        { font: '600 12px var(--font-mono), monospace' },
      );

      if (prog.sweep > 0 && prog.sweep < 1) {
        const [mx, my] = p.to2d(
          Math.cos(sweepAngle) * r * 0.5,
          Math.sin(sweepAngle) * r * 0.5,
          0,
        );
        label(ctx, "r", mx, my - 8, {
          color: RUST,
          font: '700 13px var(--font-display), serif',
        });
      }
    }

    const nextStatus = !anim
      ? "Press Show to build the point."
      : prog.circle < 1
        ? `Drawing the circle of radius ${fmt(r)}…`
        : prog.sweep < 1
          ? `Spanning θ = ${thetaDeg}°…`
          : prog.lift < 1
            ? `Lifting by z = ${fmt(z)}…`
            : `Landed at (${fmt(dot[0])}, ${fmt(dot[1])}, ${fmt(dot[2])})`;
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

  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  const thetaLabel = `${thetaDeg}° = ${formatRadians(theta)}`;

  return (
    <SceneShell
      title="Interactive cylindrical coordinates"
      subtitle="Circle → angle → height, in that order."
      badge="r,θ,z"
      ariaLabel="Interactive cylindrical coordinate system building a point from radius, angle and height"
      canvasRef={canvasRef}
      pointer={pointer}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#BF4326]" /> Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#B4552D]" /> Radius r
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#33506E]" /> Height z
          </span>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Slider
          id="cyl-r"
          label="Radius r"
          value={r}
          display={fmt(r)}
          min={0}
          max={6}
          step={0.1}
          onChange={setR}
        />
        <Slider
          id="cyl-theta"
          label="Angle θ"
          value={thetaDeg}
          display={thetaLabel}
          min={0}
          max={360}
          step={1}
          onChange={setThetaDeg}
        />
        <Slider
          id="cyl-z"
          label="Height z"
          value={z}
          display={fmt(z)}
          min={-6}
          max={6}
          step={0.1}
          onChange={setZ}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <PrimaryButton onClick={run}>Show</PrimaryButton>
          <Chip
            active={showVectors}
            onClick={() => setShowVectors((v) => !v)}
          >
            Unit vectors âr, âθ, âz
          </Chip>
          <Chip onClick={reset}>Reset view</Chip>
        </div>
        <div className="text-sm font-medium text-[#181515]/75">{status}</div>
      </div>

      <div className="mt-5">
        <Readout
          items={[
            { label: "cylindrical", value: `(r, θ, z) = (${fmt(r)}, ${thetaLabel}, ${fmt(z)})` },
            { label: "rectangular", value: `(x, y, z) = (${fmt(x)}, ${fmt(y)}, ${fmt(z)})`, color: AXIS_COLOR.x },
          ]}
        />
      </div>
    </SceneShell>
  );
}

function drawUnitVectors(
  ctx: CanvasRenderingContext2D,
  p: ReturnType<typeof makeProjector>,
  at: [number, number, number],
  theta: number,
) {
  const length = 1.7;
  const er: [number, number, number] = [Math.cos(theta), Math.sin(theta), 0];
  const eth: [number, number, number] = [-Math.sin(theta), Math.cos(theta), 0];
  const ez: [number, number, number] = [0, 0, 1];

  const specs: { dir: [number, number, number]; color: string; name: string }[] = [
    { dir: er, color: RUST, name: "a_r" },
    { dir: eth, color: BLUE, name: "a_θ" },
    { dir: ez, color: "#181515", name: "a_z" },
  ];

  ctx.save();
  ctx.lineCap = "round";
  for (const spec of specs) {
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 2.2;
    arrow3(
      ctx,
      p,
      at,
      [
        at[0] + spec.dir[0] * length,
        at[1] + spec.dir[1] * length,
        at[2] + spec.dir[2] * length,
      ],
      2.2,
      10,
    );
    const [lx, ly] = p.to2d(
      at[0] + spec.dir[0] * (length + 0.35),
      at[1] + spec.dir[1] * (length + 0.35),
      at[2] + spec.dir[2] * (length + 0.35),
    );
    label(ctx, spec.name, lx + 3, ly, {
      color: spec.color,
      font: '700 12px var(--font-display), serif',
    });
  }
  ctx.restore();
}

function formatRadians(value: number): string {
  const pi = value / Math.PI;
  const nice = Math.round(pi * 24) / 24;
  if (Math.abs(nice) < 1e-9) return "0";
  const numerator = Math.round(nice * 12);
  const denominator = 12;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const d = gcd(Math.abs(numerator), denominator) || 1;
  const n = numerator / d;
  const den = denominator / d;
  if (den === 1) return `${n}π`;
  return `${n === 1 ? "" : n}π/${den}`;
}

export default CylindricalPointPlayground;
