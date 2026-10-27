"use client";

import Link from "next/link";
import { useEffect } from "react";

function errorDigest(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const { digest } = error as { digest?: unknown };
    return typeof digest === "string" ? digest : undefined;
  }
  return undefined;
}

/**
 * Root route error boundary. Catches rendering errors in pages and nested
 * layouts; errors thrown by the root layout itself are handled by
 * `global-error.tsx`. In production the server forwards a generic message plus
 * `digest`, which matches the corresponding server log line.
 */
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = errorDigest(error);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-28 pt-24 text-center lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
        Something went wrong
      </p>
      <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-[#181515]">
        This page hit a snag
      </h1>
      <p className="mt-5 max-w-md text-lg leading-8 text-[#181515]/65">
        An unexpected error stopped this page from rendering. You can try
        again, or head back to a page that works.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-[#181515] px-6 py-3 font-display text-sm font-semibold text-[#F7EBE1] transition hover:bg-[#B4552D]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#181515] px-6 py-3 font-display text-sm font-semibold text-[#181515] transition hover:border-[#B4552D] hover:text-[#B4552D]"
        >
          Back home
        </Link>
      </div>
      {digest && (
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.16em] text-[#181515]/40">
          Error reference: {digest}
        </p>
      )}
    </div>
  );
}
