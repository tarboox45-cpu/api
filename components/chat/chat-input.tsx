"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Send, Square, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  onCancel: () => void
  isLoading: boolean
  disabled?: boolean
}

export function ChatInput({
  onSend,
  onCancel,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3 bg-secondary rounded-2xl p-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground",
              "min-h-[40px] max-h-[200px]"
            )}
          />

          {isLoading ? (
            <Button
              onClick={onCancel}
              variant="destructive"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-xl"
            >
              <Square className="h-4 w-4 fill-current" />
              <span className="sr-only">Stop generating</span>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              size="icon"
              className="shrink-0 h-10 w-10 rounded-xl"
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
