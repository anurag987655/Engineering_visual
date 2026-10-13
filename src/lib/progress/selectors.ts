import type { Chapter, LessonMeta, Subject } from "@/content/library";
import { getLessonsForChapter, getLessonsForSubject } from "@/lib/content";
import { lessonProgressKey } from "@/lib/progress/keys";
import type { LessonStatus, ProgressSnapshot } from "@/lib/progress/store";

export type ProgressSummary = {
  total: number;
  started: number;
  completed: number;
  percent: number;
};

export function summarizeLessons(
  lessons: LessonMeta[],
  progress: ProgressSnapshot,
): ProgressSummary {
  let started = 0;
  let completed = 0;
  for (const lesson of lessons) {
    const status = progress[lessonProgressKey(lesson)]?.status;
    if (status === "completed") {
      completed += 1;
    } else if (status === "started") {
      started += 1;
    }
  }
  const total = lessons.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, started, completed, percent };
}

export function getLessonStatus(
  progress: ProgressSnapshot,
  lesson: LessonMeta,
): LessonStatus {
  return progress[lessonProgressKey(lesson)]?.status ?? "not-started";
}

export function getChapterProgress(
  progress: ProgressSnapshot,
  chapter: Chapter,
): ProgressSummary {
  return summarizeLessons(getLessonsForChapter(chapter.id), progress);
}

export function getSubjectProgress(
  progress: ProgressSnapshot,
  subject: Subject,
): ProgressSummary {
  return summarizeLessons(getLessonsForSubject(subject.id), progress);
}
