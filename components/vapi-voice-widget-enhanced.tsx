"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react"

interface VAPIVoiceWidgetProps {
  variant?: "default" | "compact" | "hero"
  className?: string
}

export function VAPIVoiceWidgetEnhanced({ variant = "default", className = "" }: VAPIVoiceWidgetProps) {
  const [isActive, setIsActive] = useState(false)
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "error">("idle")

  const startVAPICall = async () => {
    try {
      setStatus("connecting")

      // Get VAPI configuration from server
      const response = await fetch("/api/vapi/config")
      const config = await response.json()

      if (!config.shareKey || !config.assistantId) {
        throw new Error("VAPI configuration not available")
      }

      // Open VAPI in popup
      const vapiUrl = `https://vapi.ai/?demo=true&shareKey=${config.shareKey}&assistantId=${config.assistantId}`

      const popup = window.open(vapiUrl, "vapi-call", "width=400,height=600,scrollbars=no,resizable=no")

      if (popup) {
        setIsActive(true)
        setStatus("active")

        // Monitor popup
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            setIsActive(false)
            setStatus("idle")
          }
        }, 1000)
      } else {
        throw new Error("Popup blocked")
      }
    } catch (error) {
      console.error("Error starting VAPI call:", error)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  const stopVAPICall = () => {
    setIsActive(false)
    setStatus("idle")
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={isActive ? stopVAPICall : startVAPICall}
        disabled={status === "connecting"}
        variant={isActive ? "destructive" : "default"}
        size="sm"
        className={className}
      >
        {isActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {status === "connecting" ? "Connecting..." : isActive ? "End Call" : "Voice Report"}
      </Button>
    )
  }

  if (variant === "hero") {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Report Anonymously</h2>
          <p className="text-muted-foreground">Use your voice to report concerns safely and securely</p>
        </div>

        <Button
          onClick={isActive ? stopVAPICall : startVAPICall}
          disabled={status === "connecting"}
          variant={isActive ? "destructive" : "default"}
          size="lg"
          className="px-8 py-6 text-lg"
        >
          {isActive ? (
            <>
              <PhoneOff className="mr-2 h-6 w-6" />
              End Voice Report
            </>
          ) : (
            <>
              <Phone className="mr-2 h-6 w-6" />
              {status === "connecting" ? "Connecting..." : "Start Voice Report"}
            </>
          )}
        </Button>

        {status === "error" && <p className="text-red-500 text-sm">Unable to start voice report. Please try again.</p>}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Voice Reporting</h3>
            <p className="text-sm text-muted-foreground">
              {status === "idle" && "Click to start voice report"}
              {status === "connecting" && "Connecting to voice system..."}
              {status === "active" && "Voice report in progress"}
              {status === "error" && "Error starting voice report"}
            </p>
          </div>

          <Button
            onClick={isActive ? stopVAPICall : startVAPICall}
            disabled={status === "connecting"}
            variant={isActive ? "destructive" : "default"}
          >
            {isActive ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                End Call
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                {status === "connecting" ? "Connecting..." : "Start Report"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
