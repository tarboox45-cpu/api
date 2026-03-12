"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Copy,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  FileJson,
  FileText,
  Clock,
} from "lucide-react"
import type { ApiResponse } from "./api-dashboard"

interface ResponsePanelProps {
  response: ApiResponse | null
  isLoading: boolean
  onRetry: () => void
}

type ViewMode = "formatted" | "raw"

export function ResponsePanel({ response, isLoading, onRetry }: ResponsePanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("formatted")
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!response) return

    const textToCopy = viewMode === "formatted" && response.rawData
      ? JSON.stringify(response.rawData, null, 2)
      : response.data

    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [response, viewMode])

  const handleDownload = useCallback(() => {
    if (!response) return

    const textToDownload = viewMode === "formatted" && response.rawData
      ? JSON.stringify(response.rawData, null, 2)
      : response.data

    const blob = new Blob([textToDownload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `response-${response.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [response, viewMode])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
    if (status >= 400 && status < 500) return "text-amber-600 dark:text-amber-400 bg-amber-500/10"
    if (status >= 500 || status === 0) return "text-red-600 dark:text-red-400 bg-red-500/10"
    return "text-muted-foreground bg-muted"
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const renderFormattedResponse = () => {
    if (!response) return null

    if (response.error) {
      return (
        <div className="p-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Request Failed</h4>
                <p className="text-sm text-destructive/80 mt-1">{response.error}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (Array.isArray(response.rawData)) {
      // Streaming response chunks
      return (
        <div className="p-4 space-y-3">
          {(response.rawData as Array<{ type: string; content: string }>).map((chunk, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg p-3 border",
                chunk.type === "thinking"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : chunk.type === "response"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-xs font-medium uppercase px-2 py-0.5 rounded",
                    chunk.type === "thinking"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : chunk.type === "response"
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {chunk.type}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )
    }

    if (typeof response.rawData === "object" && response.rawData !== null) {
      return (
        <pre className="p-4 text-sm overflow-auto">
          <code>{JSON.stringify(response.rawData, null, 2)}</code>
        </pre>
      )
    }

    return (
      <div className="p-4">
        <p className="text-sm whitespace-pre-wrap break-words">{response.data}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Response
        </h2>

        {response && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("formatted")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  viewMode === "formatted"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <FileJson className="h-3 w-3" />
                Formatted
              </button>
              <button
                type="button"
                onClick={() => setViewMode("raw")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors",
                  viewMode === "raw"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <FileText className="h-3 w-3" />
                Raw
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Waiting for response...</p>
          </div>
        ) : response ? (
          <>
            {/* Status Bar */}
            <div className="px-4 py-3 border-b border-border bg-card flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold",
                  getStatusColor(response.status)
                )}
              >
                {response.status || "ERR"} {response.statusText}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(response.duration)}
              </span>
            </div>

            {/* Content */}
            {viewMode === "formatted" ? (
              renderFormattedResponse()
            ) : (
              <pre className="p-4 text-sm overflow-auto whitespace-pre-wrap break-all">
                <code>{response.data}</code>
              </pre>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileJson className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Response Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Send a request to see the API response here.
            </p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {response && (
        <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          {response.error && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
