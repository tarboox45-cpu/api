"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import {
  Settings,
  X,
  Moon,
  Sun,
  Zap,
  FileText,
  Trash2,
  Key,
  MessageSquare,
} from "lucide-react"

interface SettingsPanelProps {
  apiKey: string
  setApiKey: (key: string) => void
  prompt: string
  setPrompt: (prompt: string) => void
  streamingMode: boolean
  setStreamingMode: (mode: boolean) => void
  onClearMessages: () => void
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({
  apiKey,
  setApiKey,
  prompt,
  setPrompt,
  streamingMode,
  setStreamingMode,
  onClearMessages,
  isOpen,
  onClose,
}: SettingsPanelProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4 text-muted-foreground" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              Required for authentication with the chat API
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              System Prompt (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a system prompt to guide the AI..."
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Streaming Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Streaming Mode</p>
                <p className="text-xs text-muted-foreground">
                  Show responses as they generate
                </p>
              </div>
            </div>
            <Switch
              checked={streamingMode}
              onCheckedChange={setStreamingMode}
            />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {theme}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={cycleTheme}>
              {theme === "light" && "Light"}
              {theme === "dark" && "Dark"}
              {theme === "system" && "System"}
            </Button>
          </div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Clear Messages */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-destructive">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </label>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm("Are you sure you want to clear all messages in this session?")) {
                  onClearMessages()
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Current Session
            </Button>
          </div>

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">API Usage</p>
                <p>
                  This interface connects to /api/chat endpoint. Supports both
                  streaming and full response modes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
