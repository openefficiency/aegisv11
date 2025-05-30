"use client"

import { useEffect, useRef } from "react"

export function VapiVoiceWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== "https://vapi.ai") return

      if (event.data.type === "vapi-status") {
        console.log("Vapi status:", event.data.status)
      }

      // Handle conversation summary
      if (event.data.type === "vapi-summary") {
        try {
          // Update case with summary in Supabase
          const response = await fetch('/api/update-case-summary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              caseId: event.data.caseId,
              summary: event.data.summary,
              sessionId: event.data.sessionId
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update case summary')
          }
        } catch (error) {
          console.error('Error updating case summary:', error)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">Try Our AI Voice Assistant</h3>
        <p className="text-slate-400">Experience secure, anonymous reporting with AI guidance</p>
      </div>

      {/* Vapi Integration */}
      <div className="relative">
        <iframe
          ref={iframeRef}
          src="https://vapi.ai/?demo=true&shareKey=4669de51-f9ba-4e99-a9dd-e39279a6f510&assistantId=bb8029bb-dde6-485a-9c32-d41b684568ff"
          className="w-80 h-60 rounded-lg border border-slate-700"
          title="Vapi Voice Assistant"
          allow="microphone"
        />
      </div>

      <p className="text-sm text-slate-500 max-w-md text-center">
        This demo showcases our AI-powered voice reporting system. In production, all conversations are encrypted and
        anonymous.
      </p>
    </div>
  )
}
