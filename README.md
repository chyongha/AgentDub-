# AgentDub 🎙️

> AI 기반 오디오 더빙 플랫폼 | AI-Powered Audio Dubbing Platform
Live App: agent-dub.vercel.app
---

# 🇰🇷 한국어

## 📌 서비스 소개 및 주요 기능

**AgentDub**은 누구나 쉽게 오디오 및 영상 파일을 다른 언어로 더빙할 수 있는 AI 기반 웹 애플리케이션입니다. 복잡한 편집 툴 없이도, 파일을 업로드하고 목표 언어를 선택하는 것만으로 전문적인 수준의 더빙 오디오를 생성할 수 있습니다.

### 🔄 핵심 더빙 파이프라인

```
업로드된 파일
    │
    ▼
① 음성 인식 (Speech-to-Text)
   ElevenLabs Scribe API
   → 원본 음성을 텍스트로 변환
    │
    ▼
② 번역 (Translation)
   Google Gemini 2.5 Flash
   → 텍스트를 목표 언어로 정확하게 번역
    │
    ▼
③ 음성 합성 (Text-to-Speech)
   ElevenLabs TTS (Multilingual v2)
   → 번역된 텍스트를 자연스러운 음성으로 합성
    │
    ▼
더빙 완료된 MP3 파일 다운로드
```

### ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 Google OAuth 로그인 | NextAuth.js를 통한 구글 계정 로그인 |
| 📋 이메일 화이트리스트 | Turso DB 기반 허가된 이메일만 접근 가능 |
| 📁 파일 업로드 | 드래그 앤 드롭 / 클릭 업로드 (MP3, WAV, MP4, M4A, MOV, WEBM) |
| 🌐 18개 언어 지원 | 영어, 스페인어, 프랑스어, 일본어, 중국어, 한국어 등 |
| ⚡ AI 3단계 파이프라인 | STT → 번역 → TTS 자동 처리 |
| 🎧 인앱 오디오 플레이어 | 결과물 바로 듣기 및 MP3 다운로드 |
| ❌ 요청 취소 기능 | 처리 중 언제든지 취소 가능 |
| 🚫 접근 거부 페이지 | 비허가 이메일 로그인 시 친화적 안내 메시지 |

---

## 🛠️ 사용한 기술 스택

