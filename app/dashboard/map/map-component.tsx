"use client";

import React, { useEffect, useRef, useState } from "react";
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
  fraud: "fa-solid fa-money-bill-wave",
  abuse: "fa-solid fa-triangle-exclamation",
  discrimination: "fa-solid fa-scale-balanced",
  harassment: "fa-solid fa-user-shield",
  safety: "fa-solid fa-hard-hat",
  corruption: "fa-solid fa-user-tie",
  data_breach: "fa-solid fa-database",
  theft: "fa-solid fa-hand-holding",
  environmental: "fa-solid fa-leaf",
  misconduct: "fa-solid fa-user-slash",
  health: "fa-solid fa-heart-pulse",
  retaliation: "fa-solid fa-arrows-rotate",
  assaults: "fa-solid fa-fist-raised",
  nuisance: "fa-solid fa-bell-slash",
  motor_vehicle_theft: "fa-solid fa-car-side",
  disorderly_conduct: "fa-solid fa-person-falling"
};

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
  health: "#00BCD4",    // Cyan
  retaliation: "#E91E63"    // Pink
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
  const [cases, setCases] = useState<Case[]>([
    
      {
        "id": "1",
        "case_number": "CASE-001",
        "tracking_code": "TRACK-001",
        "title": "Suspicious Financial Activity",
        "description": "Multiple large transactions detected in employee accounts",
        "category": "fraud", // Unmapped: No direct match, possibly "Theft / Larceny" but fraud is more specific
        "priority": "critical",
        "status": "under_investigation",
        "created_at": "2025-06-04T05:14:00.000Z",
        "updated_at": "2025-06-04T05:14:00.000Z",
        "secret_code": "FRAUD001",
        "report_id": "R001",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9082,
              "lng": -77.0280,
              "address": "1400 L St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "2",
        "case_number": "CASE-002",
        "tracking_code": "TRACK-002",
        "title": "Workplace Harassment Report",
        "description": "Employee reported verbal harassment from supervisor",
        "category": "assaults", // Mapped: Verbal harassment can be considered a form of assault
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T05:14:00.000Z",
        "updated_at": "2025-06-04T05:14:00.000Z",
        "secret_code": "HARASS002",
        "report_id": "R002",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9070,
              "lng": -77.0285,
              "address": "1300 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "3",
        "case_number": "CASE-003",
        "tracking_code": "TRACK-003",
        "title": "Safety Violation in Construction",
        "description": "Workers not wearing required safety equipment",
        "category": "safety", // Unmapped: No direct match, safety violations don't fit new categories
        "priority": "medium",
        "status": "resolved",
        "created_at": "2025-06-04T05:14:00.000Z",
        "updated_at": "2025-06-04T05:14:00.000Z",
        "secret_code": "SAFETY003",
        "report_id": "R003",
        "reward_status": "paid",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9075,
              "lng": -77.0275,
              "address": "1350 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "4",
        "case_number": "CASE-004",
        "tracking_code": "TRACK-004",
        "title": "Discrimination Complaint",
        "description": "Allegations of age discrimination in hiring process",
        "category": "discrimination", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "under_investigation",
        "created_at": "2025-06-04T05:14:00.000Z",
        "updated_at": "2025-06-04T05:14:00.000Z",
        "secret_code": "DISC004",
        "report_id": "R004",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9078,
              "lng": -77.0295,
              "address": "1450 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "5",
        "case_number": "CASE-005",
        "tracking_code": "TRACK-005",
        "title": "Corruption Investigation",
        "description": "Suspicious contract awards to specific vendors",
        "category": "corruption", // Unmapped: No direct match, possibly related to "Robbery" but corruption is more specific
        "priority": "critical",
        "status": "open",
        "created_at": "2025-06-04T05:14:00.000Z",
        "updated_at": "2025-06-04T05:14:00.000Z",
        "secret_code": "CORR005",
        "report_id": "R005",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9073,
              "lng": -77.0290,
              "address": "1325 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "6",
        "case_number": "CASE-006",
        "tracking_code": "TRACK-006",
        "title": "Unauthorized Data Access",
        "description": "Employee accessed sensitive client data without permission",
        "category": "data_breach", // Unmapped: No direct match in new categories
        "priority": "critical",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "DATA006",
        "report_id": "R006",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9120,
              "lng": -77.0300,
              "address": "1500 L St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "7",
        "case_number": "CASE-007",
        "tracking_code": "TRACK-007",
        "title": "Workplace Theft",
        "description": "Office equipment reported missing from storage",
        "category": "theft", // Mapped: Direct match to "Theft / Larceny"
        "priority": "medium",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "THEFT007",
        "report_id": "R007",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9050,
              "lng": -77.0260,
              "address": "1200 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "8",
        "case_number": "CASE-008",
        "tracking_code": "TRACK-008",
        "title": "Environmental Violation",
        "description": "Improper disposal of hazardous materials detected",
        "category": "nuisance", // Mapped: Improper disposal can be considered a public nuisance
        "priority": "high",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "ENV008",
        "report_id": "R008",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9100,
              "lng": -77.0320,
              "address": "1600 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "9",
        "case_number": "CASE-009",
        "tracking_code": "TRACK-009",
        "title": "Insider Trading Allegation",
        "description": "Suspicious stock transactions by senior management",
        "category": "fraud", // Unmapped: No direct match, possibly "Theft / Larceny" but fraud is more specific
        "priority": "critical",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "FRAUD009",
        "report_id": "R009",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9040,
              "lng": -77.0310,
              "address": "1100 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "10",
        "case_number": "CASE-010",
        "tracking_code": "TRACK-010",
        "title": "Workplace Safety Concern",
        "description": "Faulty machinery reported in production area",
        "category": "safety", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "resolved",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "SAFETY010",
        "report_id": "R010",
        "reward_status": "paid",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9130,
              "lng": -77.0250,
              "address": "1550 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "11",
        "case_number": "CASE-011",
        "tracking_code": "TRACK-011",
        "title": "Gender Discrimination Complaint",
        "description": "Unequal treatment reported in promotions",
        "category": "discrimination", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "DISC011",
        "report_id": "R011",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9060,
              "lng": -77.0330,
              "address": "1250 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "12",
        "case_number": "CASE-012",
        "tracking_code": "TRACK-012",
        "title": "Bribery Allegation",
        "description": "Suspected payments to secure government contracts",
        "category": "corruption", // Unmapped: No direct match, possibly related to "Robbery" but corruption is more specific
        "priority": "critical",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "CORR012",
        "report_id": "R012",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9115,
              "lng": -77.0340,
              "address": "1650 L St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "13",
        "case_number": "CASE-013",
        "tracking_code": "TRACK-013",
        "title": "Employee Misconduct",
        "description": "Inappropriate behavior reported during team meeting",
        "category": "disorderly_conduct", // Mapped: Inappropriate behavior aligns with "Disorderly Conduct / Disturbances"
        "priority": "medium",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "MIS013",
        "report_id": "R013",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9030,
              "lng": -77.0270,
              "address": "1150 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "14",
        "case_number": "CASE-014",
        "tracking_code": "TRACK-014",
        "title": "Fraudulent Expense Claims",
        "description": "Unverified expense reports submitted by employee",
        "category": "theft", // Mapped: Fraudulent expense claims can be considered "Theft / Larceny"
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "FRAUD014",
        "report_id": "R014",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9140,
              "lng": -77.0295,
              "address": "1700 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "15",
        "case_number": "CASE-015",
        "tracking_code": "TRACK-015",
        "title": "Workplace Bullying",
        "description": "Ongoing intimidation reported by junior staff",
        "category": "assaults", // Mapped: Bullying/intimidation can be considered a form of assault
        "priority": "high",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "HARASS015",
        "report_id": "R015",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9020,
              "lng": -77.0325,
              "address": "1050 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "16",
        "case_number": "CASE-016",
        "tracking_code": "TRACK-016",
        "title": "Health Code Violation",
        "description": "Unsanitary conditions reported in cafeteria",
        "category": "nuisance", // Mapped: Unsanitary conditions can be considered a public nuisance
        "priority": "medium",
        "status": "resolved",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "HEALTH016",
        "report_id": "R016",
        "reward_status": "paid",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9095,
              "lng": -77.0240,
              "address": "1450 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "17",
        "case_number": "CASE-017",
        "tracking_code": "TRACK-017",
        "title": "Racial Discrimination Complaint",
        "description": "Alleged bias in team assignments",
        "category": "discrimination", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "DISC017",
        "report_id": "R017",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9150,
              "lng": -77.0315,
              "address": "1750 L St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "18",
        "case_number": "CASE-018",
        "tracking_code": "TRACK-018",
        "title": "Vendor Kickback Scheme",
        "description": "Suspected payments for favorable vendor selection",
        "category": "corruption", // Unmapped: No direct match, possibly related to "Robbery" but corruption is more specific
        "priority": "critical",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "CORR018",
        "report_id": "R018",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9015,
              "lng": -77.0280,
              "address": "1000 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "19",
        "case_number": "CASE-019",
        "tracking_code": "TRACK-019",
        "title": "Fire Safety Noncompliance",
        "description": "Blocked fire exits reported in office building",
        "category": "safety", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "SAFETY019",
        "report_id": "R019",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9085,
              "lng": -77.0350,
              "address": "1625 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "20",
        "case_number": "CASE-020",
        "tracking_code": "TRACK-020",
        "title": "Embezzlement Suspected",
        "description": "Discrepancies found in financial records",
        "category": "theft", // Mapped: Embezzlement aligns with "Theft / Larceny"
        "priority": "critical",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "FRAUD020",
        "report_id": "R020",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9160,
              "lng": -77.0265,
              "address": "1800 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "21",
        "case_number": "CASE-021",
        "tracking_code": "TRACK-021",
        "title": "Sexual Harassment Allegation",
        "description": "Inappropriate comments reported in workplace",
        "category": "assaults", // Mapped: Inappropriate comments can be considered a form of assault
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "HARASS021",
        "report_id": "R021",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9045,
              "lng": -77.0345,
              "address": "1225 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "22",
        "case_number": "CASE-022",
        "tracking_code": "TRACK-022",
        "title": "Non-Compliant Hiring Practices",
        "description": "Failure to follow diversity hiring guidelines",
        "category": "discrimination", // Unmapped: No direct match in new categories
        "priority": "medium",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "DISC022",
        "report_id": "R022",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9125,
              "lng": -77.0235,
              "address": "1525 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "23",
        "case_number": "CASE-023",
        "tracking_code": "TRACK-023",
        "title": "Conflict of Interest",
        "description": "Employee involved in vendor selection has personal ties",
        "category": "corruption", // Unmapped: No direct match, possibly related to "Robbery" but corruption is more specific
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "CORR023",
        "report_id": "R023",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9035,
              "lng": -77.0305,
              "address": "1125 K St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "24",
        "case_number": "CASE-024",
        "tracking_code": "TRACK-024",
        "title": "Equipment Safety Issue",
        "description": "Malfunctioning safety guards on machinery",
        "category": "safety", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "resolved",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "SAFETY024",
        "report_id": "R024",
        "reward_status": "paid",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9105,
              "lng": -77.0220,
              "address": "1475 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "25",
        "case_number": "CASE-025",
        "tracking_code": "TRACK-025",
        "title": "Falsified Time Records",
        "description": "Employee reported inflating work hours",
        "category": "theft", // Mapped: Falsifying time records aligns with "Theft / Larceny" (stealing time)
        "priority": "medium",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "FRAUD025",
        "report_id": "R025",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9165,
              "lng": -77.0335,
              "address": "1825 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "26",
        "case_number": "CASE-026",
        "tracking_code": "TRACK-026",
        "title": "Retaliation Complaint",
        "description": "Employee faced demotion after reporting misconduct",
        "category": "retaliation", // Unmapped: No direct match in new categories
        "priority": "high",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "RETAL026",
        "report_id": "R026",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9025,
              "lng": -77.0255,
              "address": "1075 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "27",
        "case_number": "CASE-027",
        "tracking_code": "TRACK-027",
        "title": "Improper Waste Disposal",
        "description": "Chemical waste dumped without proper permits",
        "category": "nuisance", // Mapped: Improper waste disposal can be considered a public nuisance
        "priority": "critical",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "ENV027",
        "report_id": "R027",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9145,
              "lng": -77.0355,
              "address": "1775 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "28",
        "case_number": "CASE-028",
        "tracking_code": "TRACK-028",
        "title": "Unreported Workplace Injury",
        "description": "Employee injury not documented properly",
        "category": "safety", // Unmapped: No direct match in new categories
        "priority": "medium",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "SAFETY028",
        "report_id": "R028",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9070,
              "lng": -77.0225,
              "address": "1300 I St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "29",
        "case_number": "CASE-029",
        "tracking_code": "TRACK-029",
        "title": "Misuse of Company Resources",
        "description": "Employee using company vehicles for personal use",
        "category": "motor_vehicle_theft", // Mapped: Misuse of company vehicles aligns with "Motor Vehicle Theft"
        "priority": "medium",
        "status": "under_investigation",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "MIS029",
        "report_id": "R029",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9110,
              "lng": -77.0360,
              "address": "1675 M St NW, Washington, DC 20005"
            }
          }
        }
      },
      {
        "id": "30",
        "case_number": "CASE-030",
        "tracking_code": "TRACK-030",
        "title": "Payroll Fraud",
        "description": "Ghost employees detected on payroll system",
        "category": "theft", // Mapped: Payroll fraud (ghost employees) aligns with "Theft / Larceny"
        "priority": "critical",
        "status": "open",
        "created_at": "2025-06-04T03:17:00.000Z",
        "updated_at": "2025-06-04T03:17:00.000Z",
        "secret_code": "FRAUD030",
        "report_id": "R030",
        "reward_status": "pending",
        "structured_data": {
          "incident": {
            "location": {
              "lat": 38.9155,
              "lng": -77.0245,
              "address": "1725 I St NW, Washington, DC 20005"
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
        center: [38.90767, -77.02858], // New center coordinates
        zoom: 17, // Increased zoom level for better focus on the area
        zoomControl: false,
        attributionControl: false,
        minZoom: 15, // Prevent zooming out too far
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

      // Add a marker for the Convention Center
      const conventionCenterIcon = L.divIcon({
        className: 'convention-center-marker',
        html: `<div style="
          background-color: #2196F3;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([38.90767, -77.02858], { icon: conventionCenterIcon })
        .bindPopup(`
          <div style="
            padding: 8px;
            background: white;
            color: #333;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">Center Point</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">Lat: 38.90767, Lng: -77.02858</p>
          </div>
        `)
        .addTo(map.current);

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
          const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar custom-switcher-card');
          div.innerHTML = `
            <div class="switcher-card modern">
              <div class="switcher-header modern">
                <span class="switcher-icon modern">${viewMode === 'cases'
                  ? '<svg width="20" height="20" fill="none" stroke="#2196F3" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6l9-4 9 4M4 10v6a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 002-2v-6"/></svg>'
                  : '<svg width="20" height="20" fill="none" stroke="#FF5722" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>'}
                </span>
                <span class="switcher-title modern">${viewMode === 'cases' ? 'Cases View' : 'Heatmap View'}</span>
              </div>
              <button id="viewModeToggle" class="modern-switch-btn ${viewMode === 'cases' ? 'cases' : 'heatmap'}">
                <span class="modern-switch-btn-icon">${viewMode === 'cases'
                  ? '<svg width="18" height="18" fill="none" stroke="#FF5722" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>'
                  : '<svg width="18" height="18" fill="none" stroke="#2196F3" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6l9-4 9 4M4 10v6a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 012-2h0a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 002-2v-6"/></svg>'}
                </span>
                <span class="modern-switch-btn-label">Switch to ${viewMode === 'cases' ? 'Heatmap View' : 'Cases View'}</span>
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
        // Determine marker color based on priority
        let markerColor;
        switch(case_.priority) {
          case 'critical':
            markerColor = '#F44336'; // Red
            break;
          case 'high':
            markerColor = '#FFC107'; // Yellow
            break;
          case 'medium':
            markerColor = '#4CAF50'; // Green
            break;
          default:
            markerColor = '#4CAF50'; // Default to green
        }

        const customIcon = L.divIcon({
          className: `custom-marker ${markerColor}`,
          html: `<div style="
            background-color: ${markerColor};
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <i class="${categoryIcons[case_.category]}" style="
              color: white;
              font-size: 24px;
            "></i>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const popupContent = `
          <div style="
            min-width: 280px;
            max-width: 90vw;
            background: white;
            color: #333;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            overflow: hidden;
          ">
            <div style="
              padding: 16px;
              border-bottom: 1px solid #eee;
              background: ${markerColor};
              color: white;
            ">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; line-height: 1.3;">${case_.title}</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Case ID: ${case_.tracking_code}</p>
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

              <div style="
                background: #f8f9fa;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <i class="fa-solid fa-location-dot" style="color: #666;"></i>
                <p style="margin: 0; font-size: 13px; color: #333;">
                  ${case_.structured_data?.incident?.location?.address || 'Address not available'}
                </p>
              </div>

              ${case_.reward_amount ? `
                <div style="
                  background: #f8f9fa;
                  padding: 12px;
                  border-radius: 8px;
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
                  padding: 14px;
                  background: ${markerColor};
                  color: white;
                  border: none;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  position: relative;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  -webkit-tap-highlight-color: transparent;
                "
                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'"
              >
                ${deployingDrone === case_.id ? `
                  <div style="
                    width: 18px;
                    height: 18px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                  "></div>
                  <span>Deploying Drone...</span>
                ` : `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>Deploy Drone</span>
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
          location = generateRandomLocation(38.90767, -77.02858);
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
      const gridSize = 0.0003; // Even smaller grid size for more detailed heatmap
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

      // Add legend
      const LegendControl = L.Control.extend({
        options: {
          position: 'bottomleft'
        },
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
          div.innerHTML = `
            <div style="
              background-color: rgba(255, 255, 255, 0.98);
              padding: 16px;
              border-radius: 10px;
              color: #333;
              font-size: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              backdrop-filter: blur(8px);
            ">
              <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Safety Level</h4>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; background-color: ${safetyColors.safe}; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;"></div>
                  <span style="font-weight: 500;">Safe</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; background-color: ${safetyColors.warning}; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;"></div>
                  <span style="font-weight: 500;">Warning</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; background-color: ${safetyColors.danger}; border: 1px solid rgba(0,0,0,0.1); border-radius: 4px;"></div>
                  <span style="font-weight: 500;">Danger</span>
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
