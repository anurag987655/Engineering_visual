import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { FeedbackEntry } from "./types";

/**
 * Storage is deliberately hidden behind this interface so the API route never
 * changes when we move from a file to a database or external service.
 *
 * Note: the default file sink is intended for local development and
 * self-hosted environments with a writable filesystem. It will NOT persist on
 * read-only serverless hosts — `save()` throws there so the route can respond
 * gracefully.
 */
export interface FeedbackSink {
  readonly name: string;
  save(entry: FeedbackEntry): Promise<void>;
}

export class FileFeedbackSink implements FeedbackSink {
  readonly name = "file";

  constructor(private readonly dir = path.join(process.cwd(), "data")) {}

  private get file() {
    return path.join(this.dir, "feedback.jsonl");
  }

  async save(entry: FeedbackEntry): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await appendFile(this.file, `${JSON.stringify(entry)}\n`, "utf8");
  }
}

export class ConsoleFeedbackSink implements FeedbackSink {
  readonly name = "console";

  async save(entry: FeedbackEntry): Promise<void> {
    console.log("[feedback]", JSON.stringify(entry));
  }
}

/**
 * Prefer a writable file sink; fall back to structured logging when the
 * filesystem is unavailable.
 */
export function getFeedbackSink(): FeedbackSink {
  if (process.env.FEEDBACK_SINK === "console") return new ConsoleFeedbackSink();
  return new FileFeedbackSink();
}
