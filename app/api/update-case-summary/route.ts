import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { caseId, summary, sessionId } = await request.json()

    const { error } = await supabase
      .from("cases")
      .update({
        vapi_report_summary: summary,
        vapi_session_id: sessionId
      })
      .eq("id", caseId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating case summary:", error)
    return NextResponse.json({ error: "Failed to update case summary" }, { status: 500 })
  }
}