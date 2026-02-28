import { useState, FormEvent } from "react";
import Head from "next/head";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "@/lib/prisma";

interface Officer {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  email: string | null;
  linkedin: string | null;
  imageUrl: string | null;
  termStart: string | null;
  termEnd: string | null;
  isCurrent: boolean;
  displayOrder: number;
}

type OfficerForm = {
  name: string;
  role: string;
  bio: string;
  email: string;
  linkedin: string;
  imageUrl: string;
  termStart: string;
  termEnd: string;
};

const emptyForm: OfficerForm = {
  name: "",
  role: "",
  bio: "",
  email: "",
  linkedin: "",
  imageUrl: "",
  termStart: "",
  termEnd: "",
};

export const getServerSideProps: GetServerSideProps<{
  officers: Officer[];
}> = async () => {
  // Auth is enforced by middleware (see middleware.ts matcher: /admin/:path*)
  try {
    const officers = await prisma.officer.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        email: true,
        linkedin: true,
        imageUrl: true,
        termStart: true,
        termEnd: true,
        isCurrent: true,
        displayOrder: true,
      },
    });

    return {
      props: {
        officers: officers.map((o) => ({
          ...o,
          termStart: o.termStart?.toISOString().split("T")[0] ?? null,
          termEnd: o.termEnd?.toISOString().split("T")[0] ?? null,
        })),
      },
    };
  } catch {
    return { props: { officers: [] } };
  }
};

export default function AdminOfficersPage({
  officers: initialOfficers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [officers, setOfficers] = useState<Officer[]>(initialOfficers);
  const [form, setForm] = useState<OfficerForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "current" | "alumni">("all");

  const currentOfficers = officers.filter((o) => o.isCurrent);
  const alumniOfficers = officers.filter((o) => !o.isCurrent);
  const filteredOfficers =
    filter === "current"
      ? currentOfficers
      : filter === "alumni"
        ? alumniOfficers
        : officers;

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEditForm(officer: Officer) {
    setForm({
      name: officer.name,
      role: officer.role,
      bio: officer.bio ?? "",
      email: officer.email ?? "",
      linkedin: officer.linkedin ?? "",
      imageUrl: officer.imageUrl ?? "",
      termStart: officer.termStart ?? "",
      termEnd: officer.termEnd ?? "",
    });
    setEditingId(officer.id);
    setShowForm(true);
    setError("");
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      name: form.name,
      role: form.role,
      bio: form.bio || null,
      email: form.email || null,
      linkedin: form.linkedin || null,
      imageUrl: form.imageUrl || null,
      termStart: form.termStart || null,
      termEnd: form.termEnd || null,
    };

    try {
      const url = editingId
        ? `/api/admin/officers/${editingId}`
        : "/api/admin/officers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const officer = await res.json();
      const updated: Officer = {
        ...officer,
        termStart: officer.termStart
          ? new Date(officer.termStart).toISOString().split("T")[0]
          : null,
        termEnd: officer.termEnd
          ? new Date(officer.termEnd).toISOString().split("T")[0]
          : null,
      };

      if (editingId) {
        setOfficers((prev) =>
          prev.map((o) => (o.id === editingId ? updated : o)),
        );
      } else {
        setOfficers((prev) => [...prev, updated]);
      }

      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this officer?")) return;

    try {
      const res = await fetch(`/api/admin/officers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setOfficers((prev) => prev.filter((o) => o.id !== id));
    } catch {
      setError("Failed to delete officer");
    }
  }

  async function handleToggleCurrent(officer: Officer) {
    try {
      const res = await fetch(`/api/admin/officers/${officer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCurrent: !officer.isCurrent }),
      });
      if (!res.ok) throw new Error();

      setOfficers((prev) =>
        prev.map((o) =>
          o.id === officer.id ? { ...o, isCurrent: !o.isCurrent } : o,
        ),
      );
    } catch {
      setError("Failed to update officer status");
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    const idx = officers.findIndex((o) => o.id === id);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === officers.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = [...officers];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    setOfficers(newOrder);

    try {
      const res = await fetch("/api/admin/officers/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder.map((o) => o.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOfficers(officers);
      setError("Failed to reorder officers");
    }
  }

  return (
    <>
      <Head>
        <title>Officers - Admin | JHU ACM</title>
      </Head>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Officers</h1>
          <p className="mt-1 text-gray-600">
            {currentOfficers.length} current, {alumniOfficers.length} alumni
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid"
        >
          + Add Officer
        </button>
      </div>

      {/* Error banner */}
      {error && !showForm && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1 rounded-lg bg-gray-200 p-1">
        {(["all", "current", "alumni"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab} ({tab === "all" ? officers.length : tab === "current" ? currentOfficers.length : alumniOfficers.length})
          </button>
        ))}
      </div>

      {/* Officers table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredOfficers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No officers found. Click &quot;+ Add Officer&quot; to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOfficers.map((officer) => (
                <tr key={officer.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMove(officer.id, "up")}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        title="Move up"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMove(officer.id, "down")}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        title="Move down"
                      >
                        <svg
                          className="h-4 w-4"
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
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {officer.imageUrl ? (
                        <img
                          src={officer.imageUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary">
                          {officer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {officer.name}
                        </div>
                        {officer.email && (
                          <div className="text-xs text-gray-500">
                            {officer.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {officer.role}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleCurrent(officer)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        officer.isCurrent
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {officer.isCurrent ? "Current" : "Alumni"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {officer.termStart || officer.termEnd
                      ? `${officer.termStart ?? "?"} - ${officer.termEnd ?? "present"}`
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(officer)}
                      className="mr-2 rounded px-3 py-1 text-sm text-primary hover:bg-primary-light"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(officer.id)}
                      className="rounded px-3 py-1 text-sm text-danger hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary">
                {editingId ? "Edit Officer" : "Add Officer"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={255}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    maxLength={500}
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm({ ...form, linkedin: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Photo URL
                </label>
                <input
                  type="url"
                  maxLength={500}
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Term Start
                  </label>
                  <input
                    type="date"
                    value={form.termStart}
                    onChange={(e) =>
                      setForm({ ...form, termStart: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Term End
                  </label>
                  <input
                    type="date"
                    value={form.termEnd}
                    onChange={(e) =>
                      setForm({ ...form, termEnd: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Officer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
