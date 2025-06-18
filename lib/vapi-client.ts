// Enhanced VAPI Client with tight integration
export interface VAPIConfig {
  apiKey: string
  baseUrl: string
  assistantId: string
  shareKey: string
}

export interface VAPICall {
  id: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  endedAt?: string
  cost?: number
  costBreakdown?: any
  messages?: VAPIMessage[]
  phoneNumber?: any
  customer?: any
  call?: any
  analysis?: VAPIAnalysis
  artifact?: any
  transcript?: string
  recordingUrl?: string
  summary?: string
  stereoRecordingUrl?: string
  monoRecordingUrl?: string
}

export interface VAPIMessage {
  time: number
  role: "user" | "assistant" | "system"
  message: string
  endTime?: number
  secondsFromStart?: number
}

export interface VAPIAnalysis {
  summary?: string
  structuredData?: any
  successEvaluation?: any
}

export interface ProcessedVAPIReport {
  id: string
  case_id: string
  report_id: string
  title: string
  summary: string
  transcript: string
  audio_url: string
  session_id: string
  category: string
  priority: string
  status: string
  report_source: "VAPIReport"
  vapi_call_data: any
  created_at: string
  ended_at?: string
  tracking_code: string
  secret_code: string
}

export class VAPIClient {
  private apiKey: string
  private baseUrl: string
  private assistantId: string
  private shareKey: string

  constructor(config: VAPIConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.vapi.ai"
    this.assistantId = config.assistantId
    this.shareKey = config.shareKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

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

  async fetchCalls(limit = 100): Promise<VAPICall[]> {
    try {
      const calls = await this.makeRequest(`/call?limit=${limit}`)
      return calls || []
    } catch (error) {
      console.error("Error fetching VAPI calls:", error)
      return []
    }
  }

  async getCallById(callId: string): Promise<VAPICall | null> {
    try {
      const call = await this.makeRequest(`/call/${callId}`)
      return call
    } catch (error) {
      console.error("Error fetching VAPI call:", error)
      return null
    }
  }

  async fetchReports(): Promise<ProcessedVAPIReport[]> {
    try {
      console.log("Fetching calls from VAPI API...")
      const calls = await this.fetchCalls()
      console.log(`Retrieved ${calls.length} calls from VAPI`)

      // Filter and transform calls into report format
      const reports = calls
        .filter((call) => call.status === "ended" && (call.transcript || call.summary))
        .map((call) => this.transformCallToReport(call))

      console.log(`Converted ${reports.length} calls to reports`)
      return reports
    } catch (error) {
      console.error("Error fetching VAPI reports:", error)
      throw error
    }
  }

  private transformCallToReport(call: VAPICall): ProcessedVAPIReport {
    const case_id = this.generate10DigitKey()
    const report_id = this.generate10DigitKey()
    const tracking_code = this.generate10DigitKey()
    const secret_code = this.generateSecretCode()

    return {
      id: call.id,
      case_id,
      report_id,
      title: this.extractTitle(call.transcript || call.summary || ""),
      summary: call.analysis?.summary || this.extractSummaryFromTranscript(call.transcript || ""),
      transcript: call.transcript || "",
      audio_url: call.recordingUrl || call.stereoRecordingUrl || call.monoRecordingUrl || "",
      session_id: call.id,
      category: this.categorizeReport(call.transcript || call.summary || ""),
      priority: this.determinePriority(call.transcript || call.summary || ""),
      status: "processed",
      report_source: "VAPIReport",
      vapi_call_data: call,
      created_at: call.createdAt,
      ended_at: call.endedAt,
      tracking_code,
      secret_code,
    }
  }

  private extractTitle(content: string): string {
    if (!content) return "Voice Report"

    // Extract first meaningful sentence
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)
    if (sentences.length === 0) return "Voice Report"

    const firstSentence = sentences[0].trim()
    if (firstSentence.length > 80) {
      return firstSentence.substring(0, 77) + "..."
    }

    return firstSentence || "Voice Report"
  }

