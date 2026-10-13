import type { LessonMeta } from "@/content/library";

/**
 * Progress is keyed by stable IDs, never by title or URL, so that renaming a
 * lesson or changing a route does not invalidate a student's progress.
 */
export function lessonProgressKey(
  lesson: Pick<LessonMeta, "subjectId" | "chapterId" | "id">,
): string {
  return `${lesson.subjectId}/${lesson.chapterId}/${lesson.id}`;
}

export function chapterProgressKey(chapterId: string): string {
  return chapterId;
}
