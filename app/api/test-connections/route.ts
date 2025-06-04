import { NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing all connections...")

    const results = {
      timestamp: new Date().toISOString(),
      vapi: {
        connection: { success: false, error: "", data: null },
        calls: { success: false, error: "", calls: 0 },
      },
      supabase: {
        connection: { success: false, error: "", data: null },
        reports: { success: false, error: "", reports: 0 },
      },
      environment: {
        vapiApiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY
          ? `✅ Set (${process.env.NEXT_PUBLIC_VAPI_API_KEY.substring(0, 8)}...)`
          : "❌ Not set",
        vapiAssistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
          ? `✅ Set (${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID.substring(0, 8)}...)`
          : "❌ Not set",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 8)}...)`
          : "❌ Not set",
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 8)}...)`
          : "❌ Not set",
      },
    }

    // Test VAPI Connection
    try {
      console.log("Testing VAPI connection...")
      const vapiTest = await vapiClient.testConnection()
      results.vapi.connection = vapiTest

      if (vapiTest.success) {
        // Test fetching calls
        try {
          const calls = await vapiClient.fetchCalls(5) // Limit to 5 for testing
          results.vapi.calls = {
            success: true,
            error: "",
            calls: calls.length,
          }
        } catch (callsError) {
          results.vapi.calls = {
            success: false,
            error: callsError.message,
            calls: 0,
          }
        }
      }
    } catch (vapiError) {
      results.vapi.connection = {
        success: false,
        error: vapiError.message,
        data: null,
      }
    }

    // Test Supabase Connection
    try {
      console.log("Testing Supabase connection...")

      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from("reports")
        .select("count", { count: "exact", head: true })

      if (testError) {
        results.supabase.connection = {
          success: false,
          error: testError.message,
          data: null,
        }
      } else {
        results.supabase.connection = {
          success: true,
          error: "",
          data: { connected: true },
        }

        // Test fetching reports
        try {
          const { data: reports, error: reportsError } = await supabase.from("reports").select("*").limit(5)

          if (reportsError) {
            results.supabase.reports = {
              success: false,
              error: reportsError.message,
              reports: 0,
            }
          } else {
            results.supabase.reports = {
              success: true,
              error: "",
              reports: reports?.length || 0,
            }
          }
        } catch (reportsError) {
          results.supabase.reports = {
            success: false,
            error: reportsError.message,
            reports: 0,
          }
        }
      }
    } catch (supabaseError) {
      results.supabase.connection = {
        success: false,
        error: supabaseError.message,
        data: null,
      }
    }

    console.log("Connection test results:", results)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error testing connections:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test connections",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
