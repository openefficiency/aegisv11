"use client"

import { useEffect, useState } from "react"
import { vapiClient } from "@/lib/vapi-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  FileText,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Plus,
  Mic,
  RefreshCw,
  MapPin,
  Calendar,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase, type Case, type Profile } from "@/lib/supabase"
import { formatCaseText, formatCaseTitle, extractCaseLocation, getCaseDateReceived } from "@/lib/utils"

// Enhanced Report interface to match database schema
interface Report {
  id: string
  case_id: string
  category: string
  title: string
  description: string
  location: string
  latitude: number
  longitude: number
  date_occurred?: string
  is_anonymous: boolean
  contact_info?: string
  status: string
  priority: string
  vapi_session_id?: string
  vapi_transcript?: string
  vapi_audio_url?: string
  vapi_report_summary?: string
  secret_code?: string
  report_id?: string
  tracking_code?: string
  reward_amount?: number
  recovery_amount?: number
  reward_status?: string
  created_at: string
  updated_at: string
}

export default function EthicsOfficerDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [investigators, setInvestigators] = useState<Profile[]>([])
  const [vapiReports, setVapiReports] = useState<any[]>([])
  const [stats, setStats] = useState({
    openComplaints: 0,
    resolvedCases: 0,
    rewardsIssued: 0,
    bountyOpen: 92000,
    totalReports: 0,
    mapReports: 0,
    voiceReports: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingVAPI, setLoadingVAPI] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedVAPIReport, setSelectedVAPIReport] = useState<any>(null)
  const [actionType, setActionType] = useState<"assign" | "resolve" | "escalate" | "view" | "view-report" | null>(null)
  const [rewardDetails, setRewardDetails] = useState({
    amount: "",
    currency: "USDC",
    address: "",
    companyUpdate: "",
    whistleblowerUpdate: "",
  })
  const [escalationNote, setEscalationNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const normalizeCase = (c: any): Case => {
    const normalized = { ...c } as Case

    const tryParse = (val: any): any => {
      if (!val) return null
      if (typeof val === "object") return val
      if (typeof val === "string") {
        try {
          return JSON.parse(val)
        } catch {
          return null
        }
      }
      return null
    }

    const parsed = tryParse(c.description) || tryParse(c.title)

    if (parsed && parsed.incident) {
      normalized.structured_data = parsed
      const location = parsed.incident.location || "Unknown"
      normalized.title = `${location} - TESTING`
      normalized.description = parsed.incident.description || ""
    } else {
      normalized.title = typeof c.title === "string" ? c.title : ""
      normalized.description = typeof c.description === "string" ? c.description : ""
    }

    return normalized
  }

  useEffect(() => {
    fetchData()
    fetchVAPIReports()

    // Auto-refresh VAPI reports every 30 seconds
    const interval = setInterval(fetchVAPIReports, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      console.log("Fetching dashboard data...")

      // Fetch reports from the database
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (reportsError) {
        console.error("Error fetching reports:", reportsError)
      } else {
        setReports(reportsData || [])
        console.log(`Loaded ${reportsData?.length || 0} reports from database`)
      }

      // Fetch cases from the database
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false })

      if (casesError) {
        console.error("Error fetching cases:", casesError)
      } else {
        const normalized = (casesData || []).map((c) => normalizeCase(c))
        setCases(normalized)
        console.log(`Loaded ${casesData?.length || 0} cases from database`)
      }

      // Fetch investigators
      const { data: investigatorsData, error: investigatorsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "investigator")
        .eq("is_active", true)

      if (investigatorsError) {
        console.error("Error fetching investigators:", investigatorsError)
      } else {
        setInvestigators(investigatorsData || [])
      }

      // Calculate stats
      const allReports = reportsData || []
      const allCases = casesData || []

      const openComplaints =
        allReports.filter((r) => r.status === "open").length + allCases.filter((c) => c.status === "open").length

      const resolvedCases =
        allReports.filter((r) => r.status === "resolved").length +
        allCases.filter((c) => c.status === "resolved").length

      const rewardsIssued =
        allReports.reduce((sum, r) => sum + (r.reward_amount || 0), 0) +
        allCases.reduce((sum, c) => sum + (c.reward_amount || 0), 0)

      const mapReports = allReports.filter((r) => r.latitude && r.longitude).length
      const voiceReports = allReports.filter((r) => r.vapi_transcript || r.vapi_session_id).length

      setStats({
        openComplaints,
        resolvedCases,
        rewardsIssued,
        bountyOpen: 92000,
        totalReports: allReports.length + allCases.length,
        mapReports,
        voiceReports,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const fetchVAPIReports = async () => {
    setLoadingVAPI(true)
    try {
      console.log("Fetching VAPI reports...")
      const response = await vapiClient.fetchCalls()
      setVapiReports(response)

      // Process new VAPI reports and save them to the database
      await processVAPIReportsIntoDB(response)
    } catch (error) {
      console.error("Error fetching VAPI reports:", error)
      setVapiReports([])
    } finally {
      setLoadingVAPI(false)
    }
  }

  // Process VAPI reports and save them to the reports table
  const processVAPIReportsIntoDB = async (vapiReports: any[]) => {
    try {
      for (const report of vapiReports) {
        // Check if this VAPI report already exists in our database
        const { data: existingReport } = await supabase
          .from("reports")
          .select("id")
          .eq("vapi_session_id", report.session_id)
          .single()

        if (!existingReport && report.transcript && report.transcript.length > 20) {
          // Extract tracking code from summary if available
          const match = report.summary?.match(/tracking code[:\s]+([A-Z0-9]+)/i)

          const newReport: Partial<Report> = {
            case_id: `VAPI-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tracking_code: match ? match[1] : `TRACK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            report_id: report.report_id || `RPT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            title: extractTitleFromSummary(report.summary),
            description: report.summary || "Voice report submitted via VAPI",
            category: categorizeReport(report.summary, report.transcript),
            status: "open",
            priority: prioritizeReport(report.summary, report.transcript),
            location: extractLocationFromTranscript(report.transcript) || "Location not specified",
            latitude: 0, // Default coordinates for voice reports
            longitude: 0,
            is_anonymous: true,
            vapi_session_id: report.session_id,
            vapi_transcript: report.transcript,
            vapi_audio_url: report.audio_url,
            vapi_report_summary: report.summary,
            secret_code: Math.random().toString(36).substring(2, 14).toUpperCase(),
            reward_status: "pending",
            created_at: report.created_at,
            updated_at: new Date().toISOString(),
          }

          // Insert into reports table
          const { error: insertError } = await supabase.from("reports").insert([newReport])

          if (insertError) {
            console.error("Error inserting VAPI report:", insertError)
          } else {
            console.log(`Successfully saved VAPI report: ${report.session_id}`)
            // Refresh the reports data
            fetchData()
          }
        }
      }
    } catch (error) {
      console.error("Error processing VAPI reports:", error)
    }
  }

  // Helper functions
  const extractTitleFromSummary = (summary: string): string => {
    if (!summary) return "Voice Report"
    const firstSentence = summary.split(/[.!?]/)[0].trim()
    if (firstSentence.length > 100) {
      return firstSentence.substring(0, 97) + "..."
    }
    return firstSentence || "Voice Report"
  }

  const extractLocationFromTranscript = (transcript: string): string | null => {
    if (!transcript) return null

    // Simple location extraction patterns
    const locationPatterns = [
      /(?:at|in|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr))/g,
      /([A-Z][a-z]+\s+(?:Building|Office|Department|Floor))/g,
    ]

    for (const pattern of locationPatterns) {
      const matches = transcript.match(pattern)
      if (matches && matches.length > 0) {
        return matches[0].replace(/^(?:at|in|near|around)\s+/i, "")
      }
    }

    return null
  }

  const categorizeReport = (summary: string, transcript: string): string => {
    const text = (summary + " " + transcript).toLowerCase()

    if (text.includes("discriminat") || text.includes("racial") || text.includes("gender") || text.includes("age")) {
      return "discrimination"
    } else if (text.includes("harass") || text.includes("sexual") || text.includes("unwanted")) {
      return "harassment"
    } else if (
      text.includes("fraud") ||
      text.includes("money") ||
      text.includes("steal") ||
      text.includes("embezzle")
    ) {
      return "fraud"
    } else if (text.includes("abuse") || text.includes("violence") || text.includes("threat")) {
      return "abuse"
    } else if (text.includes("safety") || text.includes("danger") || text.includes("unsafe")) {
      return "safety"
    } else if (text.includes("corrupt") || text.includes("bribe") || text.includes("kickback")) {
      return "corruption"
    } else {
      return "fraud"
    }
  }

  const prioritizeReport = (summary: string, transcript: string): string => {
    const text = (summary + " " + transcript).toLowerCase()

    if (
      text.includes("immediate") ||
      text.includes("urgent") ||
      text.includes("danger") ||
      text.includes("threat") ||
      text.includes("critical") ||
      text.includes("killed") ||
      text.includes("injury")
    ) {
      return "critical"
    } else if (
      text.includes("serious") ||
      text.includes("significant") ||
      text.includes("major") ||
      text.includes("large") ||
      text.includes("thousands") ||
      text.includes("ongoing")
    ) {
      return "high"
    } else if (text.includes("minor") || text.includes("small")) {
      return "low"
    } else {
      return "medium"
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 text-red-400"
      case "high":
        return "border-orange-500 text-orange-400"
      case "medium":
        return "border-yellow-500 text-yellow-400"
      default:
        return "border-green-500 text-green-400"
    }
  }

  const addFundsToPool = () => {
    window.open("https://plaid.com/demo", "_blank", "width=600,height=400")
  }

  if (loading) {
    return (
      <DashboardLayout role="ethics-officer">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="ethics-officer">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-300">{error}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Ethics Officer Dashboard</h1>
            <p className="text-slate-400">Manage cases, process rewards, and oversee investigations</p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Reports</p>
                  <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.mapReports} map • {stats.voiceReports} voice
                  </p>
                </div>
                <FileText className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Open Complaints</p>
                  <p className="text-3xl font-bold text-white">{stats.openComplaints}</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Resolved Cases</p>
                  <p className="text-3xl font-bold text-white">{stats.resolvedCases}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Bounty Pool</p>
                  <p className="text-3xl font-bold text-white">${stats.bountyOpen.toLocaleString()}</p>
                  <Button onClick={addFundsToPool} size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Funds
                  </Button>
                </div>
                <DollarSign className="h-12 w-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              All Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger
              value="cases"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Legacy Cases ({cases.length})
            </TabsTrigger>
            <TabsTrigger
              value="vapi-reports"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              VAPI Reports ({vapiReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Reports Management</CardTitle>
                <CardDescription className="text-slate-400">
                  All reports from map submissions and voice calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No reports found</p>
                    <p className="text-slate-500 text-sm">Reports will appear here when submitted</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">ID</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Title</TableHead>
                        <TableHead className="text-slate-300">Category</TableHead>
                        <TableHead className="text-slate-300">Priority</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Location</TableHead>
                        <TableHead className="text-slate-300">Date</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id} className="border-slate-700">
                          <TableCell className="text-slate-300 font-mono">
                            {report.tracking_code || report.case_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {report.vapi_transcript ? (
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                  <Mic className="h-3 w-3 mr-1" />
                                  Voice
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-blue-500 text-blue-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Map
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-white max-w-xs">
                            <div className="truncate">{report.title}</div>
                            {report.vapi_report_summary && (
                              <div className="text-xs text-slate-400 truncate">
                                {report.vapi_report_summary.substring(0, 50)}...
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-500 text-orange-400 capitalize">
                              {report.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(report.priority)}>
                              {report.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(report.status)}>
                              {report.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300 max-w-xs">
                            <div className="truncate">{report.location}</div>
                            {report.latitude !== 0 && report.longitude !== 0 && (
                              <div className="text-xs text-slate-500">
                                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => {
                                  setSelectedReport(report)
                                  setActionType("view-report")
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {report.vapi_audio_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                  onClick={() => window.open(report.vapi_audio_url, "_blank")}
                                >
                                  <Mic className="h-4 w-4 mr-1" />
                                  Audio
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            {/* Legacy Cases Table - Keep existing implementation */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Legacy Case Management</CardTitle>
                <CardDescription className="text-slate-400">Cases from the original system</CardDescription>
              </CardHeader>
              <CardContent>
                {cases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No legacy cases found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Case ID</TableHead>
                        <TableHead className="text-slate-300">Title</TableHead>
                        <TableHead className="text-slate-300">Category</TableHead>
                        <TableHead className="text-slate-300">Priority</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.map((case_) => (
                        <TableRow key={case_.id} className="border-slate-700">
                          <TableCell className="text-slate-300 font-mono">
                            {case_.tracking_code || case_.report_id || case_.case_number}
                          </TableCell>
                          <TableCell className="text-white max-w-xs truncate">
                            {formatCaseTitle(case_.title, case_.description, case_.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-500 text-orange-400 capitalize">
                              {case_.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                              {case_.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(case_.status)}>
                              {case_.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                              onClick={() => {
                                setSelectedCase(case_)
                                setActionType("view")
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vapi-reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Voice AI Reports</CardTitle>
                    <CardDescription className="text-slate-400">Raw reports from VAPI voice assistant</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={fetchVAPIReports}
                      variant="outline"
                      size="sm"
                      disabled={loadingVAPI}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {loadingVAPI ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Sync VAPI
                        </>
                      )}
                    </Button>
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {vapiReports.length} Reports
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVAPI ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mr-2" />
                    <div className="text-slate-400">Loading VAPI reports...</div>
                  </div>
                ) : vapiReports.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No voice reports found</p>
                    <p className="text-slate-500 text-sm">
                      Reports will appear here when users submit voice complaints
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vapiReports.map((report) => (
                      <Card key={report.id} className="bg-slate-900/50 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="border-blue-500 text-blue-400">
                                  {report.report_id}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    report.status === "processed"
                                      ? "border-green-500 text-green-400"
                                      : "border-yellow-500 text-yellow-400"
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </div>
                              <h4 className="text-white font-semibold">{extractTitleFromSummary(report.summary)}</h4>
                              <p className="text-slate-400 text-sm">
                                Received: {new Date(report.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {report.audio_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  onClick={() => window.open(report.audio_url, "_blank")}
                                >
                                  <Mic className="h-4 w-4 mr-1" />
                                  Audio
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    onClick={() => setSelectedVAPIReport(report)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Full
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </div>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                            <p className="text-slate-300 text-sm">{report.summary}</p>
                          </div>
                          {report.transcript && (
                            <details className="mt-2">
                              <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
                                View Transcript ({report.transcript.length} characters)
                              </summary>
                              <div className="mt-2 p-2 bg-slate-900/30 rounded text-slate-400 text-xs max-h-32 overflow-y-auto">
                                {report.transcript.substring(0, 500)}
                                {report.transcript.length > 500 && "..."}
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Detail Modal */}
        {selectedReport && actionType === "view-report" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedReport(null)
              setActionType(null)
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Report Details: {selectedReport.tracking_code}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Complete report information and evidence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Report ID</Label>
                    <p className="text-white font-mono">{selectedReport.tracking_code}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Type</Label>
                    <div className="flex items-center gap-2">
                      {selectedReport.vapi_transcript ? (
                        <Badge variant="outline" className="border-purple-500 text-purple-400">
                          <Mic className="h-3 w-3 mr-1" />
                          Voice Report
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          <MapPin className="h-3 w-3 mr-1" />
                          Map Report
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Date Received</Label>
                    <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Location</Label>
                    <p className="text-white">{selectedReport.location}</p>
                    {selectedReport.latitude !== 0 && selectedReport.longitude !== 0 && (
                      <p className="text-slate-400 text-sm">
                        Coordinates: {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Title</Label>
                  <p className="text-white">{selectedReport.title}</p>
                </div>
                <div>
                  <Label className="text-slate-300">Description</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                    <p className="text-slate-300">{selectedReport.description}</p>
                  </div>
                </div>
                {selectedReport.vapi_report_summary && (
                  <div>
                    <Label className="text-slate-300">VAPI Summary</Label>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-slate-300">{selectedReport.vapi_report_summary}</p>
                    </div>
                  </div>
                )}
                {selectedReport.vapi_transcript && (
                  <div>
                    <Label className="text-slate-300">Voice Transcript</Label>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600 max-h-40 overflow-y-auto">
                      <p className="text-slate-300 whitespace-pre-wrap">{selectedReport.vapi_transcript}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Category</Label>
                    <Badge variant="outline" className="border-orange-500 text-orange-400 capitalize">
                      {selectedReport.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-300">Priority</Label>
                    <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                      {selectedReport.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-slate-300">Status</Label>
                    <Badge variant="outline" className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {selectedReport.contact_info && !selectedReport.is_anonymous && (
                  <div>
                    <Label className="text-slate-300">Contact Information</Label>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-slate-300">{selectedReport.contact_info}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {selectedReport.vapi_audio_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedReport.vapi_audio_url, "_blank")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Play Audio
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedReport(null)
                    setActionType(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Keep existing modals for legacy cases and VAPI reports */}
        {selectedCase && actionType === "view" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null)
              setActionType(null)
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Case Details: {selectedCase.tracking_code}</DialogTitle>
                <DialogDescription className="text-slate-400">Complete case information and evidence</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Case ID</Label>
                    <p className="text-white font-mono">{selectedCase.tracking_code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Date Received</Label>
                    <p className="text-white">
                      {getCaseDateReceived(selectedCase.title, selectedCase.description, selectedCase.created_at)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Location</Label>
                    <p className="text-white">
                      {extractCaseLocation(selectedCase.title) || extractCaseLocation(selectedCase.description)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Title</Label>
                  <p className="text-white">
                    {formatCaseTitle(selectedCase.title, selectedCase.description, selectedCase.created_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-300">Description</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                    <p className="text-slate-300">{formatCaseText(selectedCase.description)}</p>
                  </div>
                </div>
                {selectedCase.vapi_transcript && (
                  <div>
                    <Label className="text-slate-300">Voice Transcript</Label>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600 max-h-40 overflow-y-auto">
                      <p className="text-slate-300 whitespace-pre-wrap">{selectedCase.vapi_transcript}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* VAPI Report Detail Modal */}
        {selectedVAPIReport && (
          <Dialog open={true} onOpenChange={() => setSelectedVAPIReport(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">VAPI Report Details</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Complete voice report from {selectedVAPIReport.report_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Summary</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                    <p className="text-slate-300">{selectedVAPIReport.summary}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Full Transcript</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600 max-h-60 overflow-y-auto">
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedVAPIReport.transcript}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {selectedVAPIReport.audio_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedVAPIReport.audio_url, "_blank")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Play Audio
                  </Button>
                )}
                <Button onClick={() => setSelectedVAPIReport(null)} className="bg-blue-600 hover:bg-blue-700">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
