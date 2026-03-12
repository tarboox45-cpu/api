"use client"

import { useState, useEffect, useCallback } from "react"
import type { Session, Message } from "@/lib/types"

const STORAGE_KEY = "xhost-chat-sessions"
const SETTINGS_KEY = "xhost-chat-settings"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createNewSession(): Session {
  return {
    id: generateId(),
    name: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { sessions: Session[]; currentId: string }
        if (parsed.sessions.length > 0) {
          setSessions(parsed.sessions)
          setCurrentSessionId(parsed.currentId || parsed.sessions[0].id)
        } else {
          const newSession = createNewSession()
          setSessions([newSession])
          setCurrentSessionId(newSession.id)
        }
      } catch {
        const newSession = createNewSession()
        setSessions([newSession])
        setCurrentSessionId(newSession.id)
      }
    } else {
      const newSession = createNewSession()
      setSessions([newSession])
      setCurrentSessionId(newSession.id)
    }
    setIsLoaded(true)
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessions, currentId: currentSessionId })
      )
    }
  }, [sessions, currentSessionId, isLoaded])

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  const createSession = useCallback(() => {
    const newSession = createNewSession()
    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    return newSession
  }, [])

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id)
        if (filtered.length === 0) {
          const newSession = createNewSession()
          setCurrentSessionId(newSession.id)
          return [newSession]
        }
        if (currentSessionId === id) {
          setCurrentSessionId(filtered[0].id)
        }
        return filtered
      })
    },
    [currentSessionId]
  )

  const renameSession = useCallback((id: string, name: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, name, updatedAt: Date.now() } : s
      )
    )
  }, [])

  const switchSession = useCallback((id: string) => {
    setCurrentSessionId(id)
  }, [])

  const addMessage = useCallback(
    (message: Omit<Message, "id" | "timestamp">) => {
      const newMessage: Message = {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...s.messages, newMessage],
                updatedAt: Date.now(),
                name:
                  s.messages.length === 0 && message.role === "user"
                    ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
                    : s.name,
              }
            : s
        )
      )
      return newMessage.id
    },
    [currentSessionId]
  )

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
                updatedAt: Date.now(),
              }
            : s
        )
      )
    },
    [currentSessionId]
  )

  const clearMessages = useCallback(() => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [], updatedAt: Date.now() }
          : s
      )
    )
  }, [currentSessionId])

  return {
    sessions,
    currentSession,
    currentSessionId,
    isLoaded,
    createSession,
    deleteSession,
    renameSession,
    switchSession,
    addMessage,
    updateMessage,
    clearMessages,
  }
}

export function useSettings() {
  const [apiKey, setApiKey] = useState("")
  const [prompt, setPrompt] = useState("")
  const [streamingMode, setStreamingMode] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setApiKey(parsed.apiKey || "")
        setPrompt(parsed.prompt || "")
        setStreamingMode(parsed.streamingMode !== false)
      } catch {
        // Ignore parse errors
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ apiKey, prompt, streamingMode })
      )
    }
  }, [apiKey, prompt, streamingMode, isLoaded])

  return {
    apiKey,
    setApiKey,
    prompt,
    setPrompt,
    streamingMode,
    setStreamingMode,
    isLoaded,
  }
}
