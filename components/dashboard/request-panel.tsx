"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Send,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react"

interface RequestPanelProps {
  defaultApiKey: string
  defaultPrompt: string
  defaultSessionId: string
  onSendRequest: (
    method: "GET" | "POST" | "OPTIONS",
    request: string,
    prompt: string,
    sessionId: string,
    apiKey: string
  ) => Promise<void>
  isLoading: boolean
  disabled: boolean
  onOpenSettings: () => void
}

const methods = ["GET", "POST", "OPTIONS"] as const
type Method = (typeof methods)[number]

export function RequestPanel({
  defaultApiKey,
  defaultPrompt,
  defaultSessionId,
  onSendRequest,
  isLoading,
  disabled,
  onOpenSettings,
}: RequestPanelProps) {
  const [method, setMethod] = useState<Method>("POST")
  const [request, setRequest] = useState("")
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [sessionId, setSessionId] = useState(defaultSessionId)
  const [apiKey, setApiKey] = useState(defaultApiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!apiKey.trim()) {
      newErrors.apiKey = "API key is required"
    }

    if (method !== "OPTIONS" && !request.trim()) {
      newErrors.request = "Request message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [apiKey, method, request])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate()) return

      await onSendRequest(method, request, prompt, sessionId || "default", apiKey)
    },
    [method, request, prompt, sessionId, apiKey, validate, onSendRequest]
  )

  const getMethodColor = (m: Method) => {
    switch (m) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      case "POST":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
      case "OPTIONS":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    }
  }

  if (disabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">API Key Required</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          Please configure your API key in settings to start making requests.
        </p>
        <Button onClick={onOpenSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Open Settings
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Request
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Method Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Method</label>
          <div className="flex gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  method === m
                    ? getMethodColor(m)
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Request Input */}
        {method !== "OPTIONS" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Request Message</label>
            <textarea
              value={request}
              onChange={(e) => {
                setRequest(e.target.value)
                if (errors.request) setErrors((prev) => ({ ...prev, request: "" }))
              }}
              placeholder="Enter your request message..."
              className={cn(
                "w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                errors.request ? "border-destructive" : "border-input"
              )}
            />
            {errors.request && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.request}
              </p>
            )}
          </div>
        )}

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                if (errors.apiKey) setErrors((prev) => ({ ...prev, apiKey: "" }))
              }}
              placeholder="Enter your API key..."
              className={cn(
                "pr-10",
                errors.apiKey ? "border-destructive" : ""
              )}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.apiKey && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.apiKey}
            </p>
          )}
        </div>

        {/* Advanced Options */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">Advanced Options</span>
            {advancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {advancedOpen && (
            <div className="p-4 space-y-4 border-t border-border">
              {/* Session ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Session ID</label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="default"
                />
                <p className="text-xs text-muted-foreground">
                  Used to maintain conversation context across requests
                </p>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">System Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Optional system prompt..."
                  className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground">
                  Sets context for the AI response
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Request Preview */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <span className="text-sm font-medium">Request Preview</span>
          </div>
          <pre className="p-4 text-xs overflow-x-auto bg-muted/10">
            <code>
              {method === "GET"
                ? `GET /api/chat?request=${encodeURIComponent(request)}&session_id=${sessionId || "default"}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ""}`
                : method === "POST"
                  ? JSON.stringify(
                      {
                        request,
                        session_id: sessionId || "default",
                        ...(prompt && { prompt }),
                      },
                      null,
                      2
                    )
                  : "OPTIONS /api/chat"}
            </code>
          </pre>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Request
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
