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
  const mapRef = useRef<L.Map | null>(null);

  const handleMapClick = (latlng: LatLngLiteral) => {
    setSelectedLocation(latlng);
    setMapCenter(latlng);
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
          mapRef.current.setView(latlng, 14);
        }
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image src="/images/aegis-logo.webp" alt="Aegis Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold text-white">AegisWhistle</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/follow-up">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Follow-up
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                  Team Aegis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex justify-center items-center py-4 bg-slate-900/70">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="rounded-l px-4 py-2 w-64 bg-slate-800 text-white border border-slate-700 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-r px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={searching}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
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
              <Popup>
                <div>
                  <h3 className="font-bold mb-2">Report Here?</h3>
                  <p>Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}</p>
                  <Button className="mt-2 w-full">Report at this location</Button>
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