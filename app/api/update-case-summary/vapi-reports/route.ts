import { NextResponse } from "next/server";
import { vapiClient } from "@/lib/vapi-client";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Fetching VAPI reports...");
    console.log("Fardeen-test-GET");

    // Check VAPI configuration
    const hasValidConfig =
      process.env.NEXT_PUBLIC_VAPI_API_KEY &&
      process.env.NEXT_PUBLIC_VAPI_API_KEY !==
        "0a4b2b25-ecba-4a82-864c-1b7f057260f5";

    console.log("VAPI Config Status:", {
      hasApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
      hasValidKey: hasValidConfig,
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "using_default",
    });

    // For demo purposes, create mock reports if VAPI is not accessible
    const mockReports = [
      {
        id: "call_001",
        report_id: "RPT001ABC",
        summary:
          "Employee reports suspected financial fraud in accounting department. Mentions unauthorized transactions and missing documentation.",
        transcript:
          "Hello, I need to report something important. I work in the accounting department and I've noticed some irregular transactions that don't seem right. There are missing invoices and I think someone might be embezzling funds. I'm worried about retaliation but this needs to be investigated.",
        audio_url: "https://example.com/audio/001.mp3",
        session_id: "session_001",
        status: "processed",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        ended_at: new Date(
          Date.now() - 24 * 60 * 60 * 1000 + 300000
        ).toISOString(), // 5 minutes later
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
            {
              role: "assistant",
              message:
                "I understand this took courage to call. Can you tell me more about what you've observed?",
              time: 10000,
              secondsFromStart: 10,
            },
            {
              role: "user",
              message:
                "I work in accounting and I've seen transactions that don't have proper documentation. Money going to vendors I don't recognize.",
              time: 15000,
              secondsFromStart: 15,
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
        report_id: "RPT002DEF",
        summary:
          "Report of workplace harassment and inappropriate behavior from a supervisor towards multiple employees.",
        transcript:
          "I'm calling because my supervisor has been making inappropriate comments and creating a hostile work environment. This has been going on for months and affects several people on our team. We're afraid to speak up because he's well-connected in the company.",
        audio_url: "https://example.com/audio/002.mp3",
        session_id: "session_002",
        status: "processed",
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        ended_at: new Date(
          Date.now() - 12 * 60 * 60 * 1000 + 420000
        ).toISOString(), // 7 minutes later
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
            {
              role: "assistant",
              message:
                "I'm sorry you're experiencing this. Your safety matters. Can you tell me more about what's been happening?",
              time: 10000,
              secondsFromStart: 10,
            },
          ],
          analysis: {
            summary:
              "Report of workplace harassment from supervisor affecting multiple employees.",
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
        report_id: "RPT003GHI",
        summary:
          "Safety violation report regarding improper handling of hazardous materials and lack of protective equipment.",
        transcript:
          "I work in the manufacturing facility and I'm concerned about safety violations. We're not getting proper protective equipment and there are chemicals being stored incorrectly. Someone could get seriously hurt.",
        audio_url: "https://example.com/audio/003.mp3",
        session_id: "session_003",
        status: "processed",
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        ended_at: new Date(
          Date.now() - 6 * 60 * 60 * 1000 + 360000
        ).toISOString(), // 6 minutes later
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
            summary:
              "Safety violation report regarding hazardous materials handling and protective equipment.",
            structuredData: {
              category: "safety",
              priority: "critical",
              location: "manufacturing",
            },
          },
        },
      },
    ];

    try {
      // Try to fetch real VAPI reports, but fall back to mock data if it fails
      console.log("VAPI CONNECTION!!!");
      const reports = await vapiClient.fetchCalls();
      console.log(`Found ${reports.length} real VAPI reports`);

      if (reports.length === 0) {
        console.log("No real VAPI reports found, using mock data for demo");
        // Store mock reports in database for demo
        for (const report of mockReports) {
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
            {
              onConflict: "id",
            }
          );

          if (error) {
            console.error("Error storing mock VAPI report:", error);
          }
        }

        return NextResponse.json({
          success: true,
          count: mockReports.length,
          reports: mockReports,
          source: "mock_data",
        });
      }

      // Store real reports in database
      for (const report of reports) {
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
          {
            onConflict: "id",
          }
        );

        if (error) {
          console.error("Error storing VAPI report:", error);
        }
      }

      return NextResponse.json({
        success: true,
        count: reports.length,
        reports,
        source: "vapi_api",
      });
    } catch (vapiError) {
      console.error("VAPI API error, falling back to mock data:", vapiError);

      // Store mock reports for demo
      for (const report of mockReports) {
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
          {
            onConflict: "id",
          }
        );

        if (error) {
          console.error("Error storing mock VAPI report:", error);
        }
      }

      return NextResponse.json({
        success: true,
        count: mockReports.length,
        reports: mockReports,
        source: "mock_fallback",
      });
    }
  } catch (error) {
    console.error("Error in VAPI reports endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reports",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Fardeen-test-post");
    const { callId, summary, transcript, audio_url, session_id } =
      await request.json();

    // Get full call data from VAPI
    const vapiCall = await vapiClient.getCallById(callId);

    if (!vapiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Generate report ID
    const report_id = vapiClient.generateReportId();

    // Store in database
    const { data, error } = await supabase
      .from("vapi_reports")
      .insert({
        id: vapiCall.id,
        report_id,
        summary:
          summary || vapiCall.analysis?.summary || "Voice report submitted",
        transcript: transcript || vapiCall.transcript || "",
        audio_url: audio_url || vapiCall.recordingUrl || "",
        session_id: session_id || vapiCall.id,
        status: "processed",
        created_at: vapiCall.createdAt,
        vapi_call_data: vapiCall,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, report_id, data });
  } catch (error) {
    console.error("Error processing VAPI report:", error);
    return NextResponse.json(
      {
        error: "Failed to process report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
