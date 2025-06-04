import { createClient } from "@supabase/supabase-js"

// Clean environment variables from quotes if present
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  // Remove quotes if present
  return value.replace(/^['"](.*)['"]$/, "$1")
}

const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Create a fallback client if environment variables are missing
const createFallbackClient = () => {
  console.warn("Using fallback Supabase client - database operations will be simulated")

  // Return a mock client that simulates Supabase operations
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Using fallback client") }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: () => ({ eq: async () => ({ data: null, error: null }) }),
    }),
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error("Using fallback client") }),
    },
  }
}

// Create and export the Supabase client
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : (createFallbackClient() as any)

// Enhanced existing Case interface
export interface Case {
  id: string
  case_number: string
  title: string
  description: string
  category: "fraud" | "abuse" | "discrimination" | "harassment" | "safety" | "corruption"
  status: "open" | "under_investigation" | "resolved" | "escalated"
  priority: "low" | "medium" | "high" | "critical"
  secret_code: string
  report_id: string // NEW: 10-digit alphanumeric ID
  tracking_code: string // NEW required tracking code from VAPI
  reward_amount?: number
  recovery_amount?: number
  reward_status: "pending" | "approved" | "paid"
  vapi_report_summary?: string
  vapi_session_id?: string
  vapi_transcript?: string // NEW
  vapi_audio_url?: string // NEW
  structured_data?: any // Parsed VAPI fields
  assigned_to?: string
  assigned_by?: string // NEW
  resolution_summary?: string // NEW
  whistleblower_update?: string // NEW
  crypto_address?: string // NEW
  crypto_currency?: string // NEW
  created_at: string
  updated_at: string
}

// Enhanced existing Profile interface
export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "ethics_officer" | "investigator"
  is_active: boolean
  department?: string // NEW
  created_at: string
}

// NEW: VAPI Report interface
export interface VAPIReport {
  id: string
  report_id: string
  summary: string
  transcript: string
  audio_url: string
  session_id: string
  status: "pending" | "processed"
  created_at: string
}

// NEW: Investigator Query interface
export interface InvestigatorQuery {
  id: string
  case_id: string
  investigator_id: string
  query_text: string
  response_text?: string
  response_audio_url?: string
  status: "pending" | "responded"
  created_at: string
  responded_at?: string
}

// NEW: Audit Trail interface
export interface AuditTrail {
  id: string
  user_id: string
  action: string
  entity_type: "case" | "reward" | "assignment" | "query"
  entity_id: string
  details: any
  timestamp: string
}

// NEW: Reward Transaction interface
export interface RewardTransaction {
  id: string
  case_id: string
  amount: number
  crypto_currency: string
  crypto_address: string
  transaction_hash?: string
  status: "pending" | "completed" | "failed"
  created_at: string
  completed_at?: string
}

// Existing interfaces remain the same
export interface CaseUpdate {
  id: string
  case_id: string
  message: string
  update_type: "progress" | "status" | "escalated" | "resolved"
  is_public: boolean
  created_at: string
}

export interface Interview {
  id: string
  case_id: string
  investigator_id: string
  interviewee_name: string
  interviewee_type: "witness" | "subject" | "expert"
  scheduled_date: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}
