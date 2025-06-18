// lib/vapi-client.ts
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

  async fetchReports(): Promise<any[]> {
    try {
      console.log("Fetching calls from VAPI API...")
      const calls = await this.fetchCalls()
      console.log(`Retrieved ${calls.length} calls from VAPI`)

      // Filter and transform calls into report format with 10-digit keys
      const reports = calls
        .filter((call) => call.status === "ended" && call.transcript)
        .map((call) => ({
          id: call.id,
          case_id: this.generate10DigitKey(), // 10-digit alphanumeric key
          report_id: this.generate10DigitKey(), // 10-digit alphanumeric key
          summary: call.analysis?.summary || this.extractSummaryFromTranscript(call.transcript || ""),
          transcript: call.transcript || "",
          audio_url: call.recordingUrl || call.stereoRecordingUrl || call.monoRecordingUrl || "",
          session_id: call.id,
          status: "processed",
          report_source: "VAPIReport",
          priority: this.determinePriority(call.transcript || ""),
          category: this.categorizeReport(call.transcript || ""),
          created_at: call.createdAt,
          ended_at: call.endedAt,
          cost: call.cost,
          messages: call.messages || [],
          analysis: call.analysis,
          vapi_call_data: call,
        }))

      console.log(`Converted ${reports.length} calls to reports with 10-digit keys`)
      return reports
    } catch (error) {
      console.error("Error fetching VAPI reports:", error)
      throw error
    }
  }

  private extractSummaryFromTranscript(transcript: string): string {
    const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    if (sentences.length === 0) return "Voice report submitted"

    const summary = sentences.slice(0, 3).join(". ").trim()
    return summary.length > 200 ? summary.substring(0, 200) + "..." : summary
  }

  private determinePriority(transcript: string): string {
    const urgentKeywords = ["urgent", "emergency", "immediate", "critical", "danger", "threat"]
    const highKeywords = ["serious", "important", "concern", "violation", "harassment"]

    const lowerTranscript = transcript.toLowerCase()

    if (urgentKeywords.some((keyword) => lowerTranscript.includes(keyword))) {
      return "urgent"
    } else if (highKeywords.some((keyword) => lowerTranscript.includes(keyword))) {
      return "high"
    } else {
      return "medium"
    }
  }

  private categorizeReport(transcript: string): string {
    const categories = {
      harassment: ["harassment", "bullying", "discrimination", "hostile"],
      financial: ["money", "fraud", "embezzlement", "financial", "budget"],
      safety: ["safety", "accident", "injury", "dangerous", "hazard"],
      policy: ["policy", "procedure", "violation", "compliance"],
      other: [],
    }

    const lowerTranscript = transcript.toLowerCase()

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerTranscript.includes(keyword))) {
        return category
      }
    }

    return "other"
  }

  generate10DigitKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 10; i++) {
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
}

// Create a server-side only instance of the VAPI client
// This will only be used in server components and server actions
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
