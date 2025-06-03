'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface Location {
  lat: number;
  lng: number;
}

const ReportOnMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMapClick = (e: any) => {
    setSelectedLocation(e.latlng);
  };

  const handleSearch = () => {
    // Mock search functionality - in a real app, you would call a geocoding API
    const mockLocation: Location = { lat: 40.7128, lng: -74.0060 }; // New York City
    setSelectedLocation(mockLocation);
  };

  const sampleReport = {
    title: 'Sample Report',
    description: 'This is a sample report for the selected location.',
    date: new Date().toLocaleDateString(),
  };

  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <div>
      <h1>Report On Map</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a location..."
      />
      <button onClick={handleSearch}>Search</button>
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <MapEvents />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div>
                  <h3>{sampleReport.title}</h3>
                  <p>{sampleReport.description}</p>
                  <p>Date: {sampleReport.date}</p>
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