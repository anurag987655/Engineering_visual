"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { clamp } from "./iso";

export type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
) => void;

/**
 * Keeps a canvas sized to its CSS box and re-draws it every frame while it is
 * on screen. The draw function lives in a ref so playgrounds can close over
 * fresh state without restarting the loop.
 */
export function useSceneCanvas(draw: SceneDraw): RefObject<
  HTMLCanvasElement | null
> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const invalidateRef = useRef(true);

  useEffect(() => {
    drawRef.current = draw;
    invalidateRef.current = true;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let visible = true;
    let frozenElapsed: number | null = null;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const invalidate = () => {
      invalidateRef.current = true;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      invalidateRef.current = true;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        invalidateRef.current = true;
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(canvas);

    // Orbit dragging mutates refs without re-rendering, so watch the canvas
    // directly to keep static (reduced-motion) frames responsive.
    canvas.addEventListener("pointerdown", invalidate);
    canvas.addEventListener("pointermove", invalidate);
    motionQuery.addEventListener("change", invalidate);

    const started = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || width === 0 || height === 0) return;
      const reduced = motionQuery.matches;
      if (reduced) {
        // Freeze time on the first reduced-motion frame; redraw only when
        // something (state, resize, drag) invalidates the canvas.
        if (frozenElapsed === null) frozenElapsed = now - started;
        if (!invalidateRef.current) return;
        invalidateRef.current = false;
      } else {
        frozenElapsed = null;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const elapsed = reduced ? frozenElapsed : now - started;
      drawRef.current(ctx, width, height, elapsed ?? 0);
    };

    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", invalidate);
      canvas.removeEventListener("pointermove", invalidate);
      motionQuery.removeEventListener("change", invalidate);
    };
  }, []);

  return canvasRef;
}

export type Orbit = {
  yaw: number;
  elev: number;
};

/** Drag-to-rotate state shared between pointer handlers and the draw loop. */
export function useOrbit(initial: Orbit = { yaw: 0, elev: 0.55 }) {
  const orbit = useRef<Orbit>({ ...initial });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const active = drag.current;
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    active.x = event.clientX;
    active.y = event.clientY;
    orbit.current.yaw += dx * 0.008;
    orbit.current.elev = clamp(orbit.current.elev + dy * 0.005, 0.22, 1.35);
  };

  const end = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const reset = () => {
    orbit.current = { ...initial };
  };

  return {
    orbit,
    reset,
    pointer: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}

export function rangeStyle(value: number, min: number, max: number): CSSProperties {
  const pct = ((value - min) / (max - min)) * 100;
  return { "--pulse": `${clamp(pct, 0, 100)}%` } as CSSProperties;
}

export function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-[#181515]">
          {label}
        </label>
        <span className="font-mono text-sm text-[#B4552D]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={rangeStyle(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="pulse-range mt-3"
      />
    </div>
  );
}

export function SceneShell({
  title,
  subtitle,
  badge,
  legend,
  canvasRef,
  ariaLabel,
  pointer,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  legend?: ReactNode;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  ariaLabel: string;
  pointer?: {
    onPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  };
  children: ReactNode;
}) {
  return (
    <div
      id="playground"
      className="my-10 overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_24px_60px_-30px_rgba(24,21,21,0.5)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2523]/20 bg-[#F0E0D1] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515] font-mono text-xs text-[#F7EBE1]">
            {badge ?? "∠"}
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">
              {title}
            </p>
            <p className="mt-1 text-xs text-[#181515]/60">{subtitle}</p>
          </div>
        </div>
        {legend && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#181515]/70">
            {legend}
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        {...pointer}
        role="img"
        aria-label={ariaLabel}
        className="block aspect-[16/9] w-full touch-none select-none border-b border-[#2C2523]/20 bg-[#FBF4EC]"
      />

      <div className="px-5 py-6 sm:px-6">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
          : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
      }`}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[#B4552D] bg-[#B4552D] px-6 py-2 text-sm font-semibold text-[#F7EBE1] transition hover:bg-[#181515] hover:border-[#181515]"
    >
      {children}
    </button>
  );
}

export function Readout({
  items,
}: {
  items: { label: string; value: string; color?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border border-[#2C2523]/20 bg-[#F0E0D1]/60 px-4 py-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#181515]/55">
            {item.label}
          </span>
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: item.color ?? "#181515" }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
