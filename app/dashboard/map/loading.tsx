import { DashboardLayout } from "@/components/dashboard-layout";

export default function MapLoading() {
  return (
    <DashboardLayout role="ethics-officer">
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-white">Loading map...</div>
      </div>
    </DashboardLayout>
  );
} 