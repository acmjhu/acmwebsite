"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapEntry {
  id: string;
  name: string;
  company: string;
  role: string;
  term: string;
  year: string;
  lat: number;
  lng: number;
  contact: string | null;
  photoUrl: string | null;
}

// Fix Leaflet default icon broken in webpack/Next.js
function FixIcons() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
  return null;
}

// Slightly offset markers that share nearly identical coordinates
function applyJitter(entries: MapEntry[]): MapEntry[] {
  const JITTER = 0.012;
  const groups = new Map<string, MapEntry[]>();

  for (const entry of entries) {
    const key = `${entry.lat.toFixed(1)},${entry.lng.toFixed(1)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  const result: MapEntry[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      group.forEach((entry, i) => {
        const angle = (2 * Math.PI * i) / group.length;
        result.push({ ...entry, lat: entry.lat + JITTER * Math.cos(angle), lng: entry.lng + JITTER * Math.sin(angle) });
      });
    }
  }
  return result;
}

export default function InternMap({ entries }: { entries: MapEntry[] }) {
  const jittered = applyJitter(entries);

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      style={{ height: "500px", width: "100%" }}
      className="rounded-xl"
    >
      <FixIcons />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {jittered.map((entry) => (
        <Marker key={entry.id} position={[entry.lat, entry.lng]}>
          <Popup minWidth={200}>
            <div className="space-y-1 text-sm">
              {entry.photoUrl && (
                <img
                  src={entry.photoUrl}
                  alt={entry.name}
                  className="mb-2 h-16 w-16 rounded-full object-cover"
                />
              )}
              <p className="text-base font-bold">{entry.name}</p>
              <p className="text-gray-700">{entry.role} at {entry.company}</p>
              <p className="text-gray-500">{entry.term} &middot; {entry.year}</p>
              {entry.contact && (
                <p className="mt-1 text-gray-600">{entry.contact}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
