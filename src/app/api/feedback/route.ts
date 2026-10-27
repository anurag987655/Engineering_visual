import { getFeedbackSink } from "@/lib/feedback/sinks";
import type { FeedbackEntry } from "@/lib/feedback/types";
import { validateFeedback } from "@/lib/feedback/validate";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const MIN_FILL_MS = 1500;
/** Hard cap on the request body; fields are validated (and truncated) below. */
const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_RETRY_SECONDS = Math.ceil(WINDOW_MS / 1000);

const recentHits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recentHits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recentHits.set(ip, hits);
  if (recentHits.size > 1000) {
    for (const [key, times] of recentHits) {
      if (times.every((time) => now - time >= WINDOW_MS)) recentHits.delete(key);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return Response.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_RETRY_SECONDS) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "Request body is too large." },
      { status: 413 },
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (body.length > MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "Request body is too large." },
      { status: 413 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = validateFeedback(raw);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors },
      { status: 422 },
    );
  }

  const input = result.value;

  // Honeypot: a hidden field only bots fill. Pretend success.
  if (input.website) {
    return Response.json({ ok: true });
  }

  // Too fast to be human. Pretend success so bots do not learn.
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_MS) {
    return Response.json({ ok: true });
  }

  const entry: FeedbackEntry = {
    id: crypto.randomUUID(),
    type: input.type,
    message: input.message,
    email: input.email,
    lessonId: input.lessonId,
    rating: input.rating,
    pagePath: input.pagePath,
    createdAt: new Date().toISOString(),
  };

  try {
    await getFeedbackSink().save(entry);
  } catch (error) {
    console.error("Feedback storage failed:", error);
    return Response.json(
      {
        ok: false,
        error:
          "We couldn't save your feedback right now. Your message was not lost on purpose — please try again later.",
      },
      { status: 503 },
    );
  }

  return Response.json({ ok: true });
}
