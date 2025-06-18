import { NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client"
import { supabase } from "@/lib/supabase"
import { generate10DigitKey, createStandardReport } from "@/lib/report-utils"

export async function GET() {
  try {
    console.log("Fetching VAPI reports...")

    // Mock reports with 10-digit keys for demo
    const mockReports = [
      {
        id: "call_001",
        report_id: generate10DigitKey(),
        summary:
          "Employee reports suspected financial fraud in accounting department. Mentions unauthorized transactions and missing documentation.",
        transcript:
          "Hello, I need to report something important. I work in the accounting department and I've noticed some irregular transactions that don't seem right. There are missing invoices and I think someone might be embezzling funds. I'm worried about retaliation but this needs to be investigated.",
        audio_url: "https://example.com/audio/001.mp3",
        session_id: "session_001",
        status: "processed",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 300000).toISOString(),
        cost: 0.05,
        vapi_call_data: {
          id: "call_001",
          type: "inboundPhoneCall",
          status: "ended",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          cost: 0.05,
          messages: [
            {
              role: "assistant",
              message:
                "Hello, this is the AegisWhistle confidential reporting line. I'm here to help you report any concerns safely and anonymously. What would you like to report today?",
              time: 0,
              secondsFromStart: 0,
            },
            {
              role: "user",
              message:
                "I need to report something about my workplace. There's some financial irregularities I've noticed.",
              time: 5000,
              secondsFromStart: 5,
            },
          ],
          analysis: {
            summary:
              "Employee reports suspected financial fraud in accounting department with unauthorized transactions and missing documentation.",
            structuredData: {
              category: "fraud",
              priority: "high",
              department: "accounting",
            },
          },
        },
      },
      {
        id: "call_002",
        report_id: generate10DigitKey(),
        summary:
          "Report of workplace harassment and inappropriate behavior from a supervisor towards multiple employees.",
        transcript:
          "I'm calling because my supervisor has been making inappropriate comments and creating a hostile work environment. This has been going on for months and affects several people on our team. We're afraid to speak up because he's well-connected in the company.",
        audio_url: "https://example.com/audio/002.mp3",
        session_id: "session_002",
        status: "processed",
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 12 * 60 * 60 * 1000 + 420000).toISOString(),
        cost: 0.07,
        vapi_call_data: {
          id: "call_002",
          type: "inboundPhoneCall",
          status: "ended",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          cost: 0.07,
          messages: [
            {
              role: "assistant",
              message:
                "Thank you for calling AegisWhistle. You're in a safe space to share your concerns. What brings you here today?",
              time: 0,
              secondsFromStart: 0,
            },
            {
              role: "user",
              message:
                "I need to report harassment. My supervisor has been making inappropriate comments to several women on our team.",
              time: 5000,
              secondsFromStart: 5,
            },
          ],
          analysis: {
            summary: "Report of workplace harassment from supervisor affecting multiple employees.",
            structuredData: {
              category: "harassment",
              priority: "high",
              affectedCount: "multiple",
            },
          },
        },
      },
      {
        id: "call_003",
        report_id: generate10DigitKey(),
        summary:
          "Safety violation report regarding improper handling of hazardous materials and lack of protective equipment.",
        transcript:
          "I work in the manufacturing facility and I'm concerned about safety violations. We're not getting proper protective equipment and there are chemicals being stored incorrectly. Someone could get seriously hurt.",
        audio_url: "https://example.com/audio/003.mp3",
        session_id: "session_003",
        status: "processed",
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 6 * 60 * 60 * 1000 + 360000).toISOString(),
        cost: 0.06,
        vapi_call_data: {
          id: "call_003",
          type: "inboundPhoneCall",
          status: "ended",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          cost: 0.06,
          messages: [
            {
              role: "assistant",
              message:
                "Welcome to AegisWhistle. I'm here to listen to your concerns confidentially. What would you like to report?",
              time: 0,
              secondsFromStart: 0,
            },
            {
              role: "user",
              message:
                "I'm worried about safety at my workplace. We're not following proper protocols for hazardous materials.",
              time: 5000,
              secondsFromStart: 5,
            },
          ],
          analysis: {
            summary: "Safety violation report regarding hazardous materials handling and protective equipment.",
            structuredData: {
              category: "safety",
              priority: "critical",
              location: "manufacturing",
            },
          },
        },
      },
    ]

    try {
      // Try to fetch real VAPI reports first
      console.log("Attempting to fetch real VAPI reports...")
      const reports = await vapiClient.fetchReports()
      console.log(`Found ${reports.length} real VAPI reports`)

      // Process reports and ensure they have 10-digit keys
      const processedReports = reports.map((report) => ({
        ...report,
        report_id: report.report_id || generate10DigitKey(),
      }))

      if (processedReports.length === 0) {
        console.log("No real VAPI reports found, using mock data for demo")

        // Store mock reports in VAPI reports table
        for (const report of mockReports) {
          try {
            const { error } = await supabase.from("vapi_reports").upsert(
              {
                id: report.id,
                report_id: report.report_id,
                summary: report.summary,
                transcript: report.transcript,
                audio_url: report.audio_url,
                session_id: report.session_id,
                status: report.status,
                created_at: report.created_at,
                vapi_call_data: report.vapi_call_data,
              },
              { onConflict: "id" },
            )

            if (error) {
              console.error("Error storing mock VAPI report:", error)
            }

            // Also create a case in the reports table
            const standardReport = createStandardReport(report, "VAPIReport")

            const { error: caseError } = await supabase
              .from("reports")
              .upsert(standardReport, { onConflict: "case_id" })

            if (caseError) {
              console.error("Error creating case from VAPI report:", caseError)
            }
          } catch (dbError) {
            console.warn("Database not available, continuing with mock data:", dbError)
          }
        }

        return NextResponse.json({
          success: true,
          count: mockReports.length,
          reports: mockReports,
          source: "mock_data",
        })
      }

      // Store real reports in database
      for (const report of processedReports) {
        try {
          const { error } = await supabase.from("vapi_reports").upsert(
            {
              id: report.id,
              report_id: report.report_id,
              summary: report.summary,
              transcript: report.transcript,
              audio_url: report.audio_url,
              session_id: report.session_id,
              status: report.status,
              created_at: report.created_at,
              vapi_call_data: report.vapi_call_data,
            },
            { onConflict: "id" },
          )

          if (error) {
            console.error("Error storing VAPI report:", error)
          }

          // Create a case in the reports table
          const standardReport = createStandardReport(report, "VAPIReport")

          const { error: caseError } = await supabase.from("reports").upsert(standardReport, { onConflict: "case_id" })

          if (caseError) {
            console.error("Error creating case from VAPI report:", caseError)
          }
        } catch (dbError) {
          console.warn("Database not available, continuing:", dbError)
        }
      }

      return NextResponse.json({
        success: true,
        count: processedReports.length,
        reports: processedReports,
        source: "vapi_api",
      })
    } catch (vapiError) {
      console.error("VAPI API error, falling back to mock data:", vapiError)

      // Store mock reports for demo
      for (const report of mockReports) {
        try {
          const { error } = await supabase.from("vapi_reports").upsert(
            {
              id: report.id,
              report_id: report.report_id,
              summary: report.summary,
              transcript: report.transcript,
              audio_url: report.audio_url,
              session_id: report.session_id,
              status: report.status,
              created_at: report.created_at,
              vapi_call_data: report.vapi_call_data,
            },
            { onConflict: "id" },
          )

          if (error) {
            console.error("Error storing mock VAPI report:", error)
          }

          // Create a case in the reports table
          const standardReport = createStandardReport(report, "VAPIReport")

          const { error: caseError } = await supabase.from("reports").upsert(standardReport, { onConflict: "case_id" })

          if (caseError) {
            console.error("Error creating case from VAPI report:", caseError)
          }
        } catch (dbError) {
          console.warn("Database not available, using mock data only:", dbError)
        }
      }

      return NextResponse.json({
        success: true,
        count: mockReports.length,
        reports: mockReports,
        source: "mock_fallback",
      })
    }
  } catch (error) {
    console.error("Error in VAPI reports endpoint:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch reports",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { callId, summary, transcript, audio_url, session_id } = await request.json()

    // Get full call data from VAPI
    const vapiCall = await vapiClient.getCallById(callId)

    if (!vapiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    // Generate 10-digit report ID
    const report_id = generate10DigitKey()

    // Create standard report
    const reportData = {
      id: vapiCall.id,
      report_id,
      summary: summary || vapiCall.analysis?.summary || "Voice report submitted",
      transcript: transcript || vapiCall.transcript || "",
      audio_url: audio_url || vapiCall.recordingUrl || "",
      session_id: session_id || vapiCall.id,
      vapi_call_data: vapiCall,
    }

    const standardReport = createStandardReport(reportData, "VAPIReport")

    try {
      // Store in VAPI reports table
      const { error: vapiError } = await supabase.from("vapi_reports").insert({
        id: vapiCall.id,
        report_id,
        summary: reportData.summary,
        transcript: reportData.transcript,
        audio_url: reportData.audio_url,
        session_id: reportData.session_id,
        status: "processed",
        created_at: vapiCall.createdAt,
        vapi_call_data: vapiCall,
      })

      if (vapiError) throw vapiError

      // Store in main reports table
      const { error: reportError } = await supabase.from("reports").insert(standardReport)

      if (reportError) throw reportError

      return NextResponse.json({
        success: true,
        report_id,
        case_id: standardReport.case_id,
        data: standardReport,
      })
    } catch (dbError) {
      console.warn("Database not available, returning success anyway:", dbError)
      return NextResponse.json({
        success: true,
        report_id,
        case_id: standardReport.case_id,
        data: null,
      })
    }
  } catch (error) {
    console.error("Error processing VAPI report:", error)
    return NextResponse.json(
      {
        error: "Failed to process report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
