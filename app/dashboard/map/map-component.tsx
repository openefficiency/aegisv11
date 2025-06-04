"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Case } from "@/lib/supabase";

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
  fraud: "#808080",
  abuse: "#A9A9A9",
  discrimination: "#D3D3D3",
  harassment: "#C0C0C0",
  safety: "#E8E8E8",
  corruption: "#B8B8B8",
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
  safe: "#4CAF50",    // Green
  warning: "#FFC107",  // Yellow
  danger: "#F44336"    // Red
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
  const [cases, setCases] = useState<Case[]>([
    {
      id: "1",
      case_number: "CASE-001",
      title: "Suspicious Financial Activity",
      description: "Multiple large transactions detected in employee accounts",
      category: "fraud",
      priority: "critical",
      status: "under_investigation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      secret_code: "FRAUD001",
      report_id: "R001",
      reward_status: "pending",
      structured_data: {
        incident: {
          location: {
            lat: 38.8574,
            lng: -77.0234
          }
        }
      }
    },
    {
      id: "2",
      case_number: "CASE-002",
      title: "Workplace Harassment Report",
      description: "Employee reported verbal harassment from supervisor",
      category: "harassment",
      priority: "high",
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      secret_code: "HARASS002",
      report_id: "R002",
      reward_status: "pending",
      structured_data: {
        incident: {
          location: {
            lat: 38.8580,
            lng: -77.0220
          }
        }
      }
    },
    {
      id: "3",
      case_number: "CASE-003",
      title: "Safety Violation in Construction",
      description: "Workers not wearing required safety equipment",
      category: "safety",
      priority: "medium",
      status: "resolved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      secret_code: "SAFETY003",
      report_id: "R003",
      reward_status: "paid",
      structured_data: {
        incident: {
          location: {
            lat: 38.8568,
            lng: -77.0240
          }
        }
      }
    },
    {
      id: "4",
      case_number: "CASE-004",
      title: "Discrimination Complaint",
      description: "Allegations of age discrimination in hiring process",
      category: "discrimination",
      priority: "high",
      status: "under_investigation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      secret_code: "DISC004",
      report_id: "R004",
      reward_status: "pending",
      structured_data: {
        incident: {
          location: {
            lat: 38.8578,
            lng: -77.0245
          }
        }
      }
    },
    {
      id: "5",
      case_number: "CASE-005",
      title: "Corruption Investigation",
      description: "Suspicious contract awards to specific vendors",
      category: "corruption",
      priority: "critical",
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      secret_code: "CORR005",
      report_id: "R005",
      reward_status: "pending",
      structured_data: {
        incident: {
          location: {
            lat: 38.8565,
            lng: -77.0225
          }
        }
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cases' | 'safety'>('cases');
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
        center: [38.8574, -77.0234], // Walter E. Washington Convention Center coordinates
        zoom: 16, // Closer zoom to focus on the convention center area
        zoomControl: false,
        attributionControl: false,
        minZoom: 2,
        maxZoom: 19,
        zoomSnap: 1,
        zoomDelta: 1,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 60,
        tapTolerance: 15,
        touchZoom: true,
        bounceAtZoomLimits: true
      });

      console.log("Map initialized, adding tile layer...");

      // Add OpenStreetMap tiles with explicit options
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, © CARTO',
        tileSize: 256,
        zoomOffset: 0,
        updateWhenIdle: true,
        updateWhenZooming: true,
        keepBuffer: 2
      }).addTo(map.current);

      console.log("Tile layer added, adding controls...");

      // Add zoom control in top right
      L.control.zoom({
        position: 'topright',
        zoomInText: '+',
        zoomOutText: '-'
      }).addTo(map.current);

      // Add attribution in bottom right
      L.control.attribution({
        position: 'bottomright',
        prefix: '© OpenStreetMap contributors'
      }).addTo(map.current);

      // Add view mode toggle control
      const ViewModeControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
          div.innerHTML = `
            <div style="
              background-color: rgba(0, 0, 0, 0.8);
              padding: 8px;
              border-radius: 4px;
              margin-bottom: 8px;
            ">
              <button id="viewModeToggle" style="
                background-color: #2c3e50;
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                width: 100%;
              ">
                Switch to ${viewMode === 'cases' ? 'Safety View' : 'Cases View'}
              </button>
            </div>
          `;
          return div;
        }
      });

      new ViewModeControl().addTo(map.current);

      console.log("Controls added, map initialization complete");

      // Force multiple resize events to ensure the map renders properly
      const resizeMap = () => {
        if (map.current) {
          map.current.invalidateSize();
          console.log("Map resized");
        }
      };

      // Initial resize
      setTimeout(resizeMap, 100);
      
      // Additional resizes
      setTimeout(resizeMap, 500);
      setTimeout(resizeMap, 1000);

      // Add event listener for view mode toggle
      setTimeout(() => {
        const toggleButton = document.getElementById('viewModeToggle');
        if (toggleButton) {
          toggleButton.addEventListener('click', () => {
            setViewMode(prev => prev === 'cases' ? 'safety' : 'cases');
          });
        }
      }, 100);

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(error instanceof Error ? error.message : "Failed to initialize map");
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers or heatmap when cases or view mode changes
  useEffect(() => {
    if (!map.current || !cases.length) return;

    // Clear existing markers and heatmap
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (heatmapLayer.current) {
      map.current.removeLayer(heatmapLayer.current);
    }

    if (viewMode === 'cases') {
      // Show individual case markers
      markersRef.current = cases.map((case_) => {
        const markerColor = calculateSafetyScore(cases, case_.structured_data?.incident?.location?.lat || 0, case_.structured_data?.incident?.location?.lng || 0).color;
        const customIcon = L.divIcon({
          className: `custom-marker ${markerColor}`,
          html: `<div style="
            background-color: ${markerColor};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #666;
            box-shadow: 0 0 4px rgba(0,0,0,0.2);
            animation: pulse 2s infinite;
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const popupContent = `
          <div style="
            min-width: 300px;
            background: white;
            color: #333;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            overflow: hidden;
          ">
            <div style="
              padding: 16px;
              border-bottom: 1px solid #eee;
              background: ${markerColor};
              color: white;
            ">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${case_.title}</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Case ID: ${case_.case_number}</p>
            </div>
            
            <div style="padding: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">STATUS</p>
                  <p style="margin: 0; font-size: 13px; font-weight: 500; color: ${case_.status === 'resolved' ? '#4CAF50' : case_.status === 'under_investigation' ? '#FFC107' : '#F44336'}">
                    ${case_.status.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">PRIORITY</p>
                  <p style="margin: 0; font-size: 13px; font-weight: 500; color: ${markerColor}">
                    ${case_.priority.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">CATEGORY</p>
                  <p style="margin: 0; font-size: 13px; font-weight: 500;">
                    ${case_.category.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">CREATED</p>
                  <p style="margin: 0; font-size: 13px; font-weight: 500;">
                    ${new Date(case_.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">DESCRIPTION</p>
                <p style="margin: 0; font-size: 13px; line-height: 1.4;">${case_.description}</p>
              </div>

              ${case_.reward_amount ? `
                <div style="
                  background: #f8f9fa;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 16px;
                ">
                  <p style="margin: 0 0 4px 0; font-size: 11px; color: #666;">REWARD</p>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2c3e50;">
                    $${case_.reward_amount.toLocaleString()}
                  </p>
                </div>
              ` : ''}

              <button 
                onclick="document.dispatchEvent(new CustomEvent('deployDrone', { detail: '${case_.id}' }))"
                style="
                  width: 100%;
                  padding: 12px;
                  background: ${markerColor};
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  transition: all 0.2s;
                "
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
              >
                ${deployingDrone === case_.id ? `
                  <div style="
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                  "></div>
                  Deploying Drone...
                ` : `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Deploy Drone
                `}
              </button>
            </div>
          </div>
        `;

        // Get location from structured data or generate random location
        let location;
        if (case_.structured_data?.incident?.location?.lat && case_.structured_data?.incident?.location?.lng) {
          location = {
            lat: case_.structured_data.incident.location.lat,
            lng: case_.structured_data.incident.location.lng
          };
        } else {
          // Generate random location around convention center
          location = generateRandomLocation(38.8574, -77.0234);
        }

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(map.current!);

        // Add event listener for drone deployment
        document.addEventListener('deployDrone', ((e: CustomEvent) => {
          if (e.detail === case_.id) {
            handleDeployDrone(case_.id);
          }
        }) as EventListener);

        return marker;
      });
    } else {
      // Show safety heatmap
      const gridSize = 0.001; // Size of each grid cell
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
            fillOpacity: 0.3,
            weight: 0
          }
        ).addTo(heatmap);
      });
      heatmapLayer.current = heatmap;

      // Add legend
      const LegendControl = L.Control.extend({
        options: {
          position: 'bottomleft'
        },
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
          div.innerHTML = `
            <div style="
              background-color: rgba(255, 255, 255, 0.9);
              padding: 8px;
              border-radius: 4px;
              color: #333;
              font-size: 12px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            ">
              <h4 style="margin: 0 0 8px 0;">Safety Level</h4>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background-color: ${safetyColors.safe}; border: 1px solid #666;"></div>
                  <span>Safe</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background-color: ${safetyColors.warning}; border: 1px solid #666;"></div>
                  <span>Warning</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background-color: ${safetyColors.danger}; border: 1px solid #666;"></div>
                  <span>Danger</span>
                </div>
              </div>
            </div>
          `;
          return div;
        }
      });

      new LegendControl().addTo(map.current);
    }
  }, [cases, viewMode, deployingDrone]);

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
        backgroundColor: "#fafafa",
        zIndex: 1,
      }}
    />
  );
} 