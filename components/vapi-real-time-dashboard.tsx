"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mic, Phone, Clock, DollarSign, Eye, FileText } from "lucide-react"
import { fetchVAPIReports } from "@/lib/vapi-server-actions"

// Define the ProcessedVAPIReport type
export interface ProcessedVAPIReport {
  id: string
  case_id: string
  report_id: string
  title?: string
  summary: string
  transcript: string
  audio_url: string
  session_id: string
  status: string
  report_source: string
  priority: string
  category: string
  created_at: string
  ended_at?: string
  cost?: number
  messages?: any[]
  analysis?: any
  vapi_call_data?: any
}

interface VAPIRealTimeDashboardProps {
  onReportSelect?: (report: ProcessedVAPIReport) => void
}

export function VAPIRealTimeDashboard({ onReportSelect }: VAPIRealTimeDashboardProps) {
  const [reports, setReports] = useState<ProcessedVAPIReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ProcessedVAPIReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReports: 0,
    todayReports: 0,
    totalCost: 0,
    avgDuration: 0,
  })

  useEffect(() => {
    fetchReports()
    setupRealTimeSubscription()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const result = await fetchVAPIReports()
      if (result.success) {
        setReports(result.data)
        calculateStats(result.data)
      } else {
        console.error("Error fetching VAPI reports:", result.error)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealTimeSubscription = () => {
    // This would be implemented with Supabase real-time or similar
    // For now, we'll just poll every 30 seconds
    const interval = setInterval(fetchReports, 30000)

    return () => {
      clearInterval(interval)
    }
  }

  const calculateStats = (reportList: ProcessedVAPIReport[]) => {
    const today = new Date().toDateString()
    const todayReports = reportList.filter((r) => new Date(r.created_at).toDateString() === today).length

    const totalCost = reportList.reduce((sum, r) => {
      return sum + (r.vapi_call_data?.cost || 0)
    }, 0)

    const avgDuration =
      reportList.reduce((sum, r) => {
        if (r.created_at && r.ended_at) {
          const duration = new Date(r.ended_at).getTime() - new Date(r.created_at).getTime()
          return sum + duration / 1000 // Convert to seconds
        }
        return sum
      }, 0) / (reportList.length || 1)

    setStats({
      totalReports: reportList.length,
      todayReports,
      totalCost,
      avgDuration: Math.round(avgDuration),
    })
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return "N/A"
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime()
    return `${Math.round(duration / 1000)}s`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      harassment: "border-red-500 text-red-400",
      fraud: "border-orange-500 text-orange-400",
      safety: "border-yellow-500 text-yellow-400",
      discrimination: "border-purple-500 text-purple-400",
      corruption: "border-pink-500 text-pink-400",
      other: "border-gray-500 text-gray-400",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: "border-red-500 text-red-400",
      high: "border-orange-500 text-orange-400",
      medium: "border-yellow-500 text-yellow-400",
      low: "border-green-500 text-green-400",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-slate-400">Loading VAPI reports...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Reports</p>
                <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Today</p>
                <p className="text-2xl font-bold text-white">{stats.todayReports}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-white">${stats.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Duration</p>
                <p className="text-2xl font-bold text-white">{stats.avgDuration}s</p>
              </div>
              <Phone className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Real-Time VAPI Reports
          </CardTitle>
          <CardDescription className="text-slate-400">
            Live feed of voice reports with automatic case creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No voice reports yet</p>
                  <p className="text-slate-500 text-sm">Reports will appear here in real-time</p>
                </div>
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="bg-slate-900/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              {report.report_id}
                            </Badge>
                            <Badge variant="outline" className={getCategoryColor(report.category)}>
                              {report.category}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(report.priority)}>
                              {report.priority}
                            </Badge>
                            {report.vapi_call_data?.cost && (
                              <Badge variant="outline" className="border-green-500 text-green-400">
                                ${report.vapi_call_data.cost.toFixed(3)}
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-white font-semibold mb-1">{report.title || "Voice Report"}</h4>
                          <p className="text-slate-300 text-sm mb-2 line-clamp-2">{report.summary}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>📅 {new Date(report.created_at).toLocaleString()}</span>
                            <span>⏱️ {formatDuration(report.created_at, report.ended_at)}</span>
                            <span>🆔 {report.case_id}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {report.audio_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={() => window.open(report.audio_url, "_blank")}
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          {onReportSelect && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => onReportSelect(report)}
                            >
                              Create Case
                            </Button>
                          )}
                        </div>
                      </div>

                      {report.transcript && (
                        <details className="mt-3">
                          <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
                            View Transcript ({report.transcript.length} chars)
                          </summary>
                          <div className="mt-2 p-3 bg-slate-900/30 rounded border border-slate-600">
                            <p className="text-slate-300 text-sm whitespace-pre-wrap">
                              {report.transcript.substring(0, 500)}
                              {report.transcript.length > 500 && "..."}
                            </p>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>VAPI Report Details: {selectedReport.report_id}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Complete voice report information and transcript
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm">Report ID</label>
                  <p className="text-white font-mono">{selectedReport.report_id}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Case ID</label>
                  <p className="text-white font-mono">{selectedReport.case_id}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Category</label>
                  <Badge variant="outline" className={getCategoryColor(selectedReport.category)}>
                    {selectedReport.category}
                  </Badge>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Priority</label>
                  <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-slate-300 text-sm">Summary</label>
                <div className="bg-slate-900/50 p-3 rounded border border-slate-600 mt-1">
                  <p className="text-slate-300">{selectedReport.summary}</p>
                </div>
              </div>

              {selectedReport.transcript && (
                <div>
                  <label className="text-slate-300 text-sm">Full Transcript</label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600 mt-1 max-h-60 overflow-y-auto">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedReport.transcript}</p>
                  </div>
                </div>
              )}

              {selectedReport.vapi_call_data?.messages && (
                <div>
                  <label className="text-slate-300 text-sm">Conversation Flow</label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600 mt-1 max-h-60 overflow-y-auto space-y-2">
                    {selectedReport.vapi_call_data.messages.map((message: any, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          message.role === "assistant"
                            ? "bg-blue-900/30 border-l-2 border-blue-500"
                            : "bg-green-900/30 border-l-2 border-green-500"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-xs uppercase">
                            {message.role === "assistant" ? "AI Assistant" : "Caller"}
                          </span>
                          {message.secondsFromStart !== undefined && (
                            <span className="text-xs text-slate-400">{message.secondsFromStart}s</span>
                          )}
                        </div>
                        <p className="text-slate-300">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
