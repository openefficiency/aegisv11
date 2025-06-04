import { NextResponse } from "next/server"
import { testVAPICredentials, vapiClient } from "@/lib/vapi-client"
import { testSupabaseConnection, supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing all API connections...")

    // Test VAPI connection
    const vapiTest = await testVAPICredentials()
    console.log("VAPI Test Result:", vapiTest)

    // Test Supabase connection
    const supabaseTest = await testSupabaseConnection()
    console.log("Supabase Test Result:", supabaseTest)

    // Test VAPI calls fetch
    let vapiCallsTest = { success: false, error: "Not tested", calls: 0 }
    try {
      const calls = await vapiClient.fetchCalls(5)
      vapiCallsTest = {
        success: true,
        error: null,
        calls: calls.length,
      }
    } catch (error) {
      vapiCallsTest = {
        success: false,
        error: error.message,
        calls: 0,
      }
    }

    // Test Supabase reports fetch
    let supabaseReportsTest = { success: false, error: "Not tested", reports: 0 }
    try {
      const { data: reports, error } = await supabase.from("reports").select("*").limit(5)

      if (error) {
        supabaseReportsTest = {
          success: false,
          error: error.message,
          reports: 0,
        }
      } else {
        supabaseReportsTest = {
          success: true,
          error: null,
          reports: reports?.length || 0,
        }
      }
    } catch (error) {
      supabaseReportsTest = {
        success: false,
        error: error.message,
        reports: 0,
      }
    }

    const results = {
      timestamp: new Date().toISOString(),
      vapi: {
        connection: vapiTest,
        calls: vapiCallsTest,
      },
      supabase: {
        connection: supabaseTest,
        reports: supabaseReportsTest,
      },
      environment: {
        vapiApiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY ? "✅ Set" : "❌ Missing",
        vapiAssistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? "✅ Set" : "❌ Missing",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      },
    }

    return NextResponse.json({
      success: true,
      message: "Connection tests completed",
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
