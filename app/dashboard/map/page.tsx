"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DashboardLayout } from "@/components/dashboard-layout";

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

export default function MapDashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = L.map(mapContainer.current).setView([42.35, -70.9], 9);

    // Add the OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Add example investigations
    const investigations = [
      {
        id: "INV-2024-001",
        title: "AI Bias Investigation",
        lat: 42.35,
        lng: -70.9,
        status: "Active",
        date: "2024-03-15",
        description: "Investigation into potential bias in hiring algorithm",
        severity: "High",
        investigator: "Dr. Sarah Chen",
        location: "Tech Corp HQ"
      },
      {
        id: "INV-2024-002",
        title: "Data Privacy Breach",
        lat: 42.4,
        lng: -71.0,
        status: "Under Review",
        date: "2024-03-10",
        description: "Suspected unauthorized data access in healthcare system",
        severity: "Critical",
        investigator: "James Wilson",
        location: "MediTech Center"
      },
      {
        id: "INV-2024-003",
        title: "Algorithm Transparency",
        lat: 42.3,
        lng: -70.8,
        status: "Pending",
        date: "2024-03-12",
        description: "Review of financial algorithm decision-making process",
        severity: "Medium",
        investigator: "Maria Rodriguez",
        location: "FinTech Plaza"
      },
      {
        id: "INV-2024-004",
        title: "AI Safety Protocol",
        lat: 42.38,
        lng: -70.95,
        status: "Active",
        date: "2024-03-14",
        description: "Assessment of autonomous vehicle safety measures",
        severity: "High",
        investigator: "Dr. Michael Park",
        location: "AutoTech Campus"
      }
    ];

    // Create custom markers with different colors based on severity
    const getMarkerColor = (severity: string) => {
      switch (severity.toLowerCase()) {
        case "critical":
          return "red";
        case "high":
          return "orange";
        case "medium":
          return "yellow";
        default:
          return "green";
      }
    };

    investigations.forEach((investigation) => {
      const markerColor = getMarkerColor(investigation.severity);
      const customIcon = L.divIcon({
        className: `custom-marker ${markerColor}`,
        html: `<div style="
          background-color: ${markerColor};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${investigation.title}</h3>
          <p style="margin: 4px 0; font-size: 12px;"><strong>ID:</strong> ${investigation.id}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> <span style="color: ${investigation.status === 'Active' ? 'green' : investigation.status === 'Under Review' ? 'orange' : 'gray'}">${investigation.status}</span></p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Date:</strong> ${investigation.date}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Severity:</strong> <span style="color: ${markerColor}">${investigation.severity}</span></p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Investigator:</strong> ${investigation.investigator}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Location:</strong> ${investigation.location}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px;">${investigation.description}</p>
        </div>
      `;

      L.marker([investigation.lat, investigation.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map.current!);
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <DashboardLayout role="ethics-officer">
      <div className="h-[calc(100vh-4rem)] w-full">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </DashboardLayout>
  );
}
