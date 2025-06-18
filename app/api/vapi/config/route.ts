import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      shareKey: process.env.VAPI_SHARE_KEY,
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
      available: !!(process.env.VAPI_SHARE_KEY && process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID),
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error getting VAPI config:", error)
    return NextResponse.json({ error: "Configuration error" }, { status: 500 })
  }
}
