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

// Example cases for testing
const exampleCases: Case[] = [
  {
    id: "1",
    case_number: "CASE-001",
    title: "Suspicious Financial Activity",
    description: "Unusual transactions detected in procurement department",
    status: "under_investigation",
    priority: "high",
    category: "fraud",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secret_code: "ABC123",
    report_id: "REP001",
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
    title: "Workplace Safety Concern",
    description: "Multiple reports of unsafe working conditions",
    status: "open",
    priority: "critical",
    category: "safety",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secret_code: "DEF456",
    report_id: "REP002",
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
    id: "3",
    case_number: "CASE-003",
    title: "Discrimination Complaint",
    description: "Employee reports discriminatory practices",
    status: "resolved",
    priority: "medium",
    category: "discrimination",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secret_code: "GHI789",
    report_id: "REP003",
    reward_status: "paid",
    structured_data: {
      incident: {
        location: {
          lat: 38.8574,
          lng: -77.0234
        }
      }
    }
  }
];

// Add this function after the categoryColors mapping
const generateRandomLocation = (centerLat: number, centerLng: number, radiusInMeters: number = 200) => {
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
  const [isMounted, setIsMounted] = useState(false);

  // Fetch cases from Supabase
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCases(data || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to fetch cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Initialize map
  useEffect(() => {
    let mapInstance: L.Map | null = null;

    const initializeMap = async () => {
      console.log("Starting map initialization...", {
        hasContainer: !!mapContainer.current,
        isMounted,
        hasExistingMap: !!map.current
      });

      if (!mapContainer.current) {
        console.error("Map container ref is not available");
        return;
      }

      try {
        // Initialize the map with explicit options
        const conventionCenterCoords: [number, number] = [38.8574, -77.0234];
        console.log("Setting map center to convention center:", conventionCenterCoords);
        
        mapInstance = L.map(mapContainer.current, {
          center: conventionCenterCoords,
          zoom: 15, // Increased zoom level for better visibility
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

        map.current = mapInstance;
        console.log("Map object created:", {
          center: mapInstance.getCenter(),
          zoom: mapInstance.getZoom(),
          size: mapInstance.getSize()
        });

        // Add OpenStreetMap tiles with explicit options
        const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
          tileSize: 256,
          zoomOffset: 0,
          updateWhenIdle: true,
          updateWhenZooming: true,
          keepBuffer: 2
        });

        console.log("Adding tile layer...");
        tileLayer.addTo(mapInstance);

        // Force a resize after a short delay to ensure proper rendering
        setTimeout(() => {
          if (mapInstance) {
            console.log("Forcing map resize...");
            mapInstance.invalidateSize(true);
            // Set the view again to ensure proper centering
            mapInstance.setView(conventionCenterCoords, 15);
          }
        }, 100);

        // Add zoom control in top right
        L.control.zoom({
          position: 'topright',
          zoomInText: '+',
          zoomOutText: '-'
        }).addTo(mapInstance);

        // Add attribution in bottom right
        L.control.attribution({
          position: 'bottomright',
          prefix: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        console.log("Map initialization complete");

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(error instanceof Error ? error.message : "Failed to initialize map");
      }
    };

    if (isMounted && !map.current) {
      // Wait for the next tick to ensure the container is mounted
      requestAnimationFrame(() => {
        initializeMap();
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance) {
        console.log("Cleaning up map...");
        mapInstance.remove();
        mapInstance = null;
        map.current = null;
      }
    };
  }, [isMounted, viewMode]);

  // Update markers or heatmap when cases or view mode changes
  useEffect(() => {
    console.log("Effect triggered with:", { 
      hasMap: !!map.current, 
      casesCount: cases.length,
      viewMode,
      isMounted 
    });

    if (!map.current || !cases.length) {
      console.log("Skipping marker creation:", { 
        hasMap: !!map.current, 
        casesCount: cases.length 
      });
      return;
    }

    // Clear existing markers and heatmap
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    if (heatmapLayer.current) {
      map.current.removeLayer(heatmapLayer.current);
    }

    // Add convention center marker
    const conventionCenterCoords: [number, number] = [38.8574, -77.0234];
    const conventionCenterIcon = L.divIcon({
      className: 'convention-center-marker',
      html: `<div style="
        background-color: #2c3e50;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const conventionCenterMarker = L.marker(conventionCenterCoords, { icon: conventionCenterIcon })
      .bindPopup('Walter E. Washington Convention Center')
      .addTo(map.current!);

    markersRef.current.push(conventionCenterMarker);

    if (viewMode === 'cases') {
      console.log("Creating case markers for", cases.length, "cases");
      // Show individual case markers
      markersRef.current = markersRef.current.concat(cases.map((case_) => {
        // Use category color for marker
        const markerColor = categoryColors[case_.category] || '#888';
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
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #666;">${case_.description}</p>
          </div>
        `;

        // Generate random location around convention center
        const location = generateRandomLocation(38.8574, -77.0234, 100); // Reduced radius to 100m
        console.log("Creating marker at location:", location);

        const marker = L.marker([location.lat, location.lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(map.current!);

        return marker;
      }));
      console.log("Created", markersRef.current.length, "markers");
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
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <div className="w-full flex justify-end p-4 gap-2">
        <button
          onClick={() => setViewMode('cases')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'cases'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cases View
        </button>
        <button
          onClick={() => setViewMode('safety')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'safety'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Safety Heatmap
        </button>
      </div>
      <div
        ref={mapContainer}
        className="map-container"
        style={{
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          minHeight: "500px",
          width: "100%",
          height: "calc(100vh - 80px)",
          backgroundColor: "#f5f5f5",
          zIndex: 1,
          transition: "all 0.3s ease-in-out"
        }}
      />
    </div>
  );
} 