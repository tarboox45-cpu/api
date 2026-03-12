'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * ChatInput — handles query composition, system prompt toggle,
 *             keyboard shortcuts, and character counting.
 *
 * Props:
 *   onSubmit(query, prompt)  – called when user sends a message
 *   onClear()                – called when user hits Clear
 *   onAbort()                – called when user cancels an in-flight request
 *   status                   – 'idle'|'thinking'|'streaming'|'done'|'error'
 *   history                  – array of past queries for quick-fill chips
 */
export default function ChatInput({ onSubmit, onClear, onAbort, status, history = [] }) {
  const [query,         setQuery]         = useState('')
  const [systemPrompt,  setSystemPrompt]  = useState('')
  const [showPrompt,    setShowPrompt]    = useState(false)
  const [charCount,     setCharCount]     = useState(0)

  const textareaRef = useRef(null)
  const isActive    = status === 'thinking' || status === 'streaming'
  const MAX_CHARS   = 4000

  // ── Auto-resize textarea ────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 240) + 'px'
    setCharCount(query.length)
  }, [query])

  // ── Focus on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    // Cmd/Ctrl + Enter → submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    // Escape → abort if active
    if (e.key === 'Escape' && isActive) {
      onAbort()
    }
  }, [query, isActive]) // eslint-disable-line

  const handleSubmit = () => {
    if (!query.trim() || isActive) return
    onSubmit(query.trim(), systemPrompt.trim())
    setQuery('')
  }

  // ── History chip click ──────────────────────────────────────────────────────
  const fillFromHistory = (q) => {
    setQuery(q)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── History chips ────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap" aria-label="Recent queries">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}
          >
            Recent
          </span>
          {history.slice(0, 4).map((h, i) => (
            <button
              key={i}
              className="history-chip"
              onClick={() => fillFromHistory(h.query)}
              title={h.query}
            >
              {h.query}
            </button>
          ))}
        </div>
      )}

      {/* ── System Prompt Toggle ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPrompt(v => !v)}
          className="flex items-center gap-1.5 text-xs transition-colors duration-150"
          style={{
            color: showPrompt ? 'var(--ember)' : 'var(--text-muted)',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${showPrompt ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          SYSTEM PROMPT
          {systemPrompt && (
            <span
              className="ml-1 rounded-full px-1.5 py-px text-[10px]"
              style={{ background: 'var(--ember-dim)', color: 'var(--ember)' }}
            >
              active
            </span>
          )}
        </button>
      </div>

      {showPrompt && (
        <div className="glass rounded-xl p-3 fade-up">
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            placeholder="Optional system context… (e.g. 'You are a concise technical writer')"
            rows={3}
            className="query-textarea text-sm"
            style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}
          />
        </div>
      )}

      {/* ── Main Input Card ──────────────────────────────────────────────── */}
      <div
        className="glass-bright rounded-2xl transition-all duration-200"
        style={{
          boxShadow: query
            ? '0 0 0 1px rgba(249,115,22,0.25), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Textarea */}
        <div className="px-4 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (⌘↵ to send)"
            className="query-textarea"
            rows={2}
            maxLength={MAX_CHARS}
            disabled={isActive}
            aria-label="Query input"
          />
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          {/* Char counter */}
          <div className="token-counter">
            <span style={{ color: charCount > MAX_CHARS * 0.85 ? 'var(--ember)' : undefined }}>
              {charCount.toLocaleString()}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/{MAX_CHARS.toLocaleString()}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Abort button (only when active) */}
            {isActive && (
              <button
                onClick={onAbort}
                className="btn-ghost rounded-lg px-3 py-1.5 text-xs fade-up"
                aria-label="Stop generation"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-current inline-block" />
                  Stop
                </span>
              </button>
            )}

            {/* Clear button */}
            <button
              onClick={() => { setQuery(''); setSystemPrompt(''); onClear(); }}
              disabled={isActive}
              className="btn-ghost rounded-lg px-3 py-1.5 text-xs"
              aria-label="Clear"
            >
              Clear
            </button>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isActive}
              className="btn-ember rounded-xl px-5 py-2 text-sm flex items-center gap-2"
              aria-label="Send query"
            >
              {isActive ? (
                <>
                  <span className="think-ring" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                  Working
                </>
              ) : (
                <>
                  Send
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
        ⌘↵ send &nbsp;·&nbsp; Esc stop &nbsp;·&nbsp; system prompt optional
      </p>
    </div>
  )
}
