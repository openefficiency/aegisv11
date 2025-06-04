import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats case text by trimming and limiting length
 * @param text The case description or text to format
 * @param maxLength Maximum length before truncating
 * @returns Formatted text string
 */
export function formatCaseText(text: string | null | undefined, maxLength = 150): string {
  if (!text) return "No description provided"

  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed

  return `${trimmed.substring(0, maxLength)}...`
}

/**
 * Formats a case title for display
 * @param title The case title to format
 * @param defaultTitle Default title if none provided
 * @returns Formatted title string
 */
export function formatCaseTitle(title: string | null | undefined, defaultTitle = "Untitled Report"): string {
  if (!title) return defaultTitle

  const trimmed = title.trim()
  return trimmed || defaultTitle
}

/**
 * Extracts and formats the date a case was received
 * @param caseData The case data object
 * @returns Formatted date string
 */
export function getCaseDateReceived(caseData: any): string {
  // Try different date fields that might exist in the case data
  const dateField = caseData.date_occurred || caseData.created_at || caseData.dateOccurred

  if (!dateField) return "Unknown date"

  try {
    const date = new Date(dateField)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting case date:", error)
    return "Invalid date"
  }
}

/**
 * Extracts location information from case data
 * @param caseData The case data object
 * @returns Location string or default message
 */
export function extractCaseLocation(caseData: any): string {
  // Try different location fields that might exist in the case data
  const location =
    caseData.location ||
    (caseData.coordinates
      ? `Lat: ${caseData.coordinates.lat.toFixed(4)}, Lng: ${caseData.coordinates.lng.toFixed(4)}`
      : null)

  if (!location) return "Location not specified"

  // If location is very long, truncate it
  if (typeof location === "string" && location.length > 60) {
    return `${location.substring(0, 60)}...`
  }

  return location
}
