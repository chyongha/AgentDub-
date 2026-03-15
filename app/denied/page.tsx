"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DeniedContent() {
  const params  = useSearchParams();
  const reason  = params.get("reason");
  const email   = params.get("email");

  const isNoEmail       = reason === "no_email";
  const isNotWhitelisted = reason === "not_whitelisted";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.25)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="#ff5050" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display text-4xl mb-4" style={{ color: "var(--color-text)" }}>
          ACCESS <span style={{ color: "#ff5050" }}>DENIED</span>
        </h1>

        {/* ── Not whitelisted ── */}
        {isNotWhitelisted && (
          <>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-ash)" }}>
              The account you signed in with is not on the permitted list for this application.
            </p>

            {/* Show the blocked email clearly */}
            {email && (
              <div
                className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg mb-4 mx-auto"
                style={{
                  background: "rgba(255,80,80,0.07)",
                  border: "1px solid rgba(255,80,80,0.2)",
                }}
              >
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" stroke="#ff7070" strokeWidth="1.5">
                  <path d="M2.5 5.5h15v10h-15z" rx="1" strokeLinejoin="round" />
                  <path d="M2.5 5.5l7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-mono" style={{ color: "#ff9090" }}>
                  {email}
                </span>
              </div>
            )}

            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-ash)" }}>
              This email is not allowed.{" "}
              <span style={{ color: "var(--color-text)" }}>Please switch to an authorised account</span>
              {" "}or contact the administrator to have your email added.
            </p>

            {/* What to do box */}
            <div
              className="rounded-lg px-4 py-3 mb-8 text-left text-xs space-y-2"
              style={{
                background: "rgba(17,17,24,0.8)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p className="font-mono tracking-widest uppercase text-[10px]" style={{ color: "var(--color-volt)" }}>
                What to do
              </p>
              <p style={{ color: "var(--color-ash)" }}>
                ① Click <span style={{ color: "var(--color-text)" }}>"Try a different account"</span> below and sign in with an authorised Google account.
              </p>
              <p style={{ color: "var(--color-ash)" }}>
                ② Or ask the administrator to whitelist <span style={{ color: "var(--color-text)" }}>{email ?? "your email"}</span> in the database.
              </p>
            </div>
          </>
        )}

        {/* ── No email on Google account ── */}
        {isNoEmail && (
          <>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-ash)" }}>
              We couldn&apos;t retrieve an email address from your Google account.
              Please sign in with an account that has a verified email address.
            </p>
          </>
        )}

        {/* ── Generic fallback ── */}
        {!isNoEmail && !isNotWhitelisted && (
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-ash)" }}>
            You are not authorised to access this application.
            Please try a different account or contact the administrator.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded text-sm transition-all"
            style={{
              border: "1px solid rgba(136,136,160,0.2)",
              color: "var(--color-ash)",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ash)")}
          >
            ← Back to Home
          </Link>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="btn-volt px-5 py-2.5 rounded text-sm font-medium"
          >
            Try a different account
          </button>
        </div>

      </div>
    </div>
  );
}

export default function DeniedPage() {
  return (
    <Suspense>
      <DeniedContent />
    </Suspense>
  );
}