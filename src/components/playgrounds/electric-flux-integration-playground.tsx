"use client";

import { useRef, useState } from "react";

import { clamp } from "./iso";
import { PrimaryButton, Readout, SceneShell, Slider, useSceneCanvas } from "./scene";

const RUST = "#B4552D";
const INK = "#181515";
const BLUE = "#33506E";
const AZ = "#2F6F6A";

export function ElectricFluxIntegrationPlayground() {
  const [elements, setElements] = useState(6);
  const [curvature, setCurvature] = useState(35);
  const [revealed, setRevealed] = useState(0);
  const revealedRef = useRef(0);

  const accumulate = () => {
    revealedRef.current = 0;
    setRevealed(0);
    const start = performance.now();
    const step = () => {
      const t = (performance.now() - start) / 900;
      const v = Math.min(elements, t * elements);
      revealedRef.current = v;
      setRevealed(v);
      if (v < elements) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const canvasRef = useSceneCanvas((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FBF4EC";
    ctx.fillRect(0, 0, w, h);

    const n = Math.max(1, Math.round(elements));
    const showN = Math.min(n, revealedRef.current || revealed || n);
    const left = 70;
    const right = w * 0.58;
    const midY = h * 0.52;
    const totalW = right - left;
    const segW = totalW / n;
    const curve = curvature / 100;

    // uniform D field (upward)
    ctx.strokeStyle = "rgba(180,85,45,0.55)";
    ctx.lineWidth = 1.6;
    for (let x = left - 30; x <= right + 30; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, h - 40);
      ctx.lineTo(x, 50);
      ctx.stroke();
      for (let y = h - 70; y > 70; y -= 60) {
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 6);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 4, y + 6);
        ctx.stroke();
      }
    }
    ctx.fillStyle = RUST;
    ctx.font = '700 13px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("Uniform D⃗ (upward)", left - 10, 36);

    // surface elements along a (possibly curved) strip
    const centers: { x: number; y: number; ang: number; dPsi: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = left + (i + 0.5) * segW;
      // local tilt varies with curvature to show changing D·n
      const localAng = (t - 0.5) * curve * Math.PI * 0.9; // radians from horizontal-normal alignment
      const y = midY + Math.sin((t - 0.5) * Math.PI) * curve * 55;
      const cosTheta = Math.cos(localAng); // relative to upward D
      centers.push({ x, y, ang: localAng, dPsi: cosTheta });
    }

    let sum = 0;
    for (let i = 0; i < n; i++) {
      const c = centers[i];
      const active = i < showN + 1e-6;
      const partial = clamp(showN - i, 0, 1);
      if (active) sum += c.dPsi * partial;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.ang);
      const hw = segW * 0.44;
      const hh = 8;
      ctx.fillStyle = active ? "rgba(51,80,110,0.28)" : "rgba(51,80,110,0.10)";
      ctx.strokeStyle = active ? BLUE : "rgba(51,80,110,0.35)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.rect(-hw, -hh, hw * 2, hh * 2);
      ctx.fill();
      ctx.stroke();

      // local normal
      const nx = 0;
      const ny = -28;
      ctx.strokeStyle = active ? AZ : "rgba(47,111,106,0.35)";
      ctx.fillStyle = active ? AZ : "rgba(47,111,106,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(-4, ny + 7);
      ctx.lineTo(4, ny + 7);
      ctx.closePath();
      ctx.fill();

      // dPsi label for a few
      if (n <= 10 || i % Math.ceil(n / 8) === 0) {
        ctx.rotate(-c.ang);
        ctx.fillStyle = active ? INK : "rgba(24,21,21,0.35)";
        ctx.font = '600 10px var(--font-mono), ui-monospace, monospace';
        ctx.fillText(`dΨ${i + 1}`, -14, 26);
      }
      ctx.restore();
    }

    // accumulation bar chart on right
    const bx = w * 0.66;
    const by = 60;
    const bw = w * 0.3 - 20;
    const bh = h - 120;
    ctx.fillStyle = "rgba(251,244,236,0.9)";
    ctx.fillRect(bx - 12, by - 20, bw + 24, bh + 50);
    ctx.strokeStyle = "rgba(44,37,35,0.2)";
    ctx.strokeRect(bx - 12, by - 20, bw + 24, bh + 50);
    ctx.fillStyle = INK;
    ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("Accumulating contributions", bx, by);
    ctx.font = '500 11px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("each bar = dΨᵢ = D⃗ · dS⃗ᵢ (scaled)", bx, by + 16);

    const maxTotal = Math.max(1, n);
    const barAreaH = bh - 60;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const active = i < showN + 1e-6;
      const partial = clamp(showN - i, 0, 1);
      const val = centers[i].dPsi * partial;
      acc += val;
      const x = bx + (i / n) * bw;
      const ww = Math.max(2, bw / n - 2);
      const hBar = (Math.max(0, centers[i].dPsi) / 1.2) * (barAreaH * 0.45);
      ctx.fillStyle = active ? RUST : "rgba(180,85,45,0.18)";
      ctx.fillRect(x, by + 40 + barAreaH * 0.45 - hBar, ww, hBar);
    }
    // total line
    const totalScaled = (acc / maxTotal) * (barAreaH * 0.45);
    ctx.strokeStyle = AZ;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, by + 40 + barAreaH * 0.45 - totalScaled);
    ctx.lineTo(bx + bw, by + 40 + barAreaH * 0.45 - totalScaled);
    ctx.stroke();
    ctx.fillStyle = AZ;
    ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(`Σ dΨ ≈ ${(acc).toFixed(2)} (scaled)`, bx, by + 40 + barAreaH * 0.45 + 22);
    ctx.fillStyle = INK;
    ctx.font = '500 11px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(`elements added: ${Math.floor(showN)}/${n}`, bx, by + 40 + barAreaH * 0.45 + 40);

    ctx.fillStyle = INK;
    ctx.font = '600 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("Ψ = ∫ₛ D⃗ · dS⃗  ≈  Σ D⃗ · ΔS⃗ᵢ", left, h - 24);
  });

  const n = Math.round(elements);
  const avgCos = 1 - (curvature / 200); // rough display
  return (
    <SceneShell
      title="From differential elements to total flux"
      subtitle="Split the surface into elements, compute each dΨ = D⃗·dS⃗, then accumulate to approximate Ψ."
      ariaLabel="Surface divided into differential elements whose contributions accumulate into total electric flux"
      canvasRef={canvasRef}
      legend={
        <>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#33506E]/25 border border-[#33506E]" /> element ΔS⃗ᵢ</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#2F6F6A]" /> local normal</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 bg-[#B4552D]/70" /> dΨ contribution</span>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Slider id="flux-int-n" label="Number of elements" value={elements} display={`${n}`} min={2} max={18} step={1} onChange={(v) => { setElements(v); setRevealed(v); revealedRef.current = v; }} />
        <Slider id="flux-int-curve" label="Surface tilt/curvature" value={curvature} display={`${curvature}`} min={0} max={80} step={1} onChange={(v) => { setCurvature(v); setRevealed(n); revealedRef.current = n; }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={accumulate}>Accumulate contributions</PrimaryButton>
        <Readout
          items={[
            { label: "elements", value: `${n}` },
            { label: "idea", value: "Ψ ≈ Σ dΨᵢ", color: AZ },
          ]}
        />
      </div>
      <p className="mt-3 text-sm text-[#181515]/65">Each element contributes <span className="font-mono">dΨᵢ = D⃗·dS⃗ᵢ = D dSᵢ cosθᵢ</span>. When orientation varies, local <span className="font-mono">θᵢ</span> changes each contribution; the integral adds them all.</p>
    </SceneShell>
  );
}
