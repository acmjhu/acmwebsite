import Head from "next/head";
import { useState, useEffect, useCallback } from "react";

interface AdminEvent {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  category: string;
  link: string | null;
  startTime: string;
  endTime: string;
  signupCount: number;
}

interface Signup {
  id: string;
  name: string;
  email: string;
  attended: boolean;
  createdAt: string;
}

interface EventForm {
  name: string;
  description: string;
  location: string;
  category: string;
  link: string;
  startTime: string;
  endTime: string;
}

const emptyForm: EventForm = {
  name: "",
  description: "",
  location: "",
  category: "",
  link: "",
  startTime: "",
  endTime: "",
};

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Signups state
  const [viewingSignups, setViewingSignups] = useState<string | null>(null);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [signupsEventName, setSignupsEventName] = useState("");
  const [signupsLoading, setSignupsLoading] = useState(false);

  // Attendance state
  const [uploadingAttendance, setUploadingAttendance] = useState<string | null>(null);
  const [attendanceResult, setAttendanceResult] = useState("");

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      setEvents(await res.json());
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(event: AdminEvent) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description || "",
      location: event.location || "",
      category: event.category,
      link: event.link || "",
      startTime: toLocalDatetime(event.startTime),
      endTime: toLocalDatetime(event.endTime),
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    try {
      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save event");
        return;
      }

      setShowForm(false);
      await fetchEvents();
    } catch {
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete event");
        return;
      }

      setDeletingId(null);
      await fetchEvents();
    } catch {
      setError("Network error");
    }
  }

  async function openSignups(event: AdminEvent) {
    setViewingSignups(event.id);
    setSignupsEventName(event.name);
    setSignupsLoading(true);
    setSignups([]);

    try {
      const res = await fetch(`/api/admin/events/${event.id}/signups`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSignups(data.signups);
    } catch {
      setError("Failed to load signups");
      setViewingSignups(null);
    } finally {
      setSignupsLoading(false);
    }
  }

  function downloadCsv(eventId: string) {
    window.open(`/api/admin/events/${eventId}/signups?format=csv`, "_blank");
  }

  async function handleAttendanceUpload(
    eventId: string,
    file: File,
  ) {
    setAttendanceResult("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      try {
        const res = await fetch(`/api/admin/events/${eventId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileData: base64, fileName: file.name }),
        });

        const data = await res.json();
        if (!res.ok) {
          setAttendanceResult(`Error: ${data.error}`);
          return;
        }

        setAttendanceResult(
          `Marked ${data.matched} of ${data.totalEmails} emails as attended.`,
        );
        // Refresh signups if we're viewing them
        if (viewingSignups === eventId) {
          const signupsRes = await fetch(
            `/api/admin/events/${eventId}/signups`,
          );
          if (signupsRes.ok) {
            const signupsData = await signupsRes.json();
            setSignups(signupsData.signups);
          }
        }
        await fetchEvents();
      } catch {
        setAttendanceResult("Network error");
      }
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Manage Events | ACM@JHU Admin</title>
        </Head>
        <p className="text-gray-500">Loading events...</p>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Events | ACM@JHU Admin</title>
      </Head>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            {events.length} event{events.length !== 1 && "s"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid"
        >
          Create event
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Event form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit event" : "Create event"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="e.g. Workshop, Social"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-danger">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signups modal */}
      {viewingSignups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Signups
                </h2>
                <p className="text-sm text-gray-500">{signupsEventName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCsv(viewingSignups)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    setUploadingAttendance(viewingSignups);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Upload attendance
                </button>
                <button
                  onClick={() => {
                    setViewingSignups(null);
                    setAttendanceResult("");
                    setUploadingAttendance(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Attendance upload area */}
            {uploadingAttendance && (
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <label className="text-sm font-medium text-gray-700">
                  Upload CSV or Excel file with an &quot;email&quot; column:
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAttendanceUpload(uploadingAttendance, file);
                      setUploadingAttendance(null);
                    }
                  }}
                  className="mt-1 block text-sm"
                />
                {attendanceResult && (
                  <p
                    className={`mt-2 text-sm ${attendanceResult.startsWith("Error") ? "text-danger" : "text-success"}`}
                  >
                    {attendanceResult}
                  </p>
                )}
              </div>
            )}

            {!uploadingAttendance && attendanceResult && (
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <p
                  className={`text-sm ${attendanceResult.startsWith("Error") ? "text-danger" : "text-success"}`}
                >
                  {attendanceResult}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {signupsLoading ? (
                <p className="px-6 py-4 text-sm text-gray-500">
                  Loading signups...
                </p>
              ) : signups.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">
                  No signups yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-2.5 font-medium text-gray-600">
                        Name
                      </th>
                      <th className="px-6 py-2.5 font-medium text-gray-600">
                        Email
                      </th>
                      <th className="px-6 py-2.5 font-medium text-gray-600">
                        Attended
                      </th>
                      <th className="px-6 py-2.5 font-medium text-gray-600">
                        Signed up
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {signups.map((s) => (
                      <tr key={s.id}>
                        <td className="px-6 py-2.5 font-medium text-gray-900">
                          {s.name}
                        </td>
                        <td className="px-6 py-2.5 text-gray-500">
                          {s.email}
                        </td>
                        <td className="px-6 py-2.5">
                          {s.attended ? (
                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2.5 text-gray-400">
                          {formatDate(s.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete event?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete the event and all its signups. This
              action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {events.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No events yet. Create your first event.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="px-4 py-2.5 font-medium text-gray-600">
                  Category
                </th>
                <th className="px-4 py-2.5 font-medium text-gray-600">Date</th>
                <th className="px-4 py-2.5 font-medium text-gray-600">
                  Signups
                </th>
                <th className="px-4 py-2.5 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => {
                const isPast = new Date(event.endTime) < new Date();
                return (
                  <tr key={event.id}>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-900">
                        {event.name}
                      </span>
                      {isPast && (
                        <span className="ml-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                          past
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {formatDate(event.startTime)}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => openSignups(event)}
                        className="font-medium text-primary-mid hover:underline"
                      >
                        {event.signupCount}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(event)}
                          className="text-sm font-medium text-primary-mid hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(event.id)}
                          className="text-sm font-medium text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
