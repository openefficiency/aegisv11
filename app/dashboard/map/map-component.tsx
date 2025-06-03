"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Convention Center coordinates
const CONVENTION_CENTER = { lat: 38.9033, lng: -77.0230 };

// Generate random location near the convention center
function generateRandomLocation(centerLat: number, centerLng: number, radiusInMeters: number = 200): { lat: number; lng: number } {
  const radiusInDegrees = radiusInMeters / 111000;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  const lat = centerLat + distance * Math.cos(angle);
  const lng = centerLng + distance * Math.sin(angle);
  return { lat, lng };
}

type ExampleCase = {
  id: string;
  title: string;
  case_number: string;
  status: string;
  category: string;
  description: string;
  location: { lat: number; lng: number };
};

const exampleCases: ExampleCase[] = [
  {
    id: "1",
    title: "Suspicious Financial Activity",
    case_number: "CASE-001",
    status: "Under Investigation",
    category: "Fraud",
    description: "Unusual transactions detected in procurement department.",
    location: { lat: CONVENTION_CENTER.lat, lng: CONVENTION_CENTER.lng },
  },
  {
    id: "2",
    title: "Workplace Safety Concern",
    case_number: "CASE-002",
    status: "Open",
    category: "Safety",
    description: "Multiple reports of unsafe working conditions.",
    location: { lat: CONVENTION_CENTER.lat, lng: CONVENTION_CENTER.lng },
  },
  {
    id: "3",
    title: "Discrimination Complaint",
    case_number: "CASE-003",
    status: "Resolved",
    category: "Discrimination",
    description: "Employee reports discriminatory practices.",
    location: { lat: CONVENTION_CENTER.lat, lng: CONVENTION_CENTER.lng },
  },
];

// Marker color mapping by category
const categoryColors: Record<string, string> = {
  Fraud: '#ff4444',        // Red
  Safety: '#ffbb33',       // Yellow
  Discrimination: '#00C851'// Green
};

// Fix for default marker icons in Next.js
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainer.current!, {
      center: [CONVENTION_CENTER.lat, CONVENTION_CENTER.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Add zoom control
    L.control.zoom({ position: "topright" }).addTo(map);

    // Add convention center marker
    const conventionIcon = L.divIcon({
      className: "convention-center-marker",
      html: `<div style="background:#2c3e50;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.4);"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    L.marker([CONVENTION_CENTER.lat, CONVENTION_CENTER.lng], { icon: conventionIcon })
      .bindPopup("Walter E. Washington Convention Center")
      .addTo(map);

    // Debug: Log example cases
    console.log('exampleCases:', exampleCases);

    // Add case markers
    exampleCases.forEach((c) => {
      // Debug: Log each case
      console.log('Adding marker for case:', c);
      // TEMP: Use default Leaflet icon for debugging
      const marker = L.marker([c.location.lat, c.location.lng]).addTo(map);
      marker.bindPopup(`
        <div style="min-width:220px;padding:10px 0 0 0;">
          <h3 style="margin:0 0 8px 0;font-size:16px;color:#333;">${c.title}</h3>
          <div style="font-size:13px;margin-bottom:4px;"><b>Case ID:</b> ${c.case_number}</div>
          <div style="font-size:13px;margin-bottom:4px;"><b>Status:</b> ${c.status}</div>
          <div style="font-size:13px;margin-bottom:4px;"><b>Category:</b> ${c.category}</div>
          <div style="font-size:13px;color:#666;">${c.description}</div>
        </div>
      `);
      markersRef.current.push(marker);
    });

    // Clean up on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <div
        ref={mapContainer}
        className="map-container"
        style={{
          borderRadius: "0px",
          boxShadow: "none",
          border: "none",
          minHeight: "500px",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#f5f5f5",
          zIndex: 1,
        }}
      />
    </div>
  );
} 