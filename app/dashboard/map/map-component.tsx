"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase, type Case } from "@/lib/supabase";

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

      // Extract location from structured data if available
      let lat = 38.8574; // Default to convention center
      let lng = -77.0234;
      
      if (case_.structured_data?.incident?.location) {
        // If we have location data, use it
        const location = case_.structured_data.incident.location;
        if (location.lat && location.lng) {
          lat = location.lat;
          lng = location.lng;
        }
      }

      const marker = L.marker([lat, lng], { icon: customIcon })
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