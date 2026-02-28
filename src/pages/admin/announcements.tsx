import { useState, useEffect, type FormEvent } from "react";
import Head from "next/head";

type Announcement = {
  id: string;
  title: string;
  content: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  title: string;
  content: string;
};

const emptyForm: FormData = { title: "", content: "" };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/admin/announcements/${editingId}`
        : "/api/admin/announcements";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchAnnouncements();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content || "" });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function toggleActive(a: Announcement) {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    await fetchAnnouncements();
  }

  async function handleDelete(a: Announcement) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return;

    await fetch(`/api/admin/announcements/${a.id}`, { method: "DELETE" });
    if (editingId === a.id) cancelEdit();
    await fetchAnnouncements();
  }

  return (
    <>
      <Head>
        <title>Manage Announcements | ACM@JHU</title>
      </Head>

      <h1 className="text-2xl font-bold text-primary-dark">Announcements</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create, edit, and manage homepage announcements.
      </p>

      {/* Create / Edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {editingId ? "Edit Announcement" : "New Announcement"}
        </h2>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={255}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Optional details"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
                ? "Update Announcement"
                : "Create Announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-400">
            No announcements yet. Create one above.
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-gray-900">
                      {a.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {a.content && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {a.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Created{" "}
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleActive(a)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      a.isActive
                        ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        : "border border-green-300 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {a.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => startEdit(a)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
