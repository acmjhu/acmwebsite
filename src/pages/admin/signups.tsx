import Head from "next/head";
import type { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useState, useRef } from "react";

interface Signup {
  id: string;
  eventName: string;
  name: string;
  email: string;
  attended: boolean;
  createdAt: string;
}

interface EventOption {
  id: string;
  name: string;
}

interface Props {
  signups: Signup[];
  events: EventOption[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [signups, events] = await Promise.all([
    prisma.eventSignup.findMany({
      include: { event: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.findMany({
      orderBy: { startTime: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    props: {
      signups: signups.map((s) => ({
        id: s.id,
        eventName: s.event.name,
        name: s.name,
        email: s.email,
        attended: s.attended,
        createdAt: s.createdAt.toISOString(),
      })),
      events: events.map((e) => ({ id: e.id, name: e.name })),
    },
  };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AttendanceUpload({ events }: { events: EventOption[] }) {
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!eventId) {
      setStatus("error");
      setMessage("Please select an event");
      return;
    }
    if (!file) {
      setStatus("error");
      setMessage("Please select a CSV file");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const csvContent = await file.text();
      const res = await fetch("/api/admin/signups/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, csvContent }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Upload failed");
        return;
      }

      setStatus("success");
      setMessage(`Updated ${data.updated} signup(s) as attended. Refresh to see changes.`);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Upload Attendance
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Upload a CSV with an &quot;email&quot; column to mark attendees for an
        event.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="event-select"
            className="block text-sm font-medium text-gray-700"
          >
            Event
          </label>
          <select
            id="event-select"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select an event...</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="csv-file"
            className="block text-sm font-medium text-gray-700"
          >
            CSV File
          </label>
          <input
            id="csv-file"
            ref={fileRef}
            type="file"
            accept=".csv"
            className="mt-1 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={status === "loading"}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
        >
          {status === "loading" ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm font-medium ${status === "success" ? "text-success" : "text-danger"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default function SignupsPage({ signups, events }: Props) {
  return (
    <>
      <Head>
        <title>Signups | Admin | ACM@JHU</title>
      </Head>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-dark">All Signups</h1>
        <a
          href="/api/admin/signups/export"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid"
        >
          Export Mailing List
        </a>
      </div>

      <div className="mt-6">
        <AttendanceUpload events={events} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Signed Up
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Attended
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {signups.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No signups yet.
                </td>
              </tr>
            ) : (
              signups.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {s.eventName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {s.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {s.attended ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-success">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
