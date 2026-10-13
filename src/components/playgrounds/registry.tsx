"use client";

import { ElectricFieldPlayground } from "@/components/playgrounds/electric-field-playground";
import { GeometricSeriesConvergence } from "@/components/playgrounds/geometric-series-playground";

const PLAYGROUND_COMPONENTS: Record<string, React.ComponentType> = {
  "electric-field": ElectricFieldPlayground,
  "geometric-series-convergence": GeometricSeriesConvergence,
};

export function Playground({ id }: { id: string }) {
  const Component = PLAYGROUND_COMPONENTS[id];
  if (!Component) {
    return (
      <div className="my-8 rounded-2xl border border-[#2C2523]/30 bg-[#FBF4EC] p-6 text-sm text-[#181515]/60">
        Unknown playground: <code className="font-mono">{id}</code>
      </div>
    );
  }
  return <Component />;
}