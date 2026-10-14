"use client";

import { CartesianPointPlayground } from "@/components/playgrounds/cartesian-point-playground";
import { CylindricalPointPlayground } from "@/components/playgrounds/cylindrical-point-playground";
import { ElectricFieldPlayground } from "@/components/playgrounds/electric-field-playground";
import { GeometricSeriesConvergence } from "@/components/playgrounds/geometric-series-playground";
import { SphericalPointPlayground } from "@/components/playgrounds/spherical-point-playground";
import { VectorProjectionPlayground } from "@/components/playgrounds/vector-projection-playground";

const PLAYGROUND_COMPONENTS: Record<string, React.ComponentType> = {
  "electric-field": ElectricFieldPlayground,
  "geometric-series-convergence": GeometricSeriesConvergence,
  "cartesian-point": CartesianPointPlayground,
  "cylindrical-point": CylindricalPointPlayground,
  "vector-projection": VectorProjectionPlayground,
  "spherical-point": SphericalPointPlayground,
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
