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

export default function UnifiedLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("ethics_officer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
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
    setError("")

    try {
      console.log(`Attempting login for ${email} as ${selectedRole}`)

      // Demo credentials for testing
      const demoCredentials = {
        admin: { email: "admin@aegiswhistle.com", password: "admin123" },
        ethics_officer: { email: "ethics@aegiswhistle.com", password: "ethics123" },
        investigator: { email: "investigator@aegiswhistle.com", password: "investigator123" },
      }

      // Check demo credentials first
      const creds = demoCredentials[selectedRole as keyof typeof demoCredentials]
      if (email === creds.email && password === creds.password) {
        console.log("Demo credentials matched, proceeding with login")

        // Store role in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("userRole", selectedRole)
          localStorage.setItem("userEmail", email)
        }

        // Route based on role after a short delay
        setTimeout(() => {
          setIsLoading(false)
          const roleRoutes = {
            admin: "/dashboard/admin",
            ethics_officer: "/dashboard/ethics-officer",
            investigator: "/dashboard/investigator",
          }
          router.push(roleRoutes[selectedRole as keyof typeof roleRoutes] || "/dashboard/ethics-officer")
        }, 1000)
        return
      }

      // If demo credentials don't match, show error
      throw new Error("Invalid credentials. Please use the demo credentials provided.")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Login failed")
      setIsLoading(false)
    }
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
          <p className="text-slate-400">Ethics & Investigation Portal</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Team Access Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Secure login for ethics officers, investigators, and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Credentials Alert */}
            <Alert className="bg-blue-900/20 border-blue-700">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                <div className="space-y-2">
                  <p className="font-semibold">Demo Login Credentials:</p>
                  <div className="text-sm space-y-1 bg-slate-800/50 p-3 rounded">
                    <p>
                      <strong>Ethics Officer:</strong> ethics@aegiswhistle.com / ethics123
                    </p>
                    <p>
                      <strong>Investigator:</strong> investigator@aegiswhistle.com / investigator123
                    </p>
                    <p>
                      <strong>Admin:</strong> admin@aegiswhistle.com / admin123
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fillDemoCredentials}
                    className="mt-2 border-blue-600 text-blue-300 hover:bg-blue-600 hover:text-white"
                  >
                    Fill Demo Credentials for {selectedRole.replace("_", " ")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="bg-red-900/20 border-red-700">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">
                  Select Your Role
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="ethics_officer">Ethics Officer</SelectItem>
                    <SelectItem value="investigator">Investigator</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
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
                {isLoading ? "Authenticating..." : `Sign In as ${selectedRole.replace("_", " ")}`}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-sm">
                Need help accessing your account? Contact your system administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
