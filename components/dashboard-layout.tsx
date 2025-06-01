"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Shield,
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Search,
  Award,
  AlertTriangle,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "ethics-officer" | "investigator";
}

const menuItems = {
  admin: [
    { title: "Dashboard", url: "/dashboard/admin", icon: Home },
    { title: "All Cases", url: "/dashboard/admin/cases", icon: FileText },
    { title: "Team Management", url: "/dashboard/admin/team", icon: Users },
    { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
    {
      title: "VAPI Integration",
      url: "/dashboard/admin/vapi",
      icon: MessageSquare,
    },
    { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
  ],
  "ethics-officer": [
    { title: "Dashboard", url: "/dashboard/ethics-officer", icon: Home },
    {
      title: "Case Review",
      url: "/dashboard/ethics-officer/review",
      icon: FileText,
    },
    {
      title: "Reward Processing",
      url: "/dashboard/ethics-officer/rewards",
      icon: Award,
    },
    {
      title: "VAPI Reports",
      url: "/dashboard/ethics-officer/vapi",
      icon: MessageSquare,
    },
    {
      title: "Escalations",
      url: "/dashboard/ethics-officer/escalations",
      icon: AlertTriangle,
    },
  ],
  investigator: [
    { title: "Dashboard", url: "/dashboard/investigator", icon: Home },
    { title: "My Cases", url: "/dashboard/investigator/cases", icon: FileText },
    {
      title: "Queries",
      url: "/dashboard/investigator/queries",
      icon: MessageSquare,
    },
    {
      title: "Evidence",
      url: "/dashboard/investigator/evidence",
      icon: Search,
    },
    {
      title: "Reports",
      url: "/dashboard/investigator/reports",
      icon: UserCheck,
    },
  ],
};

const roleLabels = {
  admin: "Administrator",
  "ethics-officer": "Ethics Officer",
  investigator: "Investigator",
};

const roleColors = {
  admin: "text-purple-400",
  "ethics-officer": "text-blue-400",
  investigator: "text-green-400",
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem("auth_token");
    sessionStorage.clear();

    // Redirect to login
    router.push("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex w-full">
        <Sidebar className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-700">
            <div className="flex items-center space-x-2 px-4 py-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <span className="text-lg font-bold text-white">
                  AegisWhistle
                </span>
                <p className={`text-xs ${roleColors[role]}`}>
                  {roleLabels[role]}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems[role].map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Role-specific quick actions */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {role === "ethics-officer" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <Award className="h-4 w-4" />
                          <span>Process Rewards</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Review High Priority</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {role === "investigator" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <MessageSquare className="h-4 w-4" />
                          <span>Send Query</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <UserCheck className="h-4 w-4" />
                          <span>Submit Report</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <Users className="h-4 w-4" />
                          <span>Add Team Member</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                          <BarChart3 className="h-4 w-4" />
                          <span>View Analytics</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex h-16 items-center px-4">
              <SidebarTrigger className="text-slate-300 hover:text-white" />
              <div className="ml-auto flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-white">Welcome back</p>
                  <p className={`text-xs ${roleColors[role]}`}>
                    {roleLabels[role]}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    role === "admin"
                      ? "bg-purple-400"
                      : role === "ethics-officer"
                      ? "bg-blue-400"
                      : "bg-green-400"
                  }`}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
