"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Charge = { x: number; y: number; q: number };

const WORLD_W = 960;
const WORLD_H = 540;
const SOFTENING = 900;
const MAX_STEP = 5;
const MAX_LINE_STEPS = 280;

function fieldAt(x: number, y: number, charges: Charge[]) {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + SOFTENING;
    const inv = c.q / (r2 * Math.sqrt(r2));
    ex += inv * dx;
    ey += inv * dy;
  }
  return { ex, ey };
}

function makeCharges(count: number, prev: Charge[] = []): Charge[] {
  const next: Charge[] = [];
  for (let i = 0; i < count; i += 1) {
    if (prev[i]) {
      next.push({ ...prev[i] });
    } else {
      const angle = (i / count) * Math.PI * 2;
      next.push({
        x: WORLD_W / 2 + Math.cos(angle) * WORLD_W * 0.29,
        y: WORLD_H / 2 + Math.sin(angle) * WORLD_H * 0.32,
        q: i % 2 === 0 ? 1 : -1,
      });
    }
  }
  if (count === 1) next[0] = { x: WORLD_W / 2, y: WORLD_H / 2, q: prev[0]?.q ?? 1 };
  return next;
}

function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return { "--pulse": `${Math.max(0, Math.min(100, pct))}%` } as CSSProperties;
}

