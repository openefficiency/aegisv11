import { type NextRequest, NextResponse } from "next/server"
import { fetchVAPIReports, testVAPIConnection } from "@/lib/vapi-server-actions"

export async function GET(request: NextRequest) {
  try {
    console.log("🎤 API: Fetching VAPI reports...")

    // Test connection first
    const connectionTest = await testVAPIConnection()
    if (!connectionTest.success) {
      console.warn("⚠️ VAPI connection test failed, proceeding anyway...")
    }

    // Fetch reports using server action
    const result = await fetchVAPIReports()

    if (result.success) {
      console.log(`✅ API: Successfully fetched ${result.data.length} VAPI reports`)
      return NextResponse.json({
        success: true,
        reports: result.data,
        count: result.data.length,
        source: result.source,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.error("❌ API: Failed to fetch VAPI reports:", result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        reports: result.fallback || [],
        count: 0,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("❌ API: Error in VAPI reports endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch VAPI reports",
        details: error instanceof Error ? error.message : "Unknown error",
        reports: [],
        count: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
