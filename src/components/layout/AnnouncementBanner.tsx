import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAnnouncements(data);
      })
      .catch(() => {});
  }, []);

  if (announcements.length === 0) return null;

  const current = announcements[index];

  return (
    <div className="bg-primary px-4 py-2 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
            Announcement
          </span>
          <span className="truncate text-sm font-medium">{current.title}</span>
          {current.content && (
            <span className="hidden truncate text-sm text-white/70 sm:block">
              — {current.content}
            </span>
          )}
        </div>

        {announcements.length > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() =>
                setIndex((i) => (i - 1 + announcements.length) % announcements.length)
              }
              aria-label="Previous announcement"
              className="rounded p-1 hover:bg-white/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-xs text-white/60">
              {index + 1}/{announcements.length}
            </span>
            <button
              onClick={() =>
                setIndex((i) => (i + 1) % announcements.length)
              }
              aria-label="Next announcement"
              className="rounded p-1 hover:bg-white/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
