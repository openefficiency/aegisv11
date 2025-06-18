import { supabase } from "./supabase"

export interface VAPIReport {
  id: string
  transcript: string
  summary: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  status: "new" | "in_progress" | "resolved"
  created_at: string
  audio_url?: string
  metadata?: any
}

export class VAPIClient {
  private apiKey: string
  private assistantId: string
  private shareKey: string

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || "fac3d79f-ac5c-4548-9581-be2a06fcdca1"
    this.assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "d63127d5-8ec7-4ed7-949a-1942ee4a3917"
    this.shareKey = process.env.VAPI_SHARE_KEY || "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063"
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.vapi.ai${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`VAPI API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("VAPI request failed:", error)
      throw error
    }
  }

  async processWebhook(payload: any): Promise<VAPIReport | null> {
    try {
      console.log("Processing VAPI webhook:", payload)

      if (!payload.transcript) {
        console.log("No transcript in payload")
        return null
      }

      // Create report from VAPI data
      const report: Omit<VAPIReport, "id" | "created_at"> = {
        transcript: payload.transcript,
        summary: payload.summary || this.generateSummary(payload.transcript),
        category: this.categorizeReport(payload.transcript),
        priority: this.determinePriority(payload.transcript),
        status: "new",
        audio_url: payload.recordingUrl,
        metadata: {
          call_id: payload.call?.id,
          duration: payload.call?.duration,
          vapi_data: payload,
        },
      }

      // Save to database
      const { data, error } = await supabase.from("vapi_reports").insert(report).select().single()

      if (error) {
        console.error("Error saving VAPI report:", error)
        return null
      }

      console.log("VAPI report saved:", data.id)
      return data
    } catch (error) {
      console.error("Error processing VAPI webhook:", error)
      return null
    }
  }

  private generateSummary(transcript: string): string {
    // Simple summary generation
    const sentences = transcript.split(".").filter((s) => s.trim().length > 0)
    return sentences.slice(0, 2).join(".") + "."
  }

  private categorizeReport(transcript: string): string {
    const text = transcript.toLowerCase()

    if (text.includes("harassment") || text.includes("discrimination")) {
      return "harassment"
    } else if (text.includes("fraud") || text.includes("money") || text.includes("financial")) {
      return "financial"
    } else if (text.includes("safety") || text.includes("accident") || text.includes("injury")) {
      return "safety"
    } else if (text.includes("policy") || text.includes("procedure")) {
      return "policy_violation"
    }

    return "other"
  }

  private determinePriority(transcript: string): "low" | "medium" | "high" | "critical" {
    const text = transcript.toLowerCase()

    if (text.includes("urgent") || text.includes("immediate") || text.includes("danger")) {
      return "critical"
    } else if (text.includes("serious") || text.includes("important")) {
      return "high"
    } else if (text.includes("concern") || text.includes("issue")) {
      return "medium"
    }

    return "low"
  }

  async getReports(limit = 50): Promise<VAPIReport[]> {
    try {
      const { data, error } = await supabase
        .from("vapi_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching VAPI reports:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching VAPI reports:", error)
      return []
    }
  }

  async fetchCalls(limit = 100): Promise<any[]> {
    try {
      const calls = await this.makeRequest(`/call?limit=${limit}`)
      return calls || []
    } catch (error) {
      console.error("Error fetching VAPI calls:", error)
      return []
    }
  }

  async getAssistant(): Promise<any> {
    try {
      const assistant = await this.makeRequest(`/assistant/${this.assistantId}`)
      return assistant
    } catch (error) {
      console.error("Error fetching assistant:", error)
      return null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing VAPI connection...")
      const assistant = await this.getAssistant()
      if (assistant) {
        console.log("✅ VAPI connection successful!")
        return true
      } else {
        console.log("❌ VAPI connection failed - no assistant data")
        return false
      }
    } catch (error) {
      console.error("❌ VAPI connection failed:", error)
      return false
    }
  }
}

export const vapiClient = new VAPIClient()
