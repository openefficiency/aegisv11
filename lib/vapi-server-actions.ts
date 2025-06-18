"use server"

import { vapiClient } from "./vapi-client"

// Server action to get VAPI configuration (without exposing sensitive keys)
export async function getVAPIConfig() {
  try {
    // Only return non-sensitive configuration
    return {
      success: true,
      data: {
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "",
        hasApiKey: !!process.env.VAPI_API_KEY,
        hasShareKey: !!process.env.VAPI_SHARE_KEY,
        // Remove any reference to NEXT_PUBLIC_VAPI_API_KEY
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get VAPI configuration",
      data: null,
    }
  }
}

// Server action to create a secure VAPI session token
export async function createVAPISession() {
  try {
    const apiKey = process.env.VAPI_API_KEY
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

    if (!apiKey || !assistantId) {
      return {
        success: false,
        error: "VAPI credentials not configured",
        data: null,
      }
    }

    // Create a temporary session or token for the client
    // This is a secure way to handle VAPI without exposing the API key
    const sessionData = {
      assistantId,
      timestamp: Date.now(),
      // You could generate a temporary token here if VAPI supports it
    }

    return {
      success: true,
      data: sessionData,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create VAPI session",
      data: null,
    }
  }
}

// Server action to test VAPI connection
export async function testVAPIConnection() {
  try {
    const isConnected = await vapiClient.testConnection()
    return {
      success: isConnected,
      error: isConnected ? null : "VAPI connection failed",
    }
  } catch (error: any) {
    console.error("Error in testVAPIConnection server action:", error)
    return {
      success: false,
      error: error.message || "Failed to test VAPI connection",
    }
  }
}

// Server action to fetch VAPI reports
export async function fetchVAPIReports() {
  try {
    const reports = await vapiClient.fetchReports()
    return {
      success: true,
      data: reports,
    }
  } catch (error: any) {
    console.error("Error in fetchVAPIReports server action:", error)
    return {
      success: false,
      error: error.message || "Failed to fetch VAPI reports",
      data: [],
    }
  }
}

// Server action to get a specific VAPI call by ID
export async function getVAPICallById(callId: string) {
  try {
    const call = await vapiClient.getCallById(callId)
    return {
      success: true,
      data: call,
    }
  } catch (error: any) {
    console.error("Error in getVAPICallById server action:", error)
    return {
      success: false,
      error: error.message || "Failed to get VAPI call",
      data: null,
    }
  }
}

// Server action to create a new VAPI call
export async function createVAPICall(phoneNumber?: string, metadata?: any) {
  try {
    const call = await vapiClient.createCall(phoneNumber, metadata)
    return {
      success: true,
      data: call,
    }
  } catch (error: any) {
    console.error("Error in createVAPICall server action:", error)
    return {
      success: false,
      error: error.message || "Failed to create VAPI call",
      data: null,
    }
  }
}

// Server action to validate environment variables
export async function validateEnvironment() {
  try {
    const requiredVars = {
      NEXT_PUBLIC_VAPI_ASSISTANT_ID: !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
      VAPI_API_KEY: !!process.env.VAPI_API_KEY,
      VAPI_SHARE_KEY: !!process.env.VAPI_SHARE_KEY,
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    return {
      success: missingVars.length === 0,
      data: {
        allSet: missingVars.length === 0,
        missingVars,
        hasApiKey: requiredVars.VAPI_API_KEY,
        hasAssistantId: requiredVars.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        hasShareKey: requiredVars.VAPI_SHARE_KEY,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to validate environment",
      data: null,
    }
  }
}

// Server action to process VAPI webhook data
export async function processVAPIWebhook(payload: any) {
  try {
    console.log("🎤 Processing VAPI webhook payload...")

    // Extract relevant data from webhook payload
    const { type, call, transcript, message, timestamp, assistantId, phoneNumber, cost, duration, endedReason } =
      payload

    // Only process call-ended events with transcripts
    if (type !== "call-ended" || !transcript) {
      return {
        success: true,
        message: "Webhook received but no processing needed",
        processed: false,
      }
    }

    // Create a VAPI report record
    const reportData = {
      call_id: call?.id || `vapi_${Date.now()}`,
      transcript: transcript || "",
      phone_number: phoneNumber || null,
      assistant_id: assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
      cost: cost || 0,
      duration: duration || 0,
      ended_reason: endedReason || "unknown",
      created_at: new Date(timestamp || Date.now()).toISOString(),
      metadata: {
        type,
        message,
        rawPayload: payload,
      },
    }

    // Process the webhook data (you can extend this to save to database)
    console.log(`✅ Processed VAPI webhook: ${reportData.call_id}`)
    return {
      success: true,
      data: reportData,
      message: "Webhook processed successfully",
      processed: true,
    }
  } catch (error: any) {
    console.error("❌ Error processing VAPI webhook:", error)
    return {
      success: false,
      error: error.message || "Failed to process VAPI webhook",
      processed: false,
    }
  }
}
