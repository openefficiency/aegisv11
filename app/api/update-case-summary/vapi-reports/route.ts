import { NextResponse } from "next/server";
import { vapiClient } from "@/lib/vapi-client";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Fetching VAPI reports...");
    const reports = await vapiClient.fetchReports();

    console.log(`Found ${reports.length} VAPI reports`);

    // Store/update reports in database
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
    });
  } catch (error) {
    console.error("Error fetching VAPI reports:", error);
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
