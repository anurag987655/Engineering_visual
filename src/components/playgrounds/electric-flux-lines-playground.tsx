"use client";

import { useRef, useState } from "react";

import { clamp } from "./iso";
import { Readout, SceneShell, Slider, useSceneCanvas } from "./scene";

const RUST = "#B4552D";
const INK = "#181515";
const BLUE = "#33506E";

export function ElectricFluxLinesPlayground() {
  const [strength, setStrength] = useState(6);
  const [angleDeg, setAngleDeg] = useState(20);
  const [area, setArea] = useState(1.4);

  const tRef = useRef(0);

  const canvasRef = useSceneCanvas((ctx, w, h, time) => {
    tRef.current = time;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FBF4EC";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.52;
    const theta = (angleDeg * Math.PI) / 180;
    const halfW = 90 * area;
    const halfH = 26 * Math.sqrt(area);
    const spacing = clamp(120 / strength, 14, 44);
    const speed = 0.018 + strength * 0.0025;
    const offset = (time * speed) % spacing;

    // field lines (uniform, pointing downward)
    ctx.save();
    ctx.strokeStyle = RUST;
    ctx.lineWidth = 1.6;
    for (let x = 20; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      // arrowheads pointing downward
      for (let y = 30; y < h; y += 70) {
        const ay = y + (offset % 70);
        ctx.beginPath();
        ctx.moveTo(x - 5, ay - 7);
        ctx.lineTo(x, ay);
        ctx.lineTo(x + 5, ay - 7);
        ctx.stroke();
      }
    }
    ctx.restore();

    // surface (a tilted strip)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-theta);
    ctx.fillStyle = "rgba(51,80,110,0.18)";
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(-halfW, -halfH, halfW * 2, halfH * 2);
    ctx.fill();
    ctx.stroke();

    // count crossings visually by highlighting intersection band
    ctx.fillStyle = "rgba(180,85,45,0.12)";
    ctx.fillRect(-halfW, -halfH, halfW * 2, halfH * 2);
    ctx.restore();

    // normal indicator
    const nx = Math.cos(theta);
    const ny = -Math.sin(theta);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = BLUE;
    ctx.fillStyle = BLUE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(nx * 70, ny * 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nx * 70, ny * 70);
    ctx.lineTo(nx * 60 - ny * 6, ny * 60 + nx * 6);
    ctx.lineTo(nx * 60 + ny * 6, ny * 60 - nx * 6);
    ctx.closePath();
    ctx.fill();
    ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("n̂", nx * 78, ny * 78);
    ctx.restore();

    // field label
    ctx.fillStyle = RUST;
    ctx.font = '700 13px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("D⃗ (uniform, downward)", 18, 28);
    ctx.fillStyle = "rgba(24,21,21,0.55)";
    ctx.font = '500 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("Imaginary surface", cx - 55, cy - halfH * Math.cos(theta) - 36);

    // crossing estimate (lines per width * facing factor)
    const cosT = Math.cos(theta);
    const linesAcross = (halfW * 2 * Math.abs(cosT)) / spacing;
    const relativeFlux = strength * area * Math.abs(cosT);
    ctx.fillStyle = "rgba(251,244,236,0.92)";
    ctx.fillRect(14, h - 44, 360, 30);
    ctx.fillStyle = INK;
    ctx.font = '600 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(
      `Lines crossing ≈ ${Math.max(0, linesAcross).toFixed(1)}   •   Relative flux ∝ D S |cosθ| = ${relativeFlux.toFixed(2)}`,
      22,
      h - 24,
    );
  });

  const rel = strength * area * Math.abs(Math.cos((angleDeg * Math.PI) / 180));

  return (
    <SceneShell
      title="Field lines crossing a surface"
      subtitle="Stronger field, larger facing area, or better alignment lets more field lines pass through."
      ariaLabel="Uniform electric field lines crossing an imaginary surface whose angle and size can change"
      canvasRef={canvasRef}
      legend={
        <>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#B4552D]" /> field / D⃗</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-[#33506E] bg-[#33506E]/20" /> surface</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#33506E]" /> normal n̂</span>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <Slider id="flux-lines-strength" label="Field strength (D)" value={strength} display={`${strength.toFixed(0)} units`} min={2} max={12} step={1} onChange={setStrength} />
        <Slider id="flux-lines-area" label="Surface size (S)" value={area} display={`${area.toFixed(2)}×`} min={0.6} max={2.2} step={0.05} onChange={setArea} />
        <Slider id="flux-lines-angle" label="Tilt from head-on (θ)" value={angleDeg} display={`${angleDeg.toFixed(0)}°`} min={0} max={85} step={1} onChange={setAngleDeg} />
      </div>
      <div className="mt-4">
        <Readout
          items={[
            { label: "θ from normal", value: `${angleDeg.toFixed(0)}°`, color: BLUE },
            { label: "|cosθ|", value: Math.abs(Math.cos((angleDeg * Math.PI) / 180)).toFixed(2) },
            { label: "relative Ψ", value: rel.toFixed(2), color: RUST },
          ]}
        />
      </div>
    </SceneShell>
  );
}
