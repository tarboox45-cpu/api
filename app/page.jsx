'use client'
import { useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import ChatInput      from '../components/ChatInput'
import ResponsePanel  from '../components/ResponsePanel'
import ThinkingPanel  from '../components/ThinkingPanel'
import StatusIndicator from '../components/StatusIndicator'

export default function HomePage() {
  const {
    submit, retry, abort, clear,
    status, thinkingText, responseText,
    errorMsg, history, tokenEstimate,
  } = useChat()

  return (
    <div className="min-h-dvh relative overflow-hidden bg-grid" style={{ background: 'var(--ink-950)' }}>

      {/* ── Ambient glow orbs ────────────────────────────────────────────── */}
      <div className="orb" style={{
        width: 600, height: 600,
        top: -200, left: -150,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
      }} />
      <div className="orb" style={{
        width: 500, height: 500,
        bottom: -100, right: -100,
        background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
      }} />

      {/* ── Layout shell ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-dvh max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(99,102,241,0.2))',
                border: '1px solid rgba(249,115,22,0.25)',
                boxShadow: '0 0 20px rgba(249,115,22,0.1)',
              }}
            >
              <svg className="w-5 h-5" style={{ color: '#f97316' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>

            <div>
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
                color: '#f1f5f9',
                lineHeight: 1,
              }}>
                X·Host
              </h1>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}>
                AI Stream Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusIndicator status={status} />

            {/* Model badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                color: '#818cf8',
                textTransform: 'uppercase',
              }}>
                GLM · Streaming
              </span>
            </div>
          </div>
        </header>

        {/* ── Thinking Panel ───────────────────────────────────────────────── */}
        {(thinkingText || status === 'thinking') && (
          <div className="mb-4">
            <ThinkingPanel text={thinkingText} status={status} />
          </div>
        )}

        {/* ── Response Panel ───────────────────────────────────────────────── */}
        <div className="flex-1 mb-5">
          <ResponsePanel
            text={responseText}
            status={status}
            tokenEstimate={tokenEstimate}
            onRetry={retry}
            errorMsg={errorMsg}
          />
        </div>

        {/* ── Input ───────────────────────────────────────────────────────── */}
        <div>
          <ChatInput
            onSubmit={submit}
            onClear={clear}
            onAbort={abort}
            status={status}
            history={history}
          />
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="mt-4 flex items-center justify-center gap-4">
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            X·HOST v1.0
          </span>
          <span style={{ color: 'var(--border-bright)' }}>·</span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            POWERED BY GLM
          </span>
        </footer>

      </div>
    </div>
  )
}
