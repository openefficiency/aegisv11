"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, CheckCircle, AlertTriangle, Eye, MessageSquare, Award } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase, type Case } from "@/lib/supabase"

export default function EthicsOfficerDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [stats, setStats] = useState({
    casesToReview: 0,
    rewardsProcessed: 0,
    decisionsMade: 0,
    highPriority: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: casesData, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setCases(casesData || [])

      // Calculate stats
      const casesToReview =
        casesData?.filter((c) => c.status === "open" || c.status === "under_investigation").length || 0

      const rewardsProcessed = casesData?.reduce((sum, c) => sum + (c.reward_amount || 0), 0) || 0

      const decisionsMade = casesData?.filter((c) => c.status === "resolved" || c.status === "escalated").length || 0

      const highPriority = casesData?.filter((c) => c.priority === "high" || c.priority === "critical").length || 0

      setStats({
        casesToReview,
        rewardsProcessed,
        decisionsMade,
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

  if (loading) {
    return (
      <DashboardLayout role="ethics-officer">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  const casesToReview = cases.filter((c) => c.status === "open" || c.status === "under_investigation")
  const rewardCases = cases.filter((c) => c.status === "resolved" && c.reward_status === "approved")

  return (
    <DashboardLayout role="ethics-officer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Ethics Officer Dashboard</h1>
            <p className="text-slate-400">Review cases, process rewards, and make decisions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Cases to Review</p>
                  <p className="text-2xl font-bold text-white">{stats.casesToReview}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Rewards Processed</p>
                  <p className="text-2xl font-bold text-white">${stats.rewardsProcessed.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Decisions Made</p>
                  <p className="text-2xl font-bold text-white">{stats.decisionsMade}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-400" />
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
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="review"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Case Review
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Reward Processing
            </TabsTrigger>
            <TabsTrigger
              value="decisions"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Decision Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-6">
            {/* Cases to Review */}
            <div className="grid gap-6">
              {casesToReview.map((case_) => (
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
                          Case #{case_.case_number} • {new Date(case_.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(case_.status)}>
                        {case_.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Case Summary</h4>
                      <p className="text-slate-300">{case_.description}</p>
                    </div>

                    {case_.vapi_report_summary && (
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          VAPI AI Report Summary
                        </h4>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                          <p className="text-slate-300">{case_.vapi_report_summary}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">Category:</span>
                        <Badge variant="outline" className="border-orange-500 text-orange-400 capitalize">
                          {case_.category}
                        </Badge>
                        <span className="text-slate-400">Potential Reward:</span>
                        <span className="text-green-400 font-semibold">
                          ${case_.reward_amount?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Review Case
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Reward Processing</CardTitle>
                <CardDescription className="text-slate-400">Process crypto rewards for resolved cases</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Case #</TableHead>
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Recovery Amount</TableHead>
                      <TableHead className="text-slate-300">Reward (15%)</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardCases.map((case_) => (
                      <TableRow key={case_.id} className="border-slate-700">
                        <TableCell className="text-slate-300 font-mono">{case_.case_number}</TableCell>
                        <TableCell className="text-white">{case_.title}</TableCell>
                        <TableCell className="text-green-400">
                          ${case_.recovery_amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell className="text-green-400">
                          ${case_.reward_amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            Ready for Payout
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Award className="h-4 w-4 mr-2" />
                            Process Reward
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Decisions</CardTitle>
                <CardDescription className="text-slate-400">Track your case decisions and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases
                    .filter((c) => c.status === "resolved" || c.status === "escalated")
                    .slice(0, 3)
                    .map((case_) => (
                      <div key={case_.id} className="border border-slate-700 rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-semibold">
                            {case_.case_number} - {case_.title}
                          </h4>
                          <Badge variant="outline" className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          Decision Date: {new Date(case_.updated_at).toLocaleDateString()}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {case_.status === "escalated"
                            ? "Escalated to law enforcement due to severity. Recommended immediate investigation and victim protection measures."
                            : "Case resolved successfully. Disciplinary actions taken and process improvements implemented."}
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
