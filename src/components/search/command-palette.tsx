"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { SearchEntry, SearchGroup } from "@/content/search";

const GROUP_LABELS: Record<SearchGroup, string> = {
  Subject: "Subjects",
  Chapter: "Chapters",
  Lesson: "Lessons",
  Path: "Learning paths",
};

const GROUP_ORDER: SearchGroup[] = ["Subject", "Chapter", "Lesson", "Path"];

const RECENT_KEY = "ev.search.recent";

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  const keywords = entry.keywords.join(" ").toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (title.startsWith(token)) score += 10;
    else if (title.includes(token)) score += 8;
    else if (subtitle.includes(token)) score += 4;
    else if (keywords.includes(token)) score += 2;
    else return -1;
  }
  return score;
}

export function CommandPalette({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const openRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    if (!query.trim()) {
      return {
        flat: [] as SearchEntry[],
        byGroup: new Map<SearchGroup, SearchEntry[]>(),
      };
    }
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const scored = entries
      .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score);

    const byGroup = new Map<SearchGroup, SearchEntry[]>();
    for (const group of GROUP_ORDER) {
      const list = scored
        .filter((item) => item.entry.group === group)
        .slice(0, 4)
        .map((item) => item.entry);
      if (list.length > 0) byGroup.set(group, list);
    }
    return {
      flat: scored.map((item) => item.entry),
      byGroup,
    };
  }, [entries, query]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) closePalette();
        else openPalette();
      } else if (event.key === "Escape") {
        closePalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openPalette() {
    setQuery("");
    setActive(0);
    setRecent(readRecent().slice(0, 4));
    openRef.current = true;
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closePalette() {
    openRef.current = false;
    setOpen(false);
  }

  function remember(queryValue: string) {
    try {
      const next = [queryValue, ...readRecent().filter((item) => item !== queryValue)]
        .slice(0, 6);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function navigate(href: string) {
    if (query.trim()) remember(query.trim());
    closePalette();
    router.push(href);
  }

  function runRecent(value: string) {
    setQuery(value);
    setActive(0);
  }

  function onKeyDown(event: KeyboardEvent) {
    const total = matches.flat.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(total - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = matches.flat[active];
      if (item) navigate(item.href);
    }
  }

  function flattenIndex(): { entry: SearchEntry; group: SearchGroup }[] {
    if (!query.trim()) return [];
    const flat: { entry: SearchEntry; group: SearchGroup }[] = [];
    for (const [group, list] of matches.byGroup) {
      for (const entry of list) flat.push({ entry, group });
    }
    return flat;
  }

  const flat = flattenIndex();
  const activeItem = flat[active];

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Open search"
        className="flex items-center gap-2.5 rounded-full border border-[#2C2523]/25 bg-[#FBF4EC] px-4 py-2 text-sm text-[#181515]/60 transition hover:border-[#181515] hover:text-[#181515]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M16 16l4.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-[#2C2523]/25 px-1.5 py-0.5 font-mono text-[10px] text-[#181515]/55 md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search lessons, chapters, subjects, and paths"
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={closePalette}
            className="absolute inset-0 bg-[#181515]/45 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#2C2523] bg-[#FBF4EC] shadow-[0_40px_90px_-20px_rgba(24,21,21,0.6)]">
            <div className="flex items-center gap-3 border-b border-[#2C2523]/20 px-5 py-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 shrink-0 text-[#181515]/55"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M16 16l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search lessons, chapters, subjects, paths…"
                className="w-full bg-transparent text-base text-[#181515] placeholder:text-[#181515]/45 focus:outline-none"
                aria-label="Search query"
              />
              <kbd className="shrink-0 rounded border border-[#2C2523]/25 px-2 py-1 font-mono text-[10px] text-[#181515]/55">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
              {flat.length > 0 ? (
                <>
                  {Array.from(matches.byGroup.entries()).map(([group, list]) => (
                    <div key={group}>
                      <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/45">
                        {GROUP_LABELS[group]}
                      </p>
                      {list.map((entry) => {
                        const index = flat.findIndex(
                          (item) => item.entry.id === entry.id,
                        );
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => navigate(entry.href)}
                            onMouseEnter={() => setActive(index)}
                            className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                              activeItem?.entry.id === entry.id
                                ? "bg-[#F0E0D1]"
                                : ""
                            }`}
                          >
                            <span className="mt-0.5 shrink-0 rounded border border-[#B4552D]/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#B4552D]">
                              {entry.group}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-[#181515]">
                                {entry.title}
                              </span>
                              <span className="block truncate text-xs text-[#181515]/55">
                                {entry.subtitle}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </>
              ) : query.trim() ? (
                <p className="px-4 py-10 text-center text-sm text-[#181515]/55">
                  No results for &ldquo;{query}&rdquo;. Try a topic keyword.
                </p>
              ) : recent.length > 0 ? (
                <>
                  <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#181515]/45">
                    Recent
                  </p>
                  {recent.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => runRecent(item)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[#181515]/75 transition hover:bg-[#F0E0D1]"
                    >
                      <span className="text-[#B4552D]">⌕</span>
                      {item}
                    </button>
                  ))}
                </>
              ) : (
                <p className="px-4 py-10 text-center text-sm text-[#181515]/55">
                  Start typing to search the library.
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-[#2C2523]/20 px-5 py-3 font-mono text-[10px] text-[#181515]/50">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span className="ml-auto">Engineering Visual</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}