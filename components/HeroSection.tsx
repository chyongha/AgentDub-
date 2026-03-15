"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Mandarin", "Portuguese", "Arabic"];

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">

      {/* Decorative orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(200,241,53,0.04) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Badge */}
      <div
        className="mb-8 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase"
        style={{
          border: "1px solid rgba(200,241,53,0.25)",
          color: "var(--color-volt)",
          background: "rgba(200,241,53,0.06)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-volt)] animate-pulse" />
        AI-Powered Audio Dubbing
      </div>

      {/* Headline */}
      <h1
        className="font-display text-center leading-none mb-6"
        style={{ fontSize: "clamp(4rem, 12vw, 9rem)", color: "var(--color-text)" }}
      >
        SPEAK
        <br />
        <span style={{ color: "var(--color-volt)", WebkitTextStroke: "0px" }}>
          EVERY
        </span>
        <br />
        LANGUAGE
      </h1>

      {/* Subheading */}
      <p
        className="text-center max-w-xl mb-10 leading-relaxed"
        style={{ color: "var(--color-ash)", fontSize: "1.05rem" }}
      >
        Upload any audio or video. AgentDub transcribes, translates, and re-voices
        it with AI — preserving tone, pacing, and emotion across{" "}
        <span style={{ color: "var(--color-text)" }}>50+ languages</span>.
      </p>

      {/* CTA */}
      {session ? (
        <Link
          href="/dashboard"
          className="btn-volt px-8 py-3 rounded text-sm font-medium tracking-wide"
        >
          Go to Dashboard →
        </Link>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="btn-volt px-8 py-3 rounded text-sm font-medium tracking-wide"
        >
          Get Started Free
        </button>
      )}

      {/* Language ticker */}
      <div className="mt-16 w-full max-w-2xl overflow-hidden relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--color-bg), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--color-bg), transparent)" }}
        />
        <div className="flex gap-3 animate-[scroll_18s_linear_infinite]">
          {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
            <span
              key={i}
              className="whitespace-nowrap px-3 py-1 rounded text-xs font-mono shrink-0"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-ash)",
                background: "var(--color-surface)",
              }}
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-24">
        {[
          {
            icon: "⚡",
            title: "Fast Turnaround",
            desc: "Most projects complete in under 5 minutes regardless of file length.",
          },
          {
            icon: "🎙️",
            title: "Voice Cloning",
            desc: "Preserve the original speaker's voice characteristics in the target language.",
          },
          {
            icon: "🌐",
            title: "50+ Languages",
            desc: "From Spanish to Swahili — broad language coverage powered by state-of-the-art models.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="glass-card rounded-lg p-5"
            style={{ background: "rgba(17,17,24,0.6)" }}
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-ash)" }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
