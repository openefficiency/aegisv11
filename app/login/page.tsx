"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ArrowLeft, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("admin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // Demo credentials
  const demoCredentials = {
    admin: { email: "admin@aegiswhistle.com", password: "admin123" },
    ethics_officer: { email: "ethics@aegiswhistle.com", password: "ethics123" },
    investigator: { email: "investigator@aegiswhistle.com", password: "investigator123" },
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login with demo credentials
    setTimeout(() => {
      setIsLoading(false)
      // Route based on role
      switch (selectedRole) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "ethics_officer":
          router.push("/dashboard/ethics-officer")
          break
        case "investigator":
          router.push("/dashboard/investigator")
          break
        default:
          router.push("/dashboard/admin")
      }
    }, 1000)
  }

  const fillDemoCredentials = () => {
    const creds = demoCredentials[selectedRole as keyof typeof demoCredentials]
    setEmail(creds.email)
    setPassword(creds.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">AegisWhistle</span>
          </div>
          <p className="text-slate-400">Team Aegis Portal</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Credentials Alert */}
            <Alert className="bg-blue-900/20 border-blue-700">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                <div className="space-y-2">
                  <p className="font-semibold">Demo Credentials:</p>
                  <div className="text-sm space-y-1">
                    <p>Admin: admin@aegiswhistle.com / admin123</p>
                    <p>Ethics Officer: ethics@aegiswhistle.com / ethics123</p>
                    <p>Investigator: investigator@aegiswhistle.com / investigator123</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fillDemoCredentials}
                    className="mt-2 border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
                  >
                    Fill Demo Credentials
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">
                  Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ethics_officer">Ethics Officer</SelectItem>
                    <SelectItem value="investigator">Investigator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