  private extractSummaryFromTranscript(transcript: string): string {
    if (!transcript) return "Voice report submitted"

    const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const summary = sentences.slice(0, 4).join(". ").trim()

    return summary.length > 300 ? summary.substring(0, 297) + "..." : summary
  }

  private categorizeReport(content: string): string {
    const text = content.toLowerCase()

    const categories = {
      harassment: ["harassment", "harass", "bullying", "hostile", "inappropriate", "sexual", "unwanted"],
      fraud: ["fraud", "money", "steal", "embezzle", "financial", "accounting", "budget", "expense"],
      safety: ["safety", "unsafe", "danger", "accident", "injury", "hazard", "equipment", "workplace"],
      discrimination: ["discrimination", "discriminate", "racial", "gender", "age", "bias", "unfair"],
      corruption: ["corruption", "corrupt", "bribe", "kickback", "favor", "influence", "payoff"],
      retaliation: ["retaliation", "revenge", "punish", "fired", "demoted", "threatened"],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category
      }
    }

    return "other"
  }

  private determinePriority(content: string): string {
    const text = content.toLowerCase()

    const criticalKeywords = [
      "urgent",
      "emergency",
      "immediate",
      "critical",
      "danger",
      "threat",
      "violence",
      "suicide",
      "death",
    ]
    const highKeywords = ["serious", "important", "significant", "major", "concern", "violation", "illegal", "criminal"]
    const lowKeywords = ["minor", "small", "suggestion", "recommendation"]

    if (criticalKeywords.some((keyword) => text.includes(keyword))) {
      return "critical"
    } else if (highKeywords.some((keyword) => text.includes(keyword))) {
      return "high"
    } else if (lowKeywords.some((keyword) => text.includes(keyword))) {
      return "low"
    } else {
      return "medium"
    }
  }

  generate10DigitKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private generateSecretCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Create a new call (for initiating voice reports)
  async createCall(phoneNumber?: string, customData?: any): Promise<VAPICall> {
    try {
      const callData = {
        assistantId: this.assistantId,
        phoneNumber,
        metadata: customData,
      }

      const call = await this.makeRequest("/call", {
        method: "POST",
        body: JSON.stringify(callData),
      })

      return call
    } catch (error) {
      console.error("Error creating VAPI call:", error)
      throw error
    }
  }

  // Get assistant information
  async getAssistant(): Promise<any> {
    try {
      const assistant = await this.makeRequest(`/assistant/${this.assistantId}`)
      return assistant
    } catch (error) {
      console.error("Error fetching assistant:", error)
      return null
    }
  }

  // Test connection
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

  // Real-time webhook processing
  async processWebhookData(webhookData: any): Promise<ProcessedVAPIReport | null> {
    try {
      // Transform webhook data into a call-like structure
      const call: VAPICall = {
        id: webhookData.call_id,
        type: "call",
        status: "ended",
        createdAt: webhookData.created_at,
        updatedAt: new Date().toISOString(),
        endedAt: webhookData.ended_at,
        transcript: webhookData.transcript,
        summary: webhookData.summary,
        cost: webhookData.cost,
        analysis: webhookData.analysis,
        messages: webhookData.messages,
      }

      return this.transformCallToReport(call)
    } catch (error) {
      console.error("Error processing webhook data:", error)
      return null
    }
  }
}

// Create a server-side only instance of the VAPI client
export const vapiClient = new VAPIClient({
  apiKey: process.env.VAPI_API_KEY || "",
  baseUrl: "https://api.vapi.ai",
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "",
  shareKey: process.env.VAPI_SHARE_KEY || "",
})

// Add a server-side only function to test VAPI credentials
export const testVAPICredentials = async () => {
  try {
    console.log("Testing VAPI connection with credentials...")
    return await vapiClient.testConnection()
  } catch (error: any) {
    console.error("VAPI Connection Error:", error)
    return false
  }
}
