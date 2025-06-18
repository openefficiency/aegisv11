import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Return VAPI configuration (non-sensitive data only)
    const config = {
      shareKey: process.env.VAPI_SHARE_KEY || "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063",
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "d63127d5-8ec7-4ed7-949a-1942ee4a3917",
      hasApiKey: !!process.env.VAPI_API_KEY,
      vapiUrl: `https://vapi.ai/?demo=true&shareKey=${process.env.VAPI_SHARE_KEY || "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063"}&assistantId=${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "d63127d5-8ec7-4ed7-949a-1942ee4a3917"}`,
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error getting VAPI config:", error)
    return NextResponse.json({ error: "Failed to get VAPI configuration" }, { status: 500 })
  }
}
