import { type NextRequest, NextResponse } from "next/server"
import { processVAPIWebhook } from "@/lib/vapi-server-actions"

export async function POST(request: NextRequest) {
  try {
    console.log("🎤 VAPI Webhook received")

    const payload = await request.json()
    console.log("Webhook payload:", JSON.stringify(payload, null, 2))

    // Process the webhook using server action
    const result = await processVAPIWebhook(payload)

    if (result.success) {
      console.log(`✅ Webhook processed: ${result.message}`)
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.error("❌ Webhook processing failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error in VAPI webhook:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "VAPI Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    status: "ready",
  })
}