### Frontend
- **[Next.js 15](https://nextjs.org/)** — App Router 기반 풀스택 프레임워크
- **[Tailwind CSS](https://tailwindcss.com/)** — 유틸리티 퍼스트 CSS 프레임워크
- **TypeScript** — 타입 안전성 보장

### Backend & Auth
- **[NextAuth.js v4](https://next-auth.js.org/)** — Google OAuth 인증 및 JWT 세션 관리
- **Next.js API Routes** — `/api/dub`, `/api/init-db` 서버사이드 엔드포인트

### Database
- **[Turso](https://turso.tech/)** (libSQL / SQLite) — 이메일 화이트리스트 및 사용자 관리
- **[@libsql/client](https://github.com/tursodatabase/libsql-client-ts)** — Turso 클라이언트 SDK

### AI & External APIs
- **[ElevenLabs Scribe](https://elevenlabs.io/)** — 음성 인식 (Speech-to-Text)
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)** — 텍스트 번역
- **[ElevenLabs TTS](https://elevenlabs.io/)** — 음성 합성 (Multilingual v2 모델)

### Deployment
- **[Vercel](https://vercel.com/)** — 자동 CI/CD 및 서버리스 배포

---

## ⚙️ 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/chyongha/AgentDub.git
cd agentdub
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다:

```env
# NextAuth — 아무 랜덤 문자열 (openssl rand -base64 32 으로 생성 가능)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth — https://console.cloud.google.com 에서 발급
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Turso Database — https://turso.tech/app 에서 발급
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Google Gemini — https://aistudio.google.com/app/apikey 에서 발급 (무료)
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs — https://elevenlabs.io/app/settings/api-keys 에서 발급
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# DB 초기화 라우트 보호용 시크릿 (임의 문자열)
INIT_SECRET=your_random_init_secret
```

### 4. 데이터베이스 초기화

개발 서버를 실행한 후 아래 URL을 브라우저에서 한 번만 방문합니다:

```
http://localhost:3000/api/init-db
```

아래와 같은 응답이 오면 성공입니다:

```json
{
  "ok": true,
  "message": "Database initialized successfully.",
  "tables": ["whitelist", "users", "projects"],
  "seeded": ["kts123@estsoft.com"]
}
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 6. Google OAuth 리디렉션 URI 설정

[Google Cloud Console](https://console.cloud.google.com) → 사용자 인증 정보 → OAuth 클라이언트 → **승인된 리디렉션 URI**에 아래를 추가:

```
http://localhost:3000/api/auth/callback/google
```

---

## 🚀 배포된 서비스 URL

> **🔗 Live Demo:** `https://agent-dub.vercel.app`
>
> _(위 URL을 실제 Vercel 배포 URL로 교체하세요)_

---

## 🤖 코딩 에이전트 활용 방법 및 노하우

이 프로젝트는 **AI 코딩 에이전트(Claude by Anthropic)** 를 적극 활용하여 개발되었습니다. 단순한 코드 자동완성을 넘어, 설계 결정, 디버깅, API 통합, 보안 구조화까지 전 과정에 걸쳐 에이전트와 협업하는 방식으로 진행했습니다.

### 💡 주요 활용 사례

#### 1. 복잡한 API 통합 처리
ElevenLabs STT API는 `multipart/form-data` 형식으로 파일을 전송해야 하며, Next.js의 서버사이드에서 이를 올바르게 파싱하고 재전송하는 과정이 까다로웠습니다. 에이전트는 `req.formData()`로 파일을 추출한 뒤 새로운 `FormData` 객체에 담아 ElevenLabs로 전달하는 정확한 패턴을 제시해 시행착오를 크게 줄였습니다.

Gemini API 통합에서는 `systemInstruction`과 낮은 `temperature` 값을 조합하여 번역 결과물에서 불필요한 설명이나 원문이 포함되지 않도록 프롬프트 전략을 수립했습니다.

#### 2. Vercel 배포 오류 디버깅
초기 배포 시 `TURSO_AUTH_TOKEN is not set` 빌드 오류가 발생했습니다. 원인은 모듈 최상단에서 환경 변수를 즉시 읽는 구조 때문이었고, Vercel의 빌드 단계에서는 환경 변수가 주입되지 않기 때문이었습니다. 에이전트는 **Lazy Singleton 패턴**을 제안하여 DB 클라이언트가 빌드 시점이 아닌 런타임에만 초기화되도록 수정했습니다. `Proxy` 객체를 활용해 기존 `db.execute()` 호출 방식을 전혀 변경하지 않고도 구조를 개선할 수 있었습니다.

#### 3. 보안 구조 설계
화이트리스트 기반 접근 제어 시스템을 NextAuth.js의 `signIn` 콜백과 Turso DB를 연동하여 구현했습니다. 에이전트는 단순 `return false` 대신 사용자 이메일을 URL 파라미터로 인코딩하여 `/denied` 페이지로 리디렉션하는 방식을 제안해 사용자 경험을 크게 향상시켰습니다. 또한 DB 오류 발생 시 앱이 크래시되지 않도록 `try/catch` 래핑도 함께 처리했습니다.

#### 4. 반복적 문제 해결 (Iterative Debugging)
- Gemini 모델명이 버전업으로 인해 `404`를 반환할 때, 에이전트가 최신 유효 모델명(`gemini-2.5-flash`)을 즉시 파악하여 수정
- ElevenLabs 음성 ID가 무료 플랜에서 동작하지 않을 때, `/v1/voices` 엔드포인트를 동적으로 호출하여 계정에 존재하는 음성을 자동 선택하는 로직으로 개선
- `ringColor`와 같은 유효하지 않은 CSS 속성이 TypeScript 빌드 오류를 유발했을 때 즉각적으로 올바른 Tailwind 클래스로 대체

### 📝 에이전트 활용 노하우

| 상황 | 효과적인 접근법 |
|------|----------------|
| API 통합 | 에러 메시지 전문을 그대로 붙여넣기 — 에이전트가 정확한 원인 파악 가능 |
| 단계적 개발 | "이번엔 UI만", "다음엔 API 연결"처럼 기능 단위로 분리하여 요청 |
| 보안 설계 | 요구사항 명시 ("화이트리스트 외 이메일은 접근 불가") → 에이전트가 전체 흐름 설계 |
| 배포 오류 | 빌드 로그 전체를 공유하면 에이전트가 근본 원인까지 추적 |
| 코드 품질 | 파일 단위로 변경사항만 출력 요청 → 불필요한 전체 재작성 방지 |

---

## 🚀 향후 개선 사항 (Future Improvements)

현재 MVP(Minimum Viable Product) 단계인 AgentDub을 더욱 확장하기 위한 계획입니다:

* **클라우드 스토리지 연동 (Vercel Blob / AWS S3):** 현재는 생성된 오디오를 사용자의 브라우저로 직접 스트리밍하지만, 향후 클라우드 스토리지를 연동하여 더빙된 파일을 영구 저장하고 '작업 히스토리' 탭에서 언제든 다시 다운로드할 수 있도록 개선할 예정입니다.
* **화자 분리 및 다중 음성 지원 (Speaker Diarization):** 여러 명의 대화가 포함된 영상에서도 각 화자의 목소리를 구분하여 서로 다른 AI 음성을 입히는 기능을 추가할 계획입니다.
* **실시간 처리 상태 프로그레스 바:** 현재의 단순 로딩 스피너를 넘어, STT → 번역 → TTS 각 단계의 진행률을 실시간으로 보여주는 상세 프로그레스 바를 구현할 예정입니다.

---
---

# 🇺🇸 English

## 📌 Service Introduction & Main Features

**AgentDub** is an AI-powered web application that lets anyone dub audio or video files into another language — no editing tools required. Simply upload a file, select a target language, and receive a professionally dubbed MP3 within minutes.

### 🔄 Core Dubbing Pipeline

```
Uploaded File
    │
    ▼
① Speech-to-Text
   ElevenLabs Scribe API
   → Transcribes original speech into text
    │
    ▼
② Translation
   Google Gemini 2.5 Flash
   → Accurately translates text into the target language
    │
    ▼
③ Text-to-Speech
   ElevenLabs TTS (Multilingual v2)
   → Synthesises translated text into natural-sounding audio
    │
    ▼
Download dubbed MP3
```

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Google OAuth Login | Sign in with Google via NextAuth.js |
| 📋 Email Whitelist | Only pre-approved emails can access the app (Turso DB) |
| 📁 File Upload | Drag & drop or click to upload (MP3, WAV, MP4, M4A, MOV, WEBM) |
| 🌐 18 Languages | English, Spanish, French, Japanese, Mandarin, Korean, and more |
| ⚡ 3-Step AI Pipeline | STT → Translation → TTS, fully automated |
| 🎧 In-App Audio Player | Listen to the result instantly and download as MP3 |
| ❌ Cancel Request | Abort a processing request at any time |
| 🚫 Access Denied Page | Friendly error page for non-whitelisted login attempts |

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** — Full-stack framework with App Router
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework
- **TypeScript** — Static type safety throughout

### Backend & Auth
- **[NextAuth.js v4](https://next-auth.js.org/)** — Google OAuth and JWT session management
- **Next.js API Routes** — `/api/dub`, `/api/init-db` server-side endpoints

### Database
- **[Turso](https://turso.tech/)** (libSQL / SQLite) — Email whitelist and user management
- **[@libsql/client](https://github.com/tursodatabase/libsql-client-ts)** — Turso TypeScript client

### AI & External APIs
- **[ElevenLabs Scribe](https://elevenlabs.io/)** — Speech-to-Text transcription
- **[Google Gemini 2.5 Flash](https://ai.google.dev/)** — Text translation (free tier)
- **[ElevenLabs TTS](https://elevenlabs.io/)** — Voice synthesis (Multilingual v2 model)

### Deployment
- **[Vercel](https://vercel.com/)** — Automatic CI/CD and serverless hosting

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/chyongha/AgentDub.git
cd agentdub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth — https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Turso Database — https://turso.tech/app
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# Google Gemini — https://aistudio.google.com/app/apikey (free)
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs — https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Init route protection secret (any random string)
INIT_SECRET=your_random_init_secret
```

### 4. Initialise the Database

Start the dev server, then visit this URL **once** in your browser:

```
http://localhost:3000/api/init-db
```

You should see this response:

```json
{
  "ok": true,
  "message": "Database initialized successfully.",
  "tables": ["whitelist", "users", "projects"],
  "seeded": ["kts123@estsoft.com"]
}
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Configure Google OAuth Redirect URI

In [Google Cloud Console](https://console.cloud.google.com) → Credentials → your OAuth client → **Authorised redirect URIs**, add:

```
http://localhost:3000/api/auth/callback/google
```

For production, also add:

```
https://agent-dub.vercel.app/api/auth/callback/google
```

---

## 🚀 Deployed Service URL

> **🔗 Live Demo:** `https://agent-dub.vercel.app`
>
> _(Replace with your actual Vercel deployment URL)_

---

## 🤖 Coding Agent Usage & Know-how

This project was built in close collaboration with an **AI coding agent (Claude by Anthropic)**. The agent was involved not just in generating boilerplate, but in architectural decisions, API integration strategy, security design, and iterative debugging throughout the entire development process.

### 💡 Key Use Cases

#### 1. Navigating Complex API Integrations
The ElevenLabs STT API requires files to be sent as `multipart/form-data`. Correctly parsing an incoming Next.js request and re-streaming the file to an external API is non-trivial. The agent provided the exact pattern — extracting the file via `req.formData()`, appending it to a fresh `FormData` object, and forwarding it — eliminating hours of trial and error.

For the Gemini translation step, the agent helped craft a prompting strategy using `systemInstruction` combined with a low `temperature` value to ensure the model returned only the translated text without explanations, preambles, or the original language leaking through.

#### 2. Debugging Vercel Deployment Errors
The initial deployment failed with `TURSO_AUTH_TOKEN is not set` during the build phase. The root cause was that the database client was being instantiated at module load time, before Vercel had injected runtime environment variables. The agent proposed a **Lazy Singleton pattern** — wrapping the client creation in a `getDb()` function that only runs at request time — and used a JavaScript `Proxy` object to maintain the existing `db.execute()` call signature throughout the codebase without any refactoring.

#### 3. Structuring the Backend Securely
The email whitelist access control system was designed by connecting NextAuth.js's `signIn` callback directly to a Turso database query. Rather than simply returning `false` on rejection (which shows a generic NextAuth error page), the agent suggested encoding the blocked email as a URL parameter and redirecting to a custom `/denied` page — significantly improving the user experience. Error boundaries were also added so that a database failure during sign-in would not crash the application.

#### 4. Iterative Problem Solving
- When the Gemini model name returned a `404` due to a version deprecation, the agent immediately identified the correct current model name (`gemini-2.5-flash`)
- When a hardcoded ElevenLabs voice ID stopped working on the free tier, the agent refactored the TTS step to dynamically call `/v1/voices` and select the first available voice from the account automatically
- When an invalid CSS property (`ringColor`) caused a TypeScript build failure on Vercel, the agent replaced it with the correct Tailwind utility class instantly

### 📝 Tips for Working Effectively with AI Coding Agents

| Situation | Effective Approach |
|-----------|-------------------|
| API errors | Paste the full error message verbatim — the agent can pinpoint the exact cause |
| Feature development | Break requests into single concerns: "UI only first, then wire the API" |
| Security requirements | State constraints explicitly ("only whitelisted emails may access") and let the agent design the full flow |
| Deployment failures | Share the complete build log — the agent traces root causes, not just symptoms |
| Code changes | Request only the changed files to avoid unnecessary full rewrites |

---
## 🚀 Future Improvements

The following features are planned to scale AgentDub beyond its current MVP stage:

* **Cloud Storage Integration (Vercel Blob / AWS S3):** Currently, dubbed audio is streamed directly to the browser. Integrating persistent storage will allow for a "History" tab where users can re-download past projects without re-generating them and consuming API credits.
* **Speaker Diarization:** Implementing support for multi-speaker audio files, allowing the AI to assign distinct voices to different speakers within a single file.
* **Detailed Progress Tracking:** Replacing the simple loading spinner with a step-by-step progress bar showing the real-time status of the STT, Translation, and TTS phases.

---

## 📁 Project Structure

```
agentdub/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── dub/route.ts                  # Main dubbing pipeline
│   │   └── init-db/route.ts              # One-time DB initialisation
│   ├── dashboard/page.tsx                # Protected main UI
│   ├── denied/page.tsx                   # Access denied page
│   ├── docs/page.tsx                     # Documentation page
│   ├── globals.css                       # Global styles & design tokens
│   ├── layout.tsx                        # Root layout with Navbar
│   └── page.tsx                          # Landing page
├── components/
│   ├── DashboardView.tsx                 # Upload + dub UI with state
│   ├── HeroSection.tsx                   # Landing page hero
│   └── Navbar.tsx                        # Navigation with auth controls
├── lib/
│   ├── auth.ts                           # NextAuth config & whitelist callback
│   └── db.ts                             # Turso client (lazy singleton)
├── .env.local.example                    # Environment variable template
└── package.json
```

---

## 📄 License

This project was created as a submission for the **ESTsoft DevRel Programme evaluation**.
