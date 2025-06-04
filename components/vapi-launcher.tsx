"use client"

import type { ReactNode } from "react"

interface VapiLauncherProps {
  children: ReactNode
}

export function VapiLauncher({ children }: VapiLauncherProps) {
  const handleClick = () => {
    // Open VAPI interface or redirect to report page
    window.open(
      "https://vapi.ai?demo=true&shareKey=6a029118-46e8-4cda-87f3-0ac2f287af8f&assistantId=265d793f-8179-4d20-a6cc-eb337577c512",
      "_blank",
    )
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  )
}
