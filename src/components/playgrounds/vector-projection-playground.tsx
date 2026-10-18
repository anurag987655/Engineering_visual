"use client";

import { useRef, useState } from "react";

import {
  AXIS_COLOR,
  AZ,
  BLUE,
  HALF,
  INK,
  PAPER,
  RUST,
  arrow3,
  axes,
  dashed,
  dot3,
  easeOut,
  fmt,
  label,
  line,
  makeProjector,
  quad,
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

type Pt3 = [number, number, number];

function footOnRadial(angle: number, length: number): Pt3 {
  return [Math.cos(angle) * length, Math.sin(angle) * length, 0];
}

function MatrixPanel({
  thetaDeg,
  ax,
  ay,
  az,
  inverse,
}: {
  thetaDeg: number;
  ax: number;
  ay: number;
  az: number;
  inverse: boolean;
}) {
  const theta = (thetaDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const ar = ax * cos + ay * sin;
  const at = -ax * sin + ay * cos;

  const rows = inverse
    ? [
        [fmt(cos), fmt(-sin), "0"],
        [fmt(sin), fmt(cos), "0"],
        ["0", "0", "1"],
      ]
    : [
        [fmt(cos), fmt(sin), "0"],
        [fmt(-sin), fmt(cos), "0"],
        ["0", "0", "1"],
      ];

  const output = inverse ? [fmt(ax), fmt(ay), fmt(az)] : [fmt(ar), fmt(at), fmt(az)];
  const input = inverse ? [fmt(ar), fmt(at), fmt(az)] : [fmt(ax), fmt(ay), fmt(az)];

  return (
    <div className="rounded-2xl border border-[#2C2523]/25 bg-[#F0E0D1]/60 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/55">
          {inverse ? "inverse · M⁻¹ = Mᵀ" : "forward · M"}
        </p>
        <span className="rounded-full border border-[#181515] px-3 py-1 font-mono text-xs font-semibold text-[#181515]">
          {inverse ? "Mᵀ" : "M"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 font-mono text-[13px] text-[#181515]">
        <div className="flex flex-col gap-1 text-right">
          <span>{output[0]}</span>
          <span>{output[1]}</span>
          <span style={{ color: AZ }}>{output[2]}</span>
        </div>
        <span className="text-[#181515]/45">=</span>
        <div className="grid grid-cols-3 gap-x-3 gap-y-1 rounded-lg border border-[#2C2523]/25 px-3 py-2">
          {rows.flat().map((cell, index) => (
            <span key={index} className="text-center">
              {cell}
            </span>
          ))}
        </div>
        <span className="text-[#181515]/45">×</span>
        <div className="flex flex-col gap-1">
          <span>{input[0]}</span>
          <span>{input[1]}</span>
          <span style={{ color: AZ }}>{input[2]}</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#181515]/60">
        {inverse
          ? "Multiplying by the transpose undoes the rotation — the last row just copies A_z back."
          : "Rows 1 and 2 are the directions we project onto; row 3 is the identity, so A_z passes through untouched."}
      </p>
    </div>
  );
}

export function VectorProjectionPlayground() {
  const [ax, setAx] = useState(5);
  const [ay, setAy] = useState(3);
  const [az, setAz] = useState(3);
  const [thetaDeg, setThetaDeg] = useState(45);
  const [inverse, setInverse] = useState(false);
  const [showContributions, setShowContributions] = useState(true);
  const [showRadialPlane, setShowRadialPlane] = useState(false);

  const progressRef = useRef<{ start: number } | null>(null);
  const { orbit, reset, pointer } = useOrbit({ yaw: -0.72, elev: 0.58 });

  const theta = (thetaDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const ar = ax * cos + ay * sin;
  const at = -ax * sin + ay * cos;

  const replay = () => {
    progressRef.current = { start: performance.now() };
  };

  const canvasRef = useSceneCanvas((ctx, w, h) => {
    const p = makeProjector(
      orbit.current.yaw,
      orbit.current.elev,
      sceneScale(w, h),
      w / 2,
      h / 2 + h * 0.04,
    );

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);

    spaceGrid(ctx, p, HALF);

    const radial: Pt3 = [cos, sin, 0];
    const tangential: Pt3 = [-sin, cos, 0];

    if (showRadialPlane) {
      quad(
        ctx,
        p,
        [-radial[0] * HALF, -radial[1] * HALF, -HALF],
        [radial[0] * HALF, radial[1] * HALF, -HALF],
        [radial[0] * HALF, radial[1] * HALF, HALF],
        [-radial[0] * HALF, -radial[1] * HALF, HALF],
        "rgba(180,85,45,0.07)",
        "rgba(180,85,45,0.30)",
      );
    }

    axes(ctx, p, HALF);

    if (!progressRef.current) progressRef.current = { start: performance.now() };
    const prog = easeOut(
      Math.min(1, (performance.now() - progressRef.current.start) / 900),
    );

    // Direction lines we project onto, both lying in the xy plane.
    ctx.strokeStyle = "rgba(180,85,45,0.55)";
    ctx.lineWidth = 1.6;
    line(ctx, p, [-radial[0] * HALF, -radial[1] * HALF, 0], [
      radial[0] * HALF,
      radial[1] * HALF,
      0,
    ]);

    ctx.strokeStyle = "rgba(51,80,110,0.5)";
    ctx.lineWidth = 1.4;
    dashed(ctx, [6, 6]);
    line(
      ctx,
      p,
      [-tangential[0] * HALF, -tangential[1] * HALF, 0],
      [tangential[0] * HALF, tangential[1] * HALF, 0],
    );
    solid(ctx);

    const tip: Pt3 = [ax, ay, az];
    const footXy: Pt3 = [ax, ay, 0];

    // Box edges: along x, then y, then straight up along z.
    ctx.strokeStyle = "rgba(44,37,35,0.4)";
    ctx.lineWidth = 1.3;
    dashed(ctx, [4, 5]);
    line(ctx, p, [0, 0, 0], [ax, 0, 0]);
    line(ctx, p, [ax, 0, 0], footXy);
    solid(ctx);
    ctx.strokeStyle = AZ;
    ctx.lineWidth = 1.6;
    dashed(ctx, [5, 4]);
    line(ctx, p, footXy, tip);
    solid(ctx);

    // The vector itself.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    arrow3(ctx, p, [0, 0, 0], tip, 3, 12);

    const footR = footOnRadial(theta, ar);
    const footT = footOnRadial(theta + Math.PI / 2, at);

    // Drop lines from the tip onto both directions — both are perpendicular
    // to the direction they land on, even though the tip sits off the plane.
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = RUST;
    dashed(ctx, [5, 5], -performance.now() / 60);
    line(ctx, p, footR, tip);
    ctx.strokeStyle = BLUE;
    line(ctx, p, footT, tip);
    solid(ctx);

    // Projections as vectors from the origin, plus the untouched A_z.
    ctx.strokeStyle = RUST;
    ctx.lineWidth = 4;
    line(ctx, p, [0, 0, 0], lerp3([0, 0, 0], footR, prog));
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 3;
    line(ctx, p, [0, 0, 0], lerp3([0, 0, 0], footT, prog));
    if (Math.abs(az) > 1e-6) {
      ctx.strokeStyle = AZ;
      ctx.lineWidth = 3.5;
      line(ctx, p, [0, 0, 0], lerp3([0, 0, 0], [0, 0, az], prog));
    }

    dot3(ctx, p, footR, 4.5, RUST);
    dot3(ctx, p, footT, 4.5, BLUE);
    if (Math.abs(az) > 1e-6) dot3(ctx, p, [0, 0, az], 4.5, AZ);
    dot3(ctx, p, tip, 6, INK);

    if (showContributions && prog > 0.98) {
      const footA = footOnRadial(theta, ax * Math.cos(theta));
      ctx.strokeStyle = "rgba(180,85,45,0.95)";
      ctx.lineWidth = 7;
      line(ctx, p, [0, 0, 0], footA);
      ctx.strokeStyle = "rgba(217,139,99,0.95)";
      ctx.lineWidth = 7;
      dashed(ctx, [9, 6]);
      line(ctx, p, footA, footR);
      solid(ctx);

      const [lx, ly] = p.to2d(footR[0] / 2, footR[1] / 2, 0);
      label(ctx, "Ax·cosφ + Ay·sinφ", lx + 4, ly - 10, {
        color: RUST,
        font: '600 11px var(--font-mono), monospace',
      });
    }

    const [tx, ty] = p.to2d(ax, ay, az);
    label(ctx, `A (${fmt(ax)}, ${fmt(ay)}, ${fmt(az)})`, tx + 12, ty - 10, {
      color: INK,
      font: '700 12px var(--font-display), serif',
    });

    const [rx, ry] = p.to2d(footR[0], footR[1], footR[2]);
    label(ctx, `Aρ = ${fmt(ar)}`, rx + 8, ry + 14, {
      color: RUST,
      font: '700 12px var(--font-display), serif',
    });

    const [ux, uy] = p.to2d(footT[0], footT[1], footT[2]);
    label(ctx, `Aφ = ${fmt(at)}`, ux + 8, uy + 14, {
      color: BLUE,
      font: '700 12px var(--font-display), serif',
    });

    if (Math.abs(az) > 1e-6) {
      const [zx, zy] = p.to2d(0, 0, az / 2);
      label(ctx, `Az = ${fmt(az)}`, zx + 8, zy - 6, {
        color: AZ,
        font: '700 12px var(--font-display), serif',
      });
    }

    const [axx, axy] = p.to2d(ax, 0, 0);
    label(ctx, `Ax = ${fmt(ax)}`, axx, axy + 16, {
      color: "rgba(44,37,35,0.65)",
      align: "center",
      font: '600 11px var(--font-mono), monospace',
    });

    const [ayx, ayy] = p.to2d(ax, ay / 2, 0);
    label(ctx, `Ay = ${fmt(ay)}`, ayx, ayy + 16, {
      color: "rgba(44,37,35,0.65)",
      align: "left",
      font: '600 11px var(--font-mono), monospace',
    });

    label(ctx, "drag to orbit", w - 14, h - 14, {
      color: "rgba(24,21,21,0.4)",
      align: "right",
      font: '500 11px var(--font-mono), monospace',
    });
  });

  return (
    <SceneShell
      title="Projection & transformation matrix"
      subtitle="Slide φ and A_z and watch A fall onto the new axes."
      badge="M"
      ariaLabel="Three dimensional vector projection showing how Cartesian components transform into cylindrical components"
      canvasRef={canvasRef}
      pointer={pointer}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#181515]" /> A
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#B4552D]" /> Aρ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#33506E]" /> Aφ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#2F6F6A]" /> Az
          </span>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Slider
          id="proj-ax"
          label="Component A_x"
          value={ax}
          display={fmt(ax)}
          min={-6}
          max={6}
          step={0.5}
          onChange={setAx}
        />
        <Slider
          id="proj-ay"
          label="Component A_y"
          value={ay}
          display={fmt(ay)}
          min={-6}
          max={6}
          step={0.5}
          onChange={setAy}
        />
        <Slider
          id="proj-az"
          label="Component A_z"
          value={az}
          display={fmt(az)}
          min={-6}
          max={6}
          step={0.5}
          onChange={setAz}
        />
        <Slider
          id="proj-theta"
          label="Angle φ"
          value={thetaDeg}
          display={`${thetaDeg}°`}
          min={0}
          max={360}
          step={1}
          onChange={setThetaDeg}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <PrimaryButton onClick={replay}>Replay projection</PrimaryButton>
          <Chip active={showContributions} onClick={() => setShowContributions((v) => !v)}>
            Show Ax cosφ and Ay sinφ
          </Chip>
          <Chip active={inverse} onClick={() => setInverse((v) => !v)}>
            Invert (Mᵀ)
          </Chip>
          <Chip active={showRadialPlane} onClick={() => setShowRadialPlane((v) => !v)}>
            Radial plane (âρ, ẑ)
          </Chip>
          <Chip onClick={reset}>Reset view</Chip>
        </div>
        <div className="text-sm font-medium text-[#181515]/75">
          Project A onto the radial, tangential and z directions.
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Readout
          items={[
            {
              label: "Aρ",
              value: `${fmt(ax)}·${fmt(Math.cos(theta))} + ${fmt(ay)}·${fmt(
                Math.sin(theta),
              )} = ${fmt(ar)}`,
              color: AXIS_COLOR.x,
            },
            {
              label: "Aφ",
              value: `−${fmt(ax)}·${fmt(Math.sin(theta))} + ${fmt(ay)}·${fmt(
                Math.cos(theta),
              )} = ${fmt(at)}`,
              color: AXIS_COLOR.y,
            },
            {
              label: "Az",
              value: `unchanged = ${fmt(az)}`,
              color: AZ,
            },
          ]}
        />
        <MatrixPanel
          thetaDeg={thetaDeg}
          ax={ax}
          ay={ay}
          az={az}
          inverse={inverse}
        />
      </div>
    </SceneShell>
  );
}

function lerp3(a: Pt3, b: Pt3, t: number): Pt3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export default VectorProjectionPlayground;
