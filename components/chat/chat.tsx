"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSessions, useSettings } from "@/hooks/use-sessions"
import { useChatApi } from "@/hooks/use-chat-api"
import { Sidebar } from "./sidebar"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { SettingsPanel } from "./settings-panel"
import { Button } from "@/components/ui/button"
import { Settings, AlertCircle, MessageSquare } from "lucide-react"
import type { StreamChunk } from "@/lib/types"

export function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    sessions,
    currentSession,
    currentSessionId,
    isLoaded: sessionsLoaded,
    createSession,
    deleteSession,
    renameSession,
    switchSession,
    addMessage,
    updateMessage,
    clearMessages,
  } = useSessions()

  const {
    apiKey,
    setApiKey,
    prompt,
    setPrompt,
    streamingMode,
    setStreamingMode,
    isLoaded: settingsLoaded,
  } = useSettings()

  const lastUserMessage = useRef<string>("")

  // Track streaming content separately
  const streamingContent = useRef({ content: "", thinking: "" })

  const handleChunk = useCallback(
    (chunk: StreamChunk) => {
      if (!streamingMessageId) return

      if (chunk.type === "thinking") {
        streamingContent.current.thinking += chunk.content
        updateMessage(streamingMessageId, {
          thinking: streamingContent.current.thinking,
        })
      } else if (chunk.type === "response") {
        streamingContent.current.content += chunk.content
        updateMessage(streamingMessageId, {
          content: streamingContent.current.content,
        })
      }
    },
    [streamingMessageId, updateMessage]
  )

  const handleComplete = useCallback(
    (fullContent: string, thinking: string) => {
      if (streamingMessageId) {
        updateMessage(streamingMessageId, {
          content: fullContent,
          thinking: thinking || undefined,
          isStreaming: false,
        })
        setStreamingMessageId(null)
      }
    },
    [streamingMessageId, updateMessage]
  )

  const handleError = useCallback(
    (error: string) => {
      if (streamingMessageId) {
        updateMessage(streamingMessageId, {
          error,
          isStreaming: false,
        })
        setStreamingMessageId(null)
      }
    },
    [streamingMessageId, updateMessage]
  )

  const { sendMessage, isLoading, cancel } = useChatApi({
    apiKey,
    sessionId: currentSessionId,
    prompt,
    streamingMode,
    onChunk: handleChunk,
    onComplete: handleComplete,
    onError: handleError,
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

  const handleSend = async (message: string) => {
    if (!apiKey) {
      setSettingsOpen(true)
      return
    }

    lastUserMessage.current = message

    // Add user message
    addMessage({
      role: "user",
      content: message,
    })

    // Add assistant placeholder
    const assistantId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    })

    setStreamingMessageId(assistantId)
    streamingContent.current = { content: "", thinking: "" }

    // Send to API
    await sendMessage(message)
  }

  const handleRetry = async () => {
    if (lastUserMessage.current) {
      // Add assistant placeholder
      const assistantId = addMessage({
        role: "assistant",
        content: "",
        isStreaming: true,
      })

      setStreamingMessageId(assistantId)
      streamingContent.current = { content: "", thinking: "" }
      await sendMessage(lastUserMessage.current)
    }
  }

  const handleCancel = () => {
    cancel()
    if (streamingMessageId) {
      updateMessage(streamingMessageId, {
        content: currentSession?.messages.find((m) => m.id === streamingMessageId)?.content || "(Cancelled)",
        isStreaming: false,
      })
      setStreamingMessageId(null)
    }
  }

  if (!sessionsLoaded || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const hasApiKey = !!apiKey.trim()
  const messages = currentSession?.messages || []

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={switchSession}
        onCreateSession={createSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-medium truncate">
              {currentSession?.name || "New Chat"}
            </h2>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Start a Conversation
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Type a message below to begin chatting with the AI assistant.
                {!hasApiKey && " Make sure to add your API key in settings first."}
              </p>
              {!hasApiKey && (
                <Button onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={
                    message.error && message.id === messages[messages.length - 1]?.id
                      ? handleRetry
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onCancel={handleCancel}
          isLoading={isLoading}
          disabled={!hasApiKey}
        />
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        apiKey={apiKey}
        setApiKey={setApiKey}
        prompt={prompt}
        setPrompt={setPrompt}
        streamingMode={streamingMode}
        setStreamingMode={setStreamingMode}
        onClearMessages={clearMessages}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
