import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client if environment variables are available
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
} else {
  console.warn('Supabase environment variables not found. Running in test mode.')
}

// Define valid categories and their priorities
const VALID_CATEGORIES = {
  fraud: { priority: 'high' },
  abuse: { priority: 'high' },
  discrimination: { priority: 'high' },
  harassment: { priority: 'high' },
  safety: { priority: 'critical' },
  corruption: { priority: 'high' }
} as const

// Define input limits
const INPUT_LIMITS = {
  title: { maxLength: 200 },
  description: { maxLength: 2000 },
  location: { maxLength: 500 },
  contactInfo: { maxLength: 500 }
} as const

type Category = keyof typeof VALID_CATEGORIES

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
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // maximum 100 requests per window
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const requestData = requestCounts.get(ip)

  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return false
  }

  if (requestData.count >= RATE_LIMIT.maxRequests) {
    return true
  }

  requestData.count++
  return false
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
}

export async function POST(request: Request) {
  try {
    // Check request size
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
      return NextResponse.json(
        { 
          success: false,
          error: 'Request too large',
          details: 'Request body must be less than 1MB',
          code: 'REQUEST_TOO_LARGE'
        },
        { status: 413 }
      )
    }

    // Check rate limit
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Too many requests',
          details: 'Please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    const body = await request.json() as ReportData
    console.log('Received report data:', { ...body, contactInfo: body.contactInfo ? '[REDACTED]' : undefined })
    
    // Validate required fields
    const requiredFields = ['category', 'title', 'description', 'case_id', 'location', 'coordinates'] as const
    const missingFields = requiredFields.filter(field => !body[field as keyof ReportData])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      )
    }

    // Validate input lengths
    for (const [field, limit] of Object.entries(INPUT_LIMITS)) {
      const value = body[field as keyof ReportData]
      if (typeof value === 'string' && value.length > limit.maxLength) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation failed',
            details: `${field} must be less than ${limit.maxLength} characters`,
            code: 'FIELD_TOO_LONG'
          },
          { status: 400 }
        )
      }
    }

    // Sanitize text inputs
    body.title = sanitizeInput(body.title)
    body.description = sanitizeInput(body.description)
    body.location = sanitizeInput(body.location)
    if (body.contactInfo) {
      body.contactInfo = sanitizeInput(body.contactInfo)
    }

    // Validate coordinates
    if (!body.coordinates || 
        typeof body.coordinates.lat !== 'number' || 
        typeof body.coordinates.lng !== 'number' ||
        body.coordinates.lat < -90 || 
        body.coordinates.lat > 90 ||
        body.coordinates.lng < -180 || 
        body.coordinates.lng > 180) {
      console.error('Invalid coordinates:', body.coordinates)
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: 'Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.',
          code: 'INVALID_COORDINATES'
        },
        { status: 400 }
      )
    }

    // Validate category
    if (!Object.keys(VALID_CATEGORIES).includes(body.category)) {
      console.error('Invalid category:', body.category)
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: `Invalid category. Must be one of: ${Object.keys(VALID_CATEGORIES).join(', ')}`,
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      )
    }

    // If Supabase is not configured, return a test response
    if (!supabase) {
      console.log('Test mode: Report data received:', { ...body, contactInfo: body.contactInfo ? '[REDACTED]' : undefined })
      return NextResponse.json({ 
        success: true, 
        caseId: body.case_id,
        message: 'Report submitted successfully (test mode)',
        testMode: true,
        priority: VALID_CATEGORIES[body.category].priority
      })
    }

    // Prepare the report data
    const reportData = {
      case_id: body.case_id,
      category: body.category,
      title: body.title,
      description: body.description,
      location: body.location,
      latitude: body.coordinates.lat,
      longitude: body.coordinates.lng,
      date_occurred: body.dateOccurred,
      is_anonymous: body.anonymous ?? false,
      contact_info: body.contactInfo,
      status: 'open',
      priority: VALID_CATEGORIES[body.category].priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Attempting to insert report:', { ...reportData, contact_info: reportData.contact_info ? '[REDACTED]' : undefined })

    // Insert the report into the database with retry logic
    let retries = 3
    let lastError = null

    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .insert([reportData])
          .select()

        if (error) throw error

        console.log('Report submitted successfully:', { 
          caseId: body.case_id,
          category: body.category,
          priority: VALID_CATEGORIES[body.category].priority
        })

        return NextResponse.json({ 
          success: true, 
          caseId: body.case_id,
          message: 'Report submitted successfully',
          priority: VALID_CATEGORIES[body.category].priority,
          data: {
            ...data[0],
            contact_info: data[0].contact_info ? '[REDACTED]' : undefined
          }
        })
      } catch (error) {
        lastError = error
        retries--
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
        }
      }
    }

    // If all retries failed
    console.error('Database error after retries:', {
      message: lastError instanceof Error ? lastError.message : 'Unknown error',
      details: lastError instanceof Error ? lastError.message : undefined,
      hint: lastError instanceof Error ? lastError.stack : undefined,
      code: 'DB_ERROR'
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Database operation failed',
        details: lastError instanceof Error ? lastError.message : 'Unknown error',
        hint: lastError instanceof Error ? lastError.stack : undefined,
        code: 'DB_ERROR'
      },
      { status: 500 }
    )

  } catch (error) {
    console.error('Error processing report:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    )
  }
} 