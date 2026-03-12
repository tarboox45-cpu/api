"use client"

import { useState, useCallback, useRef } from "react"
import type { StreamChunk } from "@/lib/types"

interface UseChatApiOptions {
  apiKey: string
  sessionId: string
  prompt?: string
  streamingMode: boolean
  onChunk?: (chunk: StreamChunk) => void
  onComplete?: (fullContent: string, thinking: string) => void
  onError?: (error: string) => void
}

export function useChatApi({
  apiKey,
  sessionId,
  prompt,
  streamingMode,
  onChunk,
  onComplete,
  onError,
}: UseChatApiOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (request: string) => {
      if (!apiKey) {
        onError?.("API key is required")
        return
      }

      if (!request.trim()) {
        onError?.("Message cannot be empty")
        return
      }

      setIsLoading(true)
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            request: request.trim(),
            session_id: sessionId,
            prompt: prompt || undefined,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        if (streamingMode) {
          // Handle streaming response
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("No response body")
          }

          const decoder = new TextDecoder()
          let fullContent = ""
          let thinkingContent = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const text = decoder.decode(value)
            const lines = text.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              try {
                const chunk: StreamChunk = JSON.parse(line)
                
                if (chunk.type === "thinking") {
                  thinkingContent += chunk.content
                  onChunk?.(chunk)
                } else if (chunk.type === "response") {
                  fullContent += chunk.content
                  onChunk?.(chunk)
                } else if (chunk.type === "finish") {
                  fullContent = chunk.content
                  onComplete?.(fullContent, thinkingContent)
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }

          if (!fullContent && !thinkingContent) {
            onComplete?.("", "")
          }
        } else {
          // Handle full response mode
          const text = await response.text()
          const lines = text.split("\n").filter((line) => line.trim())
          let fullContent = ""
          let thinkingContent = ""

          for (const line of lines) {
            try {
              const chunk: StreamChunk = JSON.parse(line)
              if (chunk.type === "thinking") {
                thinkingContent += chunk.content
              } else if (chunk.type === "response") {
                fullContent += chunk.content
              } else if (chunk.type === "finish") {
                fullContent = chunk.content
              }
            } catch {
              // Skip invalid JSON lines
            }
          }

          onComplete?.(fullContent, thinkingContent)
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return
        }
        onError?.((error as Error).message || "Failed to send message")
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [apiKey, sessionId, prompt, streamingMode, onChunk, onComplete, onError]
  )

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  return {
    sendMessage,
    isLoading,
    cancel,
  }
}
