"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase, type Case } from "@/lib/supabase";
import { formatCaseText, formatCaseTitle } from "@/lib/utils";

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
  }, []);

  useEffect(() => {
    if (!map.current || !cases.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

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

    // Add markers for each case
    cases.forEach((case_) => {
      // Extract location from structured data or use default
      const location = case_.structured_data?.incident?.location || "Walter E. Washington Convention Center";
      const coordinates = getCoordinatesFromLocation(location);

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
          <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">${formatCaseTitle(case_.title, case_.description, case_.created_at)}</h3>
          <p style="margin: 6px 0; font-size: 13px;"><strong>ID:</strong> ${case_.case_number}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${getStatusColor(case_.status)}">${case_.status.replace("_", " ")}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Date:</strong> ${new Date(case_.created_at).toLocaleDateString()}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Priority:</strong> <span style="color: ${markerColor}">${case_.priority}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Category:</strong> ${case_.category}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">${formatCaseText(case_.description)}</p>
        </div>
      `;

      const marker = L.marker(coordinates, { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

  }, [cases]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "#00C851";
      case "escalated":
        return "#ff4444";
      case "under_investigation":
        return "#ffbb33";
      default:
        return "#666";
    }
  };

  const getCoordinatesFromLocation = (location: string): [number, number] => {
    // Default coordinates for Walter E. Washington Convention Center
    const defaultCoords: [number, number] = [38.8574, -77.0234];
    
    // Add more location mappings as needed
    const locationMap: { [key: string]: [number, number] } = {
      "Walter E. Washington Convention Center": [38.8574, -77.0234],
      "Shaw Library": [38.8590, -77.0250],
      "Mount Vernon Square": [38.8560, -77.0210],
      "Convention Center Plaza": [38.8580, -77.0240],
    };

    return locationMap[location] || defaultCoords;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-400">Loading cases...</div>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full" />;
} 