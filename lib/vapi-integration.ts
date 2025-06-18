import { supabase } from "./supabase"
import { generate10DigitKey } from "./report-utils"
import type { ProcessedVAPIReport } from "./vapi-client"

export interface VAPIWebhookPayload {
  message: {
    type: string
    call?: {
      id: string
      status: string
      createdAt: string
      endedAt?: string
      cost?: number
      transcript?: string
      recordingUrl?: string
      summary?: string
      analysis?: any
      messages?: Array<{
        role: string
        message: string
        time: number
        secondsFromStart: number
      }>
    }
  }
}

export class VAPIIntegrationService {
  private static instance: VAPIIntegrationService
  private webhookListeners: Array<(report: ProcessedVAPIReport) => void> = []
  private realTimeListeners: Array<(data: any) => void> = []

  static getInstance(): VAPIIntegrationService {
    if (!VAPIIntegrationService.instance) {
      VAPIIntegrationService.instance = new VAPIIntegrationService()
    }
    return VAPIIntegrationService.instance
  }

  // Subscribe to real-time VAPI updates
  onNewReport(callback: (report: ProcessedVAPIReport) => void) {
    this.webhookListeners.push(callback)
  }

  // Subscribe to real-time transcript updates
  onRealTimeUpdate(callback: (data: any) => void) {
    this.realTimeListeners.push(callback)
  }

  // Process incoming VAPI webhook
  async processWebhook(payload: VAPIWebhookPayload): Promise<ProcessedVAPIReport | null> {
    try {
      const { message } = payload

      if (message.type === "end-of-call-report" && message.call) {
        const call = message.call

        // Generate unique identifiers
        const case_id = generate10DigitKey()
        const report_id = generate10DigitKey()

        // Process the call into a standardized report
        const processedReport: ProcessedVAPIReport = {
          id: call.id,
          case_id,
          report_id,
          title: this.extractTitle(call.transcript || call.summary || ""),
          summary: call.summary || this.generateSummary(call.transcript || ""),
          transcript: call.transcript || "",
          audio_url: call.recordingUrl || "",
          session_id: call.id,
          category: this.categorizeContent(call.transcript || call.summary || ""),
          priority: this.determinePriority(call.transcript || call.summary || ""),
          status: "processed",
          report_source: "VAPIReport",
          vapi_call_data: call,
          created_at: call.createdAt,
          ended_at: call.endedAt,
          tracking_code: generate10DigitKey(),
          secret_code: this.generateSecretCode(),
        }

        // Save to database
        await this.saveToDatabase(processedReport)

        // Notify listeners (real-time updates)
        this.notifyListeners(processedReport)

        return processedReport
      }

      // Handle real-time transcript updates
      if (message.type === "transcript" && message.call) {
        const transcriptData = {
          type: "transcript_update",
          callId: message.call.id,
          transcript: message.call.transcript,
          timestamp: new Date().toISOString(),
        }

        // Notify real-time listeners
        this.notifyRealTimeListeners(transcriptData)
      }

      return null
    } catch (error) {
      console.error("Error processing VAPI webhook:", error)
      return null
    }
  }

  // Save processed report to database
  private async saveToDatabase(report: ProcessedVAPIReport) {
    try {
      // Save to VAPI reports table
      const { error: vapiError } = await supabase.from("vapi_reports").upsert({
        id: report.id,
        report_id: report.report_id,
        summary: report.summary,
        transcript: report.transcript,
        audio_url: report.audio_url,
        session_id: report.session_id,
        status: report.status,
        vapi_call_data: report.vapi_call_data,
        processed_to_case_id: report.case_id,
        created_at: report.created_at,
        ended_at: report.ended_at,
        processed_at: new Date().toISOString(),
      })

      if (vapiError) {
        console.error("Error saving VAPI report:", vapiError)
      }

      // Save to main reports table
      const { error: reportError } = await supabase.from("reports").upsert({
        case_id: report.case_id,
        case_number: `WB-${new Date().getFullYear()}-${report.case_id}`,
        title: report.title,
        description: report.summary,
        category: report.category,
        status: "open",
        priority: report.priority,
        report_source: report.report_source,
        report_id: report.report_id,
        secret_code: report.secret_code,
        tracking_code: report.tracking_code,
        vapi_report_summary: report.summary,
        vapi_session_id: report.session_id,
        vapi_transcript: report.transcript,
        vapi_audio_url: report.audio_url,
        vapi_call_data: report.vapi_call_data,
        is_anonymous: true,
        reward_amount: 0,
        recovery_amount: 0,
        reward_status: "pending",
        created_at: report.created_at,
        updated_at: new Date().toISOString(),
      })

      if (reportError) {
        console.error("Error saving to reports table:", reportError)
      }

      console.log(`✅ Saved VAPI report ${report.report_id} to database`)
    } catch (error) {
      console.error("Database save error:", error)
    }
  }

  // Notify all listeners of new report
  private notifyListeners(report: ProcessedVAPIReport) {
    this.webhookListeners.forEach((callback) => {
      try {
        callback(report)
      } catch (error) {
        console.error("Error in webhook listener:", error)
      }
    })
  }

