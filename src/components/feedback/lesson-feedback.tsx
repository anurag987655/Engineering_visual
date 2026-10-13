"use client";

import { useEffect, useRef, useState } from "react";
import { submitFeedback } from "@/lib/feedback/client";

type Choice = "helpful" | "not-helpful";

export function LessonFeedback({ lessonId }: { lessonId: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function send(selected: Choice, withComment: boolean) {
    setStatus("sending");
    const result = await submitFeedback({
      type: selected === "helpful" ? "praise" : "suggestion",
      message:
        withComment && comment.trim().length >= 10
          ? comment.trim()
          : selected === "helpful"
            ? "This lesson was helpful."
            : "This lesson was not as helpful as I hoped.",
      lessonId,
      rating: selected === "helpful" ? 5 : 2,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      startedAt: startedAt.current ?? Date.now(),
    });

    if (result.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[#2C2523]/30 bg-[#F0E0D1]/70 p-5 text-sm text-[#181515]/75">
        Thanks — your note was recorded.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2C2523]/30 bg-[#F0E0D1]/70 p-5">
      <p className="text-sm font-semibold text-[#181515]">
        Was this lesson helpful?
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setChoice("helpful")}
          aria-pressed={choice === "helpful"}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            choice === "helpful"
              ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
              : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setChoice("not-helpful")}
          aria-pressed={choice === "not-helpful"}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            choice === "not-helpful"
              ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
              : "border-[#2C2523]/35 text-[#181515]/70 hover:border-[#181515]"
          }`}
        >
          Not really
        </button>
      </div>

      {choice && (
        <div className="mt-4">
          <label
            htmlFor="lesson-feedback-comment"
            className="text-xs text-[#181515]/60"
          >
            Anything you want to add? (optional)
          </label>
          <textarea
            id="lesson-feedback-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={4000}
            className="mt-2 w-full resize-y rounded-xl border border-[#2C2523]/35 bg-[#F7EBE1] px-3.5 py-2.5 text-sm text-[#181515] placeholder:text-[#181515]/40 focus:border-[#181515] focus:outline-none focus:ring-2 focus:ring-[#B4552D]/25"
            placeholder="What worked, or what didn't?"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              disabled={status === "sending"}
              onClick={() => send(choice, true)}
              className="rounded-full border border-[#181515] bg-[#181515] px-4 py-2 text-sm font-semibold text-[#F7EBE1] transition hover:border-[#B4552D] hover:bg-[#B4552D] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            {status === "error" && (
              <span role="alert" className="text-xs text-[#BF4326]">
                {error}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
