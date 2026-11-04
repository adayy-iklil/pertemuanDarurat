import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function TacticalRadarMap({
  venue,
  personnel = [],
  currentUser = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const circleLayerRef = useRef(null);

  const venueLat = venue?.lat || -6.271212;
  const venueLng = venue?.lng || 106.8234562;
  const radiusMeters = venue?.radiusMeters || 500;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [venueLat, venueLng],
        zoom: 15,
        zoomControl: true,
      });

      // Dark style tile layer (CartoDB Dark Matter)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      circleLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venueLat, venueLng]);

  // Update Geofence Circle & Personnel Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !circleLayerRef.current || !markersLayerRef.current) return;

    circleLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    // 1. Draw 500 Meter Geofence Circle
    const geofenceCircle = L.circle([venueLat, venueLng], {
      radius: radiusMeters,
      color: '#ef4444',
      weight: 2,
      dashArray: '6, 8',
      fillColor: '#ef4444',
      fillOpacity: 0.12,
    });
    geofenceCircle.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #111;">
        <strong style="color: #ef4444;">BATAS GEOFENCE 500M</strong><br/>
        Titik Pusat: ${venue?.name || 'Kopi Kenangan Kemang Timur'}<br/>
        Radius: <strong>500 Meter</strong><br/>
        Batas Jam: <strong>18.00 WIB</strong>
      </div>
    `);
    circleLayerRef.current.addLayer(geofenceCircle);

    // 2. Draw Venue Center Marker (HQ)
    const venueIcon = L.divIcon({
      className: 'custom-venue-pin',
      html: `
        <div style="
          width: 28px; 
          height: 28px; 
          background: #ef4444; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 20px #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 13px;
        ">☕</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const venueMarker = L.marker([venueLat, venueLng], { icon: venueIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #111;">
          <strong style="color: #ef4444; font-size: 13px;">☕ ${venue?.name}</strong><br/>
          <p style="margin: 4px 0;">${venue?.address}</p>
          <span style="display:inline-block; background:#ef4444; color:white; padding:2px 6px; border-radius:3px; font-size:10px; font-weight:bold;">TITIK KUMPUL RESMI</span>
        </div>
      `);
    markersLayerRef.current.addLayer(venueMarker);

    // 3. Draw Personnel Pins (Dapi, Adai, Khal, Bina, Ucup, Hilal, Awa, Ayas, Talita)
    personnel.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const isInside = p.is_inside_radius === 1 || p.distance_meters <= radiusMeters;
      const isSelected = currentUser && currentUser.id === p.id;

      // Pin Color: Green if inside 500m, Amber if OTW, Red if outside 500m
      const pinColor = isInside
        ? '#10b981'
        : p.status === 'otw'
        ? '#f59e0b'
        : '#ef4444';

      const userIcon = L.divIcon({
        className: 'custom-person-pin',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: ${pinColor};
            border: 2px solid ${isSelected ? '#ffffff' : '#111827'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            font-family: monospace;
            box-shadow: 0 0 ${isInside ? '8px #10b981' : '12px rgba(239, 68, 68, 0.8)'};
            transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
            transition: transform 0.2s;
          ">
            ${p.name.slice(0, 2).toUpperCase()}
            ${!isInside ? `<span style="position:absolute; top:-3px; right:-3px; width:10px; height:10px; background:#ef4444; border:1px solid white; border-radius:50%;"></span>` : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const distLabel =
        p.distance_meters < 1000
          ? `${Math.round(p.distance_meters)}m`
          : `${(p.distance_meters / 1000).toFixed(2)} km`;

      const marker = L.marker([p.latitude, p.longitude], { icon: userIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 175px; color: #111;">
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px; color: #0f172a;">
            ${p.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${p.tag || 'Personel'} • WA: ${p.phone || '-'}
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Jarak ke TKP:</span>
            <strong style="color: ${isInside ? '#10b981' : '#ef4444'}; font-family: monospace;">${distLabel}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>Status 500m:</span>
            <strong style="color: ${isInside ? '#10b981' : '#ef4444'};">
              ${isInside ? '✅ AMAN (DALAM)' : '🚨 DI LUAR RADIUS'}
            </strong>
          </div>
          <a href="https://wa.me/${p.phone}?text=${encodeURIComponent(`🚨 PERINGATAN DARURAT (18.00 WIB)\nHalo ${p.name}, kamu berada sejauh ${distLabel} dari Kopi Kenangan Kemang Timur. Segera merapat sebelum batas jam 18.00 WIB!`)}" 
             target="_blank" 
             style="display:block; text-align:center; background:#10b981; color:white; padding:5px; border-radius:4px; text-decoration:none; font-weight:bold; font-size:11px;">
             Hubungi via WhatsApp
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });
  }, [venue, personnel, currentUser, radiusMeters, venueLat, venueLng]);

  return (
    <div className="radar-map-wrapper">
      <div className="radar-map-hud-header">
        <div className="flex items-center gap-2">
          <span className="live-pulse-dot" />
          <span className="font-mono text-xs text-zinc-300 font-bold">
            RADAR GPS AKTIF // TITIK PUSAT: {venue?.name?.toUpperCase()}
          </span>
        </div>
        <div className="radar-legend font-mono">
          <span className="legend-item"><span className="legend-dot green" /> Dalam 500m</span>
          <span className="legend-item"><span className="legend-dot red" /> Di Luar 500m</span>
          <span className="legend-item"><span className="legend-dot circle" /> Batas 500m</span>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '420px', background: '#090a0f' }}
      />
    </div>
  );
}

