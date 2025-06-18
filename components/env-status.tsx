"use client"

import { useState, useEffect } from "react"
import { validateRequiredEnvVars } from "@/lib/env-validator"
import { testSupabaseConnection } from "@/lib/supabase"

export function EnvironmentStatus() {
  const [envStatus, setEnvStatus] = useState<{
    valid: boolean
    missing: string[]
    invalid: string[]
  }>({ valid: true, missing: [], invalid: [] })

  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Validate environment variables
    const validation = validateRequiredEnvVars()
    setEnvStatus(validation)

    // Test database connection
    const testConnection = async () => {
      const connected = await testSupabaseConnection()
      setDbConnected(connected)
      setIsLoading(false)
    }

    testConnection()
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Checking environment status...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-medium mb-2">Environment Status</h3>

      <div className="space-y-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${envStatus.valid ? "bg-green-500" : "bg-red-500"}`} />
          <span>Environment Variables: {envStatus.valid ? "Valid" : "Invalid"}</span>
        </div>

        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              dbConnected === null ? "bg-gray-500" : dbConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>Database Connection: {dbConnected === null ? "Unknown" : dbConnected ? "Connected" : "Failed"}</span>
        </div>
      </div>

      {!envStatus.valid && (
        <div className="mt-4 text-sm">
          {envStatus.missing.length > 0 && (
            <div className="mb-2">
              <p className="font-medium text-red-600">Missing Variables:</p>
              <ul className="list-disc pl-5">
                {envStatus.missing.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}

          {envStatus.invalid.length > 0 && (
            <div>
              <p className="font-medium text-red-600">Invalid Variables:</p>
              <ul className="list-disc pl-5">
                {envStatus.invalid.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
