"use client";

import { type Session } from "next-auth";
import { useState, useRef, useCallback, useEffect } from "react";

interface DashboardViewProps {
  session: Session;
}

const LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "es", label: "Spanish",    flag: "🇪🇸" },
  { code: "fr", label: "French",     flag: "🇫🇷" },
  { code: "de", label: "German",     flag: "🇩🇪" },
  { code: "it", label: "Italian",    flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ja", label: "Japanese",   flag: "🇯🇵" },
  { code: "zh", label: "Mandarin",   flag: "🇨🇳" },
  { code: "ko", label: "Korean",     flag: "🇰🇷" },
  { code: "ar", label: "Arabic",     flag: "🇸🇦" },
  { code: "hi", label: "Hindi",      flag: "🇮🇳" },
  { code: "ru", label: "Russian",    flag: "🇷🇺" },
  { code: "nl", label: "Dutch",      flag: "🇳🇱" },
  { code: "pl", label: "Polish",     flag: "🇵🇱" },
  { code: "tr", label: "Turkish",    flag: "🇹🇷" },
  { code: "sv", label: "Swedish",    flag: "🇸🇪" },
  { code: "id", label: "Indonesian", flag: "🇮🇩" },
  { code: "tl", label: "Filipino",   flag: "🇵🇭" },
];

