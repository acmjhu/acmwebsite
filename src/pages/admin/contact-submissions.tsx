import Head from "next/head";
import type { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import { useState } from "react";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  submissions: Submission[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    props: {
      submissions: submissions.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        message: s.message,
        isRead: s.isRead,
        createdAt: s.createdAt.toISOString(),
      })),
    },
  };
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SubmissionCard({
  submission: initial,
}: {
  submission: Submission;
}) {
  const [isRead, setIsRead] = useState(initial.isRead);
  const [toggling, setToggling] = useState(false);

  async function toggleRead() {
    setToggling(true);
    try {
      const res = await fetch("/api/admin/contact-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial.id, isRead: !isRead }),
      });
      if (res.ok) {
        setIsRead(!isRead);
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        isRead ? "border-gray-200" : "border-l-4 border-l-primary border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={`text-sm ${isRead ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}
          >
            {initial.name}
          </h3>
          <p className="text-sm text-gray-500">{initial.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-xs text-gray-400">
            {formatDate(initial.createdAt)}
          </span>
          <button
            onClick={toggleRead}
            disabled={toggling}
            className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              isRead
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                : "bg-primary-light text-primary hover:bg-blue-100"
            }`}
          >
            {isRead ? "Read" : "Unread"}
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
        {initial.message}
      </p>
    </div>
  );
}

export default function ContactSubmissionsPage({ submissions }: Props) {
  return (
    <>
      <Head>
        <title>Messages | Admin | ACM@JHU</title>
      </Head>

      <h1 className="text-2xl font-bold text-primary-dark">
        Contact Submissions
      </h1>
      <p className="mt-1 text-gray-600">
        Messages submitted through the contact form.
      </p>

      <div className="mt-6 space-y-4">
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        ) : (
          submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))
        )}
      </div>
    </>
  );
}
