"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, Search, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { supabase, type Case, type CaseUpdate } from "@/lib/supabase"

export default function FollowUpPage() {
  const [secretCode, setSecretCode] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setCaseData(null)

    try {
      // Look up case by secret code
      const { data: caseResult, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("secret_code", secretCode.toUpperCase())
        .single()

      if (caseError) {
        if (caseError.code === "PGRST116") {
          setError("No case found with the provided secret code.")
        } else {
          throw caseError
        }
        return
      }

      // Fetch case updates
      const { data: updatesResult, error: updatesError } = await supabase
        .from("case_updates")
        .select("*")
        .eq("case_id", caseResult.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (updatesError) throw updatesError

      setCaseData(caseResult)
      setCaseUpdates(updatesResult || [])
    } catch (error) {
      console.error("Error looking up case:", error)
      setError("An error occurred while looking up your case. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "border-green-500 text-green-400"
      case "escalated":
        return "border-red-500 text-red-400"
      case "under_investigation":
        return "border-blue-500 text-blue-400"
      default:
        return "border-yellow-500 text-yellow-400"
    }
  }

  const getProgress = (status: string) => {
    switch (status) {
      case "open":
        return 25
      case "under_investigation":
        return 60
      case "escalated":
        return 90
      case "resolved":
        return 100
      default:
        return 10
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "progress":
        return "bg-blue-500"
      case "status":
        return "bg-yellow-500"
      case "escalated":
        return "bg-red-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">AegisWhistle</span>
            </Link>
            <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Follow-up on Your Report</h1>
          <p className="text-xl text-slate-300">Track the progress of your anonymous whistleblowing report</p>
        </div>

        {/* Secret Code Input */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Enter Your Secret Code</CardTitle>
            <CardDescription className="text-slate-400">
              Use the secret code provided when you submitted your report to track its progress anonymously.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretCode" className="text-slate-300">
                  Secret Code
                </Label>
                <div className="relative">
                  <Input
                    id="secretCode"
                    type={showCode ? "text" : "password"}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter your 12-character secret code"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowCode(!showCode)}
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-slate-500">Example: ABC123456789 (for demo purposes)</p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Looking up..." : "Track My Report"}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-900/20 border-red-700 mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Case Information */}
        {caseData && (
          <div className="space-y-6">
            {/* Case Overview */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{caseData.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      Case #{caseData.case_number} • Submitted: {new Date(caseData.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(caseData.status)}>
                    {caseData.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Priority Level</span>
                    <p className="text-white font-semibold capitalize">{caseData.priority}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Last Updated</span>
                    <p className="text-white">{new Date(caseData.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${getProgress(caseData.status)}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{getProgress(caseData.status)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Information */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Reward Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Status</span>
                    <p className="text-white capitalize">{caseData.reward_status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Estimated Amount</span>
                    <p className="text-green-400 font-semibold">${caseData.reward_amount?.toLocaleString() || "0"}</p>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Description</span>
                  <p className="text-slate-300">
                    Reward will be processed upon successful resolution and recovery of funds.
                    {caseData.recovery_amount > 0 && ` Recovery amount: $${caseData.recovery_amount.toLocaleString()}`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Case Updates */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Case Updates</CardTitle>
                <CardDescription className="text-slate-400">Timeline of your case progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseUpdates.length > 0 ? (
                    caseUpdates.map((update) => (
                      <div key={update.id} className="flex gap-4 pb-4 border-b border-slate-700 last:border-b-0">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full mt-2 ${getUpdateIcon(update.update_type)}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-400 text-sm">{new Date(update.created_at).toLocaleDateString()}</p>
                          <p className="text-white">{update.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No updates available yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Notice */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mt-8">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-2">🔒 Your Privacy is Protected</h3>
            <p className="text-slate-400 text-sm">
              This lookup is completely anonymous. We do not track your IP address or store any identifying information.
              Your secret code is the only way to access your case information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
