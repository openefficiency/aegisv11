"use client"

import type React from "react"
import { useState, ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import type { LatLngLiteral } from "leaflet"

interface ReportFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  address: string
  location: LatLngLiteral | null
}

interface FormData {
  category: string
  title: string
  description: string
  dateOccurred: string
  anonymous: boolean
  contactInfo: string
}

const ReportForm: React.FC<ReportFormProps> = ({ open, onClose, onSuccess, address, location }) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    category: "",
    title: "",
    description: "",
    dateOccurred: "",
    anonymous: true,
    contactInfo: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!location || !location.lat || !location.lng) {
        throw new Error("Please select a location on the map before submitting")
      }

      if (!formData.category || !formData.title || !formData.description) {
        throw new Error("Please fill in all required fields (Category, Title, and Description)")
      }

      // Generate a unique case ID
      const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, "")
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      const caseId = `WA${timestamp}${random}`

      // Prepare the report data
      const reportData = {
        ...formData,
        location: address || "Location not specified",
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        case_id: caseId,
        status: "open",
        priority: "medium",
        created_at: new Date().toISOString(),
      }

      console.log("Submitting report:", {
        ...reportData,
        contactInfo: reportData.contactInfo ? "[REDACTED]" : undefined,
      })

      // Send to API
      const response = await fetch("/api/reportOnMap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a few minutes before trying again.")
        }

        throw new Error(data.details || data.error || "Failed to submit report")
      }

      if (data.success) {
        // Show success message with case ID and info
        toast({
          title: "Report Submitted Successfully! 🎉",
          description: (
            <div className="mt-2 space-y-2">
              <p>Your case ID is: <strong>{caseId}</strong></p>
              <p>Please keep this ID for future reference.</p>
              <p>Our team will review your report and take appropriate action.</p>
            </div>
          ),
          duration: 8000,
        })

        // Reset form and close
        setFormData({
          category: "",
          title: "",
          description: "",
          dateOccurred: "",
          anonymous: true,
          contactInfo: "",
        })

        onSuccess()
      } else {
        // Show failure message with email
        toast({
          variant: "destructive",
          title: "Failed to Submit Report",
          description: (
            <div className="mt-2 space-y-2">
              <p>We apologize, but we couldn't process your report at this time.</p>
              <p>Please contact us at: <a href="mailto:fail@aegiswhistle.com" className="text-blue-500 hover:underline">fail@aegiswhistle.com</a></p>
            </div>
          ),
          duration: 8000,
        })
      }
    } catch (error) {
      console.error("Error submitting report:", error)

      toast({
        variant: "destructive",
        title: "Error Submitting Report",
        description: error instanceof Error ? error.message : "Failed to submit report",
        duration: 5000,
        action: (
          <ToastAction altText="Try again" onClick={() => setIsLoading(false)}>
            Try again
          </ToastAction>
        ),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose} zIndex={1000}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Submit Secure Report
          </DialogTitle>
          <DialogDescription>
            Your report will be submitted securely and anonymously. Location: {address || "Selected location"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value: string) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select incident category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="abuse">Abuse</SelectItem>
                <SelectItem value="discrimination">Discrimination</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="safety">Safety Violation</SelectItem>
                <SelectItem value="corruption">Corruption</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
              placeholder="Brief title for your report"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of the incident"
              rows={4}
              maxLength={2000}
              required
            />
            <div className="text-sm text-gray-500">{formData.description.length}/2000 characters</div>
          </div>

          {/* Date Occurred */}
          <div className="space-y-2">
            <Label htmlFor="dateOccurred">Date Occurred</Label>
            <Input
              id="dateOccurred"
              type="date"
              value={formData.dateOccurred}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange("dateOccurred", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Anonymous Reporting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked: boolean) => handleInputChange("anonymous", checked)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Submit anonymously (recommended)
            </Label>
          </div>

          {/* Contact Information (conditional) */}
          {!formData.anonymous && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowContactInfo(!showContactInfo)}>
                  {showContactInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Textarea
                id="contactInfo"
                type={showContactInfo ? "text" : "password"}
                value={formData.contactInfo}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Email or phone number (optional)"
                rows={2}
                maxLength={500}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Submitting Securely..." : "Submit Report Securely"}
              <Shield className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReportForm
