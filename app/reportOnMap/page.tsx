'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LatLngLiteral } from 'leaflet';
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
import ReportForm from './ReportForm';

// Dynamically import the MapWrapper component
const MapWrapper = dynamic(
  () => import('./MapWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-64px-56px)] w-full flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading map...</div>
      </div>
    )
  }
);

const DEFAULT_CENTER: LatLngLiteral = { lat: 38.9051269, lng: -77.0229544 };

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
  const [showReportForm, setShowReportForm] = useState(false);
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
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') {
      console.error('Invalid coordinates received:', latlng);
      return;
    }
    setShowSuggestions(false);
    setSelectedLocation(latlng);
    setMapCenter(latlng);
    await getAddressFromCoordinates(latlng);
    setShowReportForm(true);
  };

  const handleStartReport = () => {
    setShowReportForm(true);
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
      // Validate required fields
      if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
        throw new Error('Please select a location on the map before submitting');
      }

      if (!formData.category || !formData.title || !formData.description) {
        throw new Error('Please fill in all required fields (Category, Title, and Description)');
      }

      // Generate a unique case ID
      const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const caseId = `WA${timestamp}${random}`;

      // Prepare the report data with validated coordinates
      const reportData = {
        ...formData,
        location: address || 'Location not specified',
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        },
        case_id: caseId,
        status: 'open',
        priority: 'medium',
        created_at: new Date().toISOString()
      };

      // Send to API
      const response = await fetch('/api/reportOnMap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a few minutes before trying again.');
        }
        
        // Construct a detailed error message
        let errorMessage = data.error || 'Failed to submit report';
        if (data.details) errorMessage += `\nDetails: ${data.details}`;
        if (data.hint) errorMessage += `\nHint: ${data.hint}`;
        if (data.code) errorMessage += `\nError Code: ${data.code}`;
        
        throw new Error(errorMessage);
      }

      // Show success toast and close modal
      toast({
        title: "Success",
        description: "Your report has been submitted successfully.",
        duration: 3000,
      });
      
      setShowReportForm(false);
      setFormData({
        category: '',
        title: '',
        description: '',
        dateOccurred: '',
        anonymous: true,
        contactInfo: ''
      });
      setSelectedLocation(null);
      setAddress('');

    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Show detailed error toast
      toast({
        variant: "destructive",
        title: "Error Submitting Report",
        description: error instanceof Error ? error.message : "Failed to submit report",
        duration: 5000,
        action: (
          <ToastAction altText="Try again" onClick={() => setShowReportForm(true)}>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="aegis-nav border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="aegis-nav__container max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center h-16 gap-2">
            <div className="aegis-nav__brand flex items-center space-x-2">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                <Image src="/images/aegis-logo.webp" alt="Aegis Logo" fill className="object-contain" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">AegisWhistle</span>
            </div>
            <div className="aegis-nav__links flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto text-slate-300 hover:text-white transition-colors text-sm sm:text-base">
                  Home
                </Button>
              </Link>
              <Link href="/follow-up" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto text-slate-300 hover:text-white transition-colors text-sm sm:text-base">
                  Follow-up
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors text-sm sm:text-base">
                  Team Aegis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Search Bar */}
      <div className="aegis-searchbar flex justify-center items-center py-4 sm:py-6 bg-transparent sticky top-16 z-40" style={{zIndex: 45}}>
        <form onSubmit={handleSearch} className="relative w-full max-w-[calc(100%-2rem)] sm:max-w-xl mx-2 sm:mx-4">
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search for a location..."
              className="aegis-searchbar__input w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 text-sm sm:text-base"
              autoComplete="off"
              onBlur={() => setShowSuggestions(false)}
            />
            <button
              type="submit"
              className="aegis-searchbar__button absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors shadow text-sm sm:text-base"
              disabled={searching}
            >
              {searching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : 'Search'}
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="aegis-searchbar__suggestions absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl z-[9999] border border-gray-200 max-h-[300px] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="truncate text-gray-900 text-sm sm:text-base">
                    {highlightMatch(suggestion.display_name, searchQuery)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
      {/* Map */}
      <div className="aegis-map-wrapper h-[calc(100vh-8rem)] sm:h-[calc(100vh-9rem)] md:h-[calc(100vh-10rem)]" style={{zIndex: 99999, width: '100%'}}>
        <MapWrapper
          selectedLocation={selectedLocation}
          mapCenter={mapCenter}
          onMapClick={handleMapClick}
          onStartReport={() => setShowReportForm(true)}
          address={address}
          mapRef={mapRef}
          popupRef={popupRef}
        />
      </div>
      {/* Report Form Modal */}
      <ReportForm
        open={showReportForm}
        onClose={() => {
          setShowReportForm(false);
          setSelectedLocation(null);
          setAddress('');
        }}
        onSuccess={() => {
          setShowReportForm(false);
          setSelectedLocation(null);
          setAddress('');
        }}
        address={address}
        location={selectedLocation}
      />
    </div>
  );
};

export default ReportOnMap;
