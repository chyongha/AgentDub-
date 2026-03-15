"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Docs", href: "/docs" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,10,15,0.85)",
        borderBottom: "1px solid rgba(200,241,53,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Icon mark */}
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: "var(--color-volt)" }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 14 L8 4 L10 10 L13 7 L16 14"
                stroke="#0a0a0f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="font-display text-xl tracking-widest"
            style={{ color: "var(--color-text)" }}
          >
          AGENT
            <span style={{ color: "var(--color-volt)" }}>DUB</span>
          </span>
        </Link>

        {/* Nav links — only shown when signed in */}
        {session && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-[var(--color-volt)] bg-[var(--color-volt-dim)]"
                      : "text-[var(--color-ash)] hover:text-[var(--color-text)] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Auth section */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div
              className="w-20 h-8 rounded animate-pulse"
              style={{ background: "var(--color-surface)" }}
            />
          ) : session ? (
            <div className="flex items-center gap-3">
              {/* User avatar */}
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={28}
                    height={28}
                    className="rounded-full ring-1"
                    style={{ ringColor: "var(--color-border)" }}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: "var(--color-volt-dim)",
                      color: "var(--color-volt)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <span
                  className="hidden sm:block text-sm"
                  style={{ color: "var(--color-ash)" }}
                >
                  {session.user?.name?.split(" ")[0]}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 rounded text-sm transition-all duration-150"
                style={{
                  color: "var(--color-ash)",
                  border: "1px solid rgba(136,136,160,0.2)",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.color =
                    "var(--color-text)";
                  (e.target as HTMLButtonElement).style.borderColor =
                    "rgba(136,136,160,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.color =
                    "var(--color-ash)";
                  (e.target as HTMLButtonElement).style.borderColor =
                    "rgba(136,136,160,0.2)";
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="btn-volt px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2"
            >
              {/* Google icon */}
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                <path
                  d="M18.17 10.23c0-.68-.06-1.33-.17-1.96H10v3.71h4.59a3.93 3.93 0 0 1-1.7 2.57v2.14h2.75c1.6-1.48 2.53-3.66 2.53-6.46z"
                  fill="#0a0a0f"
                  fillOpacity="0.7"
                />
                <path
                  d="M10 18.5c2.3 0 4.24-.76 5.65-2.06l-2.75-2.14c-.77.51-1.74.82-2.9.82-2.23 0-4.12-1.5-4.79-3.53H2.36v2.21A8.5 8.5 0 0 0 10 18.5z"
                  fill="#0a0a0f"
                  fillOpacity="0.7"
                />
                <path
                  d="M5.21 11.59A5.1 5.1 0 0 1 4.94 10c0-.55.09-1.08.27-1.59V6.2H2.36A8.5 8.5 0 0 0 1.5 10c0 1.37.33 2.67.86 3.8l2.85-2.21z"
                  fill="#0a0a0f"
                  fillOpacity="0.7"
                />
                <path
                  d="M10 4.88c1.26 0 2.38.43 3.27 1.28l2.44-2.44C14.23 2.34 12.3 1.5 10 1.5A8.5 8.5 0 0 0 2.36 6.2l2.85 2.21C5.88 6.39 7.77 4.88 10 4.88z"
                  fill="#0a0a0f"
                  fillOpacity="0.7"
                />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
