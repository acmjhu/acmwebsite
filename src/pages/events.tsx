import Head from "next/head";
import type { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useState } from "react";

interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  category: string;
  link: string | null;
  startTime: string;
  endTime: string;
}

interface Props {
  upcoming: Event[];
  past: Event[];
  categories: string[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { endTime: { gte: now } },
      orderBy: { startTime: "asc" },
    }),
    prisma.event.findMany({
      where: { endTime: { lt: now } },
      orderBy: { startTime: "desc" },
    }),
  ]);

  const allEvents = [...upcoming, ...past];
  const categories = [...new Set(allEvents.map((e) => e.category))].sort();

  const serialize = (events: typeof upcoming) =>
    events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      location: e.location,
      category: e.category,
      link: e.link,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
    }));

  return {
    props: {
      upcoming: serialize(upcoming),
      past: serialize(past),
      categories,
    },
  };
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block rounded-full bg-primary-light px-3 py-0.5 text-xs font-medium text-primary">
      {category}
    </span>
  );
}

function SignupForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/events/${eventId}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-3 text-sm font-medium text-success">
        You&apos;re signed up! See you there.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
      >
        {status === "loading" ? "Signing up..." : "Sign Up"}
      </button>
      {status === "error" && (
        <p className="w-full text-sm text-danger">{errorMsg}</p>
      )}
    </form>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-primary-dark">
          {event.name}
        </h3>
        <CategoryBadge category={event.category} />
      </div>

      <p className="mt-1 text-sm text-gray-500">
        {formatDate(event.startTime)} &middot; {formatTime(event.startTime)} &ndash;{" "}
        {formatTime(event.endTime)}
      </p>

      {event.location && (
        <p className="mt-1 text-sm text-gray-500">{event.location}</p>
      )}

      {event.description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          {event.description}
        </p>
      )}

      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-primary-mid hover:underline"
        >
          More info &rarr;
        </a>
      )}

      <SignupForm eventId={event.id} />
    </div>
  );
}

function PastEventRow({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">
            {event.name}
          </span>
          <CategoryBadge category={event.category} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {formatDate(event.startTime)}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="pb-3 pl-1">
          <p className="text-sm text-gray-500">
            {formatTime(event.startTime)} &ndash; {formatTime(event.endTime)}
            {event.location && <> &middot; {event.location}</>}
          </p>
          {event.description && (
            <p className="mt-2 text-sm text-gray-600">{event.description}</p>
          )}
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary-mid hover:underline"
            >
              More info &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const PAST_PAGE_SIZE = 10;

export default function EventsPage({ upcoming, past, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [pastPage, setPastPage] = useState(1);

  const filterByCategory = (events: Event[]) =>
    activeCategory === "All"
      ? events
      : events.filter((e) => e.category === activeCategory);

  const filteredUpcoming = filterByCategory(upcoming);
  const filteredPast = filterByCategory(past);
  const pagedPast = filteredPast.slice(0, pastPage * PAST_PAGE_SIZE);
  const hasMorePast = pagedPast.length < filteredPast.length;

  const allCategories = ["All", ...categories];

  return (
    <>
      <Head>
        <title>Events | JHU ACM</title>
        <meta
          name="description"
          content="Upcoming and past events from the Johns Hopkins University ACM Chapter"
        />
      </Head>

      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-dark">Events</h1>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPastPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Upcoming Events
          </h2>

          {filteredUpcoming.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No upcoming events{activeCategory !== "All" ? ` in ${activeCategory}` : ""}. Check back
              soon!
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {filteredUpcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {filteredPast.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-semibold text-gray-900">
              Past Events
            </h2>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 shadow-sm">
              {pagedPast.map((event) => (
                <PastEventRow key={event.id} event={event} />
              ))}
            </div>

            {hasMorePast && (
              <button
                onClick={() => setPastPage((p) => p + 1)}
                className="mt-4 text-sm font-medium text-primary-mid hover:underline"
              >
                Show more past events
              </button>
            )}
          </section>
        )}
        </div>
      </main>
    </>
  );
}
