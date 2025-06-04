"use client"

import { useRef } from "react"

export function VapiVoiceWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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
          src="https://vapi.ai?demo=true&shareKey=6a029118-46e8-4cda-87f3-0ac2f287af8f&assistantId=265d793f-8179-4d20-a6cc-eb337577c512"
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
