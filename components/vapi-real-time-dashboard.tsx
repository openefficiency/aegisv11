"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  Download,
  Eye,
  MessageSquare,
} from "lucide-react"
import { fetchVAPIReports } from "@/lib/vapi-server-actions"
import type { ProcessedVAPIReport } from "@/lib/vapi-integration"

interface VAPIRealTimeDashboardProps {
  onReportSelect?: (report: ProcessedVAPIReport) => void
  showAnalytics?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function VAPIRealTimeDashboard({
  onReportSelect,
  showAnalytics = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: VAPIRealTimeDashboardProps) {
  const [reports, setReports] = useState<ProcessedVAPIReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ProcessedVAPIReport | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [analytics, setAnalytics] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({})

  // Fetch VAPI reports
  const loadReports = async () => {
    try {
      setLoading(true)
      const result = await fetchVAPIReports()
      if (result.success) {
        setReports(result.data)
        calculateAnalytics(result.data)
      }
    } catch (error) {
      console.error("Error loading VAPI reports:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics
  const calculateAnalytics = (reportsData: ProcessedVAPIReport[]) => {
    if (!showAnalytics) return

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recent24h = reportsData.filter((r) => new Date(r.created_at) > last24h)
    const recent7d = reportsData.filter((r) => new Date(r.created_at) > last7d)

    const categoryCount = reportsData.reduce(
      (acc, report) => {
        acc[report.category] = (acc[report.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const priorityCount = reportsData.reduce(
      (acc, report) => {
        acc[report.priority] = (acc[report.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    setAnalytics({
      total: reportsData.length,
      last24h: recent24h.length,
      last7d: recent7d.length,
      categories: categoryCount,
      priorities: priorityCount,
      avgPerDay: Math.round(recent7d.length / 7),
    })
  }

  // Auto-refresh functionality
  useEffect(() => {
    loadReports()

    if (autoRefresh) {
      const interval = setInterval(loadReports, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true
    if (filter === "critical") return report.priority === "critical"
    if (filter === "recent") return new Date(report.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    return report.category === filter
  })

  // Handle audio playback
  const toggleAudio = (reportId: string, audioUrl: string) => {
    if (!audioUrl) return

    setIsPlaying((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }))

    // In a real implementation, you'd handle audio playback here
    if (isPlaying[reportId]) {
      console.log("Pausing audio for report:", reportId)
    } else {
      console.log("Playing audio for report:", reportId)
      window.open(audioUrl, "_blank")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 text-red-400 bg-red-900/20"
      case "high":
        return "border-orange-500 text-orange-400 bg-orange-900/20"
      case "medium":
        return "border-yellow-500 text-yellow-400 bg-yellow-900/20"
      default:
        return "border-green-500 text-green-400 bg-green-900/20"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      harassment: "border-purple-500 text-purple-400",
      fraud: "border-red-500 text-red-400",
      safety: "border-orange-500 text-orange-400",
      discrimination: "border-pink-500 text-pink-400",
      corruption: "border-yellow-500 text-yellow-400",
      retaliation: "border-blue-500 text-blue-400",
      other: "border-gray-500 text-gray-400",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-2 text-slate-400">Loading VAPI reports...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold text-white">{analytics.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-white">{analytics.last24h}</p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Critical Priority</p>
                  <p className="text-2xl font-bold text-white">{analytics.priorities.critical || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg/Day</p>
                  <p className="text-2xl font-bold text-white">{analytics.avgPerDay}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={loadReports}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All Reports</option>
            <option value="critical">Critical Priority</option>
            <option value="recent">Last 24 Hours</option>
            <option value="harassment">Harassment</option>
            <option value="fraud">Fraud</option>
            <option value="safety">Safety</option>
            <option value="discrimination">Discrimination</option>
            <option value="corruption">Corruption</option>
          </select>
        </div>
        <Badge variant="outline" className="border-blue-500 text-blue-400">
          {filteredReports.length} Reports
        </Badge>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No VAPI reports found</p>
              <p className="text-slate-500 text-sm">Reports will appear here when voice calls are completed</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                        {report.report_id}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(report.priority)}>
                        {report.priority}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(report.category)}>
                        {report.category}
                      </Badge>
                      <span className="text-slate-500 text-xs">{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                    <p className="text-slate-300 text-sm line-clamp-2">{report.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {report.audio_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAudio(report.id, report.audio_url)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {isPlaying[report.id] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    {onReportSelect && (
                      <Button
                        size="sm"
                        onClick={() => onReportSelect(report)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Create Case
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick transcript preview */}
                {report.transcript && (
                  <details className="mt-2">
                    <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
                      View Transcript ({report.transcript.length} characters)
                    </summary>
                    <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-600 text-slate-300 text-sm max-h-32 overflow-y-auto">
                      {report.transcript.substring(0, 500)}
                      {report.transcript.length > 500 && "..."}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Report Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>VAPI Report Details: {selectedReport.report_id}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Complete voice report information and transcript
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Report Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm">Report ID</label>
                  <p className="text-white font-mono">{selectedReport.report_id}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Session ID</label>
                  <p className="text-white font-mono text-sm">{selectedReport.session_id}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Priority</label>
                  <Badge variant="outline" className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Category</label>
                  <Badge variant="outline" className={getCategoryColor(selectedReport.category)}>
                    {selectedReport.category}
                  </Badge>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Created</label>
                  <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Duration</label>
                  <p className="text-white">
                    {selectedReport.ended_at
                      ? `${Math.round(
                          (new Date(selectedReport.ended_at).getTime() -
                            new Date(selectedReport.created_at).getTime()) /
                            1000,
                        )}s`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-slate-300 text-sm">Summary</label>
                <div className="bg-slate-900/50 p-4 rounded border border-slate-600 mt-1">
                  <p className="text-slate-300">{selectedReport.summary}</p>
                </div>
              </div>

              {/* Full Transcript */}
              {selectedReport.transcript && (
                <div>
                  <label className="text-slate-300 text-sm">Full Transcript</label>
                  <div className="bg-slate-900/50 p-4 rounded border border-slate-600 mt-1 max-h-60 overflow-y-auto">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedReport.transcript}</p>
                  </div>
                </div>
              )}

              {/* Audio Controls */}
              {selectedReport.audio_url && (
                <div>
                  <label className="text-slate-300 text-sm">Audio Recording</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedReport.audio_url, "_blank")}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play Audio Recording
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = selectedReport.audio_url
                        link.download = `vapi-report-${selectedReport.report_id}.mp3`
                        link.click()
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
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
