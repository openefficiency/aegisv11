"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface Config {
  shareKey?: string
  assistantId?: string
}

interface VAPIVoiceWidgetProps {
  config?: Config
}

const VAPIVoiceWidgetEnhanced: React.FC<VAPIVoiceWidgetProps> = ({ config }) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const getVAPIUrl = () => {
    const shareKey = config?.shareKey || "5d2ff1e9-46b9-4b45-8369-e6f0c65cb063"
    const assistantId = config?.assistantId || "d63127d5-8ec7-4ed7-949a-1942ee4a3917"
    return `https://vapi.ai/?demo=true&shareKey=${shareKey}&assistantId=${assistantId}`
  }

  useEffect(() => {
    setIframeUrl(getVAPIUrl())
  }, [config])

  return (
    <div>
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="VAPI Voice Widget"
          width="300"
          height="400"
          style={{ border: "none" }}
        />
      )}
    </div>
  )
}

export { VAPIVoiceWidgetEnhanced }
export default VAPIVoiceWidgetEnhanced
