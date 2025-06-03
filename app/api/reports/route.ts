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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received report data:', body) // Debug log
    
    // Validate required fields
    const requiredFields = ['category', 'title', 'description', 'case_id', 'location', 'coordinates']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['fraud', 'abuse', 'discrimination', 'harassment', 'safety', 'corruption']
    if (!validCategories.includes(body.category)) {
      console.error('Invalid category:', body.category)
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // If Supabase is not configured, return a test response
    if (!supabase) {
      console.log('Test mode: Report data received:', body)
      return NextResponse.json({ 
        success: true, 
        caseId: body.case_id,
        message: 'Report submitted successfully (test mode)',
        testMode: true
      })
    }

    // Prepare the report data
    const reportData = {
      case_id: body.case_id,
      category: body.category,
      title: body.title,
      description: body.description,
      location: body.location,
      coordinates: body.coordinates,
      date_occurred: body.dateOccurred,
      is_anonymous: body.anonymous,
      contact_info: body.contactInfo,
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString()
    }

    console.log('Attempting to insert report:', reportData)

    // Insert the report into the database
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // Return a more detailed error message
      return NextResponse.json(
        { 
          error: `Database error: ${error.message || 'Unknown error'}`,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('Report submitted successfully:', data)
    return NextResponse.json({ 
      success: true, 
      caseId: body.case_id,
      message: 'Report submitted successfully' 
    })

  } catch (error) {
    console.error('Error processing report:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 