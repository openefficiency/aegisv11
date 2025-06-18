"use client"

// lib/dashboard-config.ts
import { getEnvVar } from "./env-validator"

export const DASHBOARD_CONFIG = {
  // VAPI Configuration - only public/safe values
  vapi: {
    // Note: API key is handled server-side only
    baseUrl: "https://api.vapi.ai",
    assistantId: getEnvVar("NEXT_PUBLIC_VAPI_ASSISTANT_ID") || "",
    // Fallback to mock data in development
    useMockData: process.env.NODE_ENV === "development",
  },

  // Refresh intervals (in milliseconds)
  refreshIntervals: {
    vapiReports: 30000, // 30 seconds
    cases: 60000, // 1 minute
    stats: 120000, // 2 minutes
  },

  // Pagination settings
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // File upload settings
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/*", "audio/*", "video/*", ".pdf", ".doc", ".docx"],
  },

  // Crypto settings
  crypto: {
    defaultCurrency: "USDC",
    minRewardAmount: 100,
    maxRewardAmount: 100000,
  },

  // Case settings
  cases: {
    defaultPriority: "medium",
    autoAssignment: false,
    escalationThreshold: 7, // days
  },
}

export function getCaseStatusColor(status: string): string {
  const colors = {
    open: "border-yellow-500 text-yellow-400",
    under_investigation: "border-blue-500 text-blue-400",
    resolved: "border-green-500 text-green-400",
    escalated: "border-red-500 text-red-400",
  }
  return colors[status as keyof typeof colors] || "border-gray-500 text-gray-400"
}

export function getCasePriorityColor(priority: string): string {
  const colors = {
    low: "border-green-500 text-green-400",
    medium: "border-yellow-500 text-yellow-400",
    high: "border-orange-500 text-orange-400",
    critical: "border-red-500 text-red-400",
  }
  return colors[priority as keyof typeof colors] || "border-gray-500 text-gray-400"
}

export function getCaseProgress(status: string): number {
  const progress = {
    open: 25,
    under_investigation: 60,
    escalated: 90,
    resolved: 100,
  }
  return progress[status as keyof typeof progress] || 0
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = (now.getTime() - target.getTime()) / 1000

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? "s" : ""} ago`
  }
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear()
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `WB-${year}-${randomPart}`
}

export function generateSecretCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateReportId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function categorizeFromText(text: string): string {
  const lowercaseText = text.toLowerCase()

  const categories = {
    fraud: ["fraud", "money", "steal", "embezzle", "financial", "invoice", "payment"],
    harassment: ["harass", "sexual", "unwanted", "inappropriate", "advances"],
    discrimination: ["discriminat", "racial", "gender", "age", "bias", "unfair"],
    safety: ["safety", "danger", "unsafe", "injury", "accident", "hazard"],
    corruption: ["corrupt", "bribe", "kickback", "favor", "influence"],
    abuse: ["abuse", "violence", "threat", "intimidat", "bullying"],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowercaseText.includes(keyword))) {
      return category
    }
  }

  return "fraud" // Default category
}

export function prioritizeFromText(text: string): string {
  const lowercaseText = text.toLowerCase()

  const criticalKeywords = ["critical", "urgent", "immediate", "danger", "threat", "killed", "death"]
  const highKeywords = ["serious", "significant", "major", "ongoing", "thousands", "large"]
  const lowKeywords = ["minor", "small", "trivial"]

  if (criticalKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "critical"
  } else if (highKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "high"
  } else if (lowKeywords.some((keyword) => lowercaseText.includes(keyword))) {
    return "low"
  }

  return "medium" // Default priority
}

export function extractTitleFromText(text: string, maxLength = 100): string {
  if (!text) return "Report"

  // Extract first sentence or meaningful phrase
  const firstSentence = text.split(/[.!?]/)[0].trim()
  if (firstSentence.length > maxLength) {
    return firstSentence.substring(0, maxLength - 3) + "..."
  }
  return firstSentence || "Report"
}

export function calculateRewardAmount(recoveryAmount: number, percentage = 15): number {
  return Math.round(recoveryAmount * (percentage / 100))
}

export function validateCryptoAddress(address: string, currency: string): boolean {
  // Basic validation - in production, use proper crypto address validation
  if (!address || address.length < 26) return false

  // Currency-specific validation could be added here
  switch (currency) {
    case "BTC":
      return address.length >= 26 && address.length <= 35
    case "ETH":
      return address.startsWith("0x") && address.length === 42
    case "USDC":
    case "USDT":
      return address.startsWith("0x") && address.length === 42
    default:
      return true
  }
}

// hooks/use-dashboard-data.ts
import { useState, useEffect, useCallback } from "react"
import { supabase, type Profile } from "@/lib/supabase"
import type { Case } from "@/lib/supabase"
import { DASHBOARD_CONFIG as DASHBOARD_CONFIG_DATA } from "@/lib/dashboard-config"

export function useDashboardData(role: string, userId?: string) {
  const [cases, setCases] = useState<Case[]>([])
  const [investigators, setInvestigators] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    openComplaints: 0,
    resolvedCases: 0,
    rewardsIssued: 0,
    bountyOpen: 92000,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = useCallback(async () => {
    try {
      let query = supabase.from("cases").select("*").order("created_at", { ascending: false })

      if (role === "investigator" && userId) {
        query = query.eq("assigned_to", userId)
      }

      const { data, error } = await query
      if (error) throw error

      setCases(data || [])
    } catch (err) {
      console.error("Error fetching cases:", err)
      setError("Failed to fetch cases")
    }
  }, [role, userId])

  const fetchInvestigators = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "investigator")
        .eq("is_active", true)

      if (error) throw error
      setInvestigators(data || [])
    } catch (err) {
      console.error("Error fetching investigators:", err)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/stats?role=${role}&userId=${userId || ""}`)
      const result = await response.json()

      if (result.success) {
        setStats({
          openComplaints: result.data.openCases,
          resolvedCases: result.data.resolvedCases,
          rewardsIssued: result.data.totalRewards,
          bountyOpen: 92000, // This could come from API
        })
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }, [role, userId])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([fetchCases(), fetchInvestigators(), fetchStats()])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [fetchCases, fetchInvestigators, fetchStats])

  useEffect(() => {
    fetchData()

    // Set up auto-refresh
    const interval = setInterval(fetchData, DASHBOARD_CONFIG_DATA.refreshIntervals.cases)
    return () => clearInterval(interval)
  }, [fetchData])

  return {
    cases,
    investigators,
    stats,
    loading,
    error,
    refetch: fetchData,
  }
}
