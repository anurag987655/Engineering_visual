export const FEEDBACK_TYPES = [
  "content",
  "bug",
  "suggestion",
  "praise",
  "question",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export type FeedbackEntry = {
  id: string;
  type: FeedbackType;
  message: string;
  email?: string;
  lessonId?: string;
  rating?: number;
  pagePath?: string;
  createdAt: string;
};

/**
 * Shape arriving from the client. `website` and `startedAt` are anti-spam
 * signals and are never persisted.
 */
export type FeedbackInput = {
  type: FeedbackType;
  message: string;
  email?: string;
  lessonId?: string;
  rating?: number;
  pagePath?: string;
  website?: string;
  startedAt?: number;
};
