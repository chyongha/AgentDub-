"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese",
  "Japanese", "Mandarin", "Korean", "Arabic", "Hindi",
  "Russian", "Dutch", "Polish", "Turkish", "Swedish",
];

const ACCEPTED = ".mp3,.mp4,.wav,.mov,.m4a,.webm";
const MAX_MB = 500;

type Step = "upload" | "configure" | "processing";

export function NewProjectView() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [error, setError] = useState("");

  /* ── file validation ── */
  const handleFile = (f: File) => {
    setError("");
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setProjectTitle(f.name.replace(/\.[^.]+$/, ""));
    setStep("configure");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  /* ── fake submit (pipeline wired in next iteration) ── */
  const handleSubmit = () => {
    if (!targetLang) { setError("Please select a target language."); return; }
    setStep("processing");
    setTimeout(() => router.push("/dashboard"), 2500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs mb-8 transition-colors"
          style={{ color: "var(--color-ash)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ash)")}
        >
          ← Back
        </button>

        <h1 className="font-display text-5xl mb-1" style={{ color: "var(--color-text)" }}>
          NEW PROJECT
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--color-ash)" }}>
          Upload a file and configure your dub settings.
        </p>

        {/* Step: upload */}
        {step === "upload" && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className="relative rounded-xl flex flex-col items-center justify-center py-24 cursor-pointer transition-all duration-200"
            style={{
              border: `2px dashed ${dragOver ? "var(--color-volt)" : "rgba(200,241,53,0.2)"}`,
              background: dragOver ? "rgba(200,241,53,0.04)" : "rgba(17,17,24,0.5)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--color-volt-dim)", border: "1px solid var(--color-border)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="var(--color-volt)" strokeWidth="1.5">
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round"/>
                <polyline points="16 8 12 4 8 8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="4" x2="12" y2="16" strokeLinecap="round"/>
              </svg>
            </div>

            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              Drop your file here or <span style={{ color: "var(--color-volt)" }}>browse</span>
            </p>
            <p className="text-xs" style={{ color: "var(--color-ash)" }}>
              MP3, MP4, WAV, MOV, M4A — up to {MAX_MB} MB
            </p>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={onInputChange}
            />
          </div>
        )}

        {/* Step: configure */}
        {step === "configure" && file && (
          <div className="space-y-5">

            {/* File pill */}
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{ background: "rgba(200,241,53,0.06)", border: "1px solid rgba(200,241,53,0.2)" }}
            >
              <div
                className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                style={{ background: "var(--color-volt)", color: "#0a0a0f" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{file.name}</p>
                <p className="text-xs" style={{ color: "var(--color-ash)" }}>
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={() => { setFile(null); setStep("upload"); }}
                className="text-xs transition-colors shrink-0"
                style={{ color: "var(--color-ash)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ash)")}
              >
                Remove
              </button>
            </div>

            {/* Project title */}
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase mb-2" style={{ color: "var(--color-ash)" }}>
                Project Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(17,17,24,0.8)",
                  border: "1px solid rgba(200,241,53,0.15)",
                  color: "var(--color-text)",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(200,241,53,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(200,241,53,0.15)")}
              />
            </div>

            {/* Target language */}
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase mb-2" style={{ color: "var(--color-ash)" }}>
                Target Language
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setTargetLang(lang)}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-150"
                    style={{
                      background: targetLang === lang ? "var(--color-volt)" : "rgba(17,17,24,0.8)",
                      color: targetLang === lang ? "#0a0a0f" : "var(--color-ash)",
                      border: `1px solid ${targetLang === lang ? "var(--color-volt)" : "rgba(200,241,53,0.15)"}`,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs" style={{ color: "#ff6b6b" }}>{error}</p>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setFile(null); setStep("upload"); }}
                className="px-5 py-2.5 rounded text-sm transition-all"
                style={{ border: "1px solid rgba(136,136,160,0.2)", color: "var(--color-ash)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-volt flex-1 py-2.5 rounded text-sm font-medium"
              >
                Start Dubbing →
              </button>
            </div>
          </div>
        )}

        {/* Step: processing */}
        {step === "processing" && (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-24 text-center"
            style={{ border: "1px solid var(--color-border)", background: "rgba(17,17,24,0.5)" }}
          >
            <div
              className="w-12 h-12 rounded-full mb-5 border-2 animate-spin"
              style={{ borderColor: "var(--color-volt)", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
              Submitting your project…
            </p>
            <p className="text-xs" style={{ color: "var(--color-ash)" }}>
              Redirecting to dashboard
            </p>
          </div>
        )}

        {/* Upload error (shown on upload step) */}
        {step === "upload" && error && (
          <p className="mt-3 text-xs text-center" style={{ color: "#ff6b6b" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
