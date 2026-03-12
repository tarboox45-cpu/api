'use client'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

/**
 * ResponsePanel — streams markdown-rendered response text with:
 *   - Auto-scroll to bottom while streaming
 *   - Blinking cursor while streaming
 *   - Syntax-highlighted code blocks with copy button
 *   - Token/char counter
 *
 * Props:
 *   text         – response string (grows over time)
 *   status       – current status
 *   tokenEstimate – estimated token count
 *   onRetry      – callback for error retry
 *   errorMsg     – string or null
 */
export default function ResponsePanel({ text, status, tokenEstimate, onRetry, errorMsg }) {
  const scrollRef  = useRef(null)
  const [pinned, setPinned] = useState(true)    // auto-scroll on/off
  const isStreaming = status === 'streaming'
  const isThinking  = status === 'thinking'
  const isDone      = status === 'done'
  const isError     = status === 'error'
  const isEmpty     = !text && !isThinking && !isError

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (pinned && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [text, pinned])

  // Detect manual scroll-up → unpin
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    setPinned(atBottom)
  }

  // Re-pin when a new message starts
  useEffect(() => {
    if (isThinking || isStreaming) setPinned(true)
  }, [status])

  // ── Copy to clipboard ───────────────────────────────────────────────────
  const copyAll = async () => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col gap-0 flex-1 min-h-0">

      {/* ── Panel header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '0.68rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Response
        </span>

        <div className="flex items-center gap-3">
          {isDone && tokenEstimate > 0 && (
            <span className="token-counter fade-up">
              ~{tokenEstimate.toLocaleString()} tokens
            </span>
          )}
          {isDone && text && (
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-xs transition-colors duration-150"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
              title="Copy full response"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
              </svg>
              Copy
            </button>
          )}
        </div>
      </div>

      {/* ── Scroll container ────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto rounded-2xl relative scanline"
        style={{
          minHeight: '320px',
          maxHeight: 'calc(100vh - 420px)',
          background: 'rgba(11,15,26,0.7)',
          border: '1px solid var(--border)',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="p-5 pb-6">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-40 gap-4 fade-up">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}>
                Send a query to start a conversation
              </p>
            </div>
          )}

          {/* Thinking skeleton */}
          {isThinking && !text && (
            <div className="flex flex-col gap-3 fade-up">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="think-ring" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#818cf8', letterSpacing: '0.05em' }}>
                  Processing…
                </span>
              </div>
              {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
                <div key={i} className="shimmer rounded-md h-3.5" style={{ width: `${w * 100}%`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}

          {/* Markdown response */}
          {text && (
            <div className={`prose-chat ${isStreaming ? 'cursor-blink' : ''}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const lang  = match ? match[1] : ''
                    const code  = String(children).replace(/\n$/, '')

                    if (!inline && lang) {
                      return (
                        <div className="relative group">
                          <div
                            className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CopyCodeBtn code={code} />
                          </div>
                          <div
                            className="absolute top-2.5 left-3 z-10"
                            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                          >
                            {lang}
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={lang}
                            PreTag="div"
                            customStyle={{
                              background: 'var(--ink-900)',
                              border: '1px solid var(--border-bright)',
                              borderRadius: '10px',
                              padding: '2.25rem 1rem 1rem',
                              margin: '0.75rem 0',
                              fontSize: '0.8rem',
                              lineHeight: 1.65,
                            }}
                            {...props}
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      )
                    }

                    // Inline code
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col gap-3 fade-up">
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f43f5e' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#f43f5e', marginBottom: '0.25rem' }}>
                    Request Failed
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', fontFamily: 'DM Sans, sans-serif' }}>
                    {errorMsg || 'An unexpected error occurred.'}
                  </p>
                </div>
              </div>
              <button onClick={onRetry} className="btn-ember self-start rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Retry
              </button>
            </div>
          )}

        </div>

        {/* Scroll-to-bottom pill */}
        {!pinned && (
          <button
            onClick={() => { setPinned(true); scrollRef.current.scrollTop = scrollRef.current.scrollHeight }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs fade-up"
            style={{
              background: 'rgba(26,34,54,0.95)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-secondary)',
              fontFamily: 'Syne, sans-serif',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Jump to bottom
          </button>
        )}
      </div>
    </div>
  )
}

// ── Small copy button inside code blocks ─────────────────────────────────────
function CopyCodeBtn({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md px-2 py-1 text-xs transition-all duration-150"
      style={{
        background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}`,
        color: copied ? '#34d399' : 'var(--text-secondary)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.65rem',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
