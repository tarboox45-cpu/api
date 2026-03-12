# X·Host — AI Stream Interface

A high-performance, beautifully designed streaming AI chat interface built with **Next.js 14**, **React 18**, and **TailwindCSS**. Connects directly to the `/api/chat.js` GLM streaming backend.

---

## ✦ Features

- **Real-time streaming** — NDJSON stream parsed line-by-line, text appears as it's generated
- **Thinking panel** — expandable panel showing the model's reasoning chain
- **Markdown rendering** — full GFM support with syntax-highlighted code blocks
- **System prompt** — optional context injection per query
- **History chips** — quick-fill from recent queries
- **Abort / retry** — cancel in-flight requests or retry failed ones
- **Auto-scroll with unpin** — follows output, but lets you scroll up freely
- **Token estimate** — live character → token counter

---

## ✦ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TailwindCSS |
| Fonts | Syne · DM Sans · JetBrains Mono |
| Markdown | react-markdown + remark-gfm |
| Code highlighting | react-syntax-highlighter (Prism) |
| Streaming | Fetch API + ReadableStream |

---

## ✦ Project Structure

```
xhost-frontend/
├── api/
│   └── chat.js              ← Original GLM streaming serverless function
├── app/
│   ├── api/chat/route.js    ← Next.js proxy route handler
│   ├── globals.css          ← Design system (CSS vars, animations, utilities)
│   ├── layout.jsx           ← Root HTML shell + metadata
│   └── page.jsx             ← Main page (orchestrates all components)
├── components/
│   ├── ChatInput.jsx        ← Query textarea, system prompt, controls
│   ├── ResponsePanel.jsx    ← Streaming markdown output with code highlight
│   ├── StatusIndicator.jsx  ← Animated status dot + label
│   └── ThinkingPanel.jsx    ← Collapsible reasoning chain panel
├── hooks/
│   └── useChat.js           ← All streaming state management
├── public/
│   └── favicon.svg
├── .env.local               ← Local dev base URL
├── next.config.js
├── tailwind.config.js
├── vercel.json              ← Vercel function config
└── package.json
```

---

## ✦ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:3000
```

---

## ✦ Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Vercel automatically detects Next.js and serves both:
- `/api/chat.js` — legacy serverless function
- `/api/chat` — Next.js App Router proxy

---

## ✦ API Details

**Endpoint:** `POST /api/chat`  
**Key:** `x-host-jwgahs384babterboo` (set in `useChat.js`)

**Request body:**
```json
{
  "request": "Your question here",
  "session_id": "session_1234567890",
  "prompt": "Optional system context"
}
```

**Streaming response (NDJSON lines):**
```json
{ "type": "thinking",  "content": "Let me consider..." }
{ "type": "response",  "content": "Here is the answer" }
{ "type": "finish",    "content": "Full response text" }
```

---

## ✦ Customisation

| Thing to change | Where |
|-----------------|-------|
| API key | `hooks/useChat.js` → `API_KEY` |
| Colour palette | `app/globals.css` → `:root` vars |
| Fonts | `app/globals.css` → `@import` + `tailwind.config.js` |
| Max response height | `components/ResponsePanel.jsx` → `maxHeight` |
| History size | `hooks/useChat.js` → `MAX_HISTORY` |
