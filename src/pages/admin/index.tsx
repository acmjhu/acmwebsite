import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";

interface RecentSignup {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  eventName: string;
}

interface Props {
  totalUniqueSignups: number;
  upcomingEventsCount: number;
  recentSignups: RecentSignup[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const now = new Date();

  const [uniqueSignups, upcomingEventsCount, recentSignups] = await Promise.all(
    [
      prisma.eventSignup
        .findMany({
          select: { email: true },
          distinct: ["email"],
        })
        .then((rows) => rows.length),

      prisma.event.count({
        where: { endTime: { gte: now } },
      }),

      prisma.eventSignup.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { event: { select: { name: true } } },
      }),
    ],
  );

  return {
    props: {
      totalUniqueSignups: uniqueSignups,
      upcomingEventsCount,
      recentSignups: recentSignups.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt.toISOString(),
        eventName: s.event.name,
      })),
    },
  };
};

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary-dark">{value}</p>
    </Link>
  );
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard({
  totalUniqueSignups,
  upcomingEventsCount,
  recentSignups,
}: Props) {
  return (
    <>
      <Head>
        <title>Admin Dashboard | ACM@JHU</title>
      </Head>

      <h1 className="text-2xl font-bold text-primary-dark">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Overview of ACM@JHU activity.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Unique signups"
          value={totalUniqueSignups}
          href="/admin/signups"
        />
        <StatCard
          label="Upcoming events"
          value={upcomingEventsCount}
          href="/admin/events"
        />
      </div>

      {/* Recent signups */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Recent signups</h2>

        {recentSignups.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No signups yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-600">
                    Event
                  </th>
                  <th className="px-4 py-2.5 font-medium text-gray-600">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSignups.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{s.email}</td>
                    <td className="px-4 py-2.5 text-gray-700">
                      {s.eventName}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">
                      {formatRelativeTime(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Quick links</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Manage Events", href: "/admin/events" },
            { label: "View Signups", href: "/admin/signups" },
            { label: "Manage Officers", href: "/admin/officers" },
            { label: "Manage Lineages", href: "/admin/lineages" },
            { label: "Announcements", href: "/admin/announcements" },
            { label: "Contact Messages", href: "/admin/contact-submissions" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-primary-mid transition-colors hover:bg-primary-light"
            >
              {link.label} &rarr;
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
