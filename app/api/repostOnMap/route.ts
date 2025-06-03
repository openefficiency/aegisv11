import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

export async function POST(request: Request) {
  try {
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

    // Insert the report into the database
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()

    if (error) {
      console.error('Database error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database operation failed',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

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