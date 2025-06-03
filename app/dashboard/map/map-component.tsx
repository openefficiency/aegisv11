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

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    // Initialize the map centered on Walter E. Washington Convention Center
    map.current = L.map(mapContainer.current, {
      center: [38.8574, -77.0234], // Walter E. Washington Convention Center coordinates
      zoom: 14,
      zoomControl: false, // We'll add it in a specific position
      attributionControl: false // We'll add it in a specific position
    });

    // Add the light-themed map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }).addTo(map.current);

    // Add zoom control in top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map.current);

    // Add attribution in bottom right
    L.control.attribution({
      position: 'bottomright'
    }).addTo(map.current);

    // Create custom markers with different colors based on severity
    const getMarkerColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case "critical":
          return "#ff4444";
        case "high":
          return "#ffbb33";
        case "medium":
          return "#ffeb3b";
        default:
          return "#00C851";
      }
    };

    // Add markers to the map
    markersRef.current = cases.map((case_) => {
      const markerColor = getMarkerColor(case_.priority);
      const customIcon = L.divIcon({
        className: `custom-marker ${markerColor}`,
        html: `<div style="
          background-color: ${markerColor};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const popupContent = `
        <div style="min-width: 250px; padding: 12px; background: white; color: #333; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">${case_.title}</h3>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Case ID:</strong> ${case_.case_number}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${case_.status === 'resolved' ? '#00C851' : case_.status === 'under_investigation' ? '#ffbb33' : '#666'}">${case_.status.replace('_', ' ')}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Priority:</strong> <span style="color: ${markerColor}">${case_.priority}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Category:</strong> ${case_.category}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Created:</strong> ${new Date(case_.created_at).toLocaleDateString()}</p>
          ${case_.reward_amount ? `<p style="margin: 6px 0; font-size: 13px;"><strong>Reward:</strong> $${case_.reward_amount.toLocaleString()}</p>` : ''}
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">${case_.description}</p>
        </div>
      `;

      // Convention center coordinates
      const conventionCenter = { lat: 38.8574, lng: -77.0234 };
      
      // Get location from structured data or generate random location
      let location;
      if (case_.structured_data?.incident?.location?.lat && case_.structured_data?.incident?.location?.lng) {
        location = {
          lat: case_.structured_data.incident.location.lat,
          lng: case_.structured_data.incident.location.lng
        };
      } else {
        // Generate random location around convention center
        location = generateRandomLocation(conventionCenter.lat, conventionCenter.lng);
      }

      const marker = L.marker([location.lat, location.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map.current!);

      return marker;
    });

    // Add a style tag for the pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      document.head.removeChild(style);
    };
  }, [cases]); // Re-run when cases data changes

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center">Loading cases...</div>;
  }

  return <div ref={mapContainer} className="h-full w-full" />;
} 