"use client";

import { useRef, useState } from "react";

import {
  AXIS_COLOR,
  BLUE,
  HALF,
  INK,
  PAPER,
  RUST,
  arcAzimuth,
  arcMeridian,
  arcXY,
  arrow3,
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

type Spherical = { r: number; theta: number; phi: number };

type Timing = { polar: number; azimuth: number; radial: number; total: number };

const REST = 170;

function timings(r: number, theta: number, phi: number): Timing {
  const polar = 320 + (theta / Math.PI) * 700;
  const azimuth = 320 + (phi / (Math.PI * 2)) * 900;
  const radial = 280 + r * 70;
  const startAzimuth = polar + REST;
  const startRadial = startAzimuth + azimuth + REST;
  return { polar, azimuth, radial, total: startRadial + radial };
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function progressAt(elapsed: number, t: Timing) {
  const startAzimuth = t.polar + REST;
  const startRadial = startAzimuth + t.azimuth + REST;
  return {
    polar: easeInOut(clamp01(elapsed / t.polar)),
    azimuth: easeInOut(clamp01((elapsed - startAzimuth) / t.azimuth)),
    radial: easeInOut(clamp01((elapsed - startRadial) / t.radial)),
    done: elapsed >= t.total,
  };
}

function toCartesian(s: Spherical): [number, number, number] {
  const sinTheta = Math.sin(s.theta);
  return [
    s.r * sinTheta * Math.cos(s.phi),
    s.r * sinTheta * Math.sin(s.phi),
    s.r * Math.cos(s.theta),
  ];
}

export function SphericalPointPlayground() {
  const [r, setR] = useState(4);
  const [thetaDeg, setThetaDeg] = useState(55);
  const [phiDeg, setPhiDeg] = useState(40);
  const [showVectors, setShowVectors] = useState(true);
  const [status, setStatus] = useState("Press Show to build the point.");

  const animRef = useRef<{ start: number; timing: Timing } | null>(null);
  const statusRef = useRef(status);
  const { orbit, reset, pointer } = useOrbit({ yaw: -0.72, elev: 0.58 });

  const theta = (thetaDeg * Math.PI) / 180;
  const phi = (phiDeg * Math.PI) / 180;

  const run = () => {
    animRef.current = { start: performance.now(), timing: timings(r, theta, phi) };
    statusRef.current = "";
    setStatus("Sweeping the polar angle θ…");
  };

  const canvasRef = useSceneCanvas((ctx, w, h) => {
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
    axes(ctx, p, HALF);

    // Faint guide circles: the latitude ring φ travels on, and the meridian
    // circle θ travels through, so both sweeps sit on a visible sphere.
    if (r > 0.05) {
      ctx.strokeStyle = "rgba(44,37,35,0.2)";
      ctx.lineWidth = 1;
      arcXY(ctx, p, r * Math.sin(theta), 0, Math.PI * 2, r * Math.cos(theta));
      arcMeridian(ctx, p, r, 0, Math.PI, phi);
      arcMeridian(ctx, p, r, 0, Math.PI, phi + Math.PI);
    }

    const anim = animRef.current;
    const timing = anim ? anim.timing : timings(r, theta, phi);
    const elapsed = anim ? performance.now() - anim.start : timing.total;
    const prog = anim
      ? progressAt(elapsed, timing)
      : { polar: 1, azimuth: 1, radial: 1, done: true };

    const currentTheta = theta * prog.polar;
    const currentPhi = phi * prog.azimuth;
    const arm = r * prog.radial;
    const radius = Math.max(r, 0.001);

    if (prog.polar < 1 || prog.azimuth < 1) {
      const meridianPhi = prog.polar < 1 ? 0 : currentPhi;
      ctx.strokeStyle = "rgba(44,37,35,0.5)";
      ctx.lineWidth = 1.6;
      arcMeridian(ctx, p, radius, 0, currentTheta, meridianPhi);

      if (prog.azimuth > 0 && prog.polar >= 1) {
        ctx.strokeStyle = RUST;
        ctx.lineWidth = 2;
        arcAzimuth(ctx, p, radius, theta, 0, currentPhi);
        ctx.strokeStyle = "rgba(44,37,35,0.55)";
        ctx.lineWidth = 1.7;
        arcMeridian(ctx, p, radius, 0, theta, currentPhi);
      }
    } else {
      ctx.strokeStyle = "rgba(44,37,35,0.4)";
      ctx.lineWidth = 1.4;
      dashed(ctx, [4, 6]);
      arcMeridian(ctx, p, radius, 0, theta, phi);
      arcAzimuth(ctx, p, radius, theta, 0, phi);
      solid(ctx);
    }

    const point = toCartesian({ r, theta, phi });
    const onArm: [number, number, number] = [
      point[0] * prog.radial,
      point[1] * prog.radial,
      point[2] * prog.radial,
    ];

    if (arm > 0.05) {
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 2.4;
      line(ctx, p, [0, 0, 0], onArm);
    }

    if (prog.radial >= 1) {
      ctx.strokeStyle = "rgba(44,37,35,0.35)";
      ctx.lineWidth = 1.1;
      dashed(ctx, [3, 5]);
      line(ctx, p, [point[0], point[1], 0], point);
      line(ctx, p, [0, 0, point[2]], point);
      solid(ctx);
    }

    const showDot = prog.polar >= 1;
    if (showDot) {
      dot3(ctx, p, onArm, 7, "#BF4326", "rgba(191,67,38,0.16)");
      const [dx, dy] = p.to2d(onArm[0], onArm[1], onArm[2]);
      label(
        ctx,
        `(${fmt(onArm[0])}, ${fmt(onArm[1])}, ${fmt(onArm[2])})`,
        dx + 13,
        dy - 10,
        { font: '600 12px var(--font-mono), monospace' },
      );
    }

    if (showVectors && prog.radial >= 1) {
      drawSphericalUnitVectors(ctx, p, point, theta, phi);
    }

    const nextStatus = !anim
      ? "Press Show to build the point."
      : prog.polar < 1
        ? `Sweeping the polar angle θ = ${thetaDeg}°…`
        : prog.azimuth < 1
          ? `Sweeping the azimuth φ = ${phiDeg}°…`
          : prog.radial < 1
            ? `Extending the radius to r = ${fmt(r)}…`
            : `Landed at (${fmt(point[0])}, ${fmt(point[1])}, ${fmt(point[2])})`;
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

  const point = toCartesian({ r, theta, phi });

  return (
    <SceneShell
      title="Interactive spherical coordinates"
      subtitle="Polar angle → azimuth → radius, in that order."
      badge="r,θ,φ"
      ariaLabel="Interactive spherical coordinate system building a point from radius, polar angle and azimuth"
      canvasRef={canvasRef}
      pointer={pointer}
      legend={
        <>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#BF4326]" /> Point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#B4552D]" /> Azimuth φ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#33506E]" /> Radius r
          </span>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Slider
          id="sph-r"
          label="Radial distance r"
          value={r}
          display={fmt(r)}
          min={0}
          max={6}
          step={0.1}
          onChange={setR}
        />
        <Slider
          id="sph-theta"
          label="Polar angle θ (from +z)"
          value={thetaDeg}
          display={`${thetaDeg}°`}
          min={0}
          max={180}
          step={1}
          onChange={setThetaDeg}
        />
        <Slider
          id="sph-phi"
          label="Azimuth φ (from +x)"
          value={phiDeg}
          display={`${phiDeg}°`}
          min={0}
          max={360}
          step={1}
          onChange={setPhiDeg}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <PrimaryButton onClick={run}>Show</PrimaryButton>
          <Chip active={showVectors} onClick={() => setShowVectors((v) => !v)}>
            Unit vectors âr, âθ, âφ
          </Chip>
          <Chip onClick={reset}>Reset view</Chip>
        </div>
        <div className="text-sm font-medium text-[#181515]/75">{status}</div>
      </div>

      <div className="mt-5">
        <Readout
          items={[
            {
              label: "spherical",
              value: `(r, θ, φ) = (${fmt(r)}, ${thetaDeg}°, ${phiDeg}°)`,
            },
            {
              label: "rectangular",
              value: `(x, y, z) = (${fmt(point[0])}, ${fmt(point[1])}, ${fmt(
                point[2],
              )})`,
              color: AXIS_COLOR.x,
            },
          ]}
        />
      </div>
    </SceneShell>
  );
}

function drawSphericalUnitVectors(
  ctx: CanvasRenderingContext2D,
  p: ReturnType<typeof makeProjector>,
  at: [number, number, number],
  theta: number,
  phi: number,
) {
  const length = 1.6;
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  const specs: { dir: [number, number, number]; color: string; name: string }[] = [
    {
      dir: [sinTheta * cosPhi, sinTheta * sinPhi, cosTheta],
      color: RUST,
      name: "a_r",
    },
    {
      dir: [cosTheta * cosPhi, cosTheta * sinPhi, -sinTheta],
      color: BLUE,
      name: "a_θ",
    },
    { dir: [-sinPhi, cosPhi, 0], color: INK, name: "a_φ" },
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

export default SphericalPointPlayground;
