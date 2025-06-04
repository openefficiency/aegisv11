import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CreditCard, BarChart, Settings, HelpCircle, ShieldCheck, User, Mail } from "lucide-react"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { ConnectionTester } from "@/components/connection-tester"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    delta: "+20.1%",
    icon: Wallet,
  },
  {
    title: "Subscriptions",
    value: "2350",
    delta: "+180.1%",
    icon: CreditCard,
  },
  {
    title: "Sales",
    value: "12,234",
    delta: "+19%",
    icon: BarChart,
  },
]

const quickActions = [
  {
    title: "Settings",
    description: "Manage your account settings and preferences.",
    icon: Settings,
    href: "/dashboard/admin/settings",
  },
  {
    title: "Support",
    description: "Get help with common issues and troubleshooting.",
    icon: HelpCircle,
    href: "/dashboard/admin/support",
  },
  {
    title: "Security",
    description: "Review and update your security settings.",
    icon: ShieldCheck,
    href: "/dashboard/admin/security",
  },
  {
    title: "Profile",
    description: "View and edit your profile information.",
    icon: User,
    href: "/dashboard/admin/profile",
  },
  {
    title: "Inbox",
    description: "Check your messages and notifications.",
    icon: Mail,
    href: "/dashboard/admin/inbox",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Here&apos;s an overview of your business</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.delta} increase from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Connection Tester */}
      <ConnectionTester />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {quickActions.map((action) => (
          <Card key={action.title} className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
              <action.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{action.description}</p>
              <a href={action.href} className="text-sm font-medium text-blue-500 hover:underline">
                Learn more
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
