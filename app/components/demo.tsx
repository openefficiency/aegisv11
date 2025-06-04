"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { type Case } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

// Demo case categories and their descriptions
const demoCategories = [
  {
    category: "fraud",
    descriptions: [
      "Financial irregularities in expense reporting",
      "Suspicious invoice patterns detected",
      "Unauthorized fund transfers identified",
      "Fake vendor payments discovered",
      "Misuse of company credit cards",
    ],
  },
  {
    category: "harassment",
    descriptions: [
      "Inappropriate workplace behavior reported",
      "Bullying incidents in department",
      "Discriminatory comments made",
      "Hostile work environment concerns",
      "Unwanted advances reported",
    ],
  },
  {
    category: "safety",
    descriptions: [
      "Safety violations in warehouse operations",
      "Unsafe working conditions reported",
      "Equipment maintenance issues",
      "Emergency exit blockages found",
      "Chemical handling violations",
    ],
  },
  {
    category: "corruption",
    descriptions: [
      "Bribery attempts reported",
      "Conflict of interest concerns",
      "Kickback scheme discovered",
      "Vendor favoritism allegations",
      "Contract manipulation suspected",
    ],
  },
];

// Demo locations
const demoLocations = [
  "New York Office",
  "Los Angeles Branch",
  "Chicago Facility",
  "Houston Warehouse",
  "Miami Distribution Center",
  "Seattle Office",
  "Boston Branch",
  "Austin Facility",
];

// Generate a random case
const generateDemoCase = (index: number): Case => {
  const category = demoCategories[Math.floor(Math.random() * demoCategories.length)];
  const description = category.descriptions[Math.floor(Math.random() * category.descriptions.length)];
  const location = demoLocations[Math.floor(Math.random() * demoLocations.length)];
  const priority = Math.random() > 0.7 ? "critical" : Math.random() > 0.5 ? "high" : Math.random() > 0.3 ? "medium" : "low";
  
  const now = new Date();
  const createdDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days

  return {
    id: `demo-case-${index}`,
    case_number: `WB-${new Date().getFullYear()}-${String(index).padStart(4, "0")}`,
    tracking_code: `TRACK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    report_id: `RPT${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    title: `${location} - ${description}`,
    description: `Detailed report of ${description.toLowerCase()} at ${location}. This case requires immediate attention due to its severity and potential impact on operations.`,
    category: category.category as Case["category"],
    status: "open",
    priority: priority as Case["priority"],
    secret_code: Math.random().toString(36).substring(2, 14).toUpperCase(),
    reward_status: "pending",
    vapi_report_summary: `Voice report regarding ${description.toLowerCase()} at ${location}.`,
    vapi_session_id: `session-${Math.random().toString(36).substring(2, 10)}`,
    vapi_transcript: `This is a simulated voice transcript for the case regarding ${description.toLowerCase()} at ${location}.`,
    created_at: createdDate.toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export function DemoControl() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalCases, setTotalCases] = useState(0);
  const [generatedCases, setGeneratedCases] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if demo mode is enabled
  useEffect(() => {
    const demoMode = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demoMode);
  }, []);

  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    localStorage.setItem("demoMode", String(newMode));
  };

  const generateCases = async (count: number) => {
    setIsGenerating(true);
    setTotalCases(count);
    setGeneratedCases(0);
    setProgress(0);

    for (let i = 0; i < count; i++) {
      const demoCase = generateDemoCase(i + 1);
      
      try {
        // Add to Supabase
        await supabase.from("cases").insert(demoCase);
        
        // Update progress
        setGeneratedCases(prev => prev + 1);
        setProgress(((i + 1) / count) * 100);
        
        // Add a small delay to simulate real-world case creation
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error generating demo case:", error);
      }
    }

    setIsGenerating(false);
  };

  const clearDemoCases = async () => {
    try {
      await supabase.from("cases").delete().like("id", "demo-case-%");
      setGeneratedCases(0);
      setProgress(0);
    } catch (error) {
      console.error("Error clearing demo cases:", error);
    }
  };

  if (!isDemoMode) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Demo Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={toggleDemoMode}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enable Demo Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Demo Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => generateCases(10)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Generate 10 Cases
          </Button>
          <Button
            onClick={() => generateCases(50)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Generate 50 Cases
          </Button>
          <Button
            onClick={() => generateCases(100)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Generate 100 Cases
          </Button>
          <Button
            onClick={clearDemoCases}
            disabled={isGenerating}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Clear Demo Cases
          </Button>
          <Button
            onClick={toggleDemoMode}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            Disable Demo Mode
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Generating cases...</span>
              <span>{generatedCases} / {totalCases}</span>
            </div>
            <Progress value={progress} className="bg-slate-700" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            Demo Mode Active
          </Badge>
          <span className="text-slate-400 text-sm">
            {generatedCases} demo cases generated
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 