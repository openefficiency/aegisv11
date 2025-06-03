"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Test locations around Washington DC
const testLocations = [
  { lat: 38.8977, lng: -77.0365, title: "White House" },
  { lat: 38.8895, lng: -77.0093, title: "Lincoln Memorial" },
  { lat: 38.8897, lng: -77.0089, title: "Reflecting Pool" },
  { lat: 38.8898, lng: -77.0091, title: "Vietnam Veterans Memorial" },
  { lat: 38.8899, lng: -77.0092, title: "Korean War Veterans Memorial" },
];

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    const mapInstance = L.map(mapContainer.current).setView([38.8977, -77.0365], 14);
    map.current = mapInstance;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add test markers
    testLocations.forEach(location => {
      L.marker([location.lat, location.lng])
        .bindPopup(location.title)
        .addTo(mapInstance);
    });

    // Cleanup
    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px"
      }}
    />
  );
} 