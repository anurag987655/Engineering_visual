"use client";

import { CartesianPointPlayground } from "@/components/playgrounds/cartesian-point-playground";
import { ContinuityPlayground } from "@/components/playgrounds/continuity-playground";
import { CylindricalPointPlayground } from "@/components/playgrounds/cylindrical-point-playground";
import { EpsilonDeltaPlayground } from "@/components/playgrounds/epsilon-delta-playground";
import { GeometricSeriesConvergence } from "@/components/playgrounds/geometric-series-playground";
import { SphericalPointPlayground } from "@/components/playgrounds/spherical-point-playground";
import { VectorProjectionPlayground } from "@/components/playgrounds/vector-projection-playground";

const PLAYGROUND_COMPONENTS: Record<string, React.ComponentType> = {
  "geometric-series-convergence": GeometricSeriesConvergence,
  "cartesian-point": CartesianPointPlayground,
  "cylindrical-point": CylindricalPointPlayground,
  "vector-projection": VectorProjectionPlayground,
  "spherical-point": SphericalPointPlayground,
  "continuity-at-a-point": ContinuityPlayground,
  "epsilon-delta": EpsilonDeltaPlayground,
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
