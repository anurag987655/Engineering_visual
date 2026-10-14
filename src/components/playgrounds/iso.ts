/* Shared 3D → 2D helpers for the coordinate-system playgrounds.
   Everything is an orthographic (axonometric) projection drawn on canvas 2D,
   so no 3D library is needed. Screen space: +x right, +y down. */

export const PAPER = "#FBF4EC";
export const INK = "#181515";
export const RUST = "#B4552D";
export const BLUE = "#33506E";
export const POSITIVE = "#BF4326";
export const AZ = "#2F6F6A";

export const AXIS_COLOR: Record<"x" | "y" | "z", string> = {
  x: RUST,
  y: BLUE,
  z: AZ,
};

export const HALF = 6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOut(t: number): number {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function easeOut(t: number): number {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function fmt(value: number, digits = 2): string {
  const rounded = Number(value.toFixed(digits));
  if (Object.is(rounded, -0)) return "0";
  return String(rounded);
}

export type Projector = {
  yaw: number;
  elev: number;
  scale: number;
  cx: number;
  cy: number;
  to2d(x: number, y: number, z: number): [number, number];
  depth(x: number, y: number, z: number): number;
};

/** yaw rotates about z, elev is the camera elevation above the xy plane. */
export function makeProjector(
  yaw: number,
  elev: number,
  scale: number,
  cx: number,
  cy: number,
): Projector {
  const sinYaw = Math.sin(yaw);
  const cosYaw = Math.cos(yaw);
  const sinElev = Math.sin(elev);
  const cosElev = Math.cos(elev);

  return {
    yaw,
    elev,
    scale,
    cx,
    cy,
    to2d(x, y, z) {
      const sx = -x * sinYaw + y * cosYaw;
      const sy = -(x * cosYaw * sinElev + y * sinYaw * sinElev + z * cosElev);
      return [cx + sx * scale, cy + sy * scale];
    },
    depth(x, y, z) {
      return x * cosElev * cosYaw + y * cosElev * sinYaw - z * sinElev;
    },
  };
}

/** Pixels-per-unit so the ±6 cube fits inside a 16:9 frame. */
export function sceneScale(w: number, h: number, zoom = 1): number {
  return (Math.min(w / 26, h / 16.5)) * zoom;
}

export type Vec3 = readonly [number, number, number];

export function point(p: Projector, v: Vec3): [number, number] {
  return p.to2d(v[0], v[1], v[2]);
}

export function line(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  a: Vec3,
  b: Vec3,
): void {
  const [x1, y1] = p.to2d(a[0], a[1], a[2]);
  const [x2, y2] = p.to2d(b[0], b[1], b[2]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - size * Math.cos(angle - 0.42),
    y - size * Math.sin(angle - 0.42),
  );
  ctx.moveTo(x, y);
  ctx.lineTo(
    x - size * Math.cos(angle + 0.42),
    y - size * Math.sin(angle + 0.42),
  );
  ctx.stroke();
}

/** Arrow from a 3D point to another, with an arrowhead at the tip. */
export function arrow3(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  a: Vec3,
  b: Vec3,
  width = 2,
  head = 9,
): void {
  const [x1, y1] = p.to2d(a[0], a[1], a[2]);
  const [x2, y2] = p.to2d(b[0], b[1], b[2]);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - Math.cos(angle) * head * 0.72;
  const by = y2 - Math.sin(angle) * head * 0.72;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(bx, by);
  ctx.stroke();
  arrowHead(ctx, x2, y2, angle, head);
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    halo?: boolean;
  } = {},
): void {
  const {
    color = INK,
    font = '600 11px var(--font-mono), ui-monospace, monospace',
    align = "left",
    baseline = "alphabetic",
    halo = true,
  } = options;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (halo) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(251,244,236,0.92)";
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function dashed(
  ctx: CanvasRenderingContext2D,
  dash: number[],
  offset = 0,
): void {
  ctx.setLineDash(dash);
  ctx.lineDashOffset = offset;
}

export function solid(ctx: CanvasRenderingContext2D): void {
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

/** Grid lying on one of the three coordinate planes, clipped to ±half. */
export function planeGrid(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  plane: "xy" | "yz" | "xz",
  half = HALF,
  step = 1,
  color = "rgba(44,37,35,0.10)",
  lineWidth = 1,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  solid(ctx);
  for (let i = -half; i <= half; i += step) {
    const a = i;
    if (plane === "xy") {
      line(ctx, p, [-half, a, 0], [half, a, 0]);
      line(ctx, p, [a, -half, 0], [a, half, 0]);
    } else if (plane === "xz") {
      line(ctx, p, [-half, 0, a], [half, 0, a]);
      line(ctx, p, [a, 0, -half], [a, 0, half]);
    } else {
      line(ctx, p, [0, -half, a], [0, half, a]);
      line(ctx, p, [0, a, -half], [0, a, half]);
    }
  }
  ctx.restore();
}

/** All three coordinate planes: a crisp floor grid plus faint wall guides,
    so a scene reads as a volume rather than a flat drawing. */
export function spaceGrid(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  half = HALF,
  floor = "rgba(44,37,35,0.09)",
  wall = "rgba(44,37,35,0.05)",
): void {
  planeGrid(ctx, p, "xy", half, 1, floor);
  planeGrid(ctx, p, "xz", half, 2, wall);
  planeGrid(ctx, p, "yz", half, 2, wall);
}

const AXIS_VECTORS: { name: "x" | "y" | "z"; u: Vec3; tick: Vec3; title: string }[] =
  [
    { name: "x", u: [1, 0, 0], tick: [0, 1, 0], title: "+x" },
    { name: "y", u: [0, 1, 0], tick: [0, 0, 1], title: "+y" },
    { name: "z", u: [0, 0, 1], tick: [1, 0, 0], title: "+z" },
  ];

/** Axes with ticks and labels from -half to +half. */
export function axes(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  half = HALF,
  options: { labels?: boolean; alpha?: number } = {},
): void {
  const { labels = true, alpha = 1 } = options;
  ctx.save();
  ctx.lineCap = "round";

  for (const axis of AXIS_VECTORS) {
    const color = AXIS_COLOR[axis.name];
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.7;
    solid(ctx);
    const end: Vec3 = [axis.u[0] * half, axis.u[1] * half, axis.u[2] * half];
    const neg: Vec3 = [-end[0], -end[1], -end[2]];
    line(ctx, p, neg, end);

    const [ex, ey] = p.to2d(end[0], end[1], end[2]);
    const [sx, sy] = p.to2d(
      end[0] - axis.u[0] * 0.5,
      end[1] - axis.u[1] * 0.5,
      end[2] - axis.u[2] * 0.5,
    );
    arrowHead(ctx, ex, ey, Math.atan2(ey - sy, ex - sx), 11);

    ctx.lineWidth = 1.1;
    for (let i = -half; i <= half; i += 1) {
      const major = i % 2 === 0;
      const len = major ? 0.26 : 0.16;
      const base: Vec3 = [axis.u[0] * i, axis.u[1] * i, axis.u[2] * i];
      const tip: Vec3 = [
        base[0] + axis.tick[0] * len,
        base[1] + axis.tick[1] * len,
        base[2] + axis.tick[2] * len,
      ];
      ctx.globalAlpha = alpha * (major ? 0.85 : 0.55);
      line(ctx, p, base, tip);

      if (labels && i !== 0 && major) {
        const [lx, ly] = p.to2d(tip[0], tip[1], tip[2]);
        ctx.globalAlpha = alpha * 0.75;
        label(ctx, String(i), lx + 4, ly + 3, {
          color,
          font: '500 10px var(--font-mono), ui-monospace, monospace',
        });
      }
    }

    const titleAt: Vec3 = [
      axis.u[0] * (half + 0.55),
      axis.u[1] * (half + 0.55),
      axis.u[2] * (half + 0.55),
    ];
    const [tx, ty] = p.to2d(titleAt[0], titleAt[1], titleAt[2]);
    ctx.globalAlpha = alpha;
    label(ctx, axis.title, tx + 4, ty - 4, {
      color,
      font: '700 15px var(--font-display), Georgia, serif',
    });

    const negativeAt: Vec3 = [
      -axis.u[0] * (half + 0.5),
      -axis.u[1] * (half + 0.5),
      -axis.u[2] * (half + 0.5),
    ];
    const [nx, ny] = p.to2d(negativeAt[0], negativeAt[1], negativeAt[2]);
    label(ctx, `−${axis.name}`, nx - 4, ny + 12, {
      color,
      font: '600 11px var(--font-mono), ui-monospace, monospace',
      align: "right",
    });
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Filled quad in 3D (used for the constant coordinate planes). */
export function quad(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  a: Vec3,
  b: Vec3,
  c: Vec3,
  d: Vec3,
  fill: string,
  stroke?: string,
): void {
  const pts = [a, b, c, d].map((v) => p.to2d(v[0], v[1], v[2]));
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function dot3(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  v: Vec3,
  radius: number,
  fill: string,
  ring?: string,
): void {
  const [x, y] = p.to2d(v[0], v[1], v[2]);
  if (ring) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = ring;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PAPER;
  ctx.stroke();
}

/** Arc in the xy plane (z fixed) from angle a0 to a1 (radians). */
export function arcXY(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  radius: number,
  a0: number,
  a1: number,
  z = 0,
  segments = 96,
): void {
  if (Math.abs(a1 - a0) < 1e-6) return;
  const steps = Math.max(2, Math.ceil((segments * Math.abs(a1 - a0)) / (Math.PI * 2)));
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const a = lerp(a0, a1, i / steps);
    const [x, y] = p.to2d(Math.cos(a) * radius, Math.sin(a) * radius, z);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/** Arc on a sphere of given radius, from polar angle t0 to t1 at fixed azimuth. */
export function arcMeridian(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  radius: number,
  t0: number,
  t1: number,
  phi: number,
  segments = 64,
): void {
  if (Math.abs(t1 - t0) < 1e-6) return;
  const steps = Math.max(2, Math.ceil((segments * Math.abs(t1 - t0)) / Math.PI));
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const t = lerp(t0, t1, i / steps);
    const x = radius * Math.sin(t) * cosPhi;
    const y = radius * Math.sin(t) * sinPhi;
    const z = radius * Math.cos(t);
    const [sx, sy] = p.to2d(x, y, z);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
}

/** Horizontal arc at polar angle theta, sweeping azimuth a0 → a1. */
export function arcAzimuth(
  ctx: CanvasRenderingContext2D,
  p: Projector,
  radius: number,
  theta: number,
  a0: number,
  a1: number,
  segments = 96,
): void {
  if (Math.abs(a1 - a0) < 1e-6) return;
  const ring = radius * Math.sin(theta);
  const z = radius * Math.cos(theta);
  const steps = Math.max(2, Math.ceil((segments * Math.abs(a1 - a0)) / (Math.PI * 2)));
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const a = lerp(a0, a1, i / steps);
    const [x, y] = p.to2d(Math.cos(a) * ring, Math.sin(a) * ring, z);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
