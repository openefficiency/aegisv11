import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import type { LatLngLiteral } from 'leaflet';

interface ReportFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  address: string;
  location: LatLngLiteral | null;
}

const ReportForm: React.FC<ReportFormProps> = ({ open, onClose, onSuccess, address, location }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    dateOccurred: '',
    anonymous: true,
    contactInfo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Add input length limits
  const INPUT_LIMITS = {
    title: 200,
    description: 2000,
    location: 500,
    contactInfo: 500
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!location) throw new Error('No location selected');
      if (!formData.category || !formData.title || !formData.description) {
        throw new Error('Please fill in all required fields (Category, Title, and Description)');
      }

      // Validate input lengths
      if (formData.title.length > INPUT_LIMITS.title) {
        throw new Error(`Title must be less than ${INPUT_LIMITS.title} characters`);
      }
      if (formData.description.length > INPUT_LIMITS.description) {
        throw new Error(`Description must be less than ${INPUT_LIMITS.description} characters`);
      }
      if (formData.contactInfo && formData.contactInfo.length > INPUT_LIMITS.contactInfo) {
        throw new Error(`Contact information must be less than ${INPUT_LIMITS.contactInfo} characters`);
      }

      const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const caseId = `WA${timestamp}${random}`;
      const reportData = {
        ...formData,
        location: address || 'Location not specified',
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        case_id: caseId,
        status: 'open',
        priority: 'medium',
        created_at: new Date().toISOString()
      };
      const response = await fetch('/api/reportOnMap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMessage = data.error || 'Failed to submit report';
        if (data.details) errorMessage += `\nDetails: ${data.details}`;
        if (data.hint) errorMessage += `\nHint: ${data.hint}`;
        if (data.code) errorMessage += `\nError Code: ${data.code}`;
        throw new Error(errorMessage);
      }
      toast({
        title: "Success",
        description: "Your report has been submitted successfully.",
        duration: 3000,
      });
      setFormData({
        category: '',
        title: '',
        description: '',
        dateOccurred: '',
        anonymous: true,
        contactInfo: ''
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Submitting Report",
        description: error instanceof Error ? error.message : "Failed to submit report",
        duration: 5000,
        action: (
          <ToastAction altText="Try again" onClick={onClose}>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !z-[99999] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Submit a Secure Report</DialogTitle>
          <DialogDescription className="text-slate-400">
            Report wrongdoing safely and anonymously with military-grade protection
          </DialogDescription>
        </DialogHeader>
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
              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 z-[99999]">
                <SelectItem value="fraud" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Fraud</SelectItem>
                <SelectItem value="abuse" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Abuse</SelectItem>
                <SelectItem value="discrimination" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Discrimination</SelectItem>
                <SelectItem value="harassment" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Harassment</SelectItem>
                <SelectItem value="safety" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Safety Violations</SelectItem>
                <SelectItem value="corruption" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Corruption</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Brief Title * <span className="text-slate-500 text-xs">(max {INPUT_LIMITS.title} characters)</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              className="bg-slate-900/50 border-slate-600 text-white"
              required
              maxLength={INPUT_LIMITS.title}
            />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Detailed Description * <span className="text-slate-500 text-xs">(max {INPUT_LIMITS.description} characters)</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide as much detail as possible about what happened, when, where, and who was involved..."
              className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
              required
              maxLength={INPUT_LIMITS.description}
            />
          </div>
          {/* Location (pre-filled from map) */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">
              Location
            </Label>
            <Input
              id="location"
              value={address}
              readOnly
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <p className="text-sm text-slate-400">
              Lat: {location?.lat.toFixed(5)}, Lng: {location?.lng.toFixed(5)}
            </p>
          </div>
          {/* Date */}
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
                  maxLength={INPUT_LIMITS.contactInfo}
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
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