  // Notify real-time listeners
  private notifyRealTimeListeners(data: any) {
    this.realTimeListeners.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("Error in real-time listener:", error)
      }
    })
  }

  // Extract meaningful title from content
  private extractTitle(content: string): string {
    if (!content) return "Voice Report"

    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    if (sentences.length === 0) return "Voice Report"

    const firstSentence = sentences[0].trim()
    if (firstSentence.length > 80) {
      return firstSentence.substring(0, 77) + "..."
    }

    return firstSentence || "Voice Report"
  }

  // Generate summary from transcript
  private generateSummary(transcript: string): string {
    if (!transcript) return "Voice report submitted"

    const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const summary = sentences.slice(0, 3).join(". ").trim()

    return summary.length > 200 ? summary.substring(0, 197) + "..." : summary
  }

  // Categorize content based on keywords
  private categorizeContent(content: string): string {
    const text = content.toLowerCase()

    const categories = {
      harassment: ["harassment", "harass", "bullying", "hostile", "inappropriate", "sexual"],
      fraud: ["fraud", "money", "steal", "embezzle", "financial", "accounting", "budget"],
      safety: ["safety", "unsafe", "danger", "accident", "injury", "hazard", "equipment"],
      discrimination: ["discrimination", "discriminate", "racial", "gender", "age", "bias"],
      corruption: ["corruption", "corrupt", "bribe", "kickback", "favor", "influence"],
      retaliation: ["retaliation", "revenge", "punish", "fired", "demoted", "threatened"],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category
      }
    }

    return "other"
  }

  // Determine priority based on content
  private determinePriority(content: string): string {
    const text = content.toLowerCase()

    const urgentKeywords = ["urgent", "emergency", "immediate", "critical", "danger", "threat", "violence"]
    const highKeywords = ["serious", "important", "significant", "major", "concern", "violation"]

    if (urgentKeywords.some((keyword) => text.includes(keyword))) {
      return "critical"
    } else if (highKeywords.some((keyword) => text.includes(keyword))) {
      return "high"
    } else {
      return "medium"
    }
  }

  // Generate secret code for case tracking
  private generateSecretCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Fetch recent VAPI reports with enhanced filtering
  async fetchRecentReports(limit = 50, filters?: any): Promise<ProcessedVAPIReport[]> {
    try {
      let query = supabase.from("vapi_reports").select("*").order("created_at", { ascending: false }).limit(limit)

      // Apply filters if provided
      if (filters?.category) {
        query = query.eq("category", filters.category)
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority)
      }
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching VAPI reports:", error)
        return []
      }

      return data.map((report) => ({
        id: report.id,
        case_id: report.processed_to_case_id || generate10DigitKey(),
        report_id: report.report_id,
        title: this.extractTitle(report.summary || ""),
        summary: report.summary || "",
        transcript: report.transcript || "",
        audio_url: report.audio_url || "",
        session_id: report.session_id,
        category: this.categorizeContent(report.summary || ""),
        priority: this.determinePriority(report.summary || ""),
        status: report.status,
        report_source: "VAPIReport" as const,
        vapi_call_data: report.vapi_call_data,
        created_at: report.created_at,
        ended_at: report.ended_at,
        tracking_code: report.tracking_code || generate10DigitKey(),
        secret_code: report.secret_code || this.generateSecretCode(),
      }))
    } catch (error) {
      console.error("Error fetching reports:", error)
      return []
    }
  }

  // Get real-time updates using Supabase subscriptions
  subscribeToReports(callback: (report: any) => void) {
    const subscription = supabase
      .channel("vapi_reports")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vapi_reports",
        },
        (payload) => {
          console.log("New VAPI report received:", payload.new)
          callback(payload.new)
        },
      )
      .subscribe()

    return subscription
  }

  // Advanced analytics for VAPI reports
  async getReportAnalytics(timeRange = "7d") {
    try {
      const { data, error } = await supabase
        .from("vapi_reports")
        .select("category, priority, status, created_at")
        .gte("created_at", this.getTimeRangeStart(timeRange))

      if (error) {
        console.error("Error fetching analytics:", error)
        return null
      }

      // Process analytics data
      const analytics = {
        totalReports: data.length,
        byCategory: this.groupBy(data, "category"),
        byPriority: this.groupBy(data, "priority"),
        byStatus: this.groupBy(data, "status"),
        dailyTrend: this.getDailyTrend(data),
      }

      return analytics
    } catch (error) {
      console.error("Error calculating analytics:", error)
      return null
    }
  }

  private getTimeRangeStart(range: string): string {
    const now = new Date()
    const days = Number.parseInt(range.replace("d", ""))
    now.setDate(now.getDate() - days)
    return now.toISOString()
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key] || "unknown"
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }

  private getDailyTrend(data: any[]) {
    const dailyData = data.reduce((trend, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0]
      trend[date] = (trend[date] || 0) + 1
      return trend
    }, {})

    return Object.entries(dailyData).map(([date, count]) => ({ date, count }))
  }
}

// Export singleton instance
export const vapiIntegration = VAPIIntegrationService.getInstance()
