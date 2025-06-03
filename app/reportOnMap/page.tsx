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

const ReportOnMap = () => {
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
    // TODO: Implement report creation logic
    console.log('Starting report at:', selectedLocation, 'Address:', address);
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
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`);
          const data = await res.json();
          setSuggestions(data.slice(0, 5)); // Show top 5 suggestions
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200); // Reduced from 300ms to 200ms for faster response
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
    </div>
  );
};

export default ReportOnMap; 