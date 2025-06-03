"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

    // Add the dark-themed map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
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

    // Add example investigations around the convention center
    const investigations = [
      {
        id: "INV-2024-001",
        title: "AI Ethics Conference",
        lat: 38.8574,
        lng: -77.0234,
        status: "Active",
        date: "2024-03-15",
        description: "Monitoring AI ethics discussions and potential bias in conference presentations",
        severity: "High",
        investigator: "Dr. Sarah Chen",
        location: "Walter E. Washington Convention Center"
      },
      {
        id: "INV-2024-002",
        title: "Data Privacy Workshop",
        lat: 38.8590,
        lng: -77.0250,
        status: "Under Review",
        date: "2024-03-10",
        description: "Review of data handling practices in workshop demonstrations",
        severity: "Critical",
        investigator: "James Wilson",
        location: "Shaw Library"
      },
      {
        id: "INV-2024-003",
        title: "Algorithm Transparency Panel",
        lat: 38.8560,
        lng: -77.0210,
        status: "Pending",
        date: "2024-03-12",
        description: "Assessment of transparency in financial algorithms presented at panel discussion",
        severity: "Medium",
        investigator: "Maria Rodriguez",
        location: "Mount Vernon Square"
      },
      {
        id: "INV-2024-004",
        title: "AI Safety Demonstration",
        lat: 38.8580,
        lng: -77.0240,
        status: "Active",
        date: "2024-03-14",
        description: "Evaluation of safety protocols in autonomous vehicle demonstrations",
        severity: "High",
        investigator: "Dr. Michael Park",
        location: "Convention Center Plaza"
      }
    ];

    // Create custom markers with different colors based on severity
    const getMarkerColor = (severity: string) => {
      switch (severity.toLowerCase()) {
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

    investigations.forEach((investigation) => {
      const markerColor = getMarkerColor(investigation.severity);
      const customIcon = L.divIcon({
        className: `custom-marker ${markerColor}`,
        html: `<div style="
          background-color: ${markerColor};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.5);
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const popupContent = `
        <div style="min-width: 250px; padding: 12px; background: #1a1a1a; color: white; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; color: white; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 8px;">${investigation.title}</h3>
          <p style="margin: 6px 0; font-size: 13px;"><strong>ID:</strong> ${investigation.id}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${investigation.status === 'Active' ? '#00C851' : investigation.status === 'Under Review' ? '#ffbb33' : '#666'}">${investigation.status}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Date:</strong> ${investigation.date}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Severity:</strong> <span style="color: ${markerColor}">${investigation.severity}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Investigator:</strong> ${investigation.investigator}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Location:</strong> ${investigation.location}</p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #ccc;">${investigation.description}</p>
        </div>
      `;

      L.marker([investigation.lat, investigation.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map.current!);
    });

    // Add a style tag for the pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
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

  return <div ref={mapContainer} className="h-full w-full" />;
} 