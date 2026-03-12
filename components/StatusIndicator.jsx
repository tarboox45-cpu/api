'use client'

/**
 * StatusIndicator — shows current pipeline state with animated dot + label.
 * status: 'idle' | 'thinking' | 'streaming' | 'done' | 'error'
 */

const STATUS_MAP = {
  idle:      { label: 'Ready',      color: 'text-slate-500' },
  thinking:  { label: 'Reasoning…', color: 'text-cobalt-400' },
  streaming: { label: 'Streaming',  color: 'text-jade-400'  },
  done:      { label: 'Complete',   color: 'text-jade-400'  },
  error:     { label: 'Error',      color: 'text-rose-400'  },
}

export default function StatusIndicator({ status }) {
  const { label, color } = STATUS_MAP[status] || STATUS_MAP.idle

  return (
    <div className="flex items-center gap-2">
      <span className={`status-dot ${status}`} />
      <span
        className={`font-mono text-xs tracking-widest uppercase transition-colors duration-300 ${color}`}
        style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}
      >
        {label}
      </span>
    </div>
  )
}
