'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngLiteral } from 'leaflet';
import { Button } from "@/components/ui/button";
import { useMapEvent } from 'react-leaflet';
import { MapPin, X } from "lucide-react";
import type { Map, Popup as LeafletPopup } from 'leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface MapWrapperProps {
  selectedLocation: LatLngLiteral | null;
  mapCenter: LatLngLiteral;
  onMapClick: (latlng: LatLngLiteral) => void;
  onStartReport: () => void;
  address: string;
  mapRef: React.RefObject<Map>;
  popupRef: React.RefObject<LeafletPopup>;
}

const MapClickHandler: React.FC<{ onMapClick: (latlng: LatLngLiteral) => void }> = ({ onMapClick }) => {
  useMapEvent('click', (e: { latlng: LatLngLiteral }) => {
    if (e && e.latlng) {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const MapWrapper: React.FC<MapWrapperProps> = ({
  selectedLocation,
  mapCenter,
  onMapClick,
  onStartReport,
  address,
  mapRef,
  popupRef
}) => {
  const [showInstructions, setShowInstructions] = useState(true);

  return (
    <div style={{ height: 'calc(100vh - 64px - 56px)', width: '100vw', position: 'relative' }}>
      {/* Instructions Overlay */}
      {showInstructions && !selectedLocation && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-md mx-4 transform transition-all duration-500 ease-in-out animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-2">Choose Report Location</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Click anywhere on the map to select the location where the incident occurred. 
                  You can zoom in/out and pan around to find the exact spot.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Click to place marker</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>Drag to move marker</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white transition-colors pointer-events-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {selectedLocation && (
          <Marker 
            position={selectedLocation}
            eventHandlers={{
              click: () => {
                if (popupRef.current && mapRef.current) {
                  popupRef.current.openOn(mapRef.current);
                }
              }
            }}
          >
            <Popup 
              ref={popupRef}
              className="custom-popup"
              position={selectedLocation}
            >
              <div className="p-3 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2 text-slate-900">Report Location</h3>
                <p className="text-sm text-slate-600 mb-2">{address}</p>
                <p className="text-xs text-slate-500 mb-4">
                  Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                </p>
                <Button 
                  onClick={onStartReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors py-2"
                >
                  Start Report
                </Button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Controls Overlay */}
      {!selectedLocation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9998] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          <p className="text-sm text-slate-700 font-medium">
            Click on the map to select location
          </p>
        </div>
      )}
    </div>
  );
};

export default MapWrapper;
