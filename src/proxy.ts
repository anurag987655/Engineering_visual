import { NextResponse, type NextRequest } from "next/server";
import { chapters, lessons, paths, subjects } from "@/content/library";

const lessonSlugs = new Set(lessons.map((lesson) => lesson.slug));
const pathSlugs = new Set(paths.map((path) => path.slug));
const subjectSlugs = new Set(subjects.map((subject) => subject.slug));
const chapterSlugsBySubject = new Map(
  subjects.map((subject) => [
    subject.slug,
    new Set(
      chapters
        .filter((chapter) => chapter.subjectId === subject.id)
        .map((chapter) => chapter.slug),
    ),
  ]),
);

/**
 * With Cache Components + Partial Prerendering the response status is fixed as
 * soon as the static shell streams, so `notFound()` on a cache miss can only
 * produce a soft 404 (200 + noindex) for the first request to an unknown slug.
 * Validating slugs in Proxy — before any response is written — guarantees a
 * real 404 for every request. Keep this check fast and data-only.
 */
export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);

  let known = false;
  if (segments.length === 2 && segments[0] === "lessons") {
    known = lessonSlugs.has(segments[1] ?? "");
  } else if (segments.length === 2 && segments[0] === "paths") {
    known = pathSlugs.has(segments[1] ?? "");
  } else if (segments.length === 2 && segments[0] === "subjects") {
    known = subjectSlugs.has(segments[1] ?? "");
  } else if (segments.length === 3 && segments[0] === "subjects") {
    known =
      subjectSlugs.has(segments[1] ?? "") &&
      (chapterSlugsBySubject.get(segments[1] ?? "")?.has(segments[2] ?? "") ??
        false);
  }

  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

export const config = {
  matcher: [
    "/lessons/:slug",
    "/paths/:path",
    "/subjects/:subject",
    "/subjects/:subject/:chapter",
  ],
};
