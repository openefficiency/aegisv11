import { createClient } from "@supabase/supabase-js"
import { getEnvVar } from "./env-validator"

// Get cleaned environment variables
const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL") || "https://vnjfnlnwfhnwzcfkdrsw.supabase.co"
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

// Create a fallback client if environment variables are missing
const createFallbackClient = () => {
  console.warn("⚠️ Using fallback Supabase client - database operations will be simulated")

  // Return a mock client that simulates Supabase operations
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Using fallback client") }),
        }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: () => ({ eq: async () => ({ data: null, error: null }) }),
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    }),
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error("Using fallback client") }),
    },
  }
}

// Create and export the Supabase client
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : (createFallbackClient() as any)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl || "https://vnjfnlnwfhnwzcfkdrsw.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("⚠️ Supabase credentials not found, using demo mode")
      return false
    }

    // Test with a simple query
    const { data, error } = await supabase.from("profiles").select("count(*)").limit(1)

    if (error) {
      console.warn("⚠️ Supabase connection test failed:", error.message)
      return false
    }

    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.warn("⚠️ Supabase connection error:", error)
    return false
  }
}

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
  report_id: string // 10-digit alphanumeric ID
  tracking_code: string // required tracking code from VAPI
  reward_amount?: number
  recovery_amount?: number
  reward_status: "pending" | "approved" | "paid"
  vapi_report_summary?: string
  vapi_session_id?: string
  vapi_transcript?: string
  vapi_audio_url?: string
  structured_data?: any // Parsed VAPI fields
  assigned_to?: string
  assigned_by?: string
  resolution_summary?: string
  whistleblower_update?: string
  crypto_address?: string
  crypto_currency?: string
  report_source?: "VAPIReport" | "MapReport" | "ManualReport"
  latitude?: number
  longitude?: number
  location?: string
  is_anonymous?: boolean
  contact_info?: string
  date_occurred?: string
  vapi_call_data?: any
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
  department?: string
  phone?: string
  created_at: string
}

// VAPI Report interface
export interface VAPIReport {
  id: string
  report_id: string
  summary: string
  transcript: string
  audio_url: string
  session_id: string
  status: "pending" | "processed"
  vapi_call_data?: any
  processed_to_case_id?: string
  created_at: string
  processed_at?: string
  ended_at?: string
}

// Investigator Query interface
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

// Audit Trail interface
export interface AuditTrail {
  id: string
  user_id: string
  action: string
  entity_type: "case" | "reward" | "assignment" | "query" | "report"
  entity_id: string
  details: any
  ip_address?: string
  user_agent?: string
  timestamp: string
}

// Reward Transaction interface
export interface RewardTransaction {
  id: string
  case_id: string
  amount: number
  crypto_currency: string
  crypto_address: string
  transaction_hash?: string
  status: "pending" | "completed" | "failed"
  created_by?: string
  created_at: string
  completed_at?: string
}

// Case Update interface
export interface CaseUpdate {
  id: string
  case_id: string
  message: string
  update_type: "progress" | "status" | "escalated" | "resolved"
  is_public: boolean
  created_by?: string
  created_at: string
}

// Interview interface
export interface Interview {
  id: string
  case_id: string
  investigator_id: string
  interviewee_name: string
  interviewee_type: "witness" | "subject" | "expert"
  scheduled_date: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  created_at: string
}

// Report interface (main reports table)
export interface Report {
  id: string
  case_id: string // 10-digit alphanumeric key
  case_number: string
  title: string
  description: string
  category: "fraud" | "abuse" | "discrimination" | "harassment" | "safety" | "corruption"
  status: "open" | "under_investigation" | "resolved" | "escalated" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  report_source: "VAPIReport" | "MapReport" | "ManualReport"
  report_type: string
  location?: string
  latitude?: number
  longitude?: number
  is_anonymous: boolean
  contact_info?: string
  date_occurred?: string
  secret_code: string
  report_id: string // 10-digit alphanumeric
  tracking_code?: string
  vapi_report_summary?: string
  vapi_session_id?: string
  vapi_transcript?: string
  vapi_audio_url?: string
  vapi_call_data?: any
  reward_amount: number
  recovery_amount: number
  reward_status: "pending" | "approved" | "paid"
  crypto_address?: string
  crypto_currency?: string
  assigned_to?: string
  assigned_by?: string
  resolution_summary?: string
  whistleblower_update?: string
  structured_data?: any
  created_at: string
  updated_at: string
}
