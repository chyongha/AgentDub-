import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * ElevenLabs "Rachel" — default voice, available on free tier.
 * Swap this for any voice ID from your ElevenLabs account:
 * https://elevenlabs.io/app/voice-library
 */
const ELEVENLABS_VOICE_ID  = "pNInz6obpgDQGcFmaJgB";
const ELEVENLABS_TTS_MODEL = "eleven_multilingual_v2";
const ELEVENLABS_STT_MODEL = "scribe_v1";
const ELEVENLABS_BASE      = "https://api.elevenlabs.io/v1";

/** Gemini model used for translation */
const GEMINI_MODEL = "gemini-2.5-flash";

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

// ── POST /api/dub ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth check
  const authError = await requireSession();
  if (authError) return authError;

  // ── Validate env vars upfront ───────────────────────────────────────────────
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const GEMINI_API_KEY     = process.env.GEMINI_API_KEY;

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration: ELEVENLABS_API_KEY is not set." },
      { status: 500 }
    );
  }
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server misconfiguration: GEMINI_API_KEY is not set." },
      { status: 500 }
    );
  }

  // ── Step 1: Parse multipart/form-data ──────────────────────────────────────
  let file: File;
  let targetLanguage: string;

  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");
    const langEntry = formData.get("targetLanguage");

    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json(
        { error: "Missing required field: 'file' must be a file upload." },
        { status: 400 }
      );
    }
    if (!langEntry || typeof langEntry !== "string" || !langEntry.trim()) {
      return NextResponse.json(
        { error: "Missing required field: 'targetLanguage' must be a non-empty string." },
        { status: 400 }
      );
    }

    file           = fileEntry as File;
    targetLanguage = langEntry.trim();
  } catch (err) {
    console.error("[dub] Failed to parse form data:", err);
    return NextResponse.json(
      { error: "Failed to parse request body. Ensure Content-Type is multipart/form-data." },
      { status: 400 }
    );
  }

  // ── Step 2: Speech-to-Text via ElevenLabs Scribe ───────────────────────────
  let transcribedText: string;

  try {
    const sttForm = new FormData();
    sttForm.append("file", file, file.name);
    sttForm.append("model_id", ELEVENLABS_STT_MODEL);
    sttForm.append("diarize", "false");

    const sttRes = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
      body: sttForm,
    });

    if (!sttRes.ok) {
      const detail = await sttRes.text();
      console.error("[dub] ElevenLabs STT error:", sttRes.status, detail);
      return NextResponse.json(
        { error: "Speech-to-Text failed. Check your ElevenLabs API key and file format.", detail },
        { status: 502 }
      );
    }

    const sttData = await sttRes.json();
    // ElevenLabs Scribe returns { text: string, words: [...], ... }
    transcribedText = sttData?.text ?? "";

    if (!transcribedText.trim()) {
      return NextResponse.json(
        { error: "No speech detected in the uploaded file." },
        { status: 422 }
      );
    }
  } catch (err) {
    console.error("[dub] Unexpected error during STT:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during Speech-to-Text processing." },
      { status: 500 }
    );
  }

  // ── Step 3: Translation via Gemini 1.5 Flash ───────────────────────────────
  let translatedText: string;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.3, // low = more faithful, less creative
      },
      systemInstruction:
        "You are a professional translator. Translate the given text accurately and naturally " +
        "into the requested language. Preserve the original tone, style, and meaning as closely " +
        "as possible. Return ONLY the translated text — no explanations, no notes, no original text.",
    });

    const prompt = `Translate the following text into ${targetLanguage}:\n\n${transcribedText}`;
    const result = await model.generateContent(prompt);
    translatedText = result.response.text().trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: "Translation returned an empty result." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[dub] Gemini translation error:", err);
    return NextResponse.json(
      {
        error: "Translation failed. Check your GEMINI_API_KEY and quota.",
        detail: String(err),
      },
      { status: 502 }
    );
  }

  // ── Step 4: Text-to-Speech via ElevenLabs ──────────────────────────────────
  let audioBuffer: ArrayBuffer;

  try {
    const ttsRes = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key":   ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text:     translatedText,
          model_id: ELEVENLABS_TTS_MODEL,
          voice_settings: {
            stability:         0.5,
            similarity_boost:  0.75,
            style:             0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const detail = await ttsRes.text();
      console.error("[dub] ElevenLabs TTS error:", ttsRes.status, detail);
      return NextResponse.json(
        { error: "Text-to-Speech failed. Check your ElevenLabs API key and voice ID.", detail },
        { status: 502 }
      );
    }

    audioBuffer = await ttsRes.arrayBuffer();
  } catch (err) {
    console.error("[dub] Unexpected error during TTS:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during Text-to-Speech processing." },
      { status: 500 }
    );
  }

  // ── Step 5: Return audio to client ─────────────────────────────────────────
  const safeFilename = file.name.replace(/\.[^.]+$/, "");

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type":        "audio/mpeg",
      "Content-Disposition": `attachment; filename="${safeFilename}_dubbed_${targetLanguage}.mp3"`,
      "Content-Length":      String(audioBuffer.byteLength),
      "Cache-Control":       "no-store",
    },
  });
}