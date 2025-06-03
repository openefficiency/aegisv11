"use client";

import { useEffect, useRef, useState } from "react";
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
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

    // Add markers to the map
    markersRef.current = investigations.map((investigation) => {
      const markerColor = getMarkerColor(investigation.severity);
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
          <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">${investigation.title}</h3>
          <p style="margin: 6px 0; font-size: 13px;"><strong>ID:</strong> ${investigation.id}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${investigation.status === 'Active' ? '#00C851' : investigation.status === 'Under Review' ? '#ffbb33' : '#666'}">${investigation.status}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Date:</strong> ${investigation.date}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Severity:</strong> <span style="color: ${markerColor}">${investigation.severity}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Investigator:</strong> ${investigation.investigator}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Location:</strong> ${investigation.location}</p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">${investigation.description}</p>
        </div>
      `;

      const marker = L.marker([investigation.lat, investigation.lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map.current!);

      // Add data attributes for filtering
      marker.getElement()?.setAttribute('data-severity', investigation.severity.toLowerCase());
      marker.getElement()?.setAttribute('data-status', investigation.status.toLowerCase());

      return marker;
    });

    // Add a style tag for the pulse animation and custom controls
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

      .map-controls {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        color: #333;
        min-width: 200px;
      }

      .map-controls h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
      }

      .map-controls h4 {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #666;
      }

      .filter-group {
        margin-bottom: 15px;
      }

      .filter-group:last-child {
        margin-bottom: 0;
      }

      .filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .filter-button {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        background: #f5f5f5;
        color: #333;
        border: 1px solid #eee;
      }

      .filter-button:hover {
        background: #eee;
      }

      .filter-button.active {
        background: #e0e0e0;
        border-color: #ddd;
      }

      .severity-critical {
        background: #ff4444 !important;
        color: white !important;
      }

      .severity-high {
        background: #ffbb33 !important;
        color: white !important;
      }

      .severity-medium {
        background: #ffeb3b !important;
        color: #333 !important;
      }

      .severity-low {
        background: #00C851 !important;
        color: white !important;
      }

      .status-active {
        background: #00C851 !important;
        color: white !important;
      }

      .status-under-review {
        background: #ffbb33 !important;
        color: white !important;
      }

      .status-pending {
        background: #666 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    // Add custom controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'map-controls';
    controlsDiv.innerHTML = `
      <h3>Filters</h3>
      <div class="filter-group">
        <h4>Severity</h4>
        <div class="filter-buttons">
          <button class="filter-button severity-critical" data-severity="critical">Critical</button>
          <button class="filter-button severity-high" data-severity="high">High</button>
          <button class="filter-button severity-medium" data-severity="medium">Medium</button>
          <button class="filter-button severity-low" data-severity="low">Low</button>
        </div>
      </div>
      <div class="filter-group">
        <h4>Status</h4>
        <div class="filter-buttons">
          <button class="filter-button status-active" data-status="active">Active</button>
          <button class="filter-button status-under-review" data-status="under review">Under Review</button>
          <button class="filter-button status-pending" data-status="pending">Pending</button>
        </div>
      </div>
    `;
    mapContainer.current.appendChild(controlsDiv);

    // Add click handlers for filter buttons
    const filterButtons = controlsDiv.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const severity = button.getAttribute('data-severity');
        const status = button.getAttribute('data-status');
        
        if (severity) {
          setSelectedSeverity(selectedSeverity === severity ? null : severity);
          button.classList.toggle('active');
        }
        if (status) {
          setSelectedStatus(selectedStatus === status ? null : status);
          button.classList.toggle('active');
        }

        // Update marker visibility
        markersRef.current.forEach(marker => {
          const markerElement = marker.getElement();
          if (!markerElement) return;

          const markerSeverity = markerElement.getAttribute('data-severity');
          const markerStatus = markerElement.getAttribute('data-status');

          const severityMatch = !selectedSeverity || markerSeverity === selectedSeverity;
          const statusMatch = !selectedStatus || markerStatus === selectedStatus;

          if (severityMatch && statusMatch) {
            marker.addTo(map.current!);
          } else {
            marker.remove();
          }
        });
      });
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      document.head.removeChild(style);
      if (mapContainer.current) {
        mapContainer.current.removeChild(controlsDiv);
      }
    };
  }, [selectedSeverity, selectedStatus]);

  return <div ref={mapContainer} className="h-full w-full" />;
} 