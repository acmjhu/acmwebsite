import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-primary-dark text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            ACM@JHU <span className="text-sm font-normal opacity-70">Admin</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
