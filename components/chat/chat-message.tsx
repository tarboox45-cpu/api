"use client"

import { useState } from "react"
import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Copy,
  Check,
  RotateCcw,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react"

interface ChatMessageProps {
  message: Message
  onRetry?: () => void
  onCopy?: (text: string) => void
}

export function ChatMessage({ message, onRetry, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showThinking, setShowThinking] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    onCopy?.(message.content)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === "user"
  const hasError = !!message.error
  const hasThinking = !!message.thinking

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] lg:max-w-[70%] flex flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Thinking section (collapsible) */}
        {hasThinking && !isUser && (
          <div className="w-full">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-1 text-xs text-thinking-foreground bg-thinking px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
            >
              {showThinking ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Thinking...
            </button>
            {showThinking && (
              <div className="mt-2 text-sm text-thinking-foreground bg-thinking/50 p-3 rounded-lg border border-thinking whitespace-pre-wrap">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "bg-user-bubble text-user-bubble-foreground rounded-br-md"
              : "bg-assistant-bubble text-assistant-bubble-foreground rounded-bl-md",
            hasError && "border-2 border-destructive"
          )}
        >
          {message.isStreaming ? (
            <div className="flex items-center gap-2">
              <span className="whitespace-pre-wrap break-words">
                {message.content || ""}
              </span>
              <span className="inline-block w-2 h-4 bg-current animate-pulse-gentle rounded-sm" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {hasError && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {message.error}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>

            {hasError && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={onRetry}
              >
                <RotateCcw className="h-3 w-3" />
                <span className="ml-1 text-xs">Retry</span>
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}
