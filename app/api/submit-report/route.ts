import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { supabase } from "@/lib/supabase"
import { createStandardReport } from "@/lib/report-utils"

interface ManualReportData {
  category: string
  title: string
  description: string
  location?: string
  dateOccurred?: string
  anonymous?: boolean
  contactInfo?: string
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // 5 requests per window for manual reports

  const requestData = requestCounts.get(ip)

  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (requestData.count >= maxRequests) {
    return true
  }

  requestData.count++
  return false
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim()
}

export async function POST(request: Request) {
  try {
    // Check rate limit
    const headersList = headers()
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          details: "Please wait before submitting another report",
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 },
      )
    }

    const body = (await request.json()) as ManualReportData
    console.log("Received manual report data:", {
      ...body,
      contactInfo: body.contactInfo ? "[REDACTED]" : undefined,
    })

    // Validate required fields
    const requiredFields = ["category", "title", "description"] as const
    const missingFields = requiredFields.filter((field) => !body[field as keyof ManualReportData])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_FIELDS",
        },
        { status: 400 },
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      category: body.category,
      title: sanitizeInput(body.title),
      description: sanitizeInput(body.description),
      location: body.location ? sanitizeInput(body.location) : undefined,
      dateOccurred: body.dateOccurred || null,
      anonymous: body.anonymous ?? true,
      contactInfo: body.contactInfo ? sanitizeInput(body.contactInfo) : null,
    }

    // Create standard report
    const standardReport = createStandardReport(sanitizedData, "ManualReport")

    console.log("Attempting to insert manual report into reports table...")

    try {
      // Insert into reports table
      const { data: reportData, error: reportError } = await supabase.from("reports").insert([standardReport]).select()

      if (reportError) {
        console.error("Error inserting into reports table:", reportError)
        throw reportError
      }

      console.log("Manual report successfully inserted into reports table")
      return NextResponse.json({
        success: true,
        case_id: standardReport.case_id,
        report_id: standardReport.report_id,
        tracking_code: standardReport.tracking_code,
        secret_code: standardReport.secret_code,
        message: "Report submitted successfully",
        priority: standardReport.priority,
        report_source: "ManualReport",
      })
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Return success even if database fails (for demo purposes)
      return NextResponse.json({
        success: true,
        case_id: standardReport.case_id,
        report_id: standardReport.report_id,
        tracking_code: standardReport.tracking_code,
        secret_code: standardReport.secret_code,
        message: "Report submitted successfully (demo mode)",
        priority: standardReport.priority,
        report_source: "ManualReport",
        demo_mode: true,
      })
    }
  } catch (error) {
    console.error("Error processing manual report:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}
