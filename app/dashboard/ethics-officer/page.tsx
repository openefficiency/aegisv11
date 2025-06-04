// app/dashboard/ethics-officer/page.tsx (Updated with better error handling)
"use client";

import React, { useEffect, useState } from "react";
import { vapiClient } from "@/lib/vapi-client";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Award,
  Plus,
  Send,
  UserPlus,
  Mic,
  RefreshCw,
  Clock,
  User,
  Bot,
  FileCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { supabase, type Case, type Profile } from "@/lib/supabase";
import { cryptoRewardSystem, supportedCurrencies } from "@/lib/crypto-utils";

import { auditLogger } from "@/lib/audit-logger";
import { formatCaseText, formatCaseTitle, extractCaseLocation, getCaseDateReceived } from "@/lib/utils";
import demoCasesData from "../demo.json";

export default function EthicsOfficerDashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [investigators, setInvestigators] = useState<Profile[]>([]);
  const [vapiReports, setVapiReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    openComplaints: 0,
    resolvedCases: 0,
    rewardsIssued: 0,
    bountyOpen: 92000,
  });
  const [loading, setLoading] = useState(true);
  const [loadingVAPI, setLoadingVAPI] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedVAPIReport, setSelectedVAPIReport] = useState<any>(null);
  const [actionType, setActionType] = useState<
    "assign" | "resolve" | "escalate" | "view" | null
  >(null);
  const [rewardDetails, setRewardDetails] = useState({
    amount: "",
    currency: "USDC",
    address: "",
    companyUpdate: "",
    whistleblowerUpdate: "",
  });
  const [escalationNote, setEscalationNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizeCase = (c: any): Case => {
    const normalized = { ...c } as Case;

    const tryParse = (val: any): any => {
      if (!val) return null;
      if (typeof val === "object") return val;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return null;
    };

    const parsed = tryParse(c.description) || tryParse(c.title);

    if (parsed && parsed.incident) {
      normalized.structured_data = parsed;
      const location = parsed.incident.location || "Unknown";
      normalized.title = `${location} - TESTING`;
      normalized.description = parsed.incident.description || "";
    } else {
      normalized.title = typeof c.title === "string" ? c.title : "";
      normalized.description =
        typeof c.description === "string" ? c.description : "";
    }

    return normalized;
  };

  useEffect(() => {
    fetchData();
    fetchVAPIReports();

    // Auto-refresh VAPI reports every 30 seconds
    const interval = setInterval(fetchVAPIReports, 30000);

    // Add demo cases in batches
    const addDemoCases = () => {
      setCases((prev) => {
        // Take first 5 cases from demo data
        const newCases = demoCasesData.slice(0, 5).map(normalizeCase);
        // Combine with existing cases, keeping only most recent 30
        return [...newCases, ...prev].slice(0, 30);
      });
    };

    // Add initial batch of cases
    addDemoCases();

    // Add new batch every 10 seconds
    const demoInterval = setInterval(addDemoCases, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(demoInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      console.log("Fetching dashboard data...");

      // Create some mock cases if database is empty
      const mockCases: Case[] = [
        {
          id: "case-1",
          case_number: "WB-2025-0001",
          tracking_code: "TRACK-1001",
          report_id: "RPT1234567890",
          title: "Financial irregularities in department",
          description:
            "Serious financial fraud involving fake invoices and fund diversion",
          category: "fraud",
          status: "open",
          priority: "high",
          secret_code: "ABC123456789",
          reward_status: "pending",
          vapi_report_summary:
            "Financial fraud report involving fake invoices and fund diversion by manager",
          vapi_session_id: "session-1",
          vapi_transcript:
            "Hello, I need to report some serious financial irregularities...",
          vapi_audio_url: "https://example.com/recording1.mp3",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "case-2",
          case_number: "WB-2025-0002",
          tracking_code: "TRACK-1002",
          report_id: "RPT2345678901",
          title: "Workplace harassment by supervisor",
          description: "Ongoing harassment and inappropriate behavior",
          category: "harassment",
          status: "under_investigation",
          priority: "high",
          secret_code: "DEF456789012",
          reward_status: "pending",
          assigned_to: "investigator-1",
          vapi_report_summary:
            "Workplace harassment and inappropriate behavior by supervisor",
          vapi_session_id: "session-2",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "case-3",
          case_number: "WB-2025-0003",
          tracking_code: "TRACK-1003",
          report_id: "RPT3456789012",
          title: "Safety violations in warehouse",
          description: "Critical safety violations with injury cover-ups",
          category: "safety",
          status: "resolved",
          priority: "critical",
          secret_code: "GHI789012345",
          reward_status: "paid",
          reward_amount: 15000,
          recovery_amount: 100000,
          vapi_report_summary:
            "Safety violations and incident cover-ups in warehouse operations",
          vapi_session_id: "session-3",
          created_at: new Date(Date.now() - 10800000).toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Mock investigators
      const mockInvestigators: Profile[] = [
        {
          id: "investigator-1",
          email: "john.doe@company.com",
          first_name: "John",
          last_name: "Doe",
          role: "investigator",
          is_active: true,
          department: "Internal Affairs",
          created_at: new Date().toISOString(),
        },
        {
          id: "investigator-2",
          email: "jane.smith@company.com",
          first_name: "Jane",
          last_name: "Smith",
          role: "investigator",
          is_active: true,
          department: "Ethics & Compliance",
          created_at: new Date().toISOString(),
        },
      ];

      // Try to fetch from Supabase first
      try {
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: investigatorsData, error: investigatorsError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("role", "investigator")
            .eq("is_active", true);

        // Use database data if available, otherwise use mock data
        const finalCases =
          casesData && casesData.length > 0 ? casesData : mockCases;
        const finalInvestigators =
          investigatorsData && investigatorsData.length > 0
            ? investigatorsData
            : mockInvestigators;

        const normalized = finalCases.map((c) => normalizeCase(c));
        setCases(normalized);
        setInvestigators(finalInvestigators);

        // Calculate stats
        const openComplaints = finalCases.filter(
          (c) => c.status === "open"
        ).length;
        const resolvedCases = finalCases.filter(
          (c) => c.status === "resolved"
        ).length;
        const rewardsIssued = finalCases.reduce(
          (sum, c) => sum + (c.reward_amount || 0),
          0
        );

        setStats({
          openComplaints,
          resolvedCases,
          rewardsIssued,
          bountyOpen: 92000,
        });

        console.log(
          `Loaded ${finalCases.length} cases and ${finalInvestigators.length} investigators`
        );
      } catch (dbError) {
        console.warn("Database not available, using mock data:", dbError);
        //setCases(mockCases.map((c) => normalizeCase(c))); //test
        setInvestigators(mockInvestigators);

        // Calculate stats from mock data
        setStats({
          openComplaints: 1,
          resolvedCases: 1,
          rewardsIssued: 15000,
          bountyOpen: 92000,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Using demo data.");

      // Fallback to minimal mock data
      setCases([]);
      setInvestigators([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVAPIReports = async () => {
    setLoadingVAPI(true);
    try {
      console.log("Fetching VAPI reports...");
      console.log("Testing-aegis");

      // Use the correct API endpoint path
      // const response = await fetch("/api/update-case-summary/vapi-reports");
      const hasValidConfig =
        process.env.NEXT_PUBLIC_VAPI_API_KEY &&
        process.env.NEXT_PUBLIC_VAPI_API_KEY !==
          "2ca2e718-80b2-454a-a78b-e0560a06f1c4";

      console.log("VAPI Config Status:", {
        hasApiKey: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
        hasValidKey: hasValidConfig,
        assistantId:
          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "using_default",
      });

      console.log("VAPI CONNECTION!!!");
      const response = await vapiClient.fetchCalls();
      // console.log(`Found ${reports.length} real VAPI reports`);

      console.log("Testing-aegis2");
      // const response = await fetch("/api/update-case-summary/vapi-reports");

      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      // }

      const result = await response;
      console.log("test3" + JSON.stringify(result));

      // if (result.success) {
      setVapiReports(response);
      // console.log(
      //   `Loaded ${result.reports.length} VAPI reports from ${
      //     result.source || "api"
      //   }`
      // );
      // console.log("test4");

      // Process new reports into cases
      await processVAPIReportsIntoCases(response);
      console.log("test5");
      // } else {
      //   console.error("Failed to fetch VAPI reports:", result.error);
      //   // Set empty array to show no reports available
      //   setVapiReports([]);
      // }
    } catch (error) {
      console.error("Error fetching VAPI reports:", error);
      // Set empty array to show no reports available
      setVapiReports([]);
    } finally {
      setLoadingVAPI(false);
    }
  };

  // Convert VAPI reports into cases
  const processVAPIReportsIntoCases = async (reports: any[]) => {
    try {
      for (const report of reports) {
        // Check if case already exists by looking for matching session_id in current cases
        const existingCase = cases.find(
          (c) => c.vapi_session_id === report.session_id
        );

        if (
          !existingCase &&
          report.transcript &&
          report.transcript.length > 20
        ) {
          // Create new case from VAPI report
          const match = report.summary?.match(/tracking code[:\s]+([A-Z0-9]+)/i);

          const newCase: Case = {
            id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            case_number: `WB-${new Date().getFullYear()}-${String(
              Math.floor(Math.random() * 10000)
            ).padStart(4, "0")}`,
            report_id: report.report_id,
            tracking_code: match ? match[1] : generateTrackingCode(),
            title: extractTitleFromSummary(report.summary),
            description: report.summary,
            category: categorizeReport(report.summary, report.transcript),
            status: "open",
            priority: prioritizeReport(report.summary, report.transcript),
            secret_code: generateSecretCode(),
            vapi_report_summary: report.summary,
            vapi_session_id: report.session_id,
            vapi_transcript: report.transcript,
            vapi_audio_url: report.audio_url,
            reward_status: "pending",
            created_at: report.created_at,
            updated_at: new Date().toISOString(),
          };

          // Add to local state with normalization
          setCases((prevCases) => [normalizeCase(newCase), ...prevCases]);

          // Try to save to database (optional)
          try {
            await supabase.from("cases").insert(newCase);
            console.log(
              `Created new case from VAPI report: ${report.report_id}`
            );
          } catch (dbError) {
            console.warn(
              "Could not save to database, but case created locally:",
              dbError
            );
          }
        }
      }
    } catch (error) {
      console.error("Error processing VAPI reports into cases:", error);
    }
  };

  const testVAPIConnection = async () => {
    try {
      const isConnected = await vapiClient.testConnection();
      if (isConnected) {
        console.log("✅ VAPI connection successful!");
        alert("VAPI connection successful!");
      } else {
        console.log("❌ VAPI connection failed");
        alert("VAPI connection failed - check your credentials");
      }
    } catch (error) {
      console.error("VAPI test error:", error);
      alert("VAPI connection error: " + error.message);
    }
  };

  const convertSingleReportToCase = async (report: any) => {
    try {
      // Check if case already exists
      const existingCase = cases.find(
        (c) => c.vapi_session_id === report.session_id
      );

      if (existingCase) {
        alert("This report has already been converted to a case.");
        return;
      }

      const match = report.summary?.match(/tracking code[:\s]+([A-Z0-9]+)/i);

      const newCase: Case = {
        id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        case_number: `WB-${new Date().getFullYear()}-${String(
          Math.floor(Math.random() * 10000)
        ).padStart(4, "0")}`,
        report_id: report.report_id,
        tracking_code: match ? match[1] : generateTrackingCode(),
        title: extractTitleFromSummary(report.summary),
        description: report.summary,
        category: categorizeReport(report.summary, report.transcript),
        status: "open",
        priority: prioritizeReport(report.summary, report.transcript),
        secret_code: generateSecretCode(),
        vapi_report_summary: report.summary,
        vapi_session_id: report.session_id,
        vapi_transcript: report.transcript,
        vapi_audio_url: report.audio_url,
        reward_status: "pending",
        created_at: report.created_at,
        updated_at: new Date().toISOString(),
      };

      // Add to local state
      setCases((prevCases) => [normalizeCase(newCase), ...prevCases]);

      // Try to save to database
      try {
        await supabase.from("cases").insert(newCase);
        await auditLogger.logCaseAction(
          "current_user_id",
          newCase.id,
          "case_created_from_vapi",
          {
            vapi_report_id: report.report_id,
            session_id: report.session_id,
          }
        );
      } catch (dbError) {
        console.warn("Could not save to database:", dbError);
      }

      alert("Report successfully converted to case!");
      setSelectedVAPIReport(null);
    } catch (error) {
      console.error("Error converting report to case:", error);
      alert("Failed to convert report to case.");
    }
  };

  // Helper functions
  const extractTitleFromSummary = (summary: string): string => {
    if (!summary) return "Voice Report";
    const firstSentence = summary.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 100) {
      return firstSentence.substring(0, 97) + "...";
    }
    return firstSentence || "Voice Report";
  };

  const categorizeReport = (summary: string, transcript: string): string => {
    const text = (summary + " " + transcript).toLowerCase();

    if (
      text.includes("discriminat") ||
      text.includes("racial") ||
      text.includes("gender") ||
      text.includes("age")
    ) {
      return "discrimination";
    } else if (
      text.includes("harass") ||
      text.includes("sexual") ||
      text.includes("unwanted")
    ) {
      return "harassment";
    } else if (
      text.includes("fraud") ||
      text.includes("money") ||
      text.includes("steal") ||
      text.includes("embezzle")
    ) {
      return "fraud";
    } else if (
      text.includes("abuse") ||
      text.includes("violence") ||
      text.includes("threat")
    ) {
      return "abuse";
    } else if (
      text.includes("safety") ||
      text.includes("danger") ||
      text.includes("unsafe")
    ) {
      return "safety";
    } else if (
      text.includes("corrupt") ||
      text.includes("bribe") ||
      text.includes("kickback")
    ) {
      return "corruption";
    } else {
      return "fraud";
    }
  };

  const prioritizeReport = (summary: string, transcript: string): string => {
    const text = (summary + " " + transcript).toLowerCase();

    if (
      text.includes("immediate") ||
      text.includes("urgent") ||
      text.includes("danger") ||
      text.includes("threat") ||
      text.includes("critical") ||
      text.includes("killed") ||
      text.includes("injury")
    ) {
      return "critical";
    } else if (
      text.includes("serious") ||
      text.includes("significant") ||
      text.includes("major") ||
      text.includes("large") ||
      text.includes("thousands") ||
      text.includes("ongoing")
    ) {
      return "high";
    } else if (text.includes("minor") || text.includes("small")) {
      return "low";
    } else {
      return "medium";
    }
  };

  const generateSecretCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateTrackingCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAssignCase = async (caseId: string, investigatorId: string) => {
    try {
      // Update local state immediately
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                assigned_to: investigatorId,
                status: "under_investigation",
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );

      // Try to update database
      try {
        await supabase
          .from("cases")
          .update({
            assigned_to: investigatorId,
            assigned_by: "current_user_id",
            status: "under_investigation",
            updated_at: new Date().toISOString(),
          })
          .eq("id", caseId);

        await auditLogger.logCaseAction(
          "current_user_id",
          caseId,
          "case_assigned",
          { investigator_id: investigatorId }
        );
      } catch (dbError) {
        console.warn("Could not update database:", dbError);
      }

      setSelectedCase(null);
      setActionType(null);
    } catch (error) {
      console.error("Error assigning case:", error);
    }
  };

  const handleResolveCase = async () => {
    if (!selectedCase) return;

    try {
      const updates = {
        status: "resolved" as const,
        resolution_summary: rewardDetails.companyUpdate,
        whistleblower_update: rewardDetails.whistleblowerUpdate,
        updated_at: new Date().toISOString(),
        reward_amount: rewardDetails.amount
          ? parseFloat(rewardDetails.amount)
          : undefined,
        crypto_address: rewardDetails.address || undefined,
        crypto_currency: rewardDetails.currency || undefined,
        reward_status: rewardDetails.amount
          ? ("pending" as const)
          : selectedCase.reward_status,
      };

      // Update local state
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.id === selectedCase.id ? { ...c, ...updates } : c
        )
      );

      // Try to update database
      try {
        await supabase.from("cases").update(updates).eq("id", selectedCase.id);

        // Process crypto reward if specified
        if (rewardDetails.amount && rewardDetails.address) {
          const rewardResult = await cryptoRewardSystem.processReward({
            amount: parseFloat(rewardDetails.amount),
            currency: rewardDetails.currency,
            address: rewardDetails.address,
            caseId: selectedCase.id,
          });

          if (rewardResult.success) {
            await supabase
              .from("cases")
              .update({ reward_status: "paid" })
              .eq("id", selectedCase.id);
            await auditLogger.logRewardTransaction(
              "current_user_id",
              selectedCase.id,
              {
                amount: rewardDetails.amount,
                currency: rewardDetails.currency,
                transaction_hash: rewardResult.transactionHash,
              }
            );
          }
        }

        await auditLogger.logCaseAction(
          "current_user_id",
          selectedCase.id,
          "case_resolved",
          {
            reward_amount: rewardDetails.amount,
            currency: rewardDetails.currency,
          }
        );
      } catch (dbError) {
        console.warn("Could not update database:", dbError);
      }

      setSelectedCase(null);
      setActionType(null);
      setRewardDetails({
        amount: "",
        currency: "USDC",
        address: "",
        companyUpdate: "",
        whistleblowerUpdate: "",
      });
    } catch (error) {
      console.error("Error resolving case:", error);
    }
  };

  const handleEscalateCase = async (caseId: string) => {
    try {
      // Update local state
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                status: "escalated",
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );

      // Try to update database
      try {
        await supabase
          .from("cases")
          .update({
            status: "escalated",
            updated_at: new Date().toISOString(),
          })
          .eq("id", caseId);

        await auditLogger.logCaseAction(
          "current_user_id",
          caseId,
          "case_escalated",
          {
            escalation_note: escalationNote,
          }
        );
      } catch (dbError) {
        console.warn("Could not update database:", dbError);
      }

      // Mock email notification
      console.log("Email notification sent:", {
        to: "legal@company.com",
        subject: `Case Escalation Required: ${selectedCase?.tracking_code}`,
        body: `Case has been escalated for review.\n\nDetails:\n${escalationNote}`,
      });

      setSelectedCase(null);
      setActionType(null);
      setEscalationNote("");
    } catch (error) {
      console.error("Error escalating case:", error);
    }
  };

  const addFundsToPool = () => {
    window.open("https://plaid.com/demo", "_blank", "width=600,height=400");
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

  if (loading) {
    return (
      <DashboardLayout role="ethics-officer">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
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
            <h1 className="text-3xl font-bold text-white">
              Ethics Officer Dashboard
            </h1>
            <p className="text-slate-400">
              Manage cases, process rewards, and oversee investigations
            </p>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Open Complaints</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.openComplaints}
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
                  <p className="text-slate-400 text-sm">Resolved Cases</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.resolvedCases}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    Rewards Issued So Far
                  </p>
                  <p className="text-3xl font-bold text-white">
                    ${stats.rewardsIssued.toLocaleString()}
                  </p>
                </div>
                <Award className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Bounty Open</p>
                  <p className="text-3xl font-bold text-white">
                    ${stats.bountyOpen.toLocaleString()}
                  </p>
                  <Button
                    onClick={addFundsToPool}
                    size="sm"
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Money
                  </Button>
                </div>
                <DollarSign className="h-12 w-12 text-yellow-400" />
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
              Case Management
            </TabsTrigger>
            <TabsTrigger
              value="vapi-reports"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              VAPI Reports ({vapiReports.length})
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
            >
              Reward Processing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cases Table */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Case Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Review cases, assign investigators, and process rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No cases found</p>
                    <p className="text-slate-500 text-sm">
                      Cases will appear here when reports are submitted
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Case ID</TableHead>
                        <TableHead className="text-slate-300">Title</TableHead>
                        <TableHead className="text-slate-300">
                          Summary
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Category
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Priority
                        </TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">
                          Actions
                        </TableHead>
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
                          <TableCell className="text-slate-300 max-w-sm">
                            <span className="truncate block">
                              {formatCaseText(case_.vapi_report_summary || case_.description)}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                                  onClick={() => {
                                    setSelectedCase(case_);
                                    setActionType("view");
                                  }}
                                >
                                  ---- more
                                </button>
                              </DialogTrigger>
                            </Dialog>
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
                            <Badge
                              variant="outline"
                              className={getPriorityColor(case_.priority)}
                            >
                              {case_.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(case_.status)}
                            >
                              {case_.status.replace("_", " ")}
                            </Badge>
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
                                      setActionType("assign");
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign
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
                                      setActionType("resolve");
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolve
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
                                      setActionType("escalate");
                                    }}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Escalate
                                  </Button>
                                </DialogTrigger>
                              </Dialog>

                              <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => {
                                  setSelectedCase(case_);
                                  setActionType("view");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Full
                              </Button>
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

          <TabsContent value="vapi-reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">
                      Voice AI Reports
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Reports submitted through the VAPI voice assistant
                    </CardDescription>
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
                    <Badge
                      variant="outline"
                      className="border-blue-500 text-blue-400"
                    >
                      {vapiReports.length} Reports
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVAPI ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mr-2" />
                    <div className="text-slate-400">
                      Loading VAPI reports...
                    </div>
                  </div>
                ) : vapiReports.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No voice reports found</p>
                    <p className="text-slate-500 text-sm">
                      Reports will appear here when users submit voice
                      complaints
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vapiReports.map((report) => (
                      <Card
                        key={report.id}
                        className="bg-slate-900/50 border-slate-600"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className="border-blue-500 text-blue-400"
                                >
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
                                {report.vapi_call_data?.cost && (
                                  <Badge
                                    variant="outline"
                                    className="border-purple-500 text-purple-400"
                                  >
                                    ${report.vapi_call_data.cost.toFixed(3)}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="text-white font-semibold">
                                {extractTitleFromSummary(report.summary)}
                              </h4>
                              <p className="text-slate-400 text-sm">
                                Received:{" "}
                                {new Date(report.created_at).toLocaleString()}
                                {report.ended_at && (
                                  <>
                                    {" "}
                                    • Duration:{" "}
                                    {Math.round(
                                      (new Date(report.ended_at).getTime() -
                                        new Date(report.created_at).getTime()) /
                                        1000
                                    )}
                                    s
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {report.audio_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  onClick={() =>
                                    window.open(report.audio_url, "_blank")
                                  }
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
                                    onClick={() =>
                                      setSelectedVAPIReport(report)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Full
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </div>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                            <p className="text-slate-300 text-sm">
                              {report.summary}
                            </p>
                          </div>
                          {report.transcript && (
                            <details className="mt-2">
                              <summary className="text-slate-400 text-sm cursor-pointer hover:text-slate-300">
                                View Transcript ({report.transcript.length}{" "}
                                characters)
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

          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Reward Processing</CardTitle>
                <CardDescription className="text-slate-400">
                  Process crypto rewards for resolved cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cases.filter(
                  (c) =>
                    c.status === "resolved" && c.reward_status === "approved"
                ).length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">
                      No rewards ready for processing
                    </p>
                    <p className="text-slate-500 text-sm">
                      Resolved cases with approved rewards will appear here
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Case ID</TableHead>
                        <TableHead className="text-slate-300">Title</TableHead>
                        <TableHead className="text-slate-300">
                          Recovery Amount
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Reward (15%)
                        </TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases
                        .filter(
                          (c) =>
                            c.status === "resolved" &&
                            c.reward_status === "approved"
                        )
                        .map((case_) => (
                          <TableRow key={case_.id} className="border-slate-700">
                            <TableCell className="text-slate-300 font-mono">
                              {case_.tracking_code || case_.report_id || case_.case_number}
                            </TableCell>
                            <TableCell className="text-white">

                              {formatCaseTitle(case_.title, case_.description, case_.created_at)}




                            </TableCell>
                            <TableCell className="text-green-400">
                              ${case_.recovery_amount?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell className="text-green-400">
                              ${case_.reward_amount?.toLocaleString() || "0"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-400"
                              >
                                Ready for Payout
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Award className="h-4 w-4 mr-2" />
                                Process Reward
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
        </Tabs>

        {/* Action Modals - Same as before but with proper Dialog handling */}
        {selectedCase && actionType === "view" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null);
              setActionType(null);
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Case Details: {selectedCase.tracking_code}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Complete case information and evidence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Case ID</Label>
                    <p className="text-white font-mono">
                      {selectedCase.tracking_code}
                    </p>
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
                {selectedCase.structured_data && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Incident Type</Label>
                        <p className="text-white">
                          {selectedCase.structured_data.incident?.type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Incident Date</Label>
                        <p className="text-white">
                          {selectedCase.structured_data.incident?.date || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Follow Up Notes</Label>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                        <p className="text-slate-300">
                          {selectedCase.structured_data.follow_up?.notes || "N/A"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {selectedCase.vapi_transcript && (
                  <div>
                    <Label className="text-slate-300">Voice Transcript</Label>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600 max-h-40 overflow-y-auto">
                      <p className="text-slate-300 whitespace-pre-wrap">
                        {selectedCase.vapi_transcript}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {selectedCase && actionType === "assign" && (
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
                  Assign Case to Investigator
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Select an investigator for case {selectedCase.tracking_code}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Select Investigator</Label>
                  <Select
                    onValueChange={(value) =>
                      handleAssignCase(selectedCase.id, value)
                    }
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue placeholder="Choose investigator" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {investigators.map((investigator) => (
                        <SelectItem
                          key={investigator.id}
                          value={investigator.id}
                        >
                          {investigator.first_name} {investigator.last_name} -{" "}
                          {investigator.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {selectedCase && actionType === "resolve" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null);
              setActionType(null);
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Resolve Case</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Complete the resolution for case {selectedCase.tracking_code}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Company Update</Label>
                  <Textarea
                    placeholder="Internal resolution summary for company documentation..."
                    value={rewardDetails.companyUpdate}
                    onChange={(e) =>
                      setRewardDetails({
                        ...rewardDetails,
                        companyUpdate: e.target.value,
                      })
                    }
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Whistleblower Update</Label>
                  <Textarea
                    placeholder="Greeting and update message for the whistleblower..."
                    value={rewardDetails.whistleblowerUpdate}
                    onChange={(e) =>
                      setRewardDetails({
                        ...rewardDetails,
                        whistleblowerUpdate: e.target.value,
                      })
                    }
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">
                      Reward Amount (Optional)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter reward amount"
                      value={rewardDetails.amount}
                      onChange={(e) =>
                        setRewardDetails({
                          ...rewardDetails,
                          amount: e.target.value,
                        })
                      }
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Cryptocurrency</Label>
                    <Select
                      value={rewardDetails.currency}
                      onValueChange={(value) =>
                        setRewardDetails({ ...rewardDetails, currency: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {supportedCurrencies.map((currency) => (
                          <SelectItem
                            key={currency.currency}
                            value={currency.currency}
                          >
                            {currency.symbol} {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {rewardDetails.amount && (
                  <div>
                    <Label className="text-slate-300">
                      Crypto Wallet Address
                    </Label>
                    <Input
                      placeholder="Whistleblower's crypto wallet address"
                      value={rewardDetails.address}
                      onChange={(e) =>
                        setRewardDetails({
                          ...rewardDetails,
                          address: e.target.value,
                        })
                      }
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleResolveCase}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Resolve Case & Process Reward
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {selectedCase && actionType === "escalate" && (
          <Dialog
            open={true}
            onOpenChange={() => {
              setSelectedCase(null);
              setActionType(null);
            }}
          >
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Escalate Case</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Escalate case {selectedCase.tracking_code} to legal/senior
                  management
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Escalation Note</Label>
                  <Textarea
                    placeholder="Reason for escalation and required actions..."
                    value={escalationNote}
                    onChange={(e) => setEscalationNote(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => handleEscalateCase(selectedCase.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Escalate & Notify
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* VAPI Report Detail Modal */}
        {selectedVAPIReport && (
          <Dialog open={true} onOpenChange={() => setSelectedVAPIReport(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  VAPI Report Details
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Complete voice report from {selectedVAPIReport.report_id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Summary</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                    <p className="text-slate-300">
                      {selectedVAPIReport.summary}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Full Transcript</Label>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-600 max-h-60 overflow-y-auto">
                    <p className="text-slate-300 whitespace-pre-wrap">
                      {selectedVAPIReport.transcript}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => convertSingleReportToCase(selectedVAPIReport)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Convert to Case
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
