import type { FeedbackInput } from "./types";

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string; errors?: Record<string, string> };

export async function submitFeedback(
  input: FeedbackInput,
): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.ok) return { ok: true };

    const data = (payload ?? {}) as {
      error?: string;
      errors?: Record<string, string>;
    };
    return {
      ok: false,
      error:
        data.error ??
        "Something went wrong sending your feedback. Please try again.",
      errors: data.errors,
    };
  } catch {
    return {
      ok: false,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
