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
      "https://vapi.ai?demo=true&shareKey=89effcf9-d6c0-4a75-9470-51e6f0114e4b&assistantId=bb8029bb-dde6-485a-9c32-d41b684568ff"
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
