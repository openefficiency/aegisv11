"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, DollarSign, TrendingUp, Settings, Plus, MoreHorizontal, Shield } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { supabase, type Case, type Profile } from "@/lib/supabase"
import { formatCaseText, formatCaseTitle } from "@/lib/utils"


export default function AdminDashboard() {
  const [cases, setCases] = useState<Case[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    openCases: 0,
    resolvedCases: 0,
    totalRewards: 0,
    totalBounty: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch cases
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false })

      if (casesError) throw casesError

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) throw profilesError

      setCases(casesData || [])
      setProfiles(profilesData || [])

      // Calculate stats
      const openCases = casesData?.filter((c) => c.status === "open" || c.status === "under_investigation").length || 0
      const resolvedCases = casesData?.filter((c) => c.status === "resolved").length || 0
      const totalRewards = casesData?.reduce((sum, c) => sum + (c.reward_amount || 0), 0) || 0
      const totalBounty = casesData?.reduce((sum, c) => sum + (c.recovery_amount || 0), 0) || 0

      setStats({
        openCases,
        resolvedCases,
        totalRewards,
        totalBounty,
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
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your organization's whistleblowing platform</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Open Cases</p>
                  <p className="text-2xl font-bold text-white">{stats.openCases}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Resolved Cases</p>
                  <p className="text-2xl font-bold text-white">{stats.resolvedCases}</p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-white">${stats.totalRewards.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Recovery</p>
                  <p className="text-2xl font-bold text-white">${stats.totalBounty.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Team Management
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Cases */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Cases</CardTitle>
                <CardDescription className="text-slate-400">
                  Latest whistleblowing reports and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Case #</TableHead>
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Priority</TableHead>
                      <TableHead className="text-slate-300">Reward</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.slice(0, 5).map((case_) => (
                      <TableRow key={case_.id} className="border-slate-700">
                        <TableCell className="text-slate-300 font-mono">{case_.case_number}</TableCell>


                        <TableCell className="text-white">{formatCaseTitle(case_.title, case_.description, case_.created_at)}</TableCell>


                        <TableCell>
                          <Badge variant="outline" className="border-orange-500 text-orange-400 capitalize">
                            {case_.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(case_.status)}>
                            {case_.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-400">
                          ${case_.reward_amount?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(case_.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Team Members</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your ethics officers and investigators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id} className="border-slate-700">
                        <TableCell className="text-white">
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell className="text-slate-300">{profile.email}</TableCell>
                        <TableCell className="text-slate-300 capitalize">{profile.role.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              profile.is_active ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
                            }
                          >
                            {profile.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Organization Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your platform settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    General Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Reward Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
