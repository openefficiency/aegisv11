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
    if (map.current) {
      console.log("Map already initialized");
      return;
    }
    if (!mapContainer.current) {
      console.error("Map container ref is not available");
      return;
    }

    try {
      console.log("Starting map initialization...");
      console.log("Container dimensions:", {
        width: mapContainer.current.offsetWidth,
        height: mapContainer.current.offsetHeight,
        clientWidth: mapContainer.current.clientWidth,
        clientHeight: mapContainer.current.clientHeight
      });
      
      // Initialize the map with explicit options
      map.current = L.map(mapContainer.current, {
        center: [38.8574, -77.0234],
        zoom: 14,
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

      console.log("Map object created:", map.current);

      // Add OpenStreetMap tiles with explicit options
      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        tileSize: 256,
        zoomOffset: 0,
        updateWhenIdle: true,
        updateWhenZooming: true,
        keepBuffer: 2
      });

      console.log("Tile layer created, adding to map...");
      tileLayer.addTo(map.current);

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

      console.log("Basic controls added");

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
      console.log("View mode control added");

      // Force multiple resize events to ensure the map renders properly
      const resizeMap = () => {
        if (map.current) {
          console.log("Resizing map...");
          map.current.invalidateSize();
          console.log("Map resized, new size:", {
            width: map.current.getSize().x,
            height: map.current.getSize().y
          });
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

      console.log("Map initialization complete");

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(error instanceof Error ? error.message : "Failed to initialize map");
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        console.log("Cleaning up map...");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add a debug effect to monitor map container dimensions
  useEffect(() => {
    const checkDimensions = () => {
      if (mapContainer.current) {
        console.log("Map container dimensions:", {
          width: mapContainer.current.offsetWidth,
          height: mapContainer.current.offsetHeight,
          clientWidth: mapContainer.current.clientWidth,
          clientHeight: mapContainer.current.clientHeight,
          style: mapContainer.current.style.cssText
        });
      }
    };

    // Check dimensions initially and after a short delay
    checkDimensions();
    setTimeout(checkDimensions, 1000);

    // Set up a resize observer
    const resizeObserver = new ResizeObserver(checkDimensions);
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => resizeObserver.disconnect();
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
              background-color: rgba(0, 0, 0, 0.8);
              padding: 8px;
              border-radius: 4px;
              color: white;
              font-size: 12px;
            ">
              <h4 style="margin: 0 0 8px 0;">Safety Level</h4>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 16px; height: 16px; background-color: ${safetyColors.safe};"></div>
                  <span>Safe</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 16px; height: 16px; background-color: ${safetyColors.warning};"></div>
                  <span>Warning</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 16px; height: 16px; background-color: ${safetyColors.danger};"></div>
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
  }, [cases, viewMode]);

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
      className="map-container"
    />
  );
} 