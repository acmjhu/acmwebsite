import Head from "next/head";
import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "@/lib/prisma";

type Entry = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  term: string;
  year: string;
  lat: number;
  lng: number;
  contact: string | null;
  photoUrl: string | null;
  status: string;
  createdAt: string;
};

type Props = { entries: Entry[] };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const rows = await prisma.internMapEntry.findMany({ orderBy: { createdAt: "desc" } });
  return {
    props: {
      entries: rows.map(({ updatedAt: _u, ...r }) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  };
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-600",
};

export default function AdminInternMap({ entries: initial }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Entry>>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "denied">("pending");

  async function patch(id: string, data: Partial<Entry>) {
    const res = await fetch(`/api/admin/intern-map/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated: Entry = await res.json();
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}'s entry? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/intern-map/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditForm({
      name: entry.name,
      company: entry.company,
      role: entry.role,
      term: entry.term,
      year: entry.year,
      lat: entry.lat,
      lng: entry.lng,
      contact: entry.contact ?? "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await patch(editingId, editForm);
    setSaving(false);
    setEditingId(null);
  }

  const filtered = filter === "all" ? entries : entries.filter((e) => e.status === filter);
  const counts = {
    all: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    denied: entries.filter((e) => e.status === "denied").length,
  };

  return (
    <>
      <Head>
        <title>InternMap Submissions | ACM@JHU Admin</title>
      </Head>

      <h1 className="text-2xl font-bold text-primary-dark">InternMap Submissions</h1>
      <p className="mt-1 text-sm text-gray-500">Review, approve, edit, or deny intern map submissions.</p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {(["pending", "approved", "denied", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400">No {filter === "all" ? "" : filter} submissions.</p>
        )}

        {filtered.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                {entry.photoUrl && (
                  <img src={entry.photoUrl} alt={entry.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{entry.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ""}`}>
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{entry.role} at {entry.company}</p>
                  <p className="text-xs text-gray-400">{entry.term} &middot; {entry.year} &middot; {entry.email}</p>
                  <p className="text-xs text-gray-400">
                    ({entry.lat}, {entry.lng}){entry.contact ? ` · ${entry.contact}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {entry.status !== "approved" && (
                  <button
                    onClick={() => patch(entry.id, { status: "approved" })}
                    className="rounded-md border border-green-300 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                  >
                    Approve
                  </button>
                )}
                {entry.status !== "denied" && (
                  <button
                    onClick={() => patch(entry.id, { status: "denied" })}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Deny
                  </button>
                )}
                <button
                  onClick={() => startEdit(entry)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id, entry.name)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === entry.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["name", "company", "role", "term", "year"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 capitalize">{field}</label>
                      <input
                        type="text"
                        value={(editForm[field] as string) ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                        className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Contact</label>
                    <input
                      type="text"
                      value={(editForm.contact as string) ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                      className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lat ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, lat: parseFloat(e.target.value) })}
                      className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.lng ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, lng: parseFloat(e.target.value) })}
                      className="mt-0.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
