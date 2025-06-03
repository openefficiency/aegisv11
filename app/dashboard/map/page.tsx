"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";

// Initialize Mapbox (you'll need to replace this with your actual Mapbox token)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Case {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
}

export default function MapDashboard() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    if (map) return; // initialize map only once

    const newMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.5, 40], // Default center (you can adjust this)
      zoom: 9,
    });

    newMap.on("load", () => {
      // Add navigation controls
      newMap.addControl(new mapboxgl.NavigationControl(), "top-right");
      
      // Add fullscreen control
      newMap.addControl(new mapboxgl.FullscreenControl(), "top-right");
    });

    setMap(newMap);

    // Cleanup on unmount
    return () => {
      newMap.remove();
    };
  }, []);

  // Add markers when cases are loaded
  useEffect(() => {
    if (!map || !cases.length) return;

    // Clear existing markers
    const markers = document.getElementsByClassName("mapboxgl-marker");
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each case
    cases.forEach((case_) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = getStatusColor(case_.status);
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      // Add click event
      el.addEventListener("click", () => {
        setSelectedCase(case_);
      });

      new mapboxgl.Marker(el)
        .setLngLat([case_.longitude, case_.latitude])
        .addTo(map);
    });
  }, [map, cases]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "#22c55e"; // green
      case "escalated":
        return "#ef4444"; // red
      case "under_investigation":
        return "#3b82f6"; // blue
      default:
        return "#eab308"; // yellow
    }
  };

  return (
    <DashboardLayout role="investigator">
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div id="map" className="absolute inset-0" />

        {/* Case Details Panel */}
        {selectedCase && (
          <Card className="absolute top-4 right-4 w-96 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">{selectedCase.title}</h3>
                <Badge
                  variant="outline"
                  className={`${
                    selectedCase.priority === "high" || selectedCase.priority === "critical"
                      ? "border-red-500 text-red-400"
                      : "border-blue-500 text-blue-400"
                  }`}
                >
                  {selectedCase.priority}
                </Badge>
              </div>
              <p className="text-slate-300 text-sm mb-4">{selectedCase.description}</p>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Case #{selectedCase.id}
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {selectedCase.status}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Panel */}
        <Card className="absolute top-4 left-4 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Map Overview</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Cases</span>
                <span className="text-white font-semibold">{cases.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">High Priority</span>
                <span className="text-red-400 font-semibold">
                  {cases.filter(c => c.priority === "high" || c.priority === "critical").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 