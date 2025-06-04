import { NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client"

export async function GET() {
  try {
    console.log("Fetching VAPI reports...")

    // Check if we have valid VAPI credentials
    const hasValidConfig =
      process.env.NEXT_PUBLIC_VAPI_API_KEY &&
      process.env.NEXT_PUBLIC_VAPI_API_KEY !== "your_vapi_api_key_here" &&
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID &&
      process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID !== "your_vapi_assistant_id_here"

    if (!hasValidConfig) {
      console.log("VAPI credentials not configured, returning mock data")

      // Return mock data for development
      const mockReports = [
        {
          id: "mock-1",
          report_id: "MOCK001",
          summary: "Mock financial fraud report for testing purposes",
          transcript:
            "Hello, I need to report some financial irregularities in my department. There are fake invoices being processed and money is being diverted to personal accounts.",
          audio_url: "",
          session_id: "mock-session-1",
          status: "processed",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          ended_at: new Date().toISOString(),
          cost: 0.05,
          messages: [],
          analysis: { summary: "Mock financial fraud report" },
        },
        {
          id: "mock-2",
          report_id: "MOCK002",
          summary: "Mock workplace harassment report for testing",
          transcript:
            "I want to report harassment by my supervisor. They have been making inappropriate comments and creating a hostile work environment.",
          audio_url: "",
          session_id: "mock-session-2",
          status: "processed",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          ended_at: new Date().toISOString(),
          cost: 0.03,
          messages: [],
          analysis: { summary: "Mock harassment report" },
        },
      ]

      return NextResponse.json({
        success: true,
        reports: mockReports,
        source: "mock_data",
        message: "Using mock data - VAPI credentials not configured",
      })
    }

    // Fetch real VAPI reports
    try {
      const reports = await vapiClient.fetchReports()
      console.log(`Successfully fetched ${reports.length} VAPI reports`)

      return NextResponse.json({
        success: true,
        reports,
        source: "vapi_api",
        message: `Fetched ${reports.length} reports from VAPI`,
      })
    } catch (vapiError) {
      console.error("VAPI API error:", vapiError)

      // Fallback to mock data if VAPI fails
      const mockReports = [
        {
          id: "fallback-1",
          report_id: "FALLBACK001",
          summary: "Fallback report - VAPI API unavailable",
          transcript: "This is a fallback report generated when VAPI API is unavailable.",
          audio_url: "",
          session_id: "fallback-session-1",
          status: "processed",
          created_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          cost: 0,
          messages: [],
          analysis: { summary: "Fallback report" },
        },
      ]

      return NextResponse.json({
        success: true,
        reports: mockReports,
        source: "fallback_data",
        message: "VAPI API unavailable, using fallback data",
        error: vapiError.message,
      })
    }
  } catch (error) {
    console.error("Error in VAPI reports route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch VAPI reports",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
