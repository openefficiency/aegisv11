"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { getVAPIConfig } from "@/lib/vapi-server-actions"

interface VAPICallStatus {
  status: "idle" | "loading" | "connected" | "speaking" | "listening" | "ended" | "error" | "redirect"
  message?: string
  transcript?: string
  error?: string
}

interface VAPIConfig {
  assistantId: string
  hasApiKey: boolean
  hasShareKey: boolean
}

export function VapiVoiceWidget() {
  const [callStatus, setCallStatus] = useState<VAPICallStatus>({ status: "idle" })
  const [vapiConfig, setVapiConfig] = useState<VAPIConfig | null>(null)

  // Load VAPI configuration from server
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await getVAPIConfig()
        if (result.success && result.data) {
          setVapiConfig(result.data)
        } else {
          setCallStatus({
            status: "error",
            error: "Failed to load VAPI configuration",
          })
        }
      } catch (error) {
        console.error("Failed to load VAPI config:", error)
        setCallStatus({
          status: "error",
          error: "Failed to load voice service configuration",
        })
      }
    }

    loadConfig()
  }, [])

  const startVoiceCall = () => {
    if (!vapiConfig?.assistantId) {
      setCallStatus({
        status: "error",
        error: "Voice assistant not configured",
      })
      return
    }

    // Use VAPI's share link approach with existing environment variables
    const shareKey = process.env.VAPI_SHARE_KEY || "6a029118-46e8-4cda-87f3-0ac2f287af8f" // fallback
    const vapiUrl = `https://vapi.ai?demo=true&shareKey=${shareKey}&assistantId=${vapiConfig.assistantId}`

    setCallStatus({ status: "redirect", message: "Opening voice assistant..." })

    // Open VAPI in a new window/tab
    window.open(vapiUrl, "_blank", "width=400,height=600,scrollbars=yes,resizable=yes")

    // Reset status after a moment
    setTimeout(() => {
      setCallStatus({ status: "idle", message: "Voice assistant opened in new window" })
    }, 2000)
  }

  const getStatusColor = () => {
    switch (callStatus.status) {
      case "connected":
      case "speaking":
      case "listening":
        return "border-green-500 text-green-400"
      case "loading":
      case "redirect":
        return "border-blue-500 text-blue-400"
      case "error":
        return "border-red-500 text-red-400"
      case "ended":
        return "border-yellow-500 text-yellow-400"
      default:
        return "border-slate-500 text-slate-400"
    }
  }

  const getStatusIcon = () => {
    switch (callStatus.status) {
      case "loading":
      case "redirect":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "connected":
      case "speaking":
      case "listening":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "ended":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Mic className="h-4 w-4" />
    }
  }

  // Show loading state while config is being fetched
  if (!vapiConfig) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-slate-400">Loading voice service...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusIcon()}
          <span className="ml-2 capitalize">{callStatus.status}</span>
        </Badge>
        {callStatus.message && <span className="text-sm text-slate-400">{callStatus.message}</span>}
      </div>

      {/* Error Display */}
      {callStatus.status === "error" && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <p className="text-red-300 font-semibold">Voice Service Error</p>
              <p className="text-red-400 text-sm">{callStatus.error}</p>
              <div className="mt-2 text-xs text-red-400">
                <p>Troubleshooting tips:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your microphone permissions</li>
                  <li>Ensure you're using HTTPS</li>
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Button */}
      <div className="flex justify-center">
        <Button
          onClick={startVoiceCall}
          disabled={callStatus.status === "loading" || callStatus.status === "error" || !vapiConfig.hasApiKey}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
        >
          {callStatus.status === "redirect" ? (
            <>
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <ExternalLink className="h-6 w-6 mr-2" />
              Start Voice Report
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-slate-900/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">How to Use Voice Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <p className="text-slate-300 text-sm">Click "Start Voice Report" to open the voice assistant</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              2
            </div>
            <p className="text-slate-300 text-sm">Allow microphone access when prompted in the new window</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              3
            </div>
            <p className="text-slate-300 text-sm">Speak clearly about your concerns to the AI assistant</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              4
            </div>
            <p className="text-slate-300 text-sm">The AI will guide you through the reporting process</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              5
            </div>
            <p className="text-slate-300 text-sm">Your report will be automatically processed and saved</p>
          </div>
        </CardContent>
      </Card>

      {/* Alternative: Embedded iframe approach */}
      <Card className="bg-slate-900/50 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">Alternative: Embedded Voice Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <iframe
              src={`https://vapi.ai?demo=true&shareKey=6a029118-46e8-4cda-87f3-0ac2f287af8f&assistantId=${vapiConfig.assistantId}`}
              className="w-full h-96 rounded-lg border border-slate-700"
              title="VAPI Voice Assistant"
              allow="microphone"
            />
            <p className="text-xs text-slate-500 mt-2">
              This embedded assistant provides the same functionality in a secure iframe
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-slate-900/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs text-slate-400">
              <p>Config Loaded: {vapiConfig ? "✅" : "❌"}</p>
              <p>Has API Key: {vapiConfig?.hasApiKey ? "✅" : "❌"}</p>
              <p>Has Assistant ID: {vapiConfig?.assistantId ? "✅" : "❌"}</p>
              <p>Has Share Key: {vapiConfig?.hasShareKey ? "✅" : "❌"}</p>
              <p>Status: {callStatus.status}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
