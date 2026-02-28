import { useState, FormEvent } from "react";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { prisma } from "@/lib/prisma";
import OfficerCard from "@/components/ui/OfficerCard";

interface Officer {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  linkedin: string | null;
  isCurrent: boolean;
}

export const getStaticProps: GetStaticProps<{
  currentOfficers: Officer[];
  pastOfficers: Officer[];
}> = async () => {
  try {
    const officers = await prisma.officer.findMany({
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        imageUrl: true,
        linkedin: true,
        isCurrent: true,
      },
    });

    return {
      props: {
        currentOfficers: officers.filter((o) => o.isCurrent),
        pastOfficers: officers.filter((o) => !o.isCurrent),
      },
      revalidate: 300,
    };
  } catch {
    return {
      props: { currentOfficers: [], pastOfficers: [] },
      revalidate: 60,
    };
  }
};

const benefits = [
  {
    title: "Office Access",
    description: "24/7 J-Card access to our office in Malone Hall",
    icon: "🏢",
  },
  {
    title: "Storage",
    description: "50 GiB of personal storage on our servers",
    icon: "💾",
  },
  {
    title: "Email",
    description: "Email address at acm.jhu.edu / jhuacm.org",
    icon: "✉️",
  },
  {
    title: "Virtual Machines",
    description: "VMs and SSH access for your projects",
    icon: "🖥️",
  },
  {
    title: "Workstations & Printers",
    description: "Access to workstations, printers, and other hardware",
    icon: "🖨️",
  },
  {
    title: "GitLab",
    description: "Private GitLab instance for your repositories",
    icon: "🔀",
  },
];

export default function AboutPage({
  currentOfficers,
  pastOfficers,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [alumniOpen, setAlumniOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) throw new Error();

      setSubmitStatus("success");
      setFormState({ name: "", email: "", message: "" });
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <>
      <Head>
        <title>About - JHU ACM</title>
        <meta
          name="description"
          content="Learn about the Johns Hopkins University ACM Chapter, our officers, membership benefits, and how to get in touch."
        />
      </Head>

      <div className="bg-gray-50">
        {/* Hero */}
        <section className="bg-primary py-16 text-white">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">About ACM@JHU</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Johns Hopkins University&apos;s chapter of the Association for
              Computing Machinery
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border-t-[3px] border-t-primary-mid bg-white/95 p-8 shadow-lg backdrop-blur-xl sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary">
                Our Mission
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                We are a student organization of the Johns Hopkins University
                dedicated to furthering the knowledge and advancement of
                computers and information technology through the free exchange of
                ideas and information.
              </p>
            </div>
          </div>
        </section>

        {/* Membership Benefits */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">
              Membership Benefits
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="text-3xl">{benefit.icon}</span>
                  <h3 className="mt-3 text-lg font-bold text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Officers */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">
              Current Officers
            </h2>
            {currentOfficers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentOfficers.map((officer) => (
                  <OfficerCard key={officer.id} {...officer} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Officer information coming soon.
              </p>
            )}
          </div>
        </section>

        {/* Alumni / Past Officers */}
        {pastOfficers.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-6xl px-6">
              <button
                onClick={() => setAlumniOpen(!alumniOpen)}
                className="mx-auto flex items-center gap-2 rounded-lg bg-primary/10 px-6 py-3 font-medium text-primary transition-colors hover:bg-primary/20"
              >
                Alumni &amp; Past Officers
                <svg
                  className={`h-5 w-5 transition-transform ${alumniOpen ? "rotate-180" : ""}`}
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
              {alumniOpen && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pastOfficers.map((officer) => (
                    <OfficerCard key={officer.id} {...officer} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary">
              Get in Touch
            </h2>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Info */}
              <div className="rounded-2xl bg-white/95 p-8 shadow-lg backdrop-blur-xl">
                <h3 className="mb-6 text-lg font-bold text-primary">
                  Contact Info
                </h3>
                <div className="space-y-4">
                  <a
                    href="mailto:jhuacmofficers@gmail.com"
                    className="flex items-center gap-3 text-gray-700 transition-colors hover:text-primary"
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    jhuacmofficers@gmail.com
                  </a>
                  <a
                    href="https://instagram.com/jhuacm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 transition-colors hover:text-primary"
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    @jhuacm
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="rounded-2xl bg-white/95 p-8 shadow-lg backdrop-blur-xl">
                <h3 className="mb-6 text-lg font-bold text-primary">
                  Send Us a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={255}
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={255}
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      maxLength={5000}
                      rows={4}
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitStatus === "loading"}
                    className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-mid disabled:opacity-50"
                  >
                    {submitStatus === "loading" ? "Sending..." : "Send Message"}
                  </button>
                  {submitStatus === "success" && (
                    <p className="text-sm text-success">
                      Message sent successfully!
                    </p>
                  )}
                  {submitStatus === "error" && (
                    <p className="text-sm text-danger">
                      Failed to send message. Please try again.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Special Thanks */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border-t-[3px] border-t-primary-mid bg-white/95 p-8 text-center shadow-lg backdrop-blur-xl sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-primary">
                Special Thanks
              </h2>
              <p className="mx-auto max-w-2xl text-gray-700">
                We would like to thank the Johns Hopkins University Department
                of Computer Science, the Whiting School of Engineering, and all
                of our members and alumni who continue to support and contribute
                to our community.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
