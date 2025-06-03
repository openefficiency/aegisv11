"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard-layout";

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
      <div className="text-white text-lg">Loading map...</div>
    </div>
  ),
});

export default function MapDashboard() {
  return (
    <DashboardLayout role="ethics-officer">
      <div className="h-[calc(100vh-4rem)] w-full">
        <MapComponent />
      </div>
    </DashboardLayout>
  );
}
