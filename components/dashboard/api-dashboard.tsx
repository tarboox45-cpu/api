"use client"

import { useState, useCallback } from "react"
import { useSessions, useSettings } from "@/hooks/use-sessions"
import { Sidebar } from "./dashboard-sidebar"
import { RequestPanel } from "./request-panel"
import { ResponsePanel } from "./response-panel"
import { Button } from "@/components/ui/button"
import { Settings, Menu, AlertCircle, Server } from "lucide-react"
import { SettingsModal } from "./settings-modal"

export interface ApiRequest {
  id: string
  method: "GET" | "POST" | "OPTIONS"
  request: string
  prompt: string
  sessionId: string
  apiKey: string
  timestamp: number
}

export interface ApiResponse {
  id: string
  requestId: string
  status: number
  statusText: string
  data: string
  rawData: unknown
  duration: number
  timestamp: number
  error?: string
}

export interface RequestHistoryItem {
  request: ApiRequest
  response: ApiResponse | null
}

export function ApiDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | null>(null)
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([])

  const {
    sessions,
    currentSession,
    currentSessionId,
    isLoaded: sessionsLoaded,
    createSession,
    deleteSession,
    renameSession,
    switchSession,
  } = useSessions()

  const {
    apiKey,
    setApiKey,
    prompt,
    setPrompt,
    isLoaded: settingsLoaded,
  } = useSettings()

  const handleSendRequest = useCallback(
    async (method: "GET" | "POST" | "OPTIONS", request: string, customPrompt: string, customSessionId: string, customApiKey: string) => {
      const requestId = `req-${Date.now()}`
      const startTime = Date.now()

      const apiRequest: ApiRequest = {
        id: requestId,
        method,
        request,
        prompt: customPrompt,
        sessionId: customSessionId,
        apiKey: customApiKey,
        timestamp: Date.now(),
      }

      setIsLoading(true)
      setCurrentResponse(null)

      try {
        let response: Response

        const headers: HeadersInit = {
          "x-api-key": customApiKey,
        }

        if (method === "GET") {
          const params = new URLSearchParams()
          if (request) params.set("request", request)
          if (customSessionId) params.set("session_id", customSessionId)
          if (customPrompt) params.set("prompt", customPrompt)
          
          response = await fetch(`/api/chat?${params.toString()}`, {
            method: "GET",
            headers,
          })
        } else if (method === "POST") {
          headers["Content-Type"] = "application/json"
          response = await fetch("/api/chat", {
            method: "POST",
            headers,
            body: JSON.stringify({
              request,
              session_id: customSessionId,
              prompt: customPrompt,
            }),
          })
        } else {
          response = await fetch("/api/chat", {
            method: "OPTIONS",
            headers,
          })
        }

        const duration = Date.now() - startTime
        let data = ""
        let rawData: unknown = null

        try {
          const text = await response.text()
          data = text
          try {
            rawData = JSON.parse(text)
          } catch {
            // Try to parse streaming response
            const lines = text.split("\n").filter((l) => l.trim())
            const parsedChunks: unknown[] = []
            for (const line of lines) {
              try {
                parsedChunks.push(JSON.parse(line))
              } catch {
                // Skip invalid lines
              }
            }
            if (parsedChunks.length > 0) {
              rawData = parsedChunks
            } else {
              rawData = text
            }
          }
        } catch {
          data = "Unable to read response"
          rawData = null
        }

        const apiResponse: ApiResponse = {
          id: `res-${Date.now()}`,
          requestId,
          status: response.status,
          statusText: response.statusText,
          data,
          rawData,
          duration,
          timestamp: Date.now(),
        }

        setCurrentResponse(apiResponse)
        setRequestHistory((prev) => [
          { request: apiRequest, response: apiResponse },
          ...prev.slice(0, 49),
        ])
      } catch (error) {
        const duration = Date.now() - startTime
        const apiResponse: ApiResponse = {
          id: `res-${Date.now()}`,
          requestId,
          status: 0,
          statusText: "Network Error",
          data: "",
          rawData: null,
          duration,
          timestamp: Date.now(),
          error: (error as Error).message || "Failed to send request",
        }

        setCurrentResponse(apiResponse)
        setRequestHistory((prev) => [
          { request: apiRequest, response: apiResponse },
          ...prev.slice(0, 49),
        ])
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handleRetry = useCallback(() => {
    if (requestHistory.length > 0) {
      const lastRequest = requestHistory[0].request
      handleSendRequest(
        lastRequest.method,
        lastRequest.request,
        lastRequest.prompt,
        lastRequest.sessionId,
        lastRequest.apiKey
      )
    }
  }, [requestHistory, handleSendRequest])

  const handleSelectHistoryItem = useCallback((item: RequestHistoryItem) => {
    setCurrentResponse(item.response)
  }, [])

  if (!sessionsLoaded || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const hasApiKey = !!apiKey.trim()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        requestHistory={requestHistory}
        onSelectSession={switchSession}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onSelectHistoryItem={handleSelectHistoryItem}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">API Dashboard</h1>
            </div>
            {!hasApiKey && (
              <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                <AlertCircle className="h-3 w-3" />
                API Key Required
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Request Panel */}
          <div className="flex-1 lg:max-w-2xl border-b lg:border-b-0 lg:border-r border-border overflow-hidden flex flex-col">
            <RequestPanel
              defaultApiKey={apiKey}
              defaultPrompt={prompt}
              defaultSessionId={currentSessionId}
              onSendRequest={handleSendRequest}
              isLoading={isLoading}
              disabled={!hasApiKey}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>

          {/* Response Panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ResponsePanel
              response={currentResponse}
              isLoading={isLoading}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        apiKey={apiKey}
        setApiKey={setApiKey}
        prompt={prompt}
        setPrompt={setPrompt}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
