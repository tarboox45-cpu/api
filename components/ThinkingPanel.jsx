'use client'
import { useState, useRef, useEffect } from 'react'

/**
 * ThinkingPanel — collapsible panel showing the model's reasoning chain.
 *
 * Props:
 *   text    – raw reasoning text string
 *   status  – current status (to know if still active)
 */
export default function ThinkingPanel({ text, status }) {
  const [expanded, setExpanded]   = useState(false)
  const [autoExpand, setAutoExpand] = useState(true)
  const scrollRef = useRef(null)

  const isActive = status === 'thinking'
  const lineCount = text.split('\n').filter(Boolean).length

  // Auto-expand when thinking starts, collapse when streaming begins
  useEffect(() => {
    if (status === 'thinking' && autoExpand)  setExpanded(true)
    if (status === 'streaming')               { setExpanded(false); setAutoExpand(false) }
    if (status === 'idle')                    setAutoExpand(true)
  }, [status])

  // Auto-scroll inside panel while thinking
  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [text, expanded])

  if (!text) return null

  return (
    <div className="fade-up">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl transition-colors duration-150"
        style={{
          background: expanded ? 'rgba(99,102,241,0.06)' : 'transparent',
          border: '1px solid',
          borderColor: expanded ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
        }}
        aria-expanded={expanded}
      >
        {/* Spin ring when active, brain icon when done */}
        {isActive ? (
          <span className="think-ring flex-shrink-0" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#818cf8' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        )}

        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          color: isActive ? '#818cf8' : '#64748b',
          textTransform: 'uppercase',
        }}>
          {isActive ? 'Reasoning…' : `Thought process`}
        </span>

        {!isActive && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            marginLeft: 'auto',
          }}>
            {lineCount} lines
          </span>
        )}

        <svg
          className={`w-3.5 h-3.5 ml-auto flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Collapsible Content ──────────────────────────────────────────── */}
      {expanded && (
        <div
          ref={scrollRef}
          className="mt-1 rounded-xl p-4 overflow-y-auto fade-up"
          style={{
            maxHeight: '220px',
            background: 'rgba(10,14,26,0.6)',
            border: '1px solid rgba(99,102,241,0.1)',
          }}
        >
          <p className="thinking-text">
            {text}
            {isActive && <span className="animate-pulse ml-1" style={{ color: '#818cf8' }}>▋</span>}
          </p>
        </div>
      )}
    </div>
  )
}
