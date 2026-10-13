import { FEEDBACK_TYPES, type FeedbackType, type FeedbackInput } from "./types";

const MIN_MESSAGE = 10;
const MAX_MESSAGE = 4000;
const MAX_EMAIL = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult =
  | { ok: true; value: FeedbackInput }
  | { ok: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, max);
}

export function validateFeedback(raw: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  if (!isRecord(raw)) {
    return { ok: false, errors: { form: "Expected a JSON object." } };
  }

  const type = raw.type;
  if (typeof type !== "string" || !FEEDBACK_TYPES.includes(type as FeedbackType)) {
    errors.type = "Choose a feedback type.";
  }

  const message = cleanString(raw.message, MAX_MESSAGE);
  if (!message) {
    errors.message = "Please write a short message.";
  } else if (message.length < MIN_MESSAGE) {
    errors.message = `Please write at least ${MIN_MESSAGE} characters.`;
  }

  let email: string | undefined;
  if (raw.email !== undefined && raw.email !== null && raw.email !== "") {
    const candidate = cleanString(raw.email, MAX_EMAIL);
    if (!candidate || !EMAIL_RE.test(candidate)) {
      errors.email = "That email address does not look right.";
    } else {
      email = candidate;
    }
  }

  let rating: number | undefined;
  if (raw.rating !== undefined && raw.rating !== null && raw.rating !== "") {
    const parsed = Number(raw.rating);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
      errors.rating = "Rating must be between 1 and 5.";
    } else {
      rating = Math.round(parsed);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      type: type as FeedbackType,
      message: message as string,
      email,
      rating,
      lessonId: cleanString(raw.lessonId, 120),
      pagePath: cleanString(raw.pagePath, 300),
      website: typeof raw.website === "string" ? raw.website : undefined,
      startedAt: typeof raw.startedAt === "number" ? raw.startedAt : undefined,
    },
  };
}
