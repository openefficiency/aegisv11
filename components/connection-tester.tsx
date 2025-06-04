"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ConnectionTestResults {
  timestamp: string
  vapi: {
    connection: { success: boolean; error?: string; data?: any }
    calls: { success: boolean; error?: string; calls: number }
  }
  supabase: {
    connection: { success: boolean; error?: string; data?: any }
    reports: { success: boolean; error?: string; reports: number }
  }
  environment: {
    vapiApiKey: string
    vapiAssistantId: string
    supabaseUrl: string
    supabaseAnonKey: string
    supabaseServiceKey: string
  }
}

export function ConnectionTester() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<ConnectionTestResults | null>(null)

  const testConnections = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/test-connections")
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        console.error("Connection test failed:", data)
      }
    } catch (error) {
      console.error("Error testing connections:", error)
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant="outline" className={success ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}>
        {success ? "✅ Connected" : "❌ Failed"}
      </Badge>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          API Connection Tester
        </CardTitle>
        <CardDescription className="text-slate-400">
          Test VAPI and Supabase connections with your credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testConnections}
          disabled={testing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing Connections...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test All Connections
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">Last tested: {new Date(results.timestamp).toLocaleString()}</div>

            {/* Environment Variables */}
            <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
              <h4 className="text-white font-semibold mb-3">Environment Variables</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">VAPI API Key:</span>
                  <span className={results.environment.vapiApiKey.includes("✅") ? "text-green-400" : "text-red-400"}>
                    {results.environment.vapiApiKey}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">VAPI Assistant ID:</span>
                  <span
                    className={results.environment.vapiAssistantId.includes("✅") ? "text-green-400" : "text-red-400"}
                  >
                    {results.environment.vapiAssistantId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Supabase URL:</span>
                  <span className={results.environment.supabaseUrl.includes("✅") ? "text-green-400" : "text-red-400"}>
                    {results.environment.supabaseUrl}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Supabase Anon Key:</span>
                  <span
                    className={results.environment.supabaseAnonKey.includes("✅") ? "text-green-400" : "text-red-400"}
                  >
                    {results.environment.supabaseAnonKey}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Supabase Service Key:</span>
                  <span
                    className={
                      results.environment.supabaseServiceKey.includes("✅") ? "text-green-400" : "text-red-400"
                    }
                  >
                    {results.environment.supabaseServiceKey}
                  </span>
                </div>
              </div>
            </div>

            {/* VAPI Tests */}
            <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                {getStatusIcon(results.vapi.connection.success)}
                VAPI Connection
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">API Connection:</span>
                  {getStatusBadge(results.vapi.connection.success)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Fetch Calls:</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(results.vapi.calls.success)}
                    <span className="text-slate-400 text-sm">({results.vapi.calls.calls} calls)</span>
                  </div>
                </div>
                {(results.vapi.connection.error || results.vapi.calls.error) && (
                  <div className="text-red-400 text-xs mt-2">
                    Error: {results.vapi.connection.error || results.vapi.calls.error}
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Tests */}
            <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                {getStatusIcon(results.supabase.connection.success)}
                Supabase Connection
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Database Connection:</span>
                  {getStatusBadge(results.supabase.connection.success)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Fetch Reports:</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(results.supabase.reports.success)}
                    <span className="text-slate-400 text-sm">({results.supabase.reports.reports} reports)</span>
                  </div>
                </div>
                {(results.supabase.connection.error || results.supabase.reports.error) && (
                  <div className="text-red-400 text-xs mt-2">
                    Error: {results.supabase.connection.error || results.supabase.reports.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
