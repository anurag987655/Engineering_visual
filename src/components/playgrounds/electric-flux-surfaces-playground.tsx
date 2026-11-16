"use client";

import { useState } from "react";

import { Readout, SceneShell, Slider, useSceneCanvas } from "./scene";

const RUST = "#B4552D";
const INK = "#181515";
const BLUE = "#33506E";
const POS = "#BF4326";

type Mode = "open" | "closed";

export function ElectricFluxSurfacesPlayground() {
  const [mode, setMode] = useState<Mode>("open");
  const [field, setField] = useState(6);

  const canvasRef = useSceneCanvas((ctx, w, h, time) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FBF4EC";
    ctx.fillRect(0, 0, w, h);

    const cy = h * 0.52;

    if (mode === "open") {
      // uniform field passing through an open surface (a patch)
      const spacing = 110 / field;
      const offset = (time * 0.02) % spacing;
      ctx.strokeStyle = RUST;
      ctx.lineWidth = 1.7;
      for (let x = -spacing; x < w + spacing; x += spacing) {
        const xx = x + offset;
        ctx.beginPath();
        ctx.moveTo(xx, 30);
        ctx.lineTo(xx, h - 30);
        ctx.stroke();
        for (let y = 50; y < h - 20; y += 60) {
          ctx.beginPath();
          ctx.moveTo(xx - 4, y - 6);
          ctx.lineTo(xx, y);
          ctx.lineTo(xx + 4, y - 6);
          ctx.stroke();
        }
      }
      const sx = w * 0.52, sy = cy, sw = 140, sh = 70;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.25);
      ctx.fillStyle = "rgba(51,80,110,0.18)";
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(-sw / 2, -sh / 2, sw, sh);
      ctx.fill();
      ctx.stroke();
      // open edge hint
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(51,80,110,0.5)";
      ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);
      ctx.setLineDash([]);
      // normal
      ctx.strokeStyle = BLUE;
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(-6, -48);
      ctx.lineTo(6, -48);
      ctx.closePath();
      ctx.fill();
      ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("n̂ (chosen)", 8, -52);
      ctx.restore();

      ctx.fillStyle = INK;
      ctx.font = '700 14px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("Open surface", 24, 34);
      ctx.font = '500 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillStyle = "rgba(24,21,21,0.7)";
      ctx.fillText("Has a boundary (edge). Field lines can pass through it; you choose the positive normal.", 24, 54);
      ctx.fillStyle = RUST;
      ctx.font = '600 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("Net flux through this patch: Ψ = ∫ₛ D⃗ · dS⃗ (depends on orientation)", 24, h - 28);
    } else {
      // closed surface (sphere) around positive charge
      const cx = w * 0.48;
      const r = Math.min(w, h) * 0.22;
      // field lines radiating outward crossing sphere
      ctx.strokeStyle = RUST;
      ctx.lineWidth = 1.7;
      const rays = 16;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2;
        const inner = 28;
        const outer = Math.min(w, h) * 0.46;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.stroke();
        // arrow outward
        const ar = r + 26 + ((time * 0.03 + i * 20) % 40);
        const ax = cx + Math.cos(a) * ar;
        const ay = cy + Math.sin(a) * ar;
        const px = -Math.sin(a), py = Math.cos(a);
        ctx.beginPath();
        ctx.moveTo(ax - Math.cos(a) * 7 - px * 4, ay - Math.sin(a) * 7 - py * 4);
        ctx.lineTo(ax, ay);
        ctx.lineTo(ax - Math.cos(a) * 7 + px * 4, ay - Math.sin(a) * 7 + py * 4);
        ctx.stroke();
      }

      // closed spherical surface
      ctx.fillStyle = "rgba(51,80,110,0.10)";
      ctx.strokeStyle = BLUE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // outward normals
      ctx.strokeStyle = BLUE;
      ctx.fillStyle = BLUE;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 26);
        const y2 = cy + Math.sin(a) * (r + 26);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(a) * 7 - Math.sin(a) * 4, y2 - Math.sin(a) * 7 + Math.cos(a) * 4);
        ctx.lineTo(x2 - Math.cos(a) * 7 + Math.sin(a) * 4, y2 - Math.sin(a) * 7 - Math.cos(a) * 4);
        ctx.closePath();
        ctx.fill();
      }

      // positive charge inside
      ctx.fillStyle = POS;
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FBF4EC";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy);
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7);
      ctx.stroke();
      ctx.fillStyle = POS;
      ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("+Q", cx - 10, cy + 34);

      ctx.fillStyle = INK;
      ctx.font = '700 14px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("Closed surface", 24, 34);
      ctx.font = '500 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillStyle = "rgba(24,21,21,0.7)";
      ctx.fillText("Encloses a volume. Outward n̂ is the usual positive direction.", 24, 54);
      ctx.fillText("Field lines from +Q inside cross the sphere outward.", 24, 72);
      ctx.fillStyle = RUST;
      ctx.font = '600 12px var(--font-mono), ui-monospace, monospace';
      ctx.fillText("Net outward flux through closed surface: Ψ = ∮ₛ D⃗ · dS⃗", 24, h - 28);
    }

    ctx.fillStyle = "rgba(24,21,21,0.45)";
    ctx.font = '500 11px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("Reduced motion: animation freezes but state remains visible.", 24, h - 10);
  });

  return (
    <SceneShell
      title="Open and closed surfaces"
      subtitle="Compare a field crossing an open patch with field lines crossing a closed surface around a charge."
      ariaLabel="Comparison of electric flux through an open surface and a closed spherical surface enclosing a positive charge"
      canvasRef={canvasRef}
      legend={
        <>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#B4552D]" /> field lines</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-[#33506E] bg-[#33506E]/15" /> surface</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#BF4326]" /> +Q</span>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={mode === "open"}
          onClick={() => setMode("open")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${mode === "open" ? "border-[#181515] bg-[#181515] text-[#F7EBE1]" : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"}`}
        >
          Open surface
        </button>
        <button
          type="button"
          aria-pressed={mode === "closed"}
          onClick={() => setMode("closed")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${mode === "closed" ? "border-[#181515] bg-[#181515] text-[#F7EBE1]" : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"}`}
        >
          Closed surface
        </button>
        <div className="min-w-[220px] flex-1">
          <Slider id="flux-surf-field" label="Field strength / line density" value={field} display={`${field}`} min={3} max={10} step={1} onChange={setField} />
        </div>
      </div>
      <div className="mt-4">
        <Readout
          items={[
            { label: "surface", value: mode === "open" ? "open (boundary)" : "closed (encloses volume)", color: BLUE },
            { label: "normal", value: mode === "open" ? "chosen direction" : "outward (positive)" },
          ]}
        />
      </div>
    </SceneShell>
  );
}
