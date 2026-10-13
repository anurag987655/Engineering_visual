"use client";

import { useEffect, useRef, useState } from "react";
import { submitFeedback } from "@/lib/feedback/client";
import { FEEDBACK_TYPES, type FeedbackType } from "@/lib/feedback/types";

const TYPE_LABELS: Record<FeedbackType, string> = {
  content: "Content correction",
  bug: "Something is broken",
  suggestion: "Suggestion",
  praise: "What worked well",
  question: "Question",
};

export function FeedbackForm({
  lessonId,
  defaultType = "content",
}: {
  lessonId?: string;
  defaultType?: FeedbackType;
}) {
  const [type, setType] = useState<FeedbackType>(defaultType);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState("");
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    setServerError("");

    const result = await submitFeedback({
      type,
      message,
      email: email || undefined,
      rating: rating ?? undefined,
      lessonId,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      website,
      startedAt: startedAt.current ?? Date.now(),
    });

    if (result.ok) {
      setStatus("sent");
      setMessage("");
      setEmail("");
      setRating(null);
      return;
    }

    setStatus("error");
    setServerError(result.error);
    if (result.errors) setErrors(result.errors);
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-[#2C2523] bg-[#FBF4EC] p-8 text-center">
        <p className="font-display text-xl font-semibold text-[#181515]">
          Thank you.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#181515]/70">
          Your feedback has been recorded. It genuinely helps shape what gets
          built next.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 rounded-full border border-[#181515] px-4 py-2 text-sm font-semibold transition hover:bg-[#181515] hover:text-[#F7EBE1]"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[#2C2523] bg-[#FBF4EC] p-6 sm:p-8"
    >
      <fieldset>
        <legend className="text-sm font-semibold text-[#181515]">
          What kind of feedback is this?
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEEDBACK_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              onClick={() => setType(option)}
              className={`rounded-full border px-3.5 py-2 text-sm transition ${
                type === option
                  ? "border-[#181515] bg-[#181515] text-[#F7EBE1]"
                  : "border-[#2C2523]/30 text-[#181515]/70 hover:border-[#181515]"
              }`}
            >
              {TYPE_LABELS[option]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label
          htmlFor="feedback-message"
          className="text-sm font-semibold text-[#181515]"
        >
          Your message
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="Tell us what is clear, what is confusing, or what you would like to see next…"
          className="mt-2 w-full resize-y rounded-xl border border-[#2C2523]/35 bg-[#F7EBE1] px-4 py-3 text-sm leading-6 text-[#181515] placeholder:text-[#181515]/40 focus:border-[#181515] focus:outline-none focus:ring-2 focus:ring-[#B4552D]/25"
        />
        <div className="mt-1 flex justify-between text-xs text-[#181515]/50">
          <span className="text-[#BF4326]">{errors.message ?? ""}</span>
          <span>{message.length}/4000</span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="feedback-email"
            className="text-sm font-semibold text-[#181515]"
          >
            Email <span className="font-normal text-[#181515]/50">(optional)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-[#2C2523]/35 bg-[#F7EBE1] px-4 py-2.5 text-sm text-[#181515] placeholder:text-[#181515]/40 focus:border-[#181515] focus:outline-none focus:ring-2 focus:ring-[#B4552D]/25"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[#BF4326]">{errors.email}</p>
          )}
        </div>

        <div>
          <span className="text-sm font-semibold text-[#181515]">
            How useful was this?{" "}
            <span className="font-normal text-[#181515]/50">(optional)</span>
          </span>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} out of 5`}
                aria-pressed={rating === value}
                onClick={() => setRating(rating === value ? null : value)}
                className={`h-9 w-9 rounded-full border text-sm transition ${
                  rating !== null && value <= rating
                    ? "border-[#B4552D] bg-[#B4552D]/15 text-[#B4552D]"
                    : "border-[#2C2523]/30 text-[#181515]/60 hover:border-[#181515]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="mt-1 text-xs text-[#BF4326]">{errors.rating}</p>
          )}
        </div>
      </div>

      {/* Honeypot — hidden from people, attractive to bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="feedback-website">Website</label>
        <input
          id="feedback-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {serverError && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-[#BF4326]/40 bg-[#BF4326]/10 px-4 py-3 text-sm text-[#8f3320]"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center justify-center rounded-full border border-[#181515] bg-[#181515] px-6 py-3 text-sm font-semibold text-[#F7EBE1] transition hover:border-[#B4552D] hover:bg-[#B4552D] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
