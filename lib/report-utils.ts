// Utility functions for report management

/**
 * Generate a 10-digit alphanumeric key for reports
 * Format: XXXXXXXXXX (10 characters, uppercase letters and numbers)
 */
export function generate10DigitKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a case number with year prefix
 * Format: WB-YYYY-XXXX
 */
export function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `WB-${year}-${randomPart}`
}

/**
 * Generate a secret tracking code for whistleblowers
 * Format: 12-character alphanumeric
 */
export function generateSecretCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Categorize report based on text content
 */
export function categorizeFromText(text: string): string {
  const lowercaseText = text.toLowerCase()

  const categories = {
    fraud: ["fraud", "money", "steal", "embezzle", "financial", "invoice", "payment", "accounting"],
    harassment: ["harass", "sexual", "unwanted", "inappropriate", "advances", "hostile"],
    discrimination: ["discriminat", "racial", "gender", "age", "bias", "unfair", "prejudice"],
    safety: ["safety", "danger", "unsafe", "injury", "accident", "hazard", "risk"],
    corruption: ["corrupt", "bribe", "kickback", "favor", "influence", "payoff"],
    abuse: ["abuse", "violence", "threat", "intimidat", "bullying", "assault"],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowercaseText.includes(keyword))) {
      return category
    }
  }

  return "fraud" // Default category
}

/**
 * Determine priority based on text content
 */
export function prioritizeFromText(text: string): string {
  const lowercaseText = text.toLowerCase()

  const criticalKeywords = ["critical", "urgent", "immediate", "danger", "threat", "killed", "death", "emergency"]
  const highKeywords = ["serious", "significant", "major", "ongoing", "thousands", "large", "widespread"]
  const lowKeywords = ["minor", "small", "trivial", "slight"]

  if (criticalKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "critical"
  } else if (highKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "high"
  } else if (lowKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "low"
  }

  return "medium" // Default priority
}

/**
 * Extract title from text content
 */
export function extractTitleFromText(text: string, maxLength = 100): string {
  if (!text) return "Report"

  // Extract first sentence or meaningful phrase
  const firstSentence = text.split(/[.!?]/)[0].trim()
  if (firstSentence.length > maxLength) {
    return firstSentence.substring(0, maxLength - 3) + "..."
  }
  return firstSentence || "Report"
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return typeof lat === "number" && typeof lng === "number" && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Format report source for display
 */
export function formatReportSource(source: string): string {
  switch (source) {
    case "VAPIReport":
      return "Voice AI"
    case "MapReport":
      return "Map Report"
    case "ManualReport":
      return "Manual Form"
    default:
      return "Unknown"
  }
}

/**
 * Get report source icon
 */
export function getReportSourceIcon(source: string): string {
  switch (source) {
    case "VAPIReport":
      return "🎤"
    case "MapReport":
      return "📍"
    case "ManualReport":
      return "📝"
    default:
      return "📄"
  }
}

/**
 * Create a standardized report object
 */
export interface StandardReport {
  case_id: string
  case_number: string
  report_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  report_source: "VAPIReport" | "MapReport" | "ManualReport"
  secret_code: string
  tracking_code: string
  is_anonymous: boolean
  contact_info?: string
  location?: string
  latitude?: number
  longitude?: number
  date_occurred?: string
  vapi_session_id?: string
  vapi_transcript?: string
  vapi_audio_url?: string
  vapi_call_data?: any
  created_at: string
  updated_at: string
}

/**
 * Create a standard report from various input sources
 */
export function createStandardReport(data: any, source: "VAPIReport" | "MapReport" | "ManualReport"): StandardReport {
  const case_id = generate10DigitKey()
  const report_id = generate10DigitKey()
  const case_number = generateCaseNumber()
  const secret_code = generateSecretCode()
  const tracking_code = generate10DigitKey()

  const now = new Date().toISOString()

  const baseReport: StandardReport = {
    case_id,
    case_number,
    report_id,
    title: extractTitleFromText(data.title || data.summary || data.description),
    description: data.description || data.summary || "",
    category: categorizeFromText(data.description || data.summary || data.transcript || ""),
    priority: prioritizeFromText(data.description || data.summary || data.transcript || ""),
    status: "open",
    report_source: source,
    secret_code,
    tracking_code,
    is_anonymous: data.anonymous ?? data.is_anonymous ?? true,
    contact_info: data.contactInfo || data.contact_info || null,
    created_at: now,
    updated_at: now,
  }

  // Add source-specific fields
  switch (source) {
    case "VAPIReport":
      return {
        ...baseReport,
        vapi_session_id: data.session_id,
        vapi_transcript: data.transcript,
        vapi_audio_url: data.audio_url,
        vapi_call_data: data.vapi_call_data,
      }

    case "MapReport":
      return {
        ...baseReport,
        location: data.location,
        latitude: data.coordinates?.lat || data.latitude,
        longitude: data.coordinates?.lng || data.longitude,
        date_occurred: data.dateOccurred || data.date_occurred,
      }

    case "ManualReport":
      return {
        ...baseReport,
        location: data.location,
        date_occurred: data.dateOccurred || data.date_occurred,
      }

    default:
      return baseReport
  }
}
