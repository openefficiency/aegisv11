'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LatLngLiteral } from 'leaflet';
import { useMapEvents, MapContainer as StaticMapContainer, TileLayer as StaticTileLayer, Marker as StaticMarker, Popup as StaticPopup } from 'react-leaflet';
import type L from 'leaflet';
import { FaSearch } from 'react-icons/fa';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const DEFAULT_CENTER: LatLngLiteral = { lat: 38.9051269, lng: -77.0229544 };

function MapEvents({ onMapClick }: { onMapClick: (latlng: LatLngLiteral) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const exampleReport = {
  case_id: "WA30530001",
  reporter: { name: "Mr. Riaz", role: "Employee", company: "Uber" },
  incident: { type: "Sexual Harassment", date: "2023-05-30", time: "6:30 PM", location: "Palo Alto", setting: "Company party" },
  accused: { name: "Patel", relationship_to_reporter: "Senior colleague" },
  witnesses: { present: true, count: "multiple", details: "A couple of other colleagues who witnessed the situation" },
  evidence: { type: "Video", details: "Reporter claims to have video artifacts" },
  follow_up_plan: "Reporter will use follow-up system and submit application as necessary"
};

const ReportOnMap = () => {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<LatLngLiteral | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(DEFAULT_CENTER);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [address, setAddress] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState('');
  const [reporterCompany, setReporterCompany] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    dateOccurred: '',
    anonymous: true,
    contactInfo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);

  const getAddressFromCoordinates = async (latlng: LatLngLiteral) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Address not found');
    }
  };

  const handleMapClick = async (latlng: LatLngLiteral) => {
    setSelectedLocation(latlng);
    setMapCenter(latlng);
    await getAddressFromCoordinates(latlng);
    // Open popup after a short delay to ensure marker is rendered
    setTimeout(() => {
      if (popupRef.current) {
        popupRef.current.openOn(mapRef.current!);
      }
    }, 100);
  };

  const handleStartReport = () => {
    setShowReportModal(true);
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latlng: LatLngLiteral = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setSelectedLocation(latlng);
        setMapCenter(latlng);
        if (mapRef.current) {
          mapRef.current.setView(latlng, 16);
        }
        setShowSuggestions(false);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      if (value.length > 1) {
        try {
          // Popular US cities for boosting
          const popularCities = [
            {
              display_name: 'Los Angeles, CA, USA',
              lat: '34.052235',
              lon: '-118.243683',
              extratags: { city: 'Los Angeles', state: 'California', country: 'United States' }
            },
            {
              display_name: 'New York, NY, USA',
              lat: '40.712776',
              lon: '-74.005974',
              extratags: { city: 'New York', state: 'New York', country: 'United States' }
            },
            {
              display_name: 'Chicago, IL, USA',
              lat: '41.878113',
              lon: '-87.629799',
              extratags: { city: 'Chicago', state: 'Illinois', country: 'United States' }
            },
            {
              display_name: 'San Francisco, CA, USA',
              lat: '37.774929',
              lon: '-122.419418',
              extratags: { city: 'San Francisco', state: 'California', country: 'United States' }
            },
            {
              display_name: 'Washington, DC, USA',
              lat: '38.89511',
              lon: '-77.03637',
              extratags: { city: 'Washington', state: 'District of Columbia', country: 'United States' }
            }
          ];

          // 1. Fetch US results (with extratags for business info)
          const usRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=10&addressdetails=1&extratags=1&countrycodes=us`, {
            headers: { 'accept-language': 'en' }
          });
          let usData = await usRes.json();
          usData = usData.filter((item: any) => /^[\x00-\x7F]+$/.test(item.display_name));
          let businessData = usData.filter((item: any) => item.extratags && (item.extratags.shop || item.extratags.amenity || item.extratags.office));
          let otherUSData = usData.filter((item: any) => !businessData.includes(item));
          let suggestions = [...businessData, ...otherUSData];

          // 2. If less than 5, fetch global results and fill
          if (suggestions.length < 5) {
            const worldRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=10&addressdetails=1&extratags=1`, {
              headers: { 'accept-language': 'en' }
            });
            let worldData = await worldRes.json();
            worldData = worldData.filter((item: any) => /^[\x00-\x7F]+$/.test(item.display_name));
            worldData = worldData.filter((item: any) => !suggestions.some((s: any) => s.lat === item.lat && s.lon === item.lon));
            suggestions = [...suggestions, ...worldData];
          }

          // 3. Boost popular US cities if query matches
          const lowerValue = value.toLowerCase();
          const boosted = popularCities.find(city => city.display_name.toLowerCase().startsWith(lowerValue));
          if (boosted && !suggestions.some(s => s.display_name === boosted.display_name)) {
            suggestions = [boosted, ...suggestions];
          }

          // 4. Sort by distance to mapCenter
          suggestions.sort((a: any, b: any) => {
            const distA = Math.pow(parseFloat(a.lat) - mapCenter.lat, 2) + Math.pow(parseFloat(a.lon) - mapCenter.lng, 2);
            const distB = Math.pow(parseFloat(b.lat) - mapCenter.lat, 2) + Math.pow(parseFloat(b.lon) - mapCenter.lng, 2);
            return distA - distB;
          });

          setSuggestions(suggestions.slice(0, 5)); // Show up to 5 suggestions
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion: { lat: string; lon: string; display_name: string }) => {
    const latlng: LatLngLiteral = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setSelectedLocation(latlng);
    setMapCenter(latlng);
    setSearchQuery(suggestion.display_name);
    if (mapRef.current) {
      mapRef.current.setView(latlng, 16);
    }
    setShowSuggestions(false);
  };

  // Helper to format address for display
  const formatAddress = (suggestion: any) => {
    if (!suggestion.address) return suggestion.display_name;
    
    const parts = [];
    if (suggestion.address.city) parts.push(suggestion.address.city);
    if (suggestion.address.state) parts.push(suggestion.address.state);
    if (suggestion.address.country) parts.push(suggestion.address.country);
    
    return parts.join(', ') || suggestion.display_name;
  };

  // Helper to highlight matched text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="font-semibold text-blue-600">{part}</span> : part
    );
  };

  // Helper to determine if suggestion is a place (has address)
  const isPlace = (suggestion: any) => suggestion && suggestion.display_name && suggestion.lat && suggestion.lon;

  // Helper to get thumbnail (for place, fallback to icon)
  const getSuggestionIcon = (suggestion: any) => {
    if (isPlace(suggestion)) {
      // Use a static map thumbnail or fallback image
      return (
        <img
          src={`https://maps.locationiq.com/v3/staticmap?key=pk.demo&center=${suggestion.lat},${suggestion.lon}&zoom=15&size=60x60&format=png&markers=icon:small-red-cutout|${suggestion.lat},${suggestion.lon}`}
          alt="location thumbnail"
          className="w-8 h-8 rounded object-cover bg-gray-200"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      );
    }
    // Default: magnifier icon
    return <FaSearch className="text-gray-400 w-6 h-6" />;
  };

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate a unique case ID
      const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const caseId = `WA${timestamp}${random}`;

      // Prepare the report data
      const reportData = {
        ...formData,
        location: address,
        coordinates: selectedLocation,
        case_id: caseId,
        status: 'open',
        priority: 'medium', // Default priority
        created_at: new Date().toISOString()
      };

      // Send to API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }

      const data = await response.json();

      // Show success state
      setSecretCode(data.caseId);
      setIsSubmitted(true);
      setShowReportModal(false);

      // Show success toast
      toast({
        title: "Report Submitted Successfully",
        description: "Your report has been securely submitted and is now in our system.",
        duration: 5000,
      });

    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error Submitting Report",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        action: (
          <ToastAction altText="Try again" onClick={() => setShowReportModal(true)}>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add success state UI
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16" >
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image src="/images/aegis-logo.webp" alt="Aegis Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold text-white">AegisWhistle</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/follow-up">
                <Button variant="ghost" className="text-slate-300 hover:text-white transition-colors">
                  Follow-up
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors">
                  Team Aegis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Search Bar */}
      <div className="flex justify-center items-center py-6 bg-transparent sticky top-16 z-40" style={{ zIndex: 1000 }}>
        <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search for a location..."
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 text-base"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow"
              disabled={searching}
            >
              {searching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : 'Search'}
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl z-[9999] border border-gray-200 max-h-[300px] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="truncate text-gray-900 text-base">
                    {highlightMatch(suggestion.display_name, searchQuery)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
      {/* Map */}
      <div style={{ height: 'calc(100vh - 64px - 56px)', width: '100vw' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapEvents onMapClick={handleMapClick} />
          {selectedLocation && (
            <Marker position={selectedLocation}>
              <Popup ref={popupRef}>
                <div className="p-3 min-w-[250px]">
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Report Location</h3>
                  <p className="text-sm text-slate-600 mb-2">{address}</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                  </p>
                  <Button 
                    onClick={handleStartReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors py-2"
                  >
                    Start Report
                  </Button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !z-[99999] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Submit a Secure Report</DialogTitle>
            <DialogDescription className="text-slate-400">
              Report wrongdoing safely and anonymously with military-grade protection
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select the type of issue" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="fraud" className="text-white hover:bg-slate-700 focus:bg-slate-700">Fraud</SelectItem>
                  <SelectItem value="abuse" className="text-white hover:bg-slate-700 focus:bg-slate-700">Abuse</SelectItem>
                  <SelectItem value="discrimination" className="text-white hover:bg-slate-700 focus:bg-slate-700">Discrimination</SelectItem>
                  <SelectItem value="harassment" className="text-white hover:bg-slate-700 focus:bg-slate-700">Harassment</SelectItem>
                  <SelectItem value="safety" className="text-white hover:bg-slate-700 focus:bg-slate-700">Safety Violations</SelectItem>
                  <SelectItem value="corruption" className="text-white hover:bg-slate-700 focus:bg-slate-700">Corruption</SelectItem>
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
                Lat: {selectedLocation?.lat.toFixed(5)}, Lng: {selectedLocation?.lng.toFixed(5)}
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
    </div>
  );
};

export default ReportOnMap; 