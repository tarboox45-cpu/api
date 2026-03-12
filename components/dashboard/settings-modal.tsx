"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { X, Eye, EyeOff, Key, MessageSquare, Save } from "lucide-react"

interface SettingsModalProps {
  apiKey: string
  setApiKey: (key: string) => void
  prompt: string
  setPrompt: (prompt: string) => void
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({
  apiKey,
  setApiKey,
  prompt,
  setPrompt,
  isOpen,
  onClose,
}: SettingsModalProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localPrompt, setLocalPrompt] = useState(prompt)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey)
      setLocalPrompt(prompt)
    }
  }, [isOpen, apiKey, prompt])

  const handleSave = () => {
    setApiKey(localApiKey)
    setPrompt(localPrompt)
    onClose()
  }

  const handleCancel = () => {
    setLocalApiKey(apiKey)
    setLocalPrompt(prompt)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* API Key */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4 text-primary" />
                API Key
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="pr-10"
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
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>

            {/* Default System Prompt */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-primary" />
                Default System Prompt
              </label>
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                placeholder="Enter a default system prompt (optional)..."
                className={cn(
                  "w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
              />
              <p className="text-xs text-muted-foreground">
                This prompt will be used as the default for all requests. You can override it per request.
              </p>
            </div>

            {/* API Endpoint Info */}
            <div className="rounded-lg bg-muted/50 border border-border p-4">
              <h4 className="text-sm font-medium mb-2">API Endpoint</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded">/api/chat</code>
              <p className="text-xs text-muted-foreground mt-2">
                Supports GET, POST, and OPTIONS methods. Include your API key in the x-api-key header.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
