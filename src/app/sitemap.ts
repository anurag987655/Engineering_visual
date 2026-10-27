import type { MetadataRoute } from "next";
import { chapters, lessons, paths, subjects } from "@/content/library";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/subjects", "/paths", "/feedback"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.7,
  }));

  for (const subject of subjects) {
    entries.push({
      url: `${siteUrl}/subjects/${subject.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }

  for (const chapter of chapters) {
    const subject = subjects.find((item) => item.id === chapter.subjectId);
    if (!subject) continue;
    entries.push({
      url: `${siteUrl}/subjects/${subject.slug}/${chapter.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    });
  }

  for (const lesson of lessons) {
    entries.push({
      url: `${siteUrl}/lessons/${lesson.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    });
  }

  for (const path of paths) {
    entries.push({
      url: `${siteUrl}/paths/${path.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }

  return entries;
}
