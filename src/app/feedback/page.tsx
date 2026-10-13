import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us what works, what doesn't, and what to build next at Engineering Visual.",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#B4552D]">
          A two-way door
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#181515] sm:text-5xl">
          Help shape the library
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#181515]/70">
          Every lesson is an experiment: does this explanation land? Is the
          math clear? What is missing? Your feedback is read and used.
        </p>
      </header>

      <div className="mt-10">
        <FeedbackForm />
      </div>

      <div className="mt-8 rounded-2xl border border-[#2C2523]/25 bg-[#FBF4EC]/70 p-6 text-sm leading-7 text-[#181515]/65">
        <p className="font-semibold text-[#181515]">What happens next</p>
        <p className="mt-2">
          Feedback is collected and triaged before each round of lessons is
          written. Corrections bubble to the top of the queue; suggestions go
          to the roadmap. No account needed — an email is only used if we need
          to follow up.
        </p>
      </div>
    </div>
  );
}