"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  MessageSquare,
  Mic,
} from "lucide-react";
import Link from "next/link";
import {
  supabase,
  type Case,
  type CaseUpdate,
  type InvestigatorQuery,
} from "@/lib/supabase";
import { formatCaseText, formatCaseTitle, getCaseDateReceived, extractCaseLocation } from "@/lib/utils";



export default function FollowUpPage() {
  const [secretCode, setSecretCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
  const [investigatorQueries, setInvestigatorQueries] = useState<
    InvestigatorQuery[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCaseData(null);

    try {
      // Look up case by secret code or report ID
      const { data: caseResult, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .or(
          `secret_code.eq.${secretCode.toUpperCase()},report_id.eq.${secretCode.toUpperCase()}`
        )
        .single();

      if (caseError) {
        if (caseError.code === "PGRST116") {
          setError("No case found with the provided code.");
        } else {
          throw caseError;
        }
        return;
      }

      // Fetch case updates
      const { data: updatesResult, error: updatesError } = await supabase
        .from("case_updates")
        .select("*")
        .eq("case_id", caseResult.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (updatesError) throw updatesError;

      // Fetch investigator queries
      const { data: queriesResult, error: queriesError } = await supabase
        .from("investigator_queries")
        .select("*")
        .eq("case_id", caseResult.id)
        .order("created_at", { ascending: false });

      if (queriesError) throw queriesError;

      setCaseData(caseResult);
      setCaseUpdates(updatesResult || []);
      setInvestigatorQueries(queriesResult || []);
    } catch (error) {
      console.error("Error looking up case:", error);
      setError(
        "An error occurred while looking up your case. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResponse = (queryId: string) => {
    // Launch VAPI for voice response
    setIsVoiceActive(true);
    const vapiUrl =
      "https://vapi.ai?demo=true&shareKey=89effcf9-d6c0-4a75-9470-51e6f0114e4b&assistantId=bb8029bb-dde6-485a-9c32-d41b684568ff";
    const width = 400;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    const popup = window.open(
      vapiUrl,
      "VapiResponse",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    // Monitor popup close
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsVoiceActive(false);
        // Refresh data to get new responses
        if (caseData) {
          handleLookup(new Event("submit") as any);
        }
      }
    }, 1000);
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

  const getProgress = (status: string) => {
    switch (status) {
      case "open":
        return 25;
      case "under_investigation":
        return 60;
      case "escalated":
        return 90;
      case "resolved":
        return 100;
      default:
        return 10;
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "progress":
        return "bg-blue-500";
      case "status":
        return "bg-yellow-500";
      case "escalated":
        return "bg-red-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

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
            <Link
              href="/"
              className="inline-flex items-center text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Follow-up on Your Report
          </h1>
          <p className="text-xl text-slate-300">
            Track the progress of your anonymous whistleblowing report
          </p>
        </div>

        {/* Secret Code Input */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Enter Your Report Code</CardTitle>
            <CardDescription className="text-slate-400">
              Use the secret code or 10-digit report ID provided when you
              submitted your report to track its progress anonymously.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secretCode" className="text-slate-300">
                  Report Code or ID
                </Label>
                <div className="relative">
                  <Input
                    id="secretCode"
                    type={showCode ? "text" : "password"}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter your code (e.g., ABC1234567)"
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
                    {showCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  Example: ABC123456789 (for demo purposes)
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
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
                    <CardTitle className="text-white">

                      {formatCaseTitle(caseData.title, caseData.description, caseData.created_at)}




                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Report ID: {caseData.report_id || caseData.case_number} •
                      Submitted:{" "}
                      {new Date(caseData.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(caseData.status)}
                  >
                    {caseData.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">
                      Priority Level
                    </span>
                    <p className="text-white font-semibold capitalize">
                      {caseData.priority}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Last Updated</span>
                    <p className="text-white">
                      {new Date(caseData.updated_at).toLocaleDateString()}
                    </p>
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
                      <span className="text-white text-sm">
                        {getProgress(caseData.status)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Date Received</span>
                    <p className="text-white">
                      {getCaseDateReceived(caseData.title, caseData.description, caseData.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Location</span>
                    <p className="text-white">
                      {extractCaseLocation(caseData.title) || extractCaseLocation(caseData.description)}
                    </p>
                  </div>
                </div>

                {/* Your Original Report Summary */}
                {caseData.vapi_report_summary && (
                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="text-white font-semibold mb-2">
                      Your Report Summary
                    </h4>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-600">
                      <p className="text-slate-300">
                        {caseData.vapi_report_summary}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investigator Queries */}
            {investigatorQueries.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
                    Investigator Questions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    The investigator needs additional information to help with
                    your case
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investigatorQueries.map((query) => (
                      <div
                        key={query.id}
                        className="border border-slate-700 rounded p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-400" />
                            <h4 className="text-white font-semibold">
                              Question from Investigator
                            </h4>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              query.status === "responded"
                                ? "border-green-500 text-green-400"
                                : "border-yellow-500 text-yellow-400"
                            }
                          >
                            {query.status === "responded"
                              ? "Answered"
                              : "Pending Response"}
                          </Badge>
                        </div>

                        <div className="bg-slate-900/50 p-3 rounded border border-slate-600 mb-3">
                          <p className="text-slate-300">{query.query_text}</p>
                        </div>

                        {query.response_text ? (
                          <div>
                            <h5 className="text-slate-400 text-sm mb-2">
                              Your Response:
                            </h5>
                            <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                              <p className="text-blue-300">
                                {query.response_text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  disabled={isVoiceActive}
                                >
                                  <Mic className="h-4 w-4 mr-2" />
                                  {isVoiceActive
                                    ? "Voice Assistant Active..."
                                    : "Respond with Voice AI"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Respond via Voice AI
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    The Aegis Voice AI Agent will help you
                                    respond to this question securely and
                                    anonymously.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                                    <p className="text-slate-300 mb-2">
                                      <strong>Question:</strong>
                                    </p>
                                    <p className="text-slate-300">
                                      {query.query_text}
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() =>
                                      handleVoiceResponse(query.id)
                                    }
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Mic className="h-4 w-4 mr-2" />
                                    Start Voice Response
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}

                        <p className="text-slate-500 text-xs mt-2">
                          Asked:{" "}
                          {new Date(query.created_at).toLocaleDateString()}
                          {query.responded_at && (
                            <>
                              {" "}
                              • Answered:{" "}
                              {new Date(
                                query.responded_at
                              ).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reward Information */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Reward Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Status</span>
                    <p className="text-white capitalize">
                      {caseData.reward_status}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Amount</span>
                    <p className="text-green-400 font-semibold">
                      {caseData.reward_amount
                        ? `$${caseData.reward_amount.toLocaleString()}`
                        : "TBD"}
                    </p>
                  </div>
                </div>
                {caseData.reward_amount && caseData.crypto_currency && (
                  <div className="bg-green-900/20 p-3 rounded border border-green-600/30">
                    <p className="text-green-300">
                      💰 Reward of ${caseData.reward_amount.toLocaleString()} in{" "}
                      {caseData.crypto_currency}
                      {caseData.reward_status === "paid"
                        ? " has been sent to your wallet!"
                        : " will be processed upon case resolution."}
                    </p>
                  </div>
                )}
                {caseData.whistleblower_update && (
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-600/30">
                    <h5 className="text-blue-300 font-semibold mb-2">
                      Message from Ethics Team:
                    </h5>
                    <p className="text-blue-300">
                      {caseData.whistleblower_update}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Updates */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Case Updates</CardTitle>
                <CardDescription className="text-slate-400">
                  Timeline of your case progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseUpdates.length > 0 ? (
                    caseUpdates.map((update) => (
                      <div
                        key={update.id}
                        className="flex gap-4 pb-4 border-b border-slate-700 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${getUpdateIcon(
                              update.update_type
                            )}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-400 text-sm">
                            {new Date(update.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-white">{update.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400">
                        No public updates available yet.
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Updates will appear here as your case progresses through
                        investigation.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Support */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Need Additional Support?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-auto p-4"
                    onClick={() => handleVoiceResponse("general")}
                  >
                    <div className="text-center">
                      <Mic className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <div>
                        <p className="font-semibold">Voice AI Support</p>
                        <p className="text-sm opacity-75">
                          Get help from our AI assistant
                        </p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-auto p-4"
                    onClick={() =>
                      window.open("https://whistlebloweraid.org/", "_blank")
                    }
                  >
                    <div className="text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-green-400" />
                      <div>
                        <p className="font-semibold">Legal Resources</p>
                        <p className="text-sm opacity-75">
                          External legal support
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Notice */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mt-8">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-2">
              🔒 Your Privacy is Protected
            </h3>
            <p className="text-slate-400 text-sm">
              This lookup is completely anonymous. We do not track your IP
              address or store any identifying information. Your report code is
              the only way to access your case information. All voice
              interactions are processed through our secure AI system with
              end-to-end encryption.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
