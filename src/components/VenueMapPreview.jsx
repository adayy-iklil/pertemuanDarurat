import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function VenueMapPreview({
  lat = -6.271212,
  lng = 106.8234562,
  venueName = 'Kopi Kenangan - Kemang Timur',
  address = 'Jl. Kemang Timur No. 83, Jakarta Selatan',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize Map with OpenStreetMap Standard / High-Clarity Tiles (0 API Key Required)
    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 17,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    // High clarity real street tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // 500m geofence radius
    L.circle([lat, lng], {
      radius: 500,
      color: '#ef4444',
      weight: 2,
      dashArray: '5, 8',
      fillColor: '#ef4444',
      fillOpacity: 0.1,
    }).addTo(map);

    // Custom High-Visibility Animated Marker
    const pinIcon = L.divIcon({
      className: 'venue-target-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: #ef4444; 
            color: #ffffff; 
            font-size: 11px; 
            font-weight: 800; 
            font-family: monospace; 
            padding: 3px 8px; 
            border-radius: 4px; 
            border: 2px solid #ffffff; 
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.7);
            white-space: nowrap;
            margin-bottom: 3px;
          ">
            ☕ KOPI KENANGAN (TITIK KUMPUL)
          </div>
          <div style="
            width: 22px; 
            height: 22px; 
            background: #dc2626; 
            border: 3px solid #ffffff; 
            border-radius: 50%; 
            box-shadow: 0 0 15px #ff2222;
          "></div>
        </div>
      `,
      iconSize: [200, 50],
      iconAnchor: [100, 48],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 180px;">
        <strong style="color: #ef4444; font-size: 13px;">☕ ${venueName}</strong>
        <p style="margin: 4px 0 8px; color: #475569; font-size: 11px;">${address}</p>
        <span style="display:inline-block; background:#ef4444; color:white; padding:3px 7px; border-radius:3px; font-size:10px; font-weight:bold;">
          TITIK KUMPUL RESMI 9 PASUKAN
        </span>
      </div>
    `).openPopup();

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, venueName, address]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '320px',
        borderRadius: '4px',
        overflow: 'hidden',
        background: '#e2e8f0',
      }}
    />
  );
}
