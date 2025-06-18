"use client"

import type { ReactNode } from "react"

interface VapiLauncherProps {
  children: ReactNode
}

export function VapiLauncher({ children }: VapiLauncherProps) {
  const handleClick = () => {
    // Updated VAPI configuration with new credentials
    const vapiUrl = `https://vapi.ai?demo=true&publicKey=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063&assistantId=d63127d5-8ec7-4ed7-949a-1942ee4a3917`

    console.log("Launching VAPI with URL:", vapiUrl)
    window.open(vapiUrl, "_blank")
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  )
}

// Also provide default export for compatibility
export default VapiLauncher
