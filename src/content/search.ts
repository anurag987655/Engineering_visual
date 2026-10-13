import { chapters, lessons, paths, subjects } from "@/content/library";

export type SearchGroup = "Subject" | "Chapter" | "Lesson" | "Path";

export type SearchEntry = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  group: SearchGroup;
  keywords: string[];
};

export function getSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const subject of subjects) {
    entries.push({
      id: `subject:${subject.slug}`,
      title: subject.title,
      subtitle: subject.tagline,
      href: `/subjects/${subject.slug}`,
      group: "Subject",
      keywords: [subject.title, subject.tagline, subject.description],
    });
  }

  for (const chapter of chapters) {
    const subject = subjects.find((item) => item.id === chapter.subjectId);
    entries.push({
      id: `chapter:${chapter.id}`,
      title: chapter.title,
      subtitle: subject ? `${subject.title} · Chapter ${chapter.order}` : "Chapter",
      href: subject
        ? `/subjects/${subject.slug}/${chapter.slug}`
        : "/subjects",
      group: "Chapter",
      keywords: [chapter.title, chapter.summary, ...chapter.outcomes],
    });
  }

  for (const lesson of lessons) {
    const subject = subjects.find((item) => item.id === lesson.subjectId);
    const chapter = chapters.find((item) => item.id === lesson.chapterId);
    entries.push({
      id: `lesson:${lesson.id}`,
      title: lesson.title,
      subtitle: subject && chapter ? `${subject.title} · ${chapter.title}` : "Lesson",
      href: `/lessons/${lesson.slug}`,
      group: "Lesson",
      keywords: [
        lesson.title,
        lesson.summary,
        ...lesson.keywords,
        ...lesson.objectives,
      ],
    });
  }

  for (const path of paths) {
    entries.push({
      id: `path:${path.id}`,
      title: path.title,
      subtitle: "Learning path",
      href: `/paths/${path.slug}`,
      group: "Path",
      keywords: [path.title, path.description, path.audience],
    });
  }

  return entries;
}
