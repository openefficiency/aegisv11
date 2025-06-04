import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: { persistSession: false },
})

// Define valid categories based on the database schema
const VALID_CATEGORIES = {
  fraud: { priority: "high" },
  abuse: { priority: "high" },
  discrimination: { priority: "high" },
  harassment: { priority: "high" },
  safety: { priority: "critical" },
  corruption: { priority: "high" },
} as const

type Category = keyof typeof VALID_CATEGORIES
type Priority = "low" | "medium" | "high" | "critical"
type Status = "open" | "under_investigation" | "resolved" | "escalated" | "closed"

interface ReportData {
  category: Category
  title: string
  description: string
  case_id: string
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
  const maxRequests = 10 // Reduced to 10 requests per window for map reports

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

    const body = (await request.json()) as ReportData
    console.log("Received report data:", {
      ...body,
      contactInfo: body.contactInfo ? "[REDACTED]" : undefined,
    })

    // Validate required fields
    const requiredFields = ["category", "title", "description", "case_id", "location", "coordinates"] as const
    const missingFields = requiredFields.filter((field) => !body[field as keyof ReportData])

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
    if (
      !body.coordinates ||
      typeof body.coordinates.lat !== "number" ||
      typeof body.coordinates.lng !== "number" ||
      body.coordinates.lat < -90 ||
      body.coordinates.lat > 90 ||
      body.coordinates.lng < -180 ||
      body.coordinates.lng > 180
    ) {
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
      case_id: body.case_id,
      category: body.category,
      title: sanitizeInput(body.title),
      description: sanitizeInput(body.description),
      location: sanitizeInput(body.location),
      latitude: body.coordinates.lat,
      longitude: body.coordinates.lng,
      date_occurred: body.dateOccurred || null,
      is_anonymous: body.anonymous ?? true,
      contact_info: body.contactInfo ? sanitizeInput(body.contactInfo) : null,
      status: "open" as Status,
      priority: VALID_CATEGORIES[body.category].priority as Priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Attempting to insert report into reports table...")

    // Insert into reports table
    const { data: reportData, error: reportError } = await supabase.from("reports").insert([sanitizedData]).select()

    if (reportError) {
      console.error("Error inserting into reports table:", reportError)

      // Fallback: Try to insert into cases table
      console.log("Falling back to cases table...")

      const caseData = {
        case_number: body.case_id,
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        status: sanitizedData.status,
        priority: sanitizedData.priority,
        location: sanitizedData.location,
        date_occurred: sanitizedData.date_occurred,
        is_anonymous: sanitizedData.is_anonymous,
        contact_info: sanitizedData.contact_info,
        secret_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        report_id: body.case_id,
        tracking_code: body.case_id,
        created_at: sanitizedData.created_at,
        updated_at: sanitizedData.updated_at,
      }

      const { data: caseInsertData, error: caseError } = await supabase.from("cases").insert([caseData]).select()

      if (caseError) {
        console.error("Error inserting into cases table:", caseError)
        return NextResponse.json(
          {
            success: false,
            error: "Database operation failed",
            details: caseError.message,
            code: "DB_ERROR",
          },
          { status: 500 },
        )
      }

      console.log("Report successfully inserted into cases table")
      return NextResponse.json({
        success: true,
        caseId: body.case_id,
        message: "Report submitted successfully",
        priority: sanitizedData.priority,
        table: "cases",
      })
    }

    console.log("Report successfully inserted into reports table")
    return NextResponse.json({
      success: true,
      caseId: body.case_id,
      message: "Report submitted successfully",
      priority: sanitizedData.priority,
      table: "reports",
    })
  } catch (error) {
    console.error("Error processing report:", error)
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
