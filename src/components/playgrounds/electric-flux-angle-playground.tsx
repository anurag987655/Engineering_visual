"use client";

import { useState } from "react";

import { Readout, SceneShell, Slider, useSceneCanvas } from "./scene";

const RUST = "#B4552D";
const INK = "#181515";
const BLUE = "#33506E";
const AZ = "#2F6F6A";

export function ElectricFluxAnglePlayground() {
  const [thetaDeg, setThetaDeg] = useState(35);
  const [dMag, setDMag] = useState(8);
  const [sArea, setSArea] = useState(1.0);

  const canvasRef = useSceneCanvas((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FBF4EC";
    ctx.fillRect(0, 0, w, h);

    const theta = (thetaDeg * Math.PI) / 180;
    const cx = w * 0.42;
    const cy = h * 0.55;
    const plateHalf = 95 * Math.sqrt(sArea);
    const thick = 10;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    // D field (fixed upward)
    ctx.save();
    ctx.strokeStyle = RUST;
    ctx.fillStyle = RUST;
    ctx.lineWidth = 2.2;
    const lines = 7;
    for (let i = -3; i <= 3; i++) {
      const x = cx - 230 + i * 28;
      ctx.beginPath();
      ctx.moveTo(x, h - 30);
      ctx.lineTo(x, 40);
      ctx.stroke();
      for (let y = h - 60; y > 60; y -= 55) {
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 7);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 5, y + 7);
        ctx.stroke();
      }
    }
    ctx.font = '700 14px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("D⃗", cx - 250, 30);
    ctx.font = '500 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(`|D| = ${dMag.toFixed(1)} μC/m²`, cx - 265, 48);
    ctx.restore();

    // surface plate: oriented by theta from D (upward). Normal is at angle theta from D.
    // We'll draw plate perpendicular to normal: plate direction angle = 90° - theta from horizontal ref
    ctx.save();
    ctx.translate(cx, cy);
    // normal direction (from D upward = -y, rotated by theta toward +x)
    const nx = Math.sin(theta);
    const ny = -Math.cos(theta);
    // tangent along plate
    const tx = Math.cos(theta);
    const ty = Math.sin(theta);

    // projected/effective area shadow onto plane perpendicular to D (horizontal strip width proportional to cosθ)
    const proj = Math.abs(cosT);
    ctx.fillStyle = "rgba(47,111,106,0.18)";
    ctx.strokeStyle = AZ;
    ctx.lineWidth = 1.5;
    const projHalf = plateHalf * proj;
    ctx.beginPath();
    ctx.rect(-projHalf, 78, projHalf * 2, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = AZ;
    ctx.font = '600 11px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("effective facing area ∝ S cosθ", -projHalf, 74);

    // projection dashed guides
    ctx.strokeStyle = "rgba(47,111,106,0.45)";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(-plateHalf * tx, -plateHalf * ty);
    ctx.lineTo(-projHalf, 78);
    ctx.moveTo(plateHalf * tx, plateHalf * ty);
    ctx.lineTo(projHalf, 78);
    ctx.stroke();
    ctx.setLineDash([]);

    // plate
    ctx.save();
    ctx.transform(tx, ty, -nx, -ny, 0, 0); // local x along tangent, local y along -normal? easier manual
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-plateHalf * tx - thick * nx, -plateHalf * ty - thick * ny);
    ctx.lineTo(plateHalf * tx - thick * nx, plateHalf * ty - thick * ny);
    ctx.lineTo(plateHalf * tx + thick * nx, plateHalf * ty + thick * ny);
    ctx.lineTo(-plateHalf * tx + thick * nx, -plateHalf * ty + thick * ny);
    ctx.closePath();
    ctx.fillStyle = "rgba(51,80,110,0.22)";
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    // normal arrow
    ctx.strokeStyle = BLUE;
    ctx.fillStyle = BLUE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(nx * 90, ny * 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nx * 90, ny * 90);
    ctx.lineTo(nx * 78 - tx * 7, ny * 78 - ty * 7);
    ctx.lineTo(nx * 78 + tx * 7, ny * 78 + ty * 7);
    ctx.closePath();
    ctx.fill();
    ctx.font = '700 13px var(--font-mono), ui-monospace, monospace';
    ctx.fillText("n̂", nx * 98 - 4, ny * 98 - 4);

    // angle arc between D (up, -y) and normal
    const arcR = 42;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    // from -90deg (up) to -90deg + theta
    const startA = -Math.PI / 2;
    const endA = startA + theta;
    ctx.arc(0, 0, arcR, startA, endA, theta < 0);
    ctx.stroke();
    const mid = startA + theta / 2;
    ctx.fillStyle = INK;
    ctx.font = '700 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(`θ=${thetaDeg.toFixed(0)}°`, Math.cos(mid) * (arcR + 16) - 10, Math.sin(mid) * (arcR + 16) + 4);

    // D direction reference line
    ctx.strokeStyle = "rgba(180,85,45,0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -100);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // status cases
    let note = "General case";
    if (thetaDeg === 0) note = "θ = 0°: maximum positive flux";
    else if (thetaDeg === 90) note = "θ = 90°: zero flux (parallel to surface)";
    else if (thetaDeg === 180) note = "θ = 180°: maximum negative flux";

    ctx.fillStyle = "rgba(251,244,236,0.94)";
    ctx.fillRect(w - 360, 14, 344, 86);
    ctx.strokeStyle = "rgba(44,37,35,0.2)";
    ctx.strokeRect(w - 360, 14, 344, 86);
    ctx.fillStyle = INK;
    ctx.font = '700 13px var(--font-mono), ui-monospace, monospace';
    ctx.fillText(note, w - 344, 38);
    ctx.font = '600 12px var(--font-mono), ui-monospace, monospace';
    ctx.fillStyle = BLUE;
    ctx.fillText(`Normal n̂ rotated by θ from D⃗`, w - 344, 58);
    ctx.fillStyle = AZ;
    ctx.fillText(`Projected/effective facing = S|cosθ|`, w - 344, 78);
    ctx.fillStyle = RUST;
    ctx.fillText(`Ψ = D S cosθ`, w - 344, 96);
  });

  const theta = (thetaDeg * Math.PI) / 180;
  const psi = dMag * sArea * Math.cos(theta);
  const proj = sArea * Math.abs(Math.cos(theta));

  return (
    <SceneShell
      title="Orientation, normal, and flux"
      subtitle="Change θ to see the surface, normal, angle, effective facing area, and Ψ update together."
      ariaLabel="Interactive rotatable surface showing normal vector, angle from D, projected area, and calculated electric flux"
      canvasRef={canvasRef}
      legend={
        <>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#B4552D]" /> D⃗ (fixed)</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#33506E]" /> normal n̂</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-4 rounded-sm bg-[#2F6F6A]/25 border border-[#2F6F6A]" /> effective area</span>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <Slider id="flux-angle-theta" label="Angle θ (from normal)" value={thetaDeg} display={`${thetaDeg}°`} min={0} max={180} step={1} onChange={setThetaDeg} />
        <Slider id="flux-angle-d" label="Flux density |D|" value={dMag} display={`${dMag.toFixed(1)} μC/m²`} min={1} max={12} step={0.5} onChange={setDMag} />
        <Slider id="flux-angle-s" label="Surface area S" value={sArea} display={`${sArea.toFixed(2)} m²`} min={0.25} max={2} step={0.05} onChange={setSArea} />
      </div>
      <div className="mt-4">
        <Readout
          items={[
            { label: "θ (from normal)", value: `${thetaDeg}°`, color: INK },
            { label: "cosθ", value: Math.cos(theta).toFixed(3) },
            { label: "S|cosθ|", value: `${proj.toFixed(3)} m²`, color: AZ },
            { label: "Ψ = D S cosθ", value: `${psi.toFixed(2)} μC`, color: RUST },
          ]}
        />
      </div>
    </SceneShell>
  );
}
