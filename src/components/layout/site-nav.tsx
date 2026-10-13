import Link from "next/link";
import { getSearchIndex } from "@/content/search";
import { CommandPalette } from "@/components/search/command-palette";

const NAV_LINKS = [
  { label: "Subjects", href: "/subjects" },
  { label: "Paths", href: "/paths" },
  { label: "Feedback", href: "/feedback" },
];

export function SiteNav() {
  const entries = getSearchIndex();

  return (
    <header className="sticky top-0 z-50 border-b border-[#2C2523]/20 bg-[#F7EBE1]/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#181515] bg-[#181515]">
            <span className="block h-2.5 w-2.5 rounded-full bg-[#F7EBE1]" />
            <span className="absolute inset-0 m-auto h-6 w-6 rounded-full border border-[#F7EBE1]/45" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-[#181515]">
            Engineering<span className="text-[#B4552D]"> Visual</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-[#181515]/75 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[#B4552D]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <CommandPalette entries={entries} />
          <Link
            href="/lessons/geometric-series"
            className="hidden rounded-full border border-[#181515] bg-[#181515] px-4 py-2 text-sm font-semibold text-[#F7EBE1] transition hover:border-[#B4552D] hover:bg-[#B4552D] sm:inline-flex"
          >
            Start learning
          </Link>
        </div>
      </nav>
    </header>
  );
}