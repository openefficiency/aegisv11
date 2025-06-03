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
      (value.incident && (value.incident.description || value.incident.summary)) ||
      ""
    )
  }

  return String(value)
}
