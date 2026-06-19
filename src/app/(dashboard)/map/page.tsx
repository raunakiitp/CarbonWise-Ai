"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Filter } from "lucide-react";
import type { MapPlaceType, GreenPlace } from "@/types";

const PLACE_TYPES: { type: MapPlaceType; icon: string; label: string; color: string }[] = [
  { type: "recycling_center", icon: "♻️", label: "Recycling Centers", color: "#22c55e" },
  { type: "ev_charging", icon: "⚡", label: "EV Charging", color: "#3b82f6" },
  { type: "public_transport", icon: "🚌", label: "Transport Hubs", color: "#f59e0b" },
  { type: "sustainable_store", icon: "🌿", label: "Eco Stores", color: "#10b981" },
  { type: "community_event", icon: "🤝", label: "Community Events", color: "#a855f7" },
];

// Demo places (in real app, fetched from Google Places API)
const DEMO_PLACES: GreenPlace[] = [
  { id: "1", name: "City Recycling Centre", type: "recycling_center", address: "123 Green St", lat: 51.505, lng: -0.09, rating: 4.2, isOpen: true },
  { id: "2", name: "EV FastCharge Hub", type: "ev_charging", address: "456 Electric Ave", lat: 51.508, lng: -0.085, rating: 4.5, isOpen: true },
  { id: "3", name: "Central Bus Terminal", type: "public_transport", address: "789 Transit Rd", lat: 51.502, lng: -0.095, rating: 3.8, isOpen: true },
  { id: "4", name: "Green Earth Market", type: "sustainable_store", address: "321 Eco Ln", lat: 51.51, lng: -0.082, rating: 4.7, isOpen: true },
  { id: "5", name: "Community Clean-up Drive", type: "community_event", address: "City Park", lat: 51.5, lng: -0.1, rating: 4.9, isOpen: true },
  { id: "6", name: "Southside Recycling Depot", type: "recycling_center", address: "55 Recycle Rd", lat: 51.496, lng: -0.088, rating: 3.9, isOpen: false },
];

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<MapPlaceType | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<GreenPlace | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation({ lat: 51.505, lng: -0.09 }) // Default: London
    );
  }, []);

  const filteredPlaces = activeFilter === "all"
    ? DEMO_PLACES
    : DEMO_PLACES.filter((p) => p.type === activeFilter);

  const mapSrc = userLocation && apiKey && apiKey !== "your_google_maps_api_key"
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=recycling+center+near+me&center=${userLocation.lat},${userLocation.lng}&zoom=13`
    : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🗺️ Eco Map</h1>
        <p className="page-subtitle">Discover sustainability resources near you.</p>
      </div>

      {/* Filter Panel */}
      <nav className="map-filter-panel" aria-label="Place type filters" style={{ marginBottom: "var(--space-6)", display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Filter size={14} aria-hidden="true" /> Filter:
        </span>
        <button
          onClick={() => setActiveFilter("all")}
          className={`btn btn-sm ${activeFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          aria-pressed={activeFilter === "all"}
        >
          All Places
        </button>
        {PLACE_TYPES.map((pt) => (
          <button
            key={pt.type}
            onClick={() => setActiveFilter(pt.type)}
            className={`btn btn-sm ${activeFilter === pt.type ? "btn-primary" : "btn-secondary"}`}
            aria-pressed={activeFilter === pt.type}
          >
            {pt.icon} {pt.label}
          </button>
        ))}
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "var(--space-6)" }}>
        {/* Places List */}
        <aside aria-label="Nearby eco places">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--border-default)" }}>
              <h2 style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-base)" }}>
                {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""} found
              </h2>
            </div>
            <div style={{ maxHeight: 600, overflowY: "auto" }}>
              {filteredPlaces.map((place) => {
                const type = PLACE_TYPES.find((pt) => pt.type === place.type);
                return (
                  <button
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "var(--space-4)",
                      borderBottom: "1px solid var(--border-muted)",
                      background: selectedPlace?.id === place.id ? "var(--bg-muted)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "background var(--transition-fast)",
                    }}
                    aria-selected={selectedPlace?.id === place.id}
                    aria-label={`${place.name} - ${type?.label}`}
                    onMouseEnter={(e) => { if (selectedPlace?.id !== place.id) (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; }}
                    onMouseLeave={(e) => { if (selectedPlace?.id !== place.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }} aria-hidden="true">{type?.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)", marginBottom: "var(--space-1)" }} className="truncate">{place.name}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>{place.address}</div>
                        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                          <span className={`badge ${place.isOpen ? "badge-green" : "badge-gray"}`} aria-label={place.isOpen ? "Currently open" : "Currently closed"}>
                            {place.isOpen ? "Open" : "Closed"}
                          </span>
                          {place.rating && (
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }} aria-label={`Rating: ${place.rating} out of 5`}>
                              ⭐ {place.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <div>
          <div className="map-container" style={{ height: 600 }}>
            {mapSrc ? (
              <iframe
                src={mapSrc}
                width="100%"
                height="600"
                style={{ border: 0, borderRadius: "var(--radius-xl)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Eco-friendly places near you"
                aria-label="Google Maps showing eco-friendly places"
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(135deg, #0d2a1a, #0f172a)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-4)",
                  color: "rgba(255,255,255,0.6)",
                  borderRadius: "var(--radius-xl)",
                }}
                role="img"
                aria-label="Map placeholder - Google Maps API key required"
              >
                <div style={{ fontSize: 64 }} aria-hidden="true">🗺️</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "var(--weight-bold)", marginBottom: "var(--space-2)", color: "white" }}>
                    Google Maps Integration
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", maxWidth: 300, textAlign: "center" }}>
                    Add <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your .env.local file to enable the live map
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
                  {filteredPlaces.map((place) => {
                    const type = PLACE_TYPES.find((pt) => pt.type === place.type);
                    return (
                      <div key={place.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-4)", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)" }}>
                        <span aria-hidden="true">{type?.icon}</span> {place.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Place Detail */}
          {selectedPlace && (
            <div className="card" style={{ marginTop: "var(--space-4)" }} role="region" aria-label={`Details for ${selectedPlace.name}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>{selectedPlace.name}</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <MapPin size={14} aria-hidden="true" /> {selectedPlace.address}
                  </p>
                </div>
                <button onClick={() => setSelectedPlace(null)} className="btn btn-ghost btn-icon" aria-label="Close place details">✕</button>
              </div>
              <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  aria-label={`Get directions to ${selectedPlace.name}`}
                >
                  <Navigation size={14} aria-hidden="true" /> Get Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
