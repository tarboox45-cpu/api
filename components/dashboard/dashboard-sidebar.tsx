"use client"

import { useState } from "react"
import type { Session } from "@/lib/types"
import type { RequestHistoryItem } from "./api-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Folder,
  Trash2,
  Pencil,
  Check,
  X,
  PanelLeftClose,
  History,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react"

interface SidebarProps {
  sessions: Session[]
  currentSessionId: string
  requestHistory: RequestHistoryItem[]
  onSelectSession: (id: string) => void
  onCreateSession: () => void
  onDeleteSession: (id: string) => void
  onRenameSession: (id: string, name: string) => void
  onSelectHistoryItem: (item: RequestHistoryItem) => void
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  sessions,
  currentSessionId,
  requestHistory,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onSelectHistoryItem,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [sessionsOpen, setSessionsOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(true)

  const startEditing = (session: Session) => {
    setEditingId(session.id)
    setEditName(session.name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameSession(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      case "POST":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400"
      case "OPTIONS":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
    if (status >= 400 && status < 500) return "bg-amber-500/20 text-amber-600 dark:text-amber-400"
    return "bg-red-500/20 text-red-600 dark:text-red-400"
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            xHost API
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Sessions Section */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => setSessionsOpen(!sessionsOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Sessions
              </span>
              {sessionsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {sessionsOpen && (
              <div className="mt-2 space-y-1">
                <Button
                  onClick={onCreateSession}
                  className="w-full justify-start gap-2"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  New Session
                </Button>

                <div className="space-y-1 mt-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                        session.id === currentSessionId
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                      onClick={() => {
                        if (editingId !== session.id) {
                          onSelectSession(session.id)
                        }
                      }}
                    >
                      {editingId === session.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              saveEdit()
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              cancelEdit()
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm">{session.name}</div>
                          </div>

                          <div className="hidden group-hover:flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(session)
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSession(session.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Request History Section */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              type="button"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
            >
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Request History
              </span>
              {historyOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {historyOpen && (
              <div className="mt-2 space-y-1">
                {requestHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2">
                    No requests yet
                  </p>
                ) : (
                  requestHistory.slice(0, 20).map((item) => (
                    <button
                      key={item.request.id}
                      type="button"
                      onClick={() => onSelectHistoryItem(item)}
                      className="w-full text-left rounded-lg px-3 py-2 hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            getMethodBadge(item.request.method)
                          )}
                        >
                          {item.request.method}
                        </span>
                        {item.response && (
                          <span
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded",
                              getStatusBadge(item.response.status)
                            )}
                          >
                            {item.response.status || "ERR"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sidebar-foreground truncate">
                        {item.request.request || "/api/chat"}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.request.timestamp)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
