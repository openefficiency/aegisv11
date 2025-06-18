import { type NextRequest, NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("🎤 VAPI Webhook received")

    const payload = await request.json()
    console.log("Webhook payload:", JSON.stringify(payload, null, 2))

    // Process the webhook with your VAPI client
    const processedReport = await vapiClient.processWebhookData(payload)

    if (processedReport) {
      // Save to database
      const { error } = await supabase.from("vapi_reports").upsert({
        id: processedReport.id,
        report_id: processedReport.report_id,
        case_id: processedReport.case_id,
        title: processedReport.title,
        summary: processedReport.summary,
        transcript: processedReport.transcript,
        audio_url: processedReport.audio_url,
        session_id: processedReport.session_id,
        category: processedReport.category,
        priority: processedReport.priority,
        status: processedReport.status,
        vapi_call_data: processedReport.vapi_call_data,
        tracking_code: processedReport.tracking_code,
        secret_code: processedReport.secret_code,
        created_at: processedReport.created_at,
        ended_at: processedReport.ended_at,
        processed_at: new Date().toISOString(),
      })

      if (error) {
        console.error("❌ Error saving VAPI report to database:", error)
        return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
      }

      console.log("✅ VAPI report processed and saved:", processedReport.report_id)
      return NextResponse.json({
        success: true,
        message: "Webhook processed successfully",
        reportId: processedReport.report_id,
      })
    } else {
      console.log("⚠️ No report generated from webhook")
      return NextResponse.json({
        success: true,
        message: "Webhook received but no report generated",
      })
    }
  } catch (error) {
    console.error("❌ Error processing VAPI webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "VAPI Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
    hasApiKey: !!process.env.VAPI_API_KEY,
  })
}