const ACCEPTED_TYPES = [
  "audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a",
  "video/mp4", "video/quicktime", "video/webm",
];
const ACCEPTED_EXT = ".mp3,.wav,.mp4,.m4a,.mov,.webm";
const MAX_MB = 500;
const WARN_MB = 25; // show a size warning above this threshold

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="var(--color-volt)" strokeWidth="1.5">
      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
      <polyline points="16 8 12 4 8 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="4" x2="12" y2="16" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function DashboardView({ session }: DashboardViewProps) {
  const firstName = session.user?.name?.split(" ")[0] ?? "there";
  const inputRef   = useRef<HTMLInputElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [dragOver,     setDragOver]     = useState(false);
  const [file,         setFile]         = useState<File | null>(null);
  const [fileError,    setFileError]    = useState("");
  const [targetLang,   setTargetLang]   = useState("");
  const [dropOpen,     setDropOpen]     = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl,     setAudioUrl]     = useState<string | null>(null);
  const [audioFilename,setAudioFilename]= useState("");
  const [error,        setError]        = useState("");

  // Revoke old object URL to avoid memory leaks when a new dub is generated
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ── File handling ──────────────────────────────────────────────────────────
  const acceptFile = useCallback((f: File) => {
    setFileError("");
    setError("");
    setAudioUrl(null);
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(mp3|wav|mp4|m4a|mov|webm)$/i)) {
      setFileError("Unsupported file type. Please upload MP3, WAV, MP4, M4A, MOV, or WEBM.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFileError(`File exceeds ${MAX_MB} MB limit.`);
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, [acceptFile]);

  // ── Cancel in-flight request ───────────────────────────────────────────────
  const handleCancel = () => {
    abortRef.current?.abort();
    setIsProcessing(false);
    setError("Request cancelled.");
  };

  // ── Generate Dub ───────────────────────────────────────────────────────────
  const handleGenerateDub = async () => {
    if (!file || !targetLang) return;

    const controller = new AbortController();
    abortRef.current  = controller;

    setIsProcessing(true);
    setError("");
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("targetLanguage", selectedLang!.label);

      const res = await fetch("/api/dub", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = `Request failed with status ${res.status}.`;
        try {
          const json = await res.json();
          message = json.error ?? message;
        } catch {
          // response wasn't JSON — use the default message
        }
        throw new Error(message);
      }

      const blob    = await res.blob();
      const url     = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      setAudioUrl(url);
      setAudioFilename(`${baseName}_dubbed_${selectedLang!.label}.mp3`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // cancelled — already handled
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === targetLang);
  const canSubmit    = !!file && !!targetLang && !isProcessing;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10 pt-6">
          <p className="text-xs font-mono tracking-widest uppercase mb-1" style={{ color: "var(--color-ash)" }}>
            Welcome back
          </p>
          <h1 className="font-display text-6xl leading-none" style={{ color: "var(--color-text)" }}>
            HEY,{" "}
            <span style={{ color: "var(--color-volt)" }}>
              {firstName.toUpperCase()}
            </span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-ash)" }}>
            Upload a file, pick a language, and let AgentDub do the rest.
          </p>
        </div>

        {/* ── Main card ── */}
        <div
          className="rounded-2xl overflow-visible"
          style={{ border: "1px solid var(--color-border)", background: "rgba(17,17,24,0.8)" }}
        >
          {/* Card header bar */}
          <div
            className="px-6 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(10,10,15,0.5)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-volt)" }} />
            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--color-ash)" }}>
              New Dub
            </span>
          </div>

          <div className="p-6 space-y-6">

            {/* ── Step 1: Upload ── */}
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "var(--color-ash)" }}>
                01 — Source File
              </label>

              {!file ? (
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className="relative rounded-xl flex flex-col items-center justify-center py-14 cursor-pointer transition-all duration-200 select-none"
                  style={{
                    border: `2px dashed ${dragOver ? "var(--color-volt)" : "rgba(200,241,53,0.18)"}`,
                    background: dragOver ? "rgba(200,241,53,0.04)" : "rgba(10,10,15,0.4)",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors"
                    style={{
                      background: dragOver ? "rgba(200,241,53,0.15)" : "rgba(200,241,53,0.07)",
                      color: "var(--color-volt)",
                    }}
                  >
                    <UploadIcon />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                    Drop your file here or <span style={{ color: "var(--color-volt)" }}>browse</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-ash)" }}>
                    MP3, WAV, MP4, M4A, MOV, WEBM · max {MAX_MB} MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXT}
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                  style={{
                    background: "rgba(200,241,53,0.05)",
                    border: "1px solid rgba(200,241,53,0.2)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(200,241,53,0.1)" }}
                  >
                    <FileIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                      {file.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-ash)" }}>
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-0.5 mx-2">
                    {[3,5,8,6,9,5,7,4,6,8,5,3].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{ height: `${h * 2}px`, background: "var(--color-volt)", opacity: 0.5 + (i % 3) * 0.15 }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => { setFile(null); setFileError(""); setAudioUrl(null); setError(""); }}
                    disabled={isProcessing}
                    className="text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ color: "var(--color-ash)", border: "1px solid rgba(136,136,160,0.2)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ash)")}
                  >
                    Remove
                  </button>
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-xs" style={{ color: "#ff6b6b" }}>{fileError}</p>
              )}

              {/* Large file warning — shown when file is accepted but big */}
              {file && file.size > WARN_MB * 1024 * 1024 && (
                <div
                  className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "rgba(255,180,0,0.07)",
                    border: "1px solid rgba(255,180,0,0.25)",
                    color: "#ffb347",
                  }}
                >
                  <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10 3L2 17h16L10 3z" strokeLinejoin="round" />
                    <path d="M10 8v4M10 13.5v.5" strokeLinecap="round" />
                  </svg>
                  Large file ({formatBytes(file.size)}) — processing may take several minutes. Keep this tab open.
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--color-border)" }} />

            {/* ── Step 2: Language ── */}
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "var(--color-ash)" }}>
                02 — Target Language
              </label>

              <div className="relative">
                <button
                  onClick={() => !isProcessing && setDropOpen(o => !o)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(10,10,15,0.6)",
                    border: `1px solid ${dropOpen ? "rgba(200,241,53,0.4)" : "rgba(200,241,53,0.15)"}`,
                    color: selectedLang ? "var(--color-text)" : "var(--color-ash)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {selectedLang ? (
                      <><span>{selectedLang.flag}</span><span>{selectedLang.label}</span></>
                    ) : (
                      "Select a language…"
                    )}
                  </span>
                  <span
                    className="transition-transform duration-200"
                    style={{ transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--color-ash)" }}
                  >
                    <ChevronIcon />
                  </span>
                </button>

                {dropOpen && (
                  <div
                    className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(15,15,22,0.98)",
                      border: "1px solid rgba(200,241,53,0.2)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <div className="max-h-56 overflow-y-auto py-1">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setTargetLang(lang.code); setDropOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                          style={{
                            background: targetLang === lang.code ? "rgba(200,241,53,0.08)" : "transparent",
                            color: targetLang === lang.code ? "var(--color-volt)" : "var(--color-text)",
                          }}
                          onMouseEnter={e => { if (targetLang !== lang.code) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                          onMouseLeave={e => { if (targetLang !== lang.code) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                          {targetLang === lang.code && (
                            <span className="ml-auto text-xs" style={{ color: "var(--color-volt)" }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--color-border)" }} />

            {/* ── Step 3: Generate button ── */}
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase mb-3" style={{ color: "var(--color-ash)" }}>
                03 — Generate
              </label>

              <button
                onClick={handleGenerateDub}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200"
                style={
                  isProcessing
                    ? {
                        background: "rgba(200,241,53,0.1)",
                        color: "rgba(200,241,53,0.6)",
                        border: "1px solid rgba(200,241,53,0.2)",
                        cursor: "not-allowed",
                      }
                    : canSubmit
                    ? {
                        background: "var(--color-volt)",
                        color: "#0a0a0f",
                        boxShadow: "0 0 24px rgba(200,241,53,0.25)",
                      }
                    : {
                        background: "rgba(200,241,53,0.06)",
                        color: "rgba(200,241,53,0.3)",
                        cursor: "not-allowed",
                        border: "1px solid rgba(200,241,53,0.1)",
                      }
                }
                onMouseEnter={e => {
                  if (canSubmit && !isProcessing) {
                    e.currentTarget.style.boxShadow = "0 0 36px rgba(200,241,53,0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  if (canSubmit && !isProcessing) {
                    e.currentTarget.style.boxShadow = "0 0 24px rgba(200,241,53,0.25)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <Spinner />
                    Processing AI Dub…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
                      <rect x="7" y="2" width="6" height="10" rx="3" />
                      <path d="M4 10a6 6 0 0 0 12 0" strokeLinecap="round" />
                      <line x1="10" y1="16" x2="10" y2="19" strokeLinecap="round" />
                      <line x1="7" y1="19" x2="13" y2="19" strokeLinecap="round" />
                    </svg>
                    Generate Dub
                    {canSubmit && selectedLang && (
                      <span className="opacity-60 font-normal">→ {selectedLang.label}</span>
                    )}
                  </>
                )}
              </button>

              {/* Contextual hint */}
              {!isProcessing && !canSubmit && (
                <p className="mt-2 text-xs text-center" style={{ color: "var(--color-ash)" }}>
                  {!file && !targetLang
                    ? "Upload a file and select a language to continue"
                    : !file
                    ? "Upload a source file to continue"
                    : "Select a target language to continue"}
                </p>
              )}

              {/* Processing hint + cancel */}
              {isProcessing && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs" style={{ color: "var(--color-ash)" }}>
                    Transcribing → Translating → Synthesising… this may take a minute.
                  </p>
                  <button
                    onClick={handleCancel}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      border: "1px solid rgba(255,80,80,0.3)",
                      color: "#ff8080",
                      background: "rgba(255,80,80,0.06)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,80,80,0.06)")}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            className="mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm"
            style={{
              background: "rgba(255,80,80,0.07)",
              border: "1px solid rgba(255,80,80,0.25)",
              color: "#ff8080",
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 mt-0.5 shrink-0" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 6v4M10 13.5v.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-medium mb-0.5" style={{ color: "#ff6b6b" }}>Something went wrong</p>
              <p style={{ color: "#ff9090" }}>{error}</p>
            </div>
          </div>
        )}

        {/* ── Audio result ── */}
        {audioUrl && (
          <div
            className="mt-4 rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(200,241,53,0.25)", background: "rgba(17,17,24,0.9)" }}
          >
            {/* Result header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(200,241,53,0.1)", background: "rgba(200,241,53,0.04)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-volt)" }} />
                <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--color-volt)" }}>
                  Dub Ready
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--color-ash)" }}>
                {selectedLang?.flag} {selectedLang?.label}
              </span>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Filename */}
              <p className="text-xs font-mono truncate" style={{ color: "var(--color-ash)" }}>
                {audioFilename}
              </p>

              {/* Audio player */}
              <audio
                controls
                src={audioUrl}
                className="w-full"
                style={{ accentColor: "var(--color-volt)" }}
              />

              {/* Download button */}
              <a
                href={audioUrl}
                download={audioFilename}
                className="btn-volt w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 16h14" strokeLinecap="round" />
                </svg>
                Download MP3
              </a>

              {/* Generate another */}
              <button
                onClick={() => { setAudioUrl(null); setFile(null); setTargetLang(""); setError(""); }}
                className="w-full py-2.5 rounded-xl text-xs transition-all"
                style={{ color: "var(--color-ash)", border: "1px solid rgba(136,136,160,0.15)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-ash)")}
              >
                ← Generate another dub
              </button>
            </div>
          </div>
        )}

        {/* ── Info strip ── */}
        {!audioUrl && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: "⚡", label: "Fast processing" },
              { icon: "🎙️",  label: "Voice preserved" },
              { icon: "🔒", label: "Files encrypted" },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs"
                style={{ background: "rgba(17,17,24,0.5)", border: "1px solid var(--color-border)", color: "var(--color-ash)" }}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}