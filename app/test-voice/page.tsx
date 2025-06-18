"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VapiVoiceWidget } from "@/components/vapi-voice-widget"
import { AlertCircle, CheckCircle, Mic, Settings, RefreshCw } from "lucide-react"
import { validateEnvironment, testVAPIConnection } from "@/lib/vapi-server-actions"

export default function TestVoicePage() {
  const [envCheck, setEnvCheck] = useState<{
    allSet: boolean
    hasApiKey: boolean
    hasAssistantId: boolean
    hasShareKey: boolean
    missingVars: string[]
  } | null>(null)

  const [browserCheck, setBrowserCheck] = useState<{
    https: boolean
    microphone: boolean
    webrtc: boolean
    websockets: boolean
  }>({
    https: false,
    microphone: false,
    webrtc: false,
    websockets: false,
  })

  const [networkCheck, setNetworkCheck] = useState<{
    online: boolean
    cdnAccessible: boolean
    vapiApiAccessible: boolean
  }>({
    online: false,
    cdnAccessible: false,
    vapiApiAccessible: false,
  })

  const [vapiConnectionTest, setVapiConnectionTest] = useState<{
    tested: boolean
    connected: boolean
    error?: string
  }>({
    tested: false,
    connected: false,
  })

  const [isLoading, setIsLoading] = useState(true)

  const testNetworkConnectivity = async () => {
    const checks = {
      online: navigator.onLine,
      cdnAccessible: false,
      vapiApiAccessible: false,
    }

    // Test CDN accessibility
    try {
      const cdnResponse = await fetch("https://cdn.vapi.ai/web/v1.0.0/index.js", {
        method: "HEAD",
        mode: "no-cors", // Avoid CORS issues for this test
      })
      checks.cdnAccessible = true
    } catch (error) {
      console.log("CDN test failed:", error)
    }

    // Test VAPI API accessibility
    try {
      const apiResponse = await fetch("https://api.vapi.ai", {
        method: "HEAD",
        mode: "no-cors",
      })
      checks.vapiApiAccessible = true
    } catch (error) {
      console.log("VAPI API test failed:", error)
    }

    setNetworkCheck(checks)
  }

  const loadEnvironmentCheck = async () => {
    try {
      const result = await validateEnvironment()
      if (result.success && result.data) {
        setEnvCheck(result.data)
      }
    } catch (error) {
      console.error("Failed to validate environment:", error)
    }
  }

  const testVAPIConnectionHandler = async () => {
    try {
      setVapiConnectionTest({ tested: false, connected: false })
      const result = await testVAPIConnection()
      setVapiConnectionTest({
        tested: true,
        connected: result.success,
        error: result.error || undefined,
      })
    } catch (error: any) {
      setVapiConnectionTest({
        tested: true,
        connected: false,
        error: error.message || "Connection test failed",
      })
    }
  }

  useEffect(() => {
    const initializeTests = async () => {
      setIsLoading(true)

      // Load environment check
      await loadEnvironmentCheck()

      // Test network connectivity
      await testNetworkConnectivity()

      // Check browser capabilities
      const checkBrowser = async () => {
        const checks = {
          https: window.location.protocol === "https:" || window.location.hostname === "localhost",
          microphone: false,
          webrtc: typeof RTCPeerConnection !== "undefined",
          websockets: typeof WebSocket !== "undefined",
        }

        // Test microphone access
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            checks.microphone = true
          }
        } catch (error) {
          console.log("Microphone access test failed:", error)
        }

        setBrowserCheck(checks)
      }

      await checkBrowser()
      setIsLoading(false)
    }

    initializeTests()
  }, [])

  const allBrowserChecksPass = Object.values(browserCheck).every(Boolean)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-400 mx-auto animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-2 mt-4">Loading Tests...</h1>
            <p className="text-slate-400">Running diagnostics for voice functionality</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Voice Report Test Page</h1>
          <p className="text-slate-400">Test and debug the VAPI voice functionality</p>
        </div>

        {/* Environment Variables Check */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {envCheck ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">NEXT_PUBLIC_VAPI_ASSISTANT_ID</span>
                    <Badge
                      variant="outline"
                      className={
                        envCheck.hasAssistantId ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                      }
                    >
                      {envCheck.hasAssistantId ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">VAPI_API_KEY (Server-side)</span>
                    <Badge
                      variant="outline"
                      className={envCheck.hasApiKey ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                    >
                      {envCheck.hasApiKey ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">VAPI_SHARE_KEY (Server-side)</span>
                    <Badge
                      variant="outline"
                      className={
                        envCheck.hasShareKey ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                      }
                    >
                      {envCheck.hasShareKey ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </Badge>
                  </div>
                </div>
                {!envCheck.allSet && (
                  <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded">
                    <p className="text-red-300 text-sm">
                      ⚠️ Missing environment variables: {envCheck.missingVars.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Loading environment check...</p>
            )}
          </CardContent>
        </Card>

        {/* VAPI Connection Test */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="h-5 w-5" />
              VAPI Connection Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">VAPI API Connection</span>
                <div className="flex items-center gap-2">
                  {vapiConnectionTest.tested ? (
                    <Badge
                      variant="outline"
                      className={
                        vapiConnectionTest.connected ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                      }
                    >
                      {vapiConnectionTest.connected ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </Badge>
                  ) : (
                    <Button onClick={testVAPIConnectionHandler} size="sm">
                      Test Connection
                    </Button>
                  )}
                </div>
              </div>
              {vapiConnectionTest.tested && vapiConnectionTest.error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded">
                  <p className="text-red-300 text-sm">{vapiConnectionTest.error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Browser Compatibility Check */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Browser Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">HTTPS/Localhost</span>
                <Badge
                  variant="outline"
                  className={browserCheck.https ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                >
                  {browserCheck.https ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Microphone Access</span>
                <Badge
                  variant="outline"
                  className={
                    browserCheck.microphone ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                  }
                >
                  {browserCheck.microphone ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">WebRTC Support</span>
                <Badge
                  variant="outline"
                  className={browserCheck.webrtc ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                >
                  {browserCheck.webrtc ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">WebSocket Support</span>
                <Badge
                  variant="outline"
                  className={
                    browserCheck.websockets ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                  }
                >
                  {browserCheck.websockets ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </Badge>
              </div>
            </div>
            {!allBrowserChecksPass && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Some browser features may not be available. Try using Chrome/Firefox on HTTPS.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Connectivity Check */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Network Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Internet Connection</span>
                <Badge
                  variant="outline"
                  className={networkCheck.online ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                >
                  {networkCheck.online ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">VAPI CDN Access</span>
                <Badge
                  variant="outline"
                  className={
                    networkCheck.cdnAccessible ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"
                  }
                >
                  {networkCheck.cdnAccessible ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">VAPI API Access</span>
                <Badge
                  variant="outline"
                  className={
                    networkCheck.vapiApiAccessible
                      ? "border-green-500 text-green-400"
                      : "border-yellow-500 text-yellow-400"
                  }
                >
                  {networkCheck.vapiApiAccessible ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="text-center">
              {envCheck?.allSet && allBrowserChecksPass ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">All Systems Ready!</h3>
                  <p className="text-slate-400">Voice reports should work properly</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Issues Detected</h3>
                  <p className="text-slate-400">Please fix the issues above before testing</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Widget Test */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Test Voice Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <VapiVoiceWidget />
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-green-900/20 border-green-700">
          <CardHeader>
            <CardTitle className="text-green-300">🔒 Security Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-200 text-sm">
              This implementation uses secure server-side actions and does not expose sensitive API keys to the client.
              Voice functionality is provided through VAPI's secure iframe and share link approach.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
