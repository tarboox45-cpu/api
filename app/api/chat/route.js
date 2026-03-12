/**
 * app/api/chat/route.js
 *
 * Next.js 14 Route Handler — proxies requests to the GLM streaming backend
 * at /api/chat.js (Vercel serverless function).
 *
 * The frontend calls /api/chat (this file).
 * This handler forwards the request to /api/chat.js with the correct headers.
 *
 * When deployed to Vercel, /api/chat.js runs as its own serverless function
 * and /api/chat (Next.js route) calls it.
 *
 * For local development, both run inside the same Next.js dev server so
 * we resolve against the same host.
 */

export const runtime = 'nodejs'
export const maxDuration = 60

const API_KEY = 'x-host-jwgahs384babterboo'

export async function POST(request) {
  try {
    const body = await request.json()

    // Determine base URL (works on Vercel and locally)
    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const upstream = await fetch(`${baseUrl}/api/chat.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!upstream.ok) {
      const errBody = await upstream.json().catch(() => ({ error: `HTTP ${upstream.status}` }))
      return Response.json(errBody, { status: upstream.status })
    }

    // Pass the streaming body straight through to the client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[/api/chat] Error:', err)
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}
