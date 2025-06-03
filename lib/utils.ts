import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCaseText(field: any): string {
  if (field === null || field === undefined) return ""

  let value: any = field

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        value = JSON.parse(trimmed)
      } catch {
        return value
      }
    } else {
      return value
    }
  }

  if (typeof value === "object" && value !== null) {
    return (
      value.title ||
      value.detailed_description ||
      value.description ||
      (value.incident &&
        (value.incident.detailed_description ||
          value.incident.description ||
          value.incident.summary)) ||
      (value.structuredData &&
        (value.structuredData.detailed_description ||
          value.structuredData.description ||
          value.structuredData.summary)) ||
      ""
    )
  }

  return String(value)
}

export function parseCaseData(field: any): any | null {
  if (field === null || field === undefined) return null

  let value: any = field

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        value = JSON.parse(trimmed)
      } catch {
        return null
      }
    } else {
      return null
    }
  }

  if (typeof value === "object" && value !== null) {
    return value
  }

  return null
}

export function extractCaseLocation(field: any): string {
  const data = parseCaseData(field)
  if (!data) return ""

  return (
    data.location ||
    data.location_of_incident ||
    (data.incident && (data.incident.location || data.incident.location_of_incident)) ||
    (data.structuredData &&
      (data.structuredData.location || data.structuredData.location_of_incident)) ||
    ""
  )
}

export function extractCaseDate(field: any): string {
  const data = parseCaseData(field)
  if (!data) return ""

  return (
    data.date_received ||
    data.date ||
    data.date_of_incident ||
    (data.incident &&
      (data.incident.date ||
        data.incident.date_received ||
        data.incident.date_of_incident)) ||
    (data.structuredData &&
      (data.structuredData.date ||
        data.structuredData.date_received ||
        data.structuredData.date_of_incident)) ||
    ""
  )
}

export function getCaseDateReceived(
  titleField: any,
  descriptionField?: any,
  createdAt?: string,
): string {
  const rawDate =
    extractCaseDate(titleField) ||
    extractCaseDate(descriptionField) ||
    createdAt ||
    ""

  if (!rawDate) return ""

  const dateObj = new Date(rawDate)
  if (isNaN(dateObj.getTime())) return String(rawDate)
  return dateObj.toLocaleDateString()
}

export function formatCaseTitle(
  titleField: any,
  descriptionField?: any,
  createdAt?: string,
): string {
  const location =
    extractCaseLocation(titleField) || extractCaseLocation(descriptionField)
  const date = getCaseDateReceived(titleField, descriptionField, createdAt)

  if (location && date) return `${location} - ${date}`
  if (location) return location
  if (date) return date

  return formatCaseText(titleField)
}
