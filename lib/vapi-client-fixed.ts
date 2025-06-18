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

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || ""
    this.assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ""
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
}

export const vapiClient = new VAPIClient()
