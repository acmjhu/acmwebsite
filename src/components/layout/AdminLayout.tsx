import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Events", href: "/admin/events" },
  { label: "Signups", href: "/admin/signups" },
  { label: "Officers", href: "/admin/officers" },
  { label: "Lineages", href: "/admin/lineages" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "Messages", href: "/admin/messages" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="bg-primary-dark text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            ACM@JHU{" "}
            <span className="text-sm font-normal opacity-70">Admin</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-300 transition-colors hover:text-white"
            >
              View site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-6">
        {/* Sidebar */}
        <aside className="mr-8 w-48 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? router.pathname === "/admin"
                  : router.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
