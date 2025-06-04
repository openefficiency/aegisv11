// lib/vapi-client.ts
export interface VAPIConfig {
  apiKey: string;
  baseUrl: string;
  assistantId: string;
  shareKey: string;
}

export interface VAPICall {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: any;
  messages?: VAPIMessage[];
  phoneNumber?: any;
  customer?: any;
  call?: any;
  analysis?: VAPIAnalysis;
  artifact?: any;
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  stereoRecordingUrl?: string;
  monoRecordingUrl?: string;
}

export interface VAPIMessage {
  time: number;
  role: "user" | "assistant" | "system";
  message: string;
  endTime?: number;
  secondsFromStart?: number;
}

export interface VAPIAnalysis {
  summary?: string;
  structuredData?: any;
  successEvaluation?: any;
}

export class VAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private assistantId: string;
  private shareKey: string;

  constructor(config: VAPIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.vapi.ai";
    this.assistantId = config.assistantId;
    this.shareKey = config.shareKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(
          `VAPI API error: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("VAPI request failed:", error);
      throw error;
    }
  }

  async fetchCalls(limit: number = 100): Promise<VAPICall[]> {
    try {
      const calls = await this.makeRequest(`/call?limit=${limit}`);
      return calls || [];
    } catch (error) {
      console.error("Error fetching VAPI calls:", error);
      return [];
    }
  }

  async getCallById(callId: string): Promise<VAPICall | null> {
    try {
      const call = await this.makeRequest(`/call/${callId}`);
      return call;
    } catch (error) {
      console.error("Error fetching VAPI call:", error);
      return null;
    }
  }

  async fetchReports(): Promise<any[]> {
    try {
      console.log("Fetching calls from VAPI API...");
      const calls = await this.fetchCalls();
      console.log(`Retrieved ${calls.length} calls from VAPI`);

      // Filter and transform calls into report format
      const reports = calls
        .filter((call) => call.status === "ended" && call.transcript)
        .map((call) => ({
          id: call.id,
          report_id: this.generateReportId(),
          summary:
            call.analysis?.summary ||
            this.extractSummaryFromTranscript(call.transcript || ""),
          transcript: call.transcript || "",
          audio_url:
            call.recordingUrl ||
            call.stereoRecordingUrl ||
            call.monoRecordingUrl ||
            "",
          session_id: call.id,
          status: "processed",
          created_at: call.createdAt,
          ended_at: call.endedAt,
          cost: call.cost,
          messages: call.messages || [],
          analysis: call.analysis,
          vapi_call_data: call,
        }));

      console.log(`Converted ${reports.length} calls to reports`);
      return reports;
    } catch (error) {
      console.error("Error fetching VAPI reports:", error);
      throw error; // Re-throw to let the calling function handle fallback
    }
  }

  private extractSummaryFromTranscript(transcript: string): string {
    // Extract a meaningful summary from transcript
    const sentences = transcript
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length === 0) return "Voice report submitted";

    // Take first 2-3 meaningful sentences
    const summary = sentences.slice(0, 3).join(". ").trim();
    return summary.length > 200 ? summary.substring(0, 200) + "..." : summary;
  }

  generateReportId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create a new call (for initiating voice reports)
  async createCall(phoneNumber?: string, customData?: any): Promise<VAPICall> {
    try {
      const callData = {
        assistantId: this.assistantId,
        phoneNumber,
        metadata: customData,
      };

      const call = await this.makeRequest("/call", {
        method: "POST",
        body: JSON.stringify(callData),
      });

      return call;
    } catch (error) {
      console.error("Error creating VAPI call:", error);
      throw error;
    }
  }

  // Get assistant information
  async getAssistant(): Promise<any> {
    try {
      const assistant = await this.makeRequest(
        `/assistant/${this.assistantId}`
      );
      return assistant;
    } catch (error) {
      console.error("Error fetching assistant:", error);
      return null;
    }
  }
}

// Initialize with your actual VAPI credentials
export const vapiClient = new VAPIClient({
  apiKey:
    process.env.NEXT_PUBLIC_VAPI_API_KEY ||
    "2ca2e718-80b2-454a-a78b-e0560a06f1c4",
  baseUrl: "https://api.vapi.ai",
  assistantId: "265d793f-8179-4d20-a6cc-eb337577c512",
  shareKey: "6a029118-46e8-4cda-87f3-0ac2f287af8f",
});

export const testVAPICredentials = async () => {
  try {
    console.log("Testing VAPI connection with hardcoded credentials...");

    // Test basic API connection
    const response = await fetch(
      "https://api.vapi.ai/assistant/265d793f-8179-4d20-a6cc-eb337577c512",
      {
        headers: {
          Authorization: "Bearer 2ca2e718-80b2-454a-a78b-e0560a06f1c4",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("VAPI API Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("VAPI Assistant Data:", data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error("VAPI API Error:", response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error("VAPI Connection Error:", error);
    return { success: false, error: error.message };
  }
};
