import {
  chapters,
  lessons,
  paths,
  subjects,
  type Chapter,
  type LessonMeta,
  type LearningPath,
  type Subject,
} from "@/content/library";

export function getSubjects(): Subject[] {
  return subjects;
}

export function getSubject(slug: string): Subject | undefined {
  return subjects.find((subject) => subject.slug === slug);
}

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function getChapterInSubject(
  subjectSlug: string,
  chapterSlug: string,
): Chapter | undefined {
  const subject = getSubject(subjectSlug);
  if (!subject) return undefined;
  return chapters.find(
    (chapter) => chapter.slug === chapterSlug && chapter.subjectId === subject.id,
  );
}

export function getChaptersForSubject(subjectId: string): Chapter[] {
  return chapters
    .filter((chapter) => chapter.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}

export function getLesson(slug: string): LessonMeta | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonById(id: string): LessonMeta | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsForChapter(chapterId: string): LessonMeta[] {
  return lessons
    .filter((lesson) => lesson.chapterId === chapterId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsForSubject(subjectId: string): LessonMeta[] {
  return lessons
    .filter((lesson) => lesson.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}

export function getPath(slug: string): LearningPath | undefined {
  return paths.find((path) => path.slug === slug);
}

export function getPaths(): LearningPath[] {
  return paths;
}

export function getPathLessons(path: LearningPath): LessonMeta[] {
  return path.lessonIds
    .map((id) => getLessonById(id))
    .filter((lesson): lesson is LessonMeta => Boolean(lesson));
}

/** The previous/next lesson within the same chapter, or across the subject. */
export function getLessonSiblings(lesson: LessonMeta): {
  previous?: LessonMeta;
  next?: LessonMeta;
} {
  const chapterLessons = getLessonsForChapter(lesson.chapterId);
  const index = chapterLessons.findIndex((item) => item.id === lesson.id);
  if (index >= 0 && chapterLessons.length > 1) {
    return {
      previous: chapterLessons[index - 1],
      next: chapterLessons[index + 1],
    };
  }

  const subjectLessons = getLessonsForSubject(lesson.subjectId);
  const subjectIndex = subjectLessons.findIndex((item) => item.id === lesson.id);
  return {
    previous: subjectLessons[subjectIndex - 1],
    next: subjectLessons[subjectIndex + 1],
  };
}

export function getSubjectForChapter(chapter: Chapter): Subject | undefined {
  return subjects.find((subject) => subject.id === chapter.subjectId);
}

export function getChapterForLesson(lesson: LessonMeta): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === lesson.chapterId);
}
