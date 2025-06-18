"use server"

import { vapiClient } from "./vapi-client"

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

    // Use the VAPI client to process the webhook data
    const processedReport = await vapiClient.processWebhookData(reportData)

    if (processedReport) {
      console.log(`✅ Processed VAPI webhook: ${processedReport.report_id}`)
      return {
        success: true,
        data: processedReport,
        message: "Webhook processed successfully",
        processed: true,
      }
    } else {
      console.log("ℹ️ Webhook received but no report generated")
      return {
        success: true,
        message: "Webhook received but no action taken",
        processed: false,
      }
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
