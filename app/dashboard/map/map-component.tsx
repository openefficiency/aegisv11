"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Category icons mapping
const categoryIcons = {
  fraud: "fa-hand-holding-dollar",
  abuse: "fa-triangle-exclamation",
  discrimination: "fa-scale-balanced",
  harassment: "fa-user-shield",
  safety: "fa-hard-hat",
  corruption: "fa-user-tie",
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

// Example cases
type Case = {
  id: number;
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  structured_data?: {
    incident?: {
      category?: "fraud" | "abuse" | "discrimination" | "harassment" | "safety" | "corruption";
      title?: string;
      source?: string;
      description?: string;
      location?: { lat: number; lng: number };
    };
  };
};

const exampleCases: Case[] = [
  {
    id: 1,
    priority: "high",
    created_at: "2025-06-01T10:00:00Z",
    structured_data: {
      incident: {
        category: "fraud",
        title: "Financial Misconduct Report",
        source: "Internal Audit",
        description: "Suspected fraudulent transactions detected in accounting system.",
        location: { lat: 37.7749, lng: -122.4194 },
      },
    },
  },
  {
    id: 2,
    priority: "medium",
    created_at: "2025-06-02T14:30:00Z",
    structured_data: {
      incident: {
        category: "safety",
        title: "Workplace Safety Violation",
        source: "Employee Report",
        description: "Improper safety equipment usage in warehouse.",
        location: { lat: 37.7725, lng: -122.4178 },
      },
    },
  },
  {
    id: 3,
    priority: "critical",
    created_at: "2025-06-03T09:15:00Z",
    structured_data: {
      incident: {
        category: "harassment",
        title: "Workplace Harassment Complaint",
        source: "HR Department",
        description: "Reported verbal harassment in team meeting.",
        location: { lat: 37.7763, lng: -122.4212 },
      },
    },
  },
  {
    id: 4,
    priority: "low",
    created_at: "2025-06-03T12:00:00Z",
    structured_data: {
      incident: {
        category: "discrimination",
        title: "Bias Incident Report",
        source: "Anonymous",
        description: "Reported biased language during project discussion.",
        location: { lat: 37.7738, lng: -122.4201 },
      },
    },
  },
];

const generateRandomLocation = (centerLat: number, centerLng: number, radiusInMeters: number = 500) => {
  const radiusInDegrees = radiusInMeters / 111000;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;
  const lat = centerLat + (distance * Math.cos(angle));
  const lng = centerLng + (distance * Math.sin(angle));
  return { lat, lng };
};

// Safety heatmap colors
const safetyColors = {
  safe: "#00C851",
  warning: "#ffbb33",
  danger: "#ff4444",
};

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
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      // Use example cases instead of Supabase
      setCases(exampleCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      setMapError("Failed to load case data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      map.current = L.map(mapContainer.current, {
        center: [37.7749, -122.4194], // San Francisco
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
      });

      // Use CartoDB Positron tiles for light theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
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

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    cases.forEach((case_) => {
      const category = case_.structured_data?.incident?.category || 'safety';
      const color = categoryColors[category] || '#4CAF50';
      
      // Create custom icon with FontAwesome
      const customIcon = L.divIcon({
        className: 'custom-icon',
        html: `
          <div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            <i class="fa-solid ${categoryIcons[category] || 'fa-hard-hat'}" style="color: white; font-size: 16px;"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      // Enhanced popup
      const popupContent = `
        <div style="min-width:220px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);padding:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:32px;height:32px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;">
              <i class="fa-solid ${categoryIcons[category] || 'fa-hard-hat'}" style="color:white;font-size:16px;"></i>
            </div>
            <div>
              <div style="font-weight:600;font-size:15px;">${case_.structured_data?.incident?.title || 'Incident'}</div>
              <div style="font-size:12px;color:#666;">${case_.structured_data?.incident?.source || 'Unknown'}</div>
            </div>
          </div>
          <div style="font-size:13px;color:#444;margin-bottom:8px;">${case_.structured_data?.incident?.description || 'No description'}</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>
            <span style="color:#666;">Priority:</span>
            <span style="font-weight:500;color:${color};text-transform:capitalize;">${case_.priority || 'unknown'}</span>
          </div>
        </div>
      `;

      const location = case_.structured_data?.incident?.location?.lat && case_.structured_data?.incident?.location?.lng
        ? {
            lat: case_.structured_data.incident.location.lat,
            lng: case_.structured_data.incident.location.lng
          }
        : generateRandomLocation(37.7749, -122.4194);

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -16],
          className: 'custom-popup',
        })
        .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [cases]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
          <div className="text-gray-500 text-sm">Loading map data...</div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="bg-white p-5 rounded-md shadow-md">
          <div className="text-red-400 text-sm font-medium mb-2">Map Error</div>
          <div className="text-gray-500 text-sm mb-4">{mapError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .leaflet-container {
            background: #f5f5f5 !important;
          }
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 8px;
            padding: 0;
          }
          .custom-popup .leaflet-popup-tip {
            background: #fff;
          }
        `}
      </style>
      <div
        ref={mapContainer}
        className="relative w-full h-full"
        style={{ minHeight: "500px", zIndex: 1 }}
      />
    </>
  );
}