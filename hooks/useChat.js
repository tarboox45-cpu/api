'use client'
import { useState, useCallback, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const API_ENDPOINT = '/api/chat'
const API_KEY = 'x-host-jwgahs384babterboo'
const MAX_HISTORY = 8  // keep last N exchanges in history list

// ─── Types ────────────────────────────────────────────────────────────────────
// Status: 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

/**
 * useChat — manages all streaming state for the X·Host chat interface.
 *
 * Returns:
 *  submit(query, systemPrompt)  → triggers a new request
 *  retry()                      → retries the last failed request
 *  clear()                      → resets all state
 *  abort()                      → cancels an in-flight request
 *  status, thinkingText, responseText, errorMsg, history, charCount
 */
export function useChat() {
  const [status, setStatus]           = useState('idle')         // overall state
  const [thinkingText, setThinkingText] = useState('')           // reasoning chain
  const [responseText, setResponseText] = useState('')           // final answer
  const [errorMsg, setErrorMsg]       = useState(null)           // error string
  const [history, setHistory]         = useState([])             // past queries

  // Refs for abort + retry
  const abortRef    = useRef(null)
  const lastQueryRef = useRef({ query: '', prompt: '' })

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const resetStreaming = () => {
    setThinkingText('')
    setResponseText('')
    setErrorMsg(null)
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const submit = useCallback(async (query, systemPrompt = '') => {
    if (!query.trim()) return

    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    lastQueryRef.current = { query, prompt: systemPrompt }

    resetStreaming()
    setStatus('thinking')

    // Accumulate full response text as we stream
    let fullResponse = ''
    let fullThinking = ''

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          request: query,
          session_id: `session_${Date.now()}`,
          prompt: systemPrompt,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }

      // ── Stream NDJSON line by line ─────────────────────────────────────────
      const reader = res.body.getReader()
      const dec    = new TextDecoder()
      let   buf    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += dec.decode(value, { stream: true })

        // Process every complete line
        const lines = buf.split('\n')
        buf = lines.pop() // keep partial last line in buffer

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const msg = JSON.parse(trimmed)

            if (msg.type === 'thinking') {
              fullThinking += msg.content
              setThinkingText(fullThinking)
              setStatus('thinking')
            }

            if (msg.type === 'response') {
              fullResponse += msg.content
              setResponseText(fullResponse)
              setStatus('streaming')
            }

            if (msg.type === 'finish') {
              // Server sends full accumulated text on finish
              if (msg.content) {
                setResponseText(msg.content)
                fullResponse = msg.content
              }
              setStatus('done')
            }

          } catch {
            // Malformed JSON chunk — skip silently
          }
        }
      }

      // Mark done if server didn't send a finish packet
      setStatus('done')

      // Push to history
      setHistory(prev => [
        { query, response: fullResponse, ts: Date.now() },
        ...prev.slice(0, MAX_HISTORY - 1),
      ])

    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled — leave current state
        setStatus('idle')
        return
      }
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }, [])

  // ─── Retry ─────────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    const { query, prompt } = lastQueryRef.current
    if (query) submit(query, prompt)
  }, [submit])

  // ─── Abort ─────────────────────────────────────────────────────────────────
  const abort = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
  }, [])

  // ─── Clear ─────────────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    abortRef.current?.abort()
    resetStreaming()
    setStatus('idle')
  }, [])

  // ─── Char count (rough token estimate: 1 token ≈ 4 chars) ──────────────────
  const charCount = responseText.length
  const tokenEstimate = Math.ceil(charCount / 4)

  return {
    submit,
    retry,
    abort,
    clear,
    status,
    thinkingText,
    responseText,
    errorMsg,
    history,
    charCount,
    tokenEstimate,
  }
}
