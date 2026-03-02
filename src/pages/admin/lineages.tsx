import { useState, FormEvent } from "react";
import Head from "next/head";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { prisma } from "@/lib/prisma";

interface LineageMember {
  id: string;
  name: string;
  treeName: string | null;
  role: string | null;
  graduationYear: number | null;
  mentorId: string | null;
  imageUrl: string | null;
}

type MemberForm = {
  name: string;
  treeName: string;
  role: string;
  graduationYear: string;
  mentorId: string;
  imageUrl: string;
};

const emptyForm: MemberForm = {
  name: "",
  treeName: "",
  role: "",
  graduationYear: "",
  mentorId: "",
  imageUrl: "",
};

export const getServerSideProps: GetServerSideProps<{
  members: LineageMember[];
}> = async () => {
  try {
    const members = await prisma.lineageMember.findMany({
      orderBy: [{ treeName: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        treeName: true,
        role: true,
        graduationYear: true,
        mentorId: true,
        imageUrl: true,
      },
    });
    return { props: { members } };
  } catch {
    return { props: { members: [] } };
  }
};

export default function AdminLineagesPage({
  members: initialMembers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [members, setMembers] = useState<LineageMember[]>(initialMembers);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTree, setFilterTree] = useState("all");

  const treeNames = Array.from(
    new Set(members.map((m) => m.treeName ?? "Unassigned")),
  ).sort();

  const filteredMembers =
    filterTree === "all"
      ? members
      : members.filter((m) => (m.treeName ?? "Unassigned") === filterTree);

  // Mentor dropdown: members in the same tree, excluding self
  const mentorCandidates = members.filter(
    (m) =>
      (m.treeName ?? "") === (form.treeName ?? "") && m.id !== editingId,
  );

  function getMentorName(mentorId: string | null) {
    if (!mentorId) return null;
    return members.find((m) => m.id === mentorId)?.name ?? null;
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEditForm(member: LineageMember) {
    setForm({
      name: member.name,
      treeName: member.treeName ?? "",
      role: member.role ?? "",
      graduationYear: member.graduationYear ? String(member.graduationYear) : "",
      mentorId: member.mentorId ?? "",
      imageUrl: member.imageUrl ?? "",
    });
    setEditingId(member.id);
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
      treeName: form.treeName || null,
      role: form.role || null,
      graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
      mentorId: form.mentorId || null,
      imageUrl: form.imageUrl || null,
    };

    try {
      const url = editingId
        ? `/api/admin/lineages/${editingId}`
        : "/api/admin/lineages";
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

      const saved: LineageMember = await res.json();

      if (editingId) {
        setMembers((prev) => prev.map((m) => (m.id === editingId ? saved : m)));
      } else {
        setMembers((prev) =>
          [...prev, saved].sort((a, b) => {
            const ta = a.treeName ?? "";
            const tb = b.treeName ?? "";
            return ta !== tb ? ta.localeCompare(tb) : a.name.localeCompare(b.name);
          }),
        );
      }

      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lineage member?")) return;
    try {
      const res = await fetch(`/api/admin/lineages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member");
    }
  }

  return (
    <>
      <Head>
        <title>Lineages - Admin | JHU ACM</title>
      </Head>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Lineages</h1>
          <p className="mt-1 text-gray-600">
            {members.length} member{members.length !== 1 ? "s" : ""} across{" "}
            {treeNames.length} tree{treeNames.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-mid"
        >
          + Add Member
        </button>
      </div>

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

      {/* Tree filter tabs */}
      {treeNames.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1 rounded-lg bg-gray-200 p-1">
          {(["all", ...treeNames] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTree(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterTree === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "all"
                ? `All (${members.length})`
                : `${tab} (${members.filter((m) => (m.treeName ?? "Unassigned") === tab).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Members table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredMembers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No members found. Click &quot;+ Add Member&quot; to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Tree</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Grad Year</th>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.treeName ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.role ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.graduationYear ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getMentorName(member.mentorId) ?? (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => openEditForm(member)}
                      className="mr-2 rounded px-3 py-1 text-sm text-primary hover:bg-primary-light"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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
                {editingId ? "Edit Member" : "Add Member"}
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Family Tree
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Lambda Tree"
                    value={form.treeName}
                    onChange={(e) =>
                      setForm({ ...form, treeName: e.target.value, mentorId: "" })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. President"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    min={1876}
                    max={2100}
                    value={form.graduationYear}
                    onChange={(e) =>
                      setForm({ ...form, graduationYear: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mentor
                </label>
                <select
                  value={form.mentorId}
                  onChange={(e) =>
                    setForm({ ...form, mentorId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">— None (root member) —</option>
                  {mentorCandidates.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.graduationYear ? ` (${m.graduationYear})` : ""}
                    </option>
                  ))}
                </select>
                {form.treeName && mentorCandidates.length === 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    No other members in this tree yet.
                  </p>
                )}
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
                      : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
