"use client";

import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard-layout";

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function MapDashboard() {
  return (
    <DashboardLayout role="ethics-officer">
      <div className="h-[calc(100vh-4rem)] w-full relative">
        <MapComponent />
      </div>
    </DashboardLayout>
  );
}
