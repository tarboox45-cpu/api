import { NextRequest, NextResponse } from "next/server"

const API_KEY = "x-host-jwgahs384babterboo"

let cachedNonce: string | null = null
let nonceTimestamp = 0
const NONCE_TTL = 60 * 60 * 1000

async function getNonce(): Promise<string> {
  const now = Date.now()
  if (cachedNonce && now - nonceTimestamp < NONCE_TTL) {
    return cachedNonce
  }
  const res = await fetch("https://glm-ai.chat/chat/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  })
  const html = await res.text()
  const match = html.match(/"nonce":"([^"]+)"/)
  if (!match) throw new Error("nonce not found")
  cachedNonce = match[1]
  nonceTimestamp = now
  return cachedNonce
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,x-api-key",
    },
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const requestMessage = searchParams.get("request")
  const sessionId = searchParams.get("session_id") || "default"
  const prompt = searchParams.get("prompt") || ""
  const apiKey =
    request.headers.get("x-api-key") || searchParams.get("api_key")

  return handleRequest(requestMessage, sessionId, prompt, apiKey)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const requestMessage = body.request
  const sessionId = body.session_id || "default"
  const prompt = body.prompt || ""
  const apiKey = request.headers.get("x-api-key") || body.api_key

  return handleRequest(requestMessage, sessionId, prompt, apiKey)
}

async function handleRequest(
  requestMessage: string | null,
  sessionId: string,
  prompt: string,
  apiKey: string | null
) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
  }

  if (apiKey !== API_KEY) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401, headers }
    )
  }

  if (!requestMessage) {
    return NextResponse.json(
      { error: "request required" },
      { status: 400, headers }
    )
  }

  let nonce: string
  try {
    nonce = await getNonce()
  } catch {
    return NextResponse.json(
      { error: "Failed to get nonce" },
      { status: 500, headers }
    )
  }

  const history = prompt
    ? JSON.stringify([
        { role: "user", content: prompt },
        { role: "assistant", content: "." },
      ])
    : "[]"

  const formData = new URLSearchParams()
  formData.append("action", "glm_chat_stream")
  formData.append("nonce", nonce)
  formData.append("message", requestMessage)
  formData.append("history", history)
  formData.append("agent_mode", "1")

  const ai = await fetch("https://glm-ai.chat/wp-admin/admin-ajax.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `glm_session_id=guest_${sessionId}`,
      Origin: "https://glm-ai.chat",
      Referer: "https://glm-ai.chat/chat/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    body: formData.toString(),
  })

  // Create a readable stream for the response
  const encoder = new TextEncoder()
  let full = ""

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ai.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data:")) continue
          const json = line.replace("data:", "").trim()

          if (json === "[DONE]") {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: "finish", content: full }) + "\n"
              )
            )
            controller.close()
            return
          }

          try {
            const parsed = JSON.parse(json)
            const delta = parsed?.choices?.[0]?.delta
            if (!delta) continue

            if (delta.reasoning_content) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "thinking",
                    content: delta.reasoning_content,
                  }) + "\n"
                )
              )
            }

            if (delta.content) {
              full += delta.content
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({ type: "response", content: delta.content }) +
                    "\n"
                )
              )
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
