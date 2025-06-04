"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Case } from "@/lib/supabase";
import { FaFire } from "react-icons/fa";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Category icons mapping
const categoryIcons = {
  fraud: "fa-solid fa-money-bill-wave",
  abuse: "fa-solid fa-triangle-exclamation",
  discrimination: "fa-solid fa-scale-balanced",
  harassment: "fa-solid fa-user-shield",
  safety: "fa-solid fa-hard-hat",
  corruption: "fa-solid fa-user-tie",
  data_breach: "fa-solid fa-shield-halved",
  theft: "fa-solid fa-hand-holding",
  environmental: "fa-solid fa-leaf",
  misconduct: "fa-solid fa-user-slash",
  health: "fa-solid fa-heart-pulse",
  retaliation: "fa-solid fa-arrow-rotate-left"
} as const;

// Category colors mapping
const categoryColors = {
  fraud: "#F44336",    // Red
  abuse: "#FFC107",    // Yellow
  discrimination: "#4CAF50",  // Green
  harassment: "#F44336",    // Red
  safety: "#FFC107",    // Yellow
  corruption: "#F44336",    // Red
  data_breach: "#9C27B0",   // Purple
  theft: "#FF9800",    // Orange
  environmental: "#4CAF50",  // Green
  misconduct: "#795548",    // Brown
  health: "#E91E63",    // Pink
  retaliation: "#607D8B"    // Blue Grey
} as const;

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
  safe: "rgba(76, 175, 80, 0.7)",    // Brighter green with higher opacity
  warning: "rgba(255, 193, 7, 0.7)",  // Brighter yellow with higher opacity
  danger: "rgba(244, 67, 54, 0.7)"    // Brighter red with higher opacity
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
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [deployingDrone, setDeployingDrone] = useState<string | null>(null);

  const handleDeployDrone = (caseId: string) => {
    setDeployingDrone(caseId);
    // Simulate drone deployment
    setTimeout(() => {
      setDeployingDrone(null);
      // Here you would typically make an API call to deploy the drone
      console.log(`Drone deployed to case ${caseId}`);
    }, 2000);
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      console.log("Initializing map...");
      
      // Initialize the map with explicit options
      map.current = L.map(mapContainer.current, {
        center: [38.90767, -77.02858],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        minZoom: 15,
        maxZoom: 19,
        zoomSnap: 1,
        zoomDelta: 1,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 60,
        tapTolerance: 15,
        touchZoom: true,
        bounceAtZoomLimits: true
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, © CARTO',
        tileSize: 256,
        zoomOffset: 0,
        updateWhenIdle: true,
        updateWhenZooming: true,
        keepBuffer: 2
      }).addTo(map.current);

      // Add zoom control
      L.control.zoom({
        position: 'topright',
        zoomInText: '+',
        zoomOutText: '-'
      }).addTo(map.current);

      // Add attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '© OpenStreetMap contributors'
      }).addTo(map.current);

      // Force resize to ensure proper rendering
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
        }
      }, 100);

    } catch (error) {
      console.error("Error initializing map:", error);
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
    if (!map.current || !cases.length) return;

    // Clear existing markers and heatmap
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (heatmapLayer.current && map.current) {
      map.current.removeLayer(heatmapLayer.current);
    }

    // Add markers for each case
    cases.forEach(case_ => {
      const lat = case_.structured_data?.incident?.location?.lat;
      const lng = case_.structured_data?.incident?.location?.lng;
      
      if (lat && lng && map.current) {
        // Create custom icon for the marker
        const iconHtml = `
          <div style="
            background-color: ${categoryColors[case_.category as keyof typeof categoryColors] || '#666'};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            <i class="${categoryIcons[case_.category as keyof typeof categoryIcons] || 'fa-solid fa-circle'}"></i>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        // Create marker with custom icon
        const marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${case_.title}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${case_.description}</p>
              <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px;">
                <i class="${categoryIcons[case_.category as keyof typeof categoryIcons] || 'fa-solid fa-circle'}" 
                   style="color: ${categoryColors[case_.category as keyof typeof categoryColors] || '#666'};"></i>
                <span style="font-size: 12px; text-transform: capitalize;">${case_.category}</span>
              </div>
            </div>
          `);

        marker.addTo(map.current);
        markersRef.current.push(marker);
      }
    });

    // Show safety heatmap
    if (map.current) {
      const gridSize = 0.0003;
      const bounds = map.current.getBounds();
      const heatmapData: { lat: number; lng: number; color: string }[] = [];

      for (let lat = bounds.getSouth(); lat < bounds.getNorth(); lat += gridSize) {
        for (let lng = bounds.getWest(); lng < bounds.getEast(); lng += gridSize) {
          const { color } = calculateSafetyScore(cases, lat, lng);
          heatmapData.push({ lat, lng, color });
        }
      }

      // Create heatmap layer
      const heatmap = L.layerGroup().addTo(map.current);
      heatmapData.forEach(({ lat, lng, color }) => {
        L.rectangle(
          [[lat, lng], [lat + gridSize, lng + gridSize]],
          {
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            weight: 0
          }
        ).addTo(heatmap);
      });
      heatmapLayer.current = heatmap;
    }

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
        <div className="bg-white p-6 rounded-lg shadow-lg" style={{zIndex: 99999}}>
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
        backgroundColor: "#fafafa",
        zIndex: 1,
      }}
    />
  );
}

