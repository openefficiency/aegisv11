"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, ArrowLeft, Upload, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { VapiVoiceWidget } from "@/components/vapi-voice-widget"

export default function ReportPage() {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    dateOccurred: "",
    anonymous: true,
    contactInfo: "",
  })
  const [secretCode, setSecretCode] = useState("")
  const [showSecretCode, setShowSecretCode] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate submission
    setTimeout(() => {
      const generatedCode = "ABC" + Math.random().toString(36).substr(2, 9).toUpperCase()
      setSecretCode(generatedCode)
      setIsSubmitted(true)
      setIsLoading(false)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">AegisWhistle</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Report Submitted Successfully</CardTitle>
              <CardDescription className="text-slate-400">
                Your report has been securely submitted and is now in our system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-slate-300">Your Secret Tracking Code</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showSecretCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="font-mono text-lg text-white bg-slate-800 p-3 rounded border">
                  {showSecretCode ? secretCode : "•".repeat(secretCode.length)}
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Save this code securely. You'll need it to track your report's progress.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <h4 className="text-white font-semibold">What happens next?</h4>
                    <p className="text-slate-400 text-sm">
                      Your report will be reviewed by our AI system within 24 hours and assigned to the appropriate
                      team.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <h4 className="text-white font-semibold">Track your progress</h4>
                    <p className="text-slate-400 text-sm">
                      Use your secret code on our follow-up page to check the status of your report anonymously.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <h4 className="text-white font-semibold">Potential rewards</h4>
                    <p className="text-slate-400 text-sm">
                      If your report leads to recovery of funds, you may be eligible for up to 15% as a crypto reward.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/follow-up" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Track My Report</Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    Return Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
            <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Submit a Secure Report</h1>
          <p className="text-xl text-slate-300">
            Report wrongdoing safely and anonymously with military-grade protection
          </p>
        </div>

        {/* Voice AI Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Option 1: Voice Report with AI Assistant</CardTitle>
            <CardDescription className="text-slate-400">
              Use our AI-powered voice assistant for guided, trauma-informed reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VapiVoiceWidget />
          </CardContent>
        </Card>

        {/* Written Form */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Option 2: Written Report Form</CardTitle>
            <CardDescription className="text-slate-400">
              Fill out the form below to submit your report in writing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select the type of issue" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="abuse">Abuse</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="safety">Safety Violations</SelectItem>
                    <SelectItem value="corruption">Corruption</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">
                  Brief Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="bg-slate-900/50 border-slate-600 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide as much detail as possible about what happened, when, where, and who was involved..."
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                  required
                />
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where did this occur?"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOccurred" className="text-slate-300">
                    Date Occurred
                  </Label>
                  <Input
                    id="dateOccurred"
                    type="date"
                    value={formData.dateOccurred}
                    onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-slate-300">Supporting Documents (Optional)</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Drag and drop files here, or click to select</p>
                  <p className="text-sm text-slate-500 mt-1">All files are encrypted and stored securely</p>
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked as boolean })}
                    className="border-slate-600"
                  />
                  <Label htmlFor="anonymous" className="text-slate-300">
                    Submit anonymously (recommended)
                  </Label>
                </div>

                {!formData.anonymous && (
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="text-slate-300">
                      Contact Information
                    </Label>
                    <Input
                      id="contactInfo"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                      placeholder="Email or phone number (optional)"
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Your Security is Our Priority</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• All data is encrypted with military-grade security</li>
                      <li>• Anonymous reports cannot be traced back to you</li>
                      <li>• We use Tor networks and zero-knowledge proofs</li>
                      <li>• You'll receive a secret code to track your report</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg" disabled={isLoading}>
                {isLoading ? "Submitting Securely..." : "Submit Report Securely"}
                <Shield className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
