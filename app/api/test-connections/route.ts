import { NextResponse } from "next/server"
import { vapiClient } from "@/lib/vapi-client"
import { supabase } from "@/lib/supabase"

// Helper function to clean environment variables
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return ""
  return value.replace(/['"]/g, "").trim()
}

export async function GET() {
  try {
    console.log("Testing all connections...")

    // Log raw environment variables
    console.log("Raw environment variables:")
    console.log("NEXT_PUBLIC_VAPI_API_KEY:", process.env.NEXT_PUBLIC_VAPI_API_KEY)
    console.log("NEXT_PUBLIC_VAPI_ASSISTANT_ID:", process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID)

    const rawApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || ""
    const rawAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ""
    const cleanedApiKey = cleanEnvVar(rawApiKey)
    const cleanedAssistantId = cleanEnvVar(rawAssistantId)

    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        raw: {
          vapiApiKey: rawApiKey,
          vapiAssistantId: rawAssistantId,
        },
        cleaned: {
          vapiApiKey: cleanedApiKey,
          vapiAssistantId: cleanedAssistantId,
        },
        validation: {
          apiKeyHasQuotes: rawApiKey.includes('"') || rawApiKey.includes("'"),
          assistantIdHasQuotes: rawAssistantId.includes('"') || rawAssistantId.includes("'"),
          apiKeyLength: cleanedApiKey.length,
          assistantIdLength: cleanedAssistantId.length,
          expectedApiKeyLength: 36, // UUID format
          expectedAssistantIdLength: 36, // UUID format
        },
        status: {
          vapiApiKey:
            cleanedApiKey.length === 36 ? "✅ Valid format" : `❌ Invalid length (${cleanedApiKey.length}/36)`,
          vapiAssistantId:
            cleanedAssistantId.length === 36
              ? "✅ Valid format"
              : `❌ Invalid length (${cleanedAssistantId.length}/36)`,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set",
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set",
        },
      },
      vapi: {
        connection: { success: false, error: "", data: null },
        calls: { success: false, error: "", calls: 0 },
      },
      supabase: {
        connection: { success: false, error: "", data: null },
        reports: { success: false, error: "", reports: 0 },
      },
    }

    // Test VAPI Connection only if credentials look valid
    if (cleanedApiKey.length === 36 && cleanedAssistantId.length === 36) {
      try {
        console.log("Testing VAPI connection with cleaned credentials...")
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
    } else {
      results.vapi.connection = {
        success: false,
        error: "Invalid API key or Assistant ID format. Check for quotes in environment variables.",
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
