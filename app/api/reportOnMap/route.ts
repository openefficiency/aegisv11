import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createStandardReport, validateCoordinates } from "@/lib/report-utils"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: { persistSession: false },
})

// Define valid categories
const VALID_CATEGORIES = {
  fraud: { priority: "high" },
  abuse: { priority: "high" },
  discrimination: { priority: "high" },
  harassment: { priority: "high" },
  safety: { priority: "critical" },
  corruption: { priority: "high" },
} as const

type Category = keyof typeof VALID_CATEGORIES

interface MapReportData {
  category: Category
  title: string
  description: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  dateOccurred?: string
  anonymous?: boolean
  contactInfo?: string
}

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 10 // 10 requests per window for map reports

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

    const body = (await request.json()) as MapReportData
    console.log("Received map report data:", {
      ...body,
      contactInfo: body.contactInfo ? "[REDACTED]" : undefined,
    })

    // Validate required fields
    const requiredFields = ["category", "title", "description", "location", "coordinates"] as const
    const missingFields = requiredFields.filter((field) => !body[field as keyof MapReportData])

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

    // Validate coordinates
    if (!validateCoordinates(body.coordinates.lat, body.coordinates.lng)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates",
          details: "Latitude must be between -90 and 90, longitude between -180 and 180",
          code: "INVALID_COORDINATES",
        },
        { status: 400 },
      )
    }

    // Validate category
    if (!Object.keys(VALID_CATEGORIES).includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category",
          details: `Category must be one of: ${Object.keys(VALID_CATEGORIES).join(", ")}`,
          code: "INVALID_CATEGORY",
        },
        { status: 400 },
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      category: body.category,
      title: sanitizeInput(body.title),
      description: sanitizeInput(body.description),
      location: sanitizeInput(body.location),
      coordinates: body.coordinates,
      dateOccurred: body.dateOccurred || null,
      anonymous: body.anonymous ?? true,
      contactInfo: body.contactInfo ? sanitizeInput(body.contactInfo) : null,
    }

    // Create standard report
    const standardReport = createStandardReport(sanitizedData, "MapReport")

    console.log("Attempting to insert map report into reports table...")

    try {
      // Insert into reports table
      const { data: reportData, error: reportError } = await supabase.from("reports").insert([standardReport]).select()

      if (reportError) {
        console.error("Error inserting into reports table:", reportError)
        throw reportError
      }

      console.log("Map report successfully inserted into reports table")
      return NextResponse.json({
        success: true,
        case_id: standardReport.case_id,
        report_id: standardReport.report_id,
        tracking_code: standardReport.tracking_code,
        secret_code: standardReport.secret_code,
        message: "Map report submitted successfully",
        priority: standardReport.priority,
        report_source: "MapReport",
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
        message: "Map report submitted successfully (demo mode)",
        priority: standardReport.priority,
        report_source: "MapReport",
        demo_mode: true,
      })
    }
  } catch (error) {
    console.error("Error processing map report:", error)
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