// Add this in the head section of your HTML or in your global CSS
const style = document.createElement('style');
style.textContent = `
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(0,0,0,0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(0,0,0,0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(0,0,0,0);
    }
  }

  .custom-switcher-card {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .switcher-card.modern {
    background: rgba(255,255,255,0.92);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(33, 150, 243, 0.10), 0 1.5px 6px rgba(0,0,0,0.06);
    padding: 16px 18px 14px 18px;
    min-width: 170px;
    max-width: 80vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(33,150,243,0.08);
    backdrop-filter: blur(8px);
    transition: box-shadow 0.18s cubic-bezier(.4,0,.2,1), transform 0.14s cubic-bezier(.4,0,.2,1);
  }
  .switcher-header.modern {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 0;
  }
  .switcher-icon.modern {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #f4f8fd;
    box-shadow: 0 1px 4px rgba(33,150,243,0.04);
  }
  .switcher-title.modern {
    font-size: 16px;
    font-weight: 700;
    color: #222;
    letter-spacing: -0.2px;
  }
  .modern-switch-btn {
    width: 100%;
    border: none;
    border-radius: 10px;
    padding: 10px 0;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    background: linear-gradient(90deg, #e3f0fc 0%, #f7fbff 100%);
    color: #2196F3;
    box-shadow: 0 2px 8px rgba(33,150,243,0.07);
    transition: background 0.18s, color 0.18s, transform 0.16s, box-shadow 0.16s;
    outline: none;
    position: relative;
    overflow: hidden;
  }
  .modern-switch-btn.heatmap {
    background: linear-gradient(90deg, #ffe5d6 0%, #fff7f4 100%);
    color: #FF5722;
  }
  .modern-switch-btn:active {
    transform: scale(0.97);
    box-shadow: 0 1px 2px rgba(33,150,243,0.10);
    background: #e3f0fc;
  }
  .modern-switch-btn.heatmap:active {
    background: #ffe5d6;
  }
  .modern-switch-btn-label {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.1px;
  }
  .modern-switch-btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 768px) {
    .switcher-card.modern {
      min-width: 0;
      width: 92vw;
      padding: 10px 2vw 8px 2vw;
      box-sizing: border-box;
    }
    .switcher-title.modern {
      font-size: 14px;
    }
    .modern-switch-btn {
      font-size: 14px;
      padding: 8px 0;
    }
  }

  .heatmap-btn {
    display: flex;
    align-items: center;
    background: #f6fbff;
    border: 2px solid #d1eaff;
    border-radius: 2em;
    box-shadow: 0 2px 8px #eaf6ff;
    padding: 12px 20px 12px 16px; /* 20px right padding */
    font-size: 1.5rem;
    color: #17407e;
    font-weight: 600;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }

  .heatmap-btn .icon {
    margin-right: 12px;
    display: flex;
    align-items: center;
  }

  .heatmap-btn .label {
    font-family: inherit;
  }
`;
document.head.appendChild(style);

// Add animation for button click
setTimeout(() => {
  const btn = document.getElementById('viewModeToggle');
  if (btn) {
    btn.addEventListener('click', function() {
      btn.classList.remove('clicked');
      void btn.offsetWidth; // trigger reflow
      btn.classList.add('clicked');
      setTimeout(() => btn.classList.remove('clicked'), 400);
    });
  }
}, 200);
