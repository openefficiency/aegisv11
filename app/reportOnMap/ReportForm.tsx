"use client"

import type React from "react"
import { useState } from "react"
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

      // Show success toast
      toast({
        title: "Report Submitted Successfully! 🎉",
        description: `Your case ID is: ${caseId}. Keep this for your records.`,
        duration: 5000,
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[300]">
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
          <div className="space-y-2 form-category-section">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="" disabled>Select incident category</option>
              <option value="fraud">Fraud</option>
              <option value="abuse">Abuse</option>
              <option value="discrimination">Discrimination</option>
              <option value="harassment">Harassment</option>
              <option value="safety">Safety Violation</option>
              <option value="corruption">Corruption</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2 form-title-section">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Brief title for your report"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2 form-description-section">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of the incident"
              rows={4}
              maxLength={2000}
              required
            />
            <div className="text-sm text-gray-500 character-count">{formData.description.length}/2000 characters</div>
          </div>

          {/* Date Occurred */}
          <div className="space-y-2 form-date-section">
            <Label htmlFor="dateOccurred">Date Occurred</Label>
            <Input
              id="dateOccurred"
              type="date"
              value={formData.dateOccurred}
              onChange={(e) => handleInputChange("dateOccurred", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Anonymous Reporting */}
          <div className="flex items-center space-x-2 form-anonymous-section">
            <Checkbox
              id="anonymous"
              checked={formData.anonymous}
              onCheckedChange={(checked) => handleInputChange("anonymous", checked as boolean)}
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Submit anonymously (recommended)
            </Label>
          </div>

          {/* Contact Information (conditional) */}
          {!formData.anonymous && (
            <div className="space-y-2 form-contact-section">
              <div className="flex items-center justify-between contact-header">
                <Label htmlFor="contactInfo">Contact Information</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowContactInfo(!showContactInfo)}>
                  {showContactInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Textarea
                id="contactInfo"
                type={showContactInfo ? "text" : "password"}
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Email or phone number (optional)"
                rows={2}
                maxLength={500}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 form-actions">
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
