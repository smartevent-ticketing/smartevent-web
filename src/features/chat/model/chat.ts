export type DialogueScope = "UNKNOWN" | "TOTAL" | "PER_TICKET"

export interface DialogueState {
  city?: string | null
  quantity?: number | null
  budget_amount?: number | null
  budget_scope?: DialogueScope
  event_name?: string | null
  search_query?: string | null
  active_intent?: string | null
}

export interface Citation {
  source_id: string
  version: string
  title: string
  canonical_uri: string
  chunk_id: string
  heading_path: string[]
  start: number
  end: number
}

export interface ChatResponseDTO {
  conversation_id: string
  intent: string
  state: DialogueState
  answer: string
  grounding: string
  tool_called?: string | null
  citations: Citation[]
}

export interface ChatRequestPayload {
  message: string
  conversation_id?: string | null
  previous_state?: DialogueState
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  intent?: string
  grounding?: string
  tool_called?: string | null
  citations?: Citation[]
}
