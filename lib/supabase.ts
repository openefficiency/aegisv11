import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  organization_id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "ethics_officer" | "investigator"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  case_number: string
  secret_code: string
  organization_id: string
  title: string
  description: string
  category: "fraud" | "abuse" | "discrimination" | "harassment" | "safety" | "corruption" | "other"
  status: "open" | "under_investigation" | "resolved" | "escalated" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  location?: string
  date_occurred?: string
  is_anonymous: boolean
  contact_info?: string
  assigned_to?: string
  created_by?: string
  recovery_amount: number
  reward_amount: number
  reward_status: "pending" | "approved" | "paid" | "denied"
  vapi_report_summary?: string
  vapi_session_id?: string
  created_at: string
  updated_at: string
}

export interface CaseUpdate {
  id: string
  case_id: string
  user_id?: string
  update_type: "status" | "progress" | "received" | "escalated" | "resolved"
  message: string
  is_public: boolean
  created_at: string
}

export interface Interview {
  id: string
  case_id: string
  investigator_id: string
  interviewee_name: string
  interviewee_type: string
  scheduled_date: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}
