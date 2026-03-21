import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef, type FormEvent } from "react";
import type { MapEntry } from "@/components/InternMap";

const InternMap = dynamic(() => import("@/components/InternMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
      Loading map...
    </div>
  ),
});

const TERMS = [
  "Spring 2025", "Summer 2025", "Fall 2025",
  "Spring 2026", "Summer 2026", "Fall 2026",
  "Spring 2027", "Summer 2027", "Fall 2027",
];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const emptyForm = {
  name: "", email: "", company: "", role: "",
  term: "", year: "", lat: "", lng: "",
  contact: "", photo: null as File | null,
};

export default function InternMapPage() {
  const [entries, setEntries] = useState<MapEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/intern-map")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    let photoUrl: string | null = null;
    if (form.photo) {
      photoUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(form.photo!);
      });
    }

    try {
      const res = await fetch("/api/intern-map/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          role: form.role,
          term: form.term,
          year: form.year,
          lat: form.lat,
          lng: form.lng,
          contact: form.contact || null,
          photoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong");
        return;
      }

      setStatus("success");
      setForm(emptyForm);
      setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <>
      <Head>
        <title>InternMap - JHU ACM</title>
        <meta name="description" content="See where JHU CS students are interning." />
      </Head>

      <div className="bg-gray-50">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">InternMap</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              See where JHU CS students are interning across the country and around the world.
            </p>
          </div>
        </section>

        {/* Map */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <InternMap entries={entries} />
          </div>
        </section>

        {/* Form */}
        <section className="pb-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="rounded-2xl bg-white/95 p-8 shadow-lg backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-primary">Want to be on the map?</h2>
              <p className="mt-1 text-sm text-gray-500">
                Submit your info and an admin will review it before it appears.
              </p>

              {status === "success" ? (
                <div className="mt-6 rounded-lg bg-green-50 px-4 py-6 text-center">
                  <p className="font-medium text-green-700">Submitted! We will review your entry soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {errorMsg && (
                    <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{errorMsg}</p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        JHU Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        maxLength={255}
                        placeholder="you@jhu.edu"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={255}
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Term <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.term}
                        onChange={(e) => setForm({ ...form, term: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select term</option>
                        {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Class Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select year</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Latitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="any"
                        min={-90}
                        max={90}
                        placeholder="e.g. 37.7749"
                        value={form.lat}
                        onChange={(e) => setForm({ ...form, lat: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Longitude <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="any"
                        min={-180}
                        max={180}
                        placeholder="e.g. -122.4194"
                        value={form.lng}
                        onChange={(e) => setForm({ ...form, lng: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Find coordinates by right-clicking your office location on{" "}
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                      Google Maps
                    </a>
                    .
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Info <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      placeholder="LinkedIn, email, etc."
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-mid"
                    />
                    {photoPreview && (
                      <img src={photoPreview} alt="Preview" className="mt-2 h-16 w-16 rounded-full object-cover" />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
                  >
                    {status === "loading" ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
