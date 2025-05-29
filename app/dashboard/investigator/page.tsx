"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Clock, CheckCircle, AlertTriangle, Search, Users, FileCheck, MessageSquare } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase, type Case, type Interview } from "@/lib/supabase"

export default function InvestigatorDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [stats, setStats] = useState({
    assignedCases: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch cases assigned to investigator
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .eq("assigned_to", "33333333-3333-3333-3333-333333333333") // Demo investigator ID
        .order("created_at", { ascending: false })

      if (casesError) throw casesError

      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from("interviews")
        .select("*")
        .eq("investigator_id", "33333333-3333-3333-3333-333333333333")
        .order("scheduled_date", { ascending: false })

      if (interviewsError) throw interviewsError

      setCases(casesData || [])
      setInterviews(interviewsData || [])

      // Calculate stats
      const assignedCases = casesData?.length || 0
      const inProgress = casesData?.filter((c) => c.status === "under_investigation").length || 0
      const completed = casesData?.filter((c) => c.status === "resolved").length || 0
      const highPriority = casesData?.filter((c) => c.priority === "high" || c.priority === "critical").length || 0

      setStats({
        assignedCases,
        inProgress,
        completed,
        highPriority,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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

  const getProgress = (case_: Case) => {
    switch (case_.status) {
      case "open":
        return 10
      case "under_investigation":
        return 60
      case "resolved":
        return 100
      case "escalated":
        return 90
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="investigator">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="investigator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Investigator Dashboard</h1>
            <p className="text-slate-400">Manage case assignments, interviews, and findings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Assigned Cases</p>
                  <p className="text-2xl font-bold text-white">{stats.assignedCases}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">High Priority</p>
                  <p className="text-2xl font-bold text-white">{stats.highPriority}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Case Assignments
            </TabsTrigger>
            <TabsTrigger
              value="interviews"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Interview Tracking
            </TabsTrigger>
            <TabsTrigger
              value="findings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Findings & Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {/* Assigned Cases */}
            <div className="grid gap-6">
              {cases.map((case_) => (
                <Card key={case_.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {case_.title}
                          <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Case #{case_.case_number} • Assigned: {new Date(case_.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(case_.status)}>
                        {case_.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-400 text-sm">Category</span>
                        <p className="text-white capitalize">{case_.category}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Due Date</span>
                        <p className="text-white">
                          {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getProgress(case_)}%` }} />
                          </div>
                          <span className="text-white text-sm">{getProgress(case_)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        View Evidence
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Update Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Interview Schedule</CardTitle>
                <CardDescription className="text-slate-400">Track interviews and witness statements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Case #</TableHead>
                      <TableHead className="text-slate-300">Interviewee</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow key={interview.id} className="border-slate-700">
                        <TableCell className="text-slate-300 font-mono">
                          {cases.find((c) => c.id === interview.case_id)?.case_number || "N/A"}
                        </TableCell>
                        <TableCell className="text-white">{interview.interviewee_name}</TableCell>
                        <TableCell className="text-slate-300 capitalize">{interview.interviewee_type}</TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(interview.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              interview.status === "completed"
                                ? "border-green-500 text-green-400"
                                : "border-yellow-500 text-yellow-400"
                            }
                          >
                            {interview.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                          >
                            {interview.status === "completed" ? (
                              <>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Review Notes
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Prepare
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Investigation Findings</CardTitle>
                <CardDescription className="text-slate-400">
                  Document your investigation findings and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="case-select" className="text-slate-300">
                      Select Case
                    </Label>
                    <select
                      id="case-select"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">Select a case...</option>
                      {cases.map((case_) => (
                        <option key={case_.id} value={case_.id}>
                          {case_.case_number} - {case_.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finding-type" className="text-slate-300">
                      Finding Type
                    </Label>
                    <select
                      id="finding-type"
                      className="w-full bg-slate-900/50 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="">Select type...</option>
                      <option value="substantiated">Substantiated</option>
                      <option value="unsubstantiated">Unsubstantiated</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="findings" className="text-slate-300">
                    Investigation Summary
                  </Label>
                  <Textarea
                    id="findings"
                    placeholder="Document your investigation findings, evidence collected, and recommendations..."
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations" className="text-slate-300">
                    Recommendations
                  </Label>
                  <Textarea
                    id="recommendations"
                    placeholder="Provide recommendations for resolution, disciplinary actions, or process improvements..."
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Save Draft
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Submit Report</Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Investigation Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases
                    .filter((c) => c.status === "resolved")
                    .slice(0, 2)
                    .map((case_) => (
                      <div key={case_.id} className="border border-slate-700 rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-semibold">
                            {case_.case_number} - {case_.title}
                          </h4>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            Substantiated
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          Submitted: {new Date(case_.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-slate-300 text-sm">
                          Investigation confirmed the allegations. Recommended policy changes and training programs.
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
