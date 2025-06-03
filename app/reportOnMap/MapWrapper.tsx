'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngLiteral } from 'leaflet';
import { Button } from "@/components/ui/button";

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
  mapRef: React.RefObject<any>;
  popupRef: React.RefObject<any>;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  selectedLocation,
  mapCenter,
  onMapClick,
  onStartReport,
  address,
  mapRef,
  popupRef
}) => {
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.on('click', (e: any) => {
        onMapClick(e.latlng);
      });
      return () => {
        map.off('click');
      };
    }
  }, [mapRef, onMapClick]);

  return (
    <div style={{ height: 'calc(100vh - 64px - 56px)', width: '100vw', position: 'relative' }}>
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
    </div>
  );
};

export default MapWrapper; 