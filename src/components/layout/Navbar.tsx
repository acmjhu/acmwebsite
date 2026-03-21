import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import initiatives from "@/data/initiatives";

interface NavLink {
  href: string;
  label: string;
}

interface NavDropdown {
  label: string;
  children: NavLink[];
}

type NavItem = NavLink | NavDropdown;

function isDropdown(item: NavItem): item is NavDropdown {
  return "children" in item;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/lineages", label: "Lineages" },
  { label: "Initiatives", children: initiatives },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-primary text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ACM@JHU
        </Link>

        {/* Desktop links */}
        <ul className="hidden gap-8 md:flex" ref={dropdownRef}>
          {navItems.map((item) =>
            isDropdown(item) ? (
              <li key={item.label} className="relative flex items-center">
                <button
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-white/80"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  aria-expanded={openDropdown === item.label}
                >
                  {item.label}
                  <svg
                    className={`h-3 w-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === item.label && (
                  <ul className="absolute right-0 top-full z-50 mt-3 min-w-[160px] rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-white/80"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="border-t border-white/20 px-6 pb-4 md:hidden">
          {navItems.map((item) =>
            isDropdown(item) ? (
              <li key={item.label}>
                <button
                  className="flex w-full items-center justify-between py-2 text-sm font-medium transition-colors hover:text-white/80"
                  onClick={() =>
                    setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                  }
                >
                  {item.label}
                  <svg
                    className={`h-3 w-3 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileExpanded === item.label && (
                  <ul className="ml-4 border-l border-white/20 pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block py-2 text-sm font-medium transition-colors hover:text-white/80"
                          onClick={() => {
                            setMenuOpen(false);
                            setMobileExpanded(null);
                          }}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-medium transition-colors hover:text-white/80"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      )}
    </nav>
  );
}
