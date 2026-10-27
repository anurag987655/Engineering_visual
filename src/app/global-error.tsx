"use client";

import { useEffect } from "react";

function errorDigest(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "digest" in error) {
    const { digest } = error as { digest?: unknown };
    return typeof digest === "string" ? digest : undefined;
  }
  return undefined;
}

/**
 * Last-resort boundary for errors thrown by the root layout itself. It
 * replaces the whole document, so it must render its own <html>/<body> and
 * cannot rely on the root layout's fonts or global stylesheet — styles are
 * inlined in the site palette instead.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.25rem",
          textAlign: "center",
          backgroundColor: "#F7EBE1",
          color: "#181515",
          fontFamily:
            'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#B4552D",
          }}
        >
          Something went wrong
        </p>
        <h1
          style={{
            margin: "1.25rem 0 0",
            fontSize: "2.25rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Engineering Visual is unavailable
        </h1>
        <p
          style={{
            margin: "1.25rem 0 0",
            maxWidth: "28rem",
            fontSize: "1.125rem",
            lineHeight: 1.8,
            color: "rgba(24, 21, 21, 0.65)",
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          An unexpected error occurred while loading the site. You can try
          again, or come back a little later.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "2.25rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#181515",
            color: "#F7EBE1",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {digest && (
          <p
            style={{
              marginTop: "2.5rem",
              fontSize: "0.625rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(24, 21, 21, 0.4)",
            }}
          >
            Error reference: {digest}
          </p>
        )}
      </body>
    </html>
  );
}
