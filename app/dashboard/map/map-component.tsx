"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase, type Case } from "@/lib/supabase";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Category icons mapping
const categoryIcons = {
  fraud: "fa-solid fa-hand-holding-dollar",
  abuse: "fa-solid fa-triangle-exclamation",
  discrimination: "fa-solid fa-scale-balanced",
  harassment: "fa-solid fa-user-shield",
  safety: "fa-solid fa-hard-hat",
  corruption: "fa-solid fa-user-tie",
};

// Category colors mapping
const categoryColors = {
  fraud: "#FF6B6B",
  abuse: "#FF9F43",
  discrimination: "#4ECDC4",
  harassment: "#45B7D1",
  safety: "#96CEB4",
  corruption: "#D4A5A5",
};

// Add this function after the categoryColors mapping
const generateRandomLocation = (centerLat: number, centerLng: number, radiusInMeters: number = 500) => {
  // Convert radius from meters to degrees (approximate)
  const radiusInDegrees = radiusInMeters / 111000;
  
  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;
  
  // Generate random distance within radius
  const distance = Math.random() * radiusInDegrees;
  
  // Calculate new coordinates
  const lat = centerLat + (distance * Math.cos(angle));
  const lng = centerLng + (distance * Math.sin(angle));
  
  return { lat, lng };
};

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Add safety heatmap colors
const safetyColors = {
  safe: "#00C851",
  warning: "#ffbb33",
  danger: "#ff4444"
};

// Add this function to calculate safety score
const calculateSafetyScore = (cases: Case[], lat: number, lng: number, radius: number = 0.001) => {
  const nearbyCases = cases.filter(case_ => {
    const caseLat = case_.structured_data?.incident?.location?.lat || 0;
    const caseLng = case_.structured_data?.incident?.location?.lng || 0;
    const distance = Math.sqrt(
      Math.pow(caseLat - lat, 2) + Math.pow(caseLng - lng, 2)
    );
    return distance <= radius;
  });

  if (nearbyCases.length === 0) return { score: 1, color: safetyColors.safe };

  const criticalCases = nearbyCases.filter(c => c.priority === "critical").length;
  const highCases = nearbyCases.filter(c => c.priority === "high").length;
  const mediumCases = nearbyCases.filter(c => c.priority === "medium").length;

  const score = 1 - (
    (criticalCases * 0.5) +
    (highCases * 0.3) +
    (mediumCases * 0.2)
  ) / Math.max(nearbyCases.length, 1);

  let color;
  if (score > 0.7) color = safetyColors.safe;
  else if (score > 0.4) color = safetyColors.warning;
  else color = safetyColors.danger;

  return { score, color };
};

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const heatmapLayer = useRef<L.Layer | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cases' | 'safety'>('cases');
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      map.current = L.map(mapContainer.current, {
        center: [37.7749, -122.4194], // San Francisco for demo
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
      });

      // Use CartoDB Positron tiles for a light, minimal look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '',
        maxZoom: 19,
      }).addTo(map.current);
    } catch (error) {
      setMapError(error instanceof Error ? error.message : "Failed to initialize map");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when cases change
  useEffect(() => {
    if (!map.current) return;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    cases.forEach((case_) => {
      // Choose color by priority
      let color = '#4CAF50'; // green default
      if (case_.priority === 'medium') color = '#FFC107'; // yellow
      if (case_.priority === 'high' || case_.priority === 'critical') color = '#F44336'; // red

      // Flat dot marker
      const customIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      // Modern popup card
      const popupContent = `
        <div style="min-width:220px;max-width:260px;background:#fff;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.12);padding:18px 18px 14px 18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:32px;height:32px;border-radius:8px;background:#FFF3CD;display:flex;align-items:center;justify-content:center;">
              <svg width='20' height='20' fill='#FFC107' viewBox='0 0 24 24'><path d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:16px;line-height:1.2;">Sanitation Issue</div>
              <div style="font-size:13px;color:#888;">Clarifai</div>
            </div>
          </div>
          <div style="font-size:14px;color:#444;margin-bottom:10px;">Waste/Trash detected</div>
          <div style="display:flex;align-items:center;gap:7px;font-size:13px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${color};"></div>
            <span style="color:#888;">Priority:</span>
            <span style="font-weight:500;color:${color};text-transform:capitalize;">${case_.priority}</span>
          </div>
        </div>
      `;

      // Use provided or random location
      let location;
      if (case_.structured_data?.incident?.location?.lat && case_.structured_data?.incident?.location?.lng) {
        location = {
          lat: case_.structured_data.incident.location.lat,
          lng: case_.structured_data.incident.location.lng
        };
      } else {
        location = generateRandomLocation(37.7749, -122.4194);
      }

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .bindPopup(popupContent, { closeButton: false, offset: [0, -10] })
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [cases]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="text-gray-600">Loading map data...</div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-red-500 mb-2">Error Loading Map</div>
          <div className="text-gray-600">{mapError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: "500px",
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        zIndex: 1,
      }}
    />
  );
} 