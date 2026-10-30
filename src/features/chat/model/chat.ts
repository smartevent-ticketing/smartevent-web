export interface ChatAction {
  type: "VIEW_EVENT" | "BROWSE_EVENTS"
  route: string
  label: string
  event_id?: string | null
}

export interface EventCard {
  id: string
  name: string
  slug: string
  detail_path: string
  city?: string | null
  venue_name?: string | null
  start_time?: string | null
  end_time?: string | null
  price?: string | null
  currency?: string | null
  ticket_type_id?: string | null
  sale_phase_id?: string | null
  price_observed_at?: string | null
  price_basis?: string | null
}

export type DialogueScope = "UNKNOWN" | "TOTAL" | "PER_TICKET"

export interface DialogueState {
  city?: string | null
  quantity?: number | null
  budget_amount?: number | null
  budget_scope?: DialogueScope
  event_name?: string | null
  search_query?: string | null
  active_intent?: string | null
  start_from?: string | null
  start_before?: string | null
  price_comparison?: "LT" | "LTE" | null
  faq_topic?: string | null
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
  actions?: ChatAction[]
  events?: EventCard[]
  has_more?: boolean
  mode?: string
  status?: string
  citations: Citation[]
  event_links?: ChatEventLink[]
}

export interface ChatEventLink {
  event_id: string
  title: string
  slug: string
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
  actions?: ChatAction[]
  events?: EventCard[]
  has_more?: boolean
  mode?: string
  error_code?: string
  citations?: Citation[]
  event_links?: ChatEventLink[]
}
