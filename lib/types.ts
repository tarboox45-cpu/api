export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  thinking?: string
  timestamp: number
  isStreaming?: boolean
  error?: string
}

export interface Session {
  id: string
  name: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface ChatSettings {
  apiKey: string
  prompt: string
  streamingMode: boolean
}

export interface StreamChunk {
  type: "thinking" | "response" | "finish"
  content: string
}
