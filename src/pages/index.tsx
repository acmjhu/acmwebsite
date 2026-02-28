import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "@/lib/prisma";

type Event = {
  id: string;
  name: string;
  startTime: string;
  location: string | null;
  category: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
};

type HomeProps = {
  upcomingEvents: Event[];
  announcements: Announcement[];
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const now = new Date();

    const [upcomingEvents, announcements] = await Promise.all([
      prisma.event.findMany({
        where: { startTime: { gte: now } },
        orderBy: { startTime: "asc" },
        take: 3,
        select: {
          id: true,
          name: true,
          startTime: true,
          location: true,
          category: true,
        },
      }),
      prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      props: {
        upcomingEvents: upcomingEvents.map((e) => ({
          ...e,
          startTime: e.startTime.toISOString(),
        })),
        announcements: announcements.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })),
      },
    };
  } catch {
    return {
      props: {
        upcomingEvents: [],
        announcements: [],
      },
    };
  }
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const quickLinks = [
  {
    title: "Events",
    description: "Workshops, talks, and socials throughout the semester.",
    href: "/events",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    title: "About Us",
    description: "Meet our officers and learn about our mission.",
    href: "/about",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Lineages",
    description: "Explore our mentorship trees and ACM family history.",
    href: "/lineages",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
  },
];

export default function Home({
  upcomingEvents,
  announcements,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>JHU ACM</title>
        <meta
          name="description"
          content="Johns Hopkins University ACM Chapter — workshops, talks, and community for CS students."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-[#003366] via-primary-mid to-[#0055a5] animate-gradient text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            ACM@JHU
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            Johns Hopkins University&apos;s chapter of the Association for
            Computing Machinery. Building community through code.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/events"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-105"
            >
              Upcoming Events
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links / Feature Cards */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-primary">
            Get Involved
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Explore what ACM@JHU has to offer.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-light p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  {link.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-primary">
            Upcoming Events
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Join us at our next events.
          </p>

          {upcomingEvents.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                    {event.category}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">
                    {event.name}
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                      {formatDate(event.startTime)}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                          />
                        </svg>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-gray-400">
              No upcoming events right now. Check back soon!
            </p>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View All Events
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold text-primary">
              Announcements
            </h2>
            <div className="mt-10 space-y-4">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {a.title}
                    </h3>
                    <time className="shrink-0 text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  {a.content && (
                    <p className="mt-2 text-sm text-gray-600">{a.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
