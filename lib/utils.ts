import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the missing extractCaseLocation function
export function extractCaseLocation(description: string): string {
  // Extract location information from case description
  const locationPatterns = [
    /(?:at|in|near|location:?\s*)([A-Za-z\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Building|Bldg|Floor|Room|Office|Dept|Department)[A-Za-z0-9\s,]*)/i,
    /(?:building|office|department|dept|floor|room)\s*:?\s*([A-Za-z0-9\s,]+)/i,
    /(?:address|location)\s*:?\s*([A-Za-z0-9\s,.-]+)/i,
  ]

  for (const pattern of locationPatterns) {
    const match = description.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return "Location not specified"
}

// Add other utility functions that might be needed
export function extractCaseSeverity(description: string): "Low" | "Medium" | "High" | "Critical" {
  const lowKeywords = ["minor", "small", "slight", "trivial"]
  const mediumKeywords = ["moderate", "significant", "concerning"]
  const highKeywords = ["serious", "major", "severe", "urgent"]
  const criticalKeywords = ["critical", "emergency", "dangerous", "life-threatening", "immediate"]

  const lowerDescription = description.toLowerCase()

  if (criticalKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "Critical"
  }
  if (highKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "High"
  }
  if (mediumKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "Medium"
  }
  if (lowKeywords.some((keyword) => lowerDescription.includes(keyword))) {
    return "Low"
  }

  // Default to Medium if no keywords found
  return "Medium"
}

export function extractCaseCategory(description: string): string {
  const categories = {
    harassment: ["harassment", "bullying", "intimidation", "hostile"],
    discrimination: ["discrimination", "bias", "prejudice", "unfair treatment"],
    safety: ["safety", "accident", "injury", "hazard", "unsafe"],
    financial: ["fraud", "theft", "embezzlement", "financial", "money"],
    policy: ["policy", "procedure", "violation", "compliance"],
    misconduct: ["misconduct", "inappropriate", "unprofessional"],
    other: [],
  }

  const lowerDescription = description.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerDescription.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return "Other"
}

export function generateCaseId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `CASE-${timestamp}-${random}`.toUpperCase()
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength - 3) + "..."
}

export function formatCaseText(text: string): string {
  if (!text) return "No description available"

  // Clean up the text and format it properly
  return (
    text
      .replace(/\n+/g, " ") // Replace multiple newlines with single space
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()
      .substring(0, 500) + // Limit to 500 characters
    (text.length > 500 ? "..." : "")
  )
}

export function formatCaseTitle(transcript: string): string {
  if (!transcript) return "Voice Report"

  // Extract first meaningful sentence or phrase as title
  const sentences = transcript.split(/[.!?]+/)
  const firstSentence = sentences[0]?.trim()

  if (!firstSentence) return "Voice Report"

  // Clean and format the title
  const title = firstSentence
    .replace(/^(um|uh|well|so|okay|hi|hello|hey),?\s*/i, "") // Remove filler words
    .replace(/\s+/g, " ")
    .trim()

  // Capitalize first letter and limit length
  const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1)
  return formattedTitle.length > 60 ? formattedTitle.substring(0, 57) + "..." : formattedTitle || "Voice Report"
}

export function getCaseDateReceived(timestamp?: string | Date): string {
  const date = timestamp ? new Date(timestamp) : new Date()

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}
