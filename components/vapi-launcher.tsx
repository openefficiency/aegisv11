"use client"

import type React from "react"

interface VapiLauncherProps {
  children: React.ReactNode
  className?: string
}

export function VapiLauncher({ children, className }: VapiLauncherProps) {
  const handleLaunchVapi = (e: React.MouseEvent) => {
    e.preventDefault()

    // Open Vapi in a popup window
    const vapiUrl =
      "https://vapi.ai?demo=true&shareKey=6a029118-46e8-4cda-87f3-0ac2f287af8f&assistantId=265d793f-8179-4d20-a6cc-eb337577c512"
    const width = 400
    const height = 600
    const left = window.innerWidth / 2 - width / 2
    const top = window.innerHeight / 2 - height / 2

    window.open(
      vapiUrl,
      "VapiAssistant",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
    )
  }

  return (
    <div className={className} onClick={handleLaunchVapi}>
      {children}
    </div>
  )
}