export function ElectricFieldPlayground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0, dpr: 1 });
  const drawRef = useRef<() => void>(() => {});
  const dragRef = useRef<number | null>(null);

  const [charges, setCharges] = useState<Charge[]>(() => makeCharges(2));
  const [selected, setSelected] = useState(0);
  const [showLines, setShowLines] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  const selectedCharge = charges[selected];
  const magnitude = selectedCharge ? Math.abs(selectedCharge.q) : 1;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { scale, offsetX, offsetY, dpr } = viewRef.current;
    const pixel = Math.max(0.6, 1 / scale);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#FBF4EC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const s = scale * dpr;
    ctx.setTransform(s, 0, 0, s, offsetX * dpr, offsetY * dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Paper grid
    ctx.strokeStyle = "rgba(44,37,35,0.07)";
    ctx.lineWidth = pixel;
    for (let x = 0; x <= WORLD_W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_H);
      ctx.stroke();
    }
    for (let y = 0; y <= WORLD_H; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_W, y);
      ctx.stroke();
    }

    if (showVectors) {
      const spacing = 48;
      const samples: { x: number; y: number; ux: number; uy: number; mag: number }[] =
        [];
      let maxMag = 0;
      for (let x = spacing / 2; x < WORLD_W; x += spacing) {
        for (let y = spacing / 2; y < WORLD_H; y += spacing) {
          let near = false;
          for (const c of charges) {
            if ((x - c.x) ** 2 + (y - c.y) ** 2 < 34 * 34) {
              near = true;
              break;
            }
          }
          if (near) continue;
          const { ex, ey } = fieldAt(x, y, charges);
          const mag = Math.hypot(ex, ey);
          if (mag < 1e-9) continue;
          samples.push({ x, y, ux: ex / mag, uy: ey / mag, mag });
          if (mag > maxMag) maxMag = mag;
        }
      }

      ctx.strokeStyle = "rgba(44,37,35,0.5)";
      for (const sample of samples) {
        const t = Math.pow(sample.mag / maxMag, 0.3);
        const len = 5 + t * 9;
        const alpha = 0.12 + t * 0.5;
        ctx.strokeStyle = `rgba(44,37,35,${alpha.toFixed(3)})`;
        ctx.lineWidth = (0.8 + t * 0.9) * pixel;
        const tipX = sample.x + sample.ux * len;
        const tipY = sample.y + sample.uy * len;
        ctx.beginPath();
        ctx.moveTo(sample.x, sample.y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        const head = 3.2 + t * 1.6;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
          tipX - sample.ux * head - sample.uy * head * 0.62,
          tipY - sample.uy * head + sample.ux * head * 0.62,
        );
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(
          tipX - sample.ux * head + sample.uy * head * 0.62,
          tipY - sample.uy * head - sample.ux * head * 0.62,
        );
        ctx.stroke();
      }
    }

    if (showLines) {
      const positives = charges.filter((c) => c.q > 0);
      const seeds = positives.length > 0 ? positives : charges;
      const dir = positives.length > 0 ? 1 : -1;

      for (const source of seeds) {
        const lineCount = Math.max(
          6,
          Math.round(6 * Math.min(3, Math.abs(source.q))),
        );
        for (let i = 0; i < lineCount; i += 1) {
          const angle = (i / lineCount) * Math.PI * 2 + 0.15;
          let x = source.x + Math.cos(angle) * 22;
          let y = source.y + Math.sin(angle) * 22;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.strokeStyle = "rgba(44,37,35,0.42)";
          ctx.lineWidth = 1.3 * pixel;

          for (let step = 0; step < MAX_LINE_STEPS; step += 1) {
            const { ex, ey } = fieldAt(x, y, charges);
            const mag = Math.hypot(ex, ey);
            if (mag < 1e-9) break;
            x += dir * (ex / mag) * MAX_STEP;
            y += dir * (ey / mag) * MAX_STEP;
            ctx.lineTo(x, y);

            if (x < -50 || x > WORLD_W + 50 || y < -50 || y > WORLD_H + 50) break;
            let arrived = false;
            for (const other of charges) {
              if (other === source) continue;
              if ((x - other.x) ** 2 + (y - other.y) ** 2 < 15 * 15) {
                arrived = true;
                break;
              }
            }
            if (arrived) break;
          }
          ctx.stroke();
        }
      }
    }

    charges.forEach((c, index) => {
      const positive = c.q >= 0;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 24, 0, Math.PI * 2);
      ctx.fillStyle = positive
        ? "rgba(191,67,38,0.12)"
        : "rgba(51,80,110,0.14)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = positive ? "#BF4326" : "#33506E";
      ctx.fill();
      ctx.lineWidth = (index === selected ? 3.2 : 1.6) * pixel;
      ctx.strokeStyle =
        index === selected ? "#181515" : "rgba(24,21,21,0.35)";
      ctx.stroke();

      ctx.strokeStyle = "#F7EBE1";
      ctx.lineWidth = 2.6 * pixel;
      ctx.beginPath();
      ctx.moveTo(c.x - 6, c.y);
      ctx.lineTo(c.x + 6, c.y);
      ctx.stroke();
      if (positive) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - 6);
        ctx.lineTo(c.x, c.y + 6);
        ctx.stroke();
      }
    });
  }, [charges, selected, showLines, showVectors]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    drawRef.current();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const scale = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
      viewRef.current = {
        scale,
        offsetX: (rect.width - WORLD_W * scale) / 2,
        offsetY: (rect.height - WORLD_H * scale) / 2,
        dpr,
      };
      drawRef.current();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const toWorld = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = viewRef.current;
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toWorld(event.clientX, event.clientY);
    let nearest = -1;
    let best = 30 * 30;
    charges.forEach((c, index) => {
      const d = (x - c.x) ** 2 + (y - c.y) ** 2;
      if (d < best) {
        best = d;
        nearest = index;
      }
    });
    if (nearest >= 0) {
      setSelected(nearest);
      dragRef.current = nearest;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const index = dragRef.current;
    if (index === null) return;
    const { x, y } = toWorld(event.clientX, event.clientY);
    setCharges((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              x: Math.max(24, Math.min(WORLD_W - 24, x)),
              y: Math.max(24, Math.min(WORLD_H - 24, y)),
            }
          : c,
      ),
    );
  };

  const endDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current === null) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const updateSelected = (updater: (c: Charge) => Charge) => {
    setCharges((prev) => prev.map((c, i) => (i === selected ? updater(c) : c)));
  };

  return (
    <div
      id="playground"
      className="my-10 overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_24px_60px_-30px_rgba(24,21,21,0.5)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2523]/20 bg-[#F0E0D1] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515] font-mono text-xs text-[#F7EBE1]">
            ⚡
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">
              Interactive Playground
            </p>
            <p className="mt-1 text-xs text-[#181515]/60">
              Drag a charge. Tune the field. Watch it respond.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#181515]/70">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#BF4326]" /> Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#33506E]" /> Negative
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="img"
        aria-label="Interactive simulation of the electric field produced by point charges"
        className="block aspect-[16/9] w-full touch-none select-none border-b border-[#2C2523]/20 bg-[#FBF4EC]"
      />

      <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="charge-count"
              className="text-sm font-semibold text-[#181515]"
            >
              Number of charges
            </label>
            <span className="font-mono text-sm text-[#B4552D]">
              {charges.length}
            </span>
          </div>
          <input
            id="charge-count"
            type="range"
            min={1}
            max={6}
            step={1}
            value={charges.length}
            style={rangeStyle(charges.length, 1, 6)}
            onChange={(event) => {
              const count = Number(event.target.value);
              setCharges((prev) => makeCharges(count, prev));
              setSelected((prev) => Math.min(prev, count - 1));
            }}
            className="pulse-range mt-3"
          />
          <p className="mt-2 text-xs text-[#181515]/55">
            Add or remove point charges in the field.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="charge-strength"
              className="text-sm font-semibold text-[#181515]"
            >
              Charge magnitude
              <span className="ml-2 font-normal text-[#181515]/55">
                #{selected + 1}
              </span>
            </label>
            <span className="font-mono text-sm text-[#B4552D]">
              {magnitude.toFixed(1)}
            </span>
          </div>
          <input
            id="charge-strength"
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={magnitude}
            style={rangeStyle(magnitude, 0.2, 3)}
            onChange={(event) => {
              const value = Number(event.target.value);
              updateSelected((c) => ({
                ...c,
                q: (c.q < 0 ? -1 : 1) * value,
              }));
            }}
            className="pulse-range mt-3"
          />
          <p className="mt-2 text-xs text-[#181515]/55">
            Applies to the selected charge (click a charge to select).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              updateSelected((c) => ({ ...c, q: -c.q }))
            }
            className="rounded-full border border-[#181515] px-4 py-2 text-sm font-semibold transition hover:bg-[#181515] hover:text-[#F7EBE1]"
          >
            Flip polarity
          </button>
          <button
            type="button"
            aria-pressed={showLines}
            onClick={() => setShowLines((v) => !v)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              showLines
                ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
            }`}
          >
            Field lines
          </button>
          <button
            type="button"
            aria-pressed={showVectors}
            onClick={() => setShowVectors((v) => !v)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              showVectors
                ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
            }`}
          >
            Vector field
          </button>
          <button
            type="button"
            onClick={() => {
              setCharges(makeCharges(2));
              setSelected(0);
            }}
            className="rounded-full border border-[#2C2523]/35 px-4 py-2 text-sm font-medium text-[#181515]/70 transition hover:border-[#181515]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
