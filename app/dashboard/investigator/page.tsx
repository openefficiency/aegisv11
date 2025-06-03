"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Users,
  FileCheck,
  MessageSquare,
  Send,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { supabase, type Case, type InvestigatorQuery } from "@/lib/supabase";
import { auditLogger } from "@/lib/audit-logger";
import { formatCaseText, formatCaseTitle } from "@/lib/utils";

export default function InvestigatorDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [queries, setQueries] = useState<InvestigatorQuery[]>([]);
  const [stats, setStats] = useState({
    assignedCases: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [actionType, setActionType] = useState<"query" | "update" | null>(null);
  const [queryText, setQueryText] = useState("");
  const [updateNote, setUpdateNote] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch assigned cases
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .eq("assigned_to", "33333333-3333-3333-3333-333333333333") // Demo investigator ID
        .order("created_at", { ascending: false });

      if (casesError) throw casesError;

      // Fetch queries
      const { data: queriesData, error: queriesError } = await supabase
        .from("investigator_queries")
        .select("*")
        .eq("investigator_id", "33333333-3333-3333-3333-333333333333")
        .order("created_at", { ascending: false });

      if (queriesError) throw queriesError;

      setCases(casesData || []);
      setQueries(queriesData || []);

      // Calculate stats
      const assignedCases = casesData?.length || 0;
      const inProgress =
        casesData?.filter((c) => c.status === "under_investigation").length ||
        0;
      const completed =
        casesData?.filter((c) => c.status === "resolved").length || 0;
      const highPriority =
        casesData?.filter(
          (c) => c.priority === "high" || c.priority === "critical"
        ).length || 0;

      setStats({
        assignedCases,
        inProgress,
        completed,
        highPriority,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuery = async () => {
    if (!selectedCase || !queryText.trim()) return;

    try {
      const { error } = await supabase.from("investigator_queries").insert({
        case_id: selectedCase.id,
        investigator_id: "33333333-3333-3333-3333-333333333333",
        query_text: queryText,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      await auditLogger.logCaseAction(
        "33333333-3333-3333-3333-333333333333",
        selectedCase.id,
        "query_sent",
        {
          query_text: queryText,
        }
      );

      setQueryText("");
      setSelectedCase(null);
      setActionType(null);
      fetchData();
    } catch (error) {
      console.error("Error sending query:", error);
    }
  };

  const handleUpdateCase = async () => {
    if (!selectedCase || !updateNote.trim()) return;

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (isFinished) {
        updates.status = "resolved";
      }

      const { error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", selectedCase.id);

      if (error) throw error;

      // Add case update
      await supabase.from("case_updates").insert({
        case_id: selectedCase.id,
        message: updateNote,
        update_type: isFinished ? "resolved" : "progress",
        is_public: false,
        created_at: new Date().toISOString(),
      });

      await auditLogger.logCaseAction(
        "33333333-3333-3333-3333-333333333333",
        selectedCase.id,
        isFinished ? "investigation_completed" : "investigation_updated",
        {
          update_note: updateNote,
          is_finished: isFinished,
        }
      );

      setUpdateNote("");
      setIsFinished(false);
      setSelectedCase(null);
      setActionType(null);
      fetchData();
    } catch (error) {
      console.error("Error updating case:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "border-green-500 text-green-400";
      case "escalated":
        return "border-red-500 text-red-400";
      case "under_investigation":
        return "border-blue-500 text-blue-400";
      default:
        return "border-yellow-500 text-yellow-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 text-red-400";
      case "high":
        return "border-orange-500 text-orange-400";
      case "medium":
        return "border-yellow-500 text-yellow-400";
      default:
        return "border-green-500 text-green-400";
    }
  };

  const getProgress = (case_: Case) => {
    switch (case_.status) {
      case "open":
        return 10;
      case "under_investigation":
        return 60;
      case "resolved":
        return 100;
      case "escalated":
        return 90;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="investigator">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="investigator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Investigator Dashboard
            </h1>
            <p className="text-slate-400">
              Manage assigned cases, conduct investigations, and gather evidence
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Assigned Cases</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.assignedCases}
                  </p>
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
                  <p className="text-2xl font-bold text-white">
                    {stats.inProgress}
                  </p>
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
                  <p className="text-2xl font-bold text-white">
                    {stats.completed}
                  </p>
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
                  <p className="text-2xl font-bold text-white">
                    {stats.highPriority}
                  </p>
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
              value="queries"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Whistleblower Queries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Assigned Cases</CardTitle>
                <CardDescription className="text-slate-400">
                  Cases assigned to you for investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">ID</TableHead>
                      <TableHead className="text-slate-300">Title</TableHead>
                      <TableHead className="text-slate-300">Summary</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((case_) => (
                      <TableRow key={case_.id} className="border-slate-700">
                        <TableCell className="text-slate-300 font-mono">
                          {case_.report_id || case_.case_number}
                        </TableCell>
                        <TableCell className="text-white max-w-xs truncate">
                          {formatCaseTitle(case_.title, case_.description, case_.created_at)}
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-sm truncate">
                          {formatCaseText(case_.vapi_report_summary || case_.description)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-orange-500 text-orange-400 capitalize"
                          >
                            {case_.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className={getStatusColor(case_.status)}
                            >
                              {case_.status.replace("_", " ")}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${getProgress(case_)}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">
                                {getProgress(case_)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                  onClick={() => {
                                    setSelectedCase(case_);
                                    setActionType("query");
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Query
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                  onClick={() => {
                                    setSelectedCase(case_);
                                    setActionType("update");
                                  }}
                                >
                                  <FileCheck className="h-4 w-4 mr-1" />
                                  Update/Finish
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Report: Transcript + Artifacts
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Whistleblower Queries
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Queries sent to whistleblowers and their responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div
                      key={query.id}
                      className="border border-slate-700 rounded p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-semibold">
                          Query for Case:{" "}
                          {
                            cases.find((c) => c.id === query.case_id)
                              ?.case_number
                          }
                        </h4>
                        <Badge
                          variant="outline"
                          className={
                            query.status === "responded"
                              ? "border-green-500 text-green-400"
                              : "border-yellow-500 text-yellow-400"
                          }
                        >
                          {query.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-slate-400 text-sm">Query Sent:</p>
                          <p className="text-slate-300">{query.query_text}</p>
                        </div>
                        {query.response_text && (
                          <div>
                            <p className="text-slate-400 text-sm">Response:</p>
                            <p className="text-slate-300">
                              {query.response_text}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Sent: {new Date(query.created_at).toLocaleDateString()}
                        {query.responded_at && (
                          <>
                            {" "}
                            • Responded:{" "}
                            {new Date(query.responded_at).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Query Modal */}
        {selectedCase && actionType === "query" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null);
              setActionType(null);
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Send Query to Whistleblower
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Send a delicate inquiry to the whistleblower for case{" "}
                  {selectedCase.case_number}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Query Message</Label>
                  <Textarea
                    placeholder="Thank you for your report. To help us investigate further, could you please provide additional details about..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                  />
                  <p className="text-slate-500 text-sm mt-1">
                    This message will be sent anonymously to the whistleblower
                    through the Aegis Voice AI Agent
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSendQuery}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!queryText.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Query
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Modal */}
        {selectedCase && actionType === "update" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null);
              setActionType(null);
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Update Investigation
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Provide an update on case {selectedCase.case_number}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Investigation Update</Label>
                  <Textarea
                    placeholder="Provide details on your investigation progress, findings, evidence collected, interviews conducted..."
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="finished"
                    checked={isFinished}
                    onChange={(e) => setIsFinished(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <Label htmlFor="finished" className="text-slate-300">
                    Mark investigation as complete (no further updates needed)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpdateCase}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!updateNote.trim()}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  {isFinished ? "Complete Investigation" : "Submit Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
