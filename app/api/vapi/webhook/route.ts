import { type NextRequest, NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client-fixed"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log("VAPI webhook received:", payload)

    // Process the webhook
    const report = await vapiClient.processWebhook(payload)

    if (report) {
      console.log("VAPI report created:", report.id)
      return NextResponse.json({ success: true, reportId: report.id })
    } else {
      console.log("No report created from webhook")
      return NextResponse.json({ success: false, message: "No report created" })
    }
  } catch (error) {
    console.error("VAPI webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "VAPI webhook endpoint is active" })
}
