import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Navigation,
  Sparkles,
  Compass,
  Maximize2,
  X,
  Coffee,
  CheckCircle2,
  Radio,
  Car,
  BellRing,
  Send,
  Smartphone,
  Crosshair,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import {
  MEETING_INFO,
  INVITEES,
  EMERGENCY_RULES,
  calculateDistanceMeters
} from './data/summonsData';
import TacticalRadarMap from './components/TacticalRadarMap';

// Pure Web Audio API Sound Synthesizer (Zero External Audio Assets)
const playTacticalSound = (type = 'click', isMuted = false) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(640, ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {}
};

// Canvas Particle Confetti for Celebratory Moments
const triggerCanvasConfetti = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 65 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height * 0.4,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.8) * 14,
    size: Math.random() * 6 + 4,
    color: ['#ef4444', '#f59e0b', '#22c55e', '#ffffff', '#dc2626'][
      Math.floor(Math.random() * 5)
    ],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
  }));

  let frame = 0;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.012;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frame++;
    if (frame < 90) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(render);
};

export default function App() {
  const [strobeActive, setStrobeActive] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Active identity selected (Default Dapi)
  const [selectedId, setSelectedId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('untuk')?.toLowerCase();
    if (fromUrl && INVITEES.some((p) => p.id === fromUrl)) {
      return fromUrl;
    }
    return localStorage.getItem('pd_person_v4') || 'dapi';
  });

  // Client-Side Locations & Statuses (Tanpa DB, disimpan di localStorage)
  const [personnelLocations, setPersonnelLocations] = useState(() => {
    const saved = localStorage.getItem('pd_live_coords_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const init = {};
    INVITEES.forEach((p) => {
      init[p.id] = {
        lat: p.lat,
        lng: p.lng,
        status: p.defaultStatus,
        updatedAt: 'Baru saja',
      };
    });
    return init;
  });

  // Real device GPS active state
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [geoWatchId, setGeoWatchId] = useState(null);

  // Manual Trigger for 18:00 WIB Geofence Check
  const [is1800Simulated, setIs1800Simulated] = useState(false);

  useEffect(() => {
    localStorage.setItem('pd_person_v4', selectedId);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem('pd_live_coords_v4', JSON.stringify(personnelLocations));
  }, [personnelLocations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const selectedPerson = useMemo(
    () => INVITEES.find((p) => p.id === selectedId) || INVITEES[0],
    [selectedId]
  );

  // Computed Personnel with real-time distance from Kopi Kenangan Kemang Timur
  const enrichedPersonnel = useMemo(() => {
    return INVITEES.map((person) => {
      const loc = personnelLocations[person.id] || {
        lat: person.lat,
        lng: person.lng,
        status: person.defaultStatus,
        updatedAt: 'Awal',
      };

      const distance = calculateDistanceMeters(
        loc.lat,
        loc.lng,
        MEETING_INFO.coordinates.lat,
        MEETING_INFO.coordinates.lng
      );

      const isInside = distance <= MEETING_INFO.radiusMeters;

      return {
        ...person,
        latitude: loc.lat,
        longitude: loc.lng,
        distance_meters: distance,
        is_inside_radius: isInside ? 1 : 0,
        status: loc.status || person.defaultStatus,
        updated_at: loc.updatedAt,
      };
    });
  }, [personnelLocations]);

  // Attendance metrics
  const confirmedCount = useMemo(() => {
    return enrichedPersonnel.filter((p) => p.status === 'hadir').length;
  }, [enrichedPersonnel]);

  const otwCount = useMemo(() => {
    return enrichedPersonnel.filter((p) => p.status === 'otw').length;
  }, [enrichedPersonnel]);

  const quorumScore = confirmedCount + otwCount;
  const quorumPercentage = Math.round((quorumScore / INVITEES.length) * 100);

  // Geofence statistics
  const insideGeofenceCount = useMemo(() => {
    return enrichedPersonnel.filter((p) => p.is_inside_radius === 1).length;
  }, [enrichedPersonnel]);

  const outsideGeofencePersonnel = useMemo(() => {
    return enrichedPersonnel.filter((p) => p.is_inside_radius === 0);
  }, [enrichedPersonnel]);

  // Check if current wall-clock time is past 18:00 WIB or manually simulated
  const isPast1800 = useMemo(() => {
    if (is1800Simulated) return true;
    const currentHour = now.getHours();
    return currentHour >= 18;
  }, [now, is1800Simulated]);

  // Update a person's coordinates & status
  const updatePersonLocation = (personId, newLat, newLng, newStatus = null) => {
    setPersonnelLocations((prev) => {
      const current = prev[personId] || {};
      return {
        ...prev,
        [personId]: {
          lat: newLat,
          lng: newLng,
          status: newStatus || current.status || 'hadir',
          updatedAt: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      };
    });

    const pName = INVITEES.find((p) => p.id === personId)?.name || personId;
    const dist = calculateDistanceMeters(
      newLat,
      newLng,
      MEETING_INFO.coordinates.lat,
      MEETING_INFO.coordinates.lng
    );
    const inside = dist <= MEETING_INFO.radiusMeters;

    playTacticalSound(inside ? 'success' : 'click', isAudioMuted);
    showToast(
      `Posisi ${pName} diperbarui: ${dist}m (${
        inside ? '✅ Dalam 500m' : '🚨 Di Luar 500m'
      })`
    );

    if (inside && newStatus === 'hadir') {
      triggerCanvasConfetti();
    }
  };

  const setPersonStatusOnly = (personId, newStatus) => {
    playTacticalSound(newStatus === 'hadir' ? 'success' : 'click', isAudioMuted);
    setPersonnelLocations((prev) => {
      const current = prev[personId] || {};
      return {
        ...prev,
        [personId]: {
          ...current,
          status: newStatus,
        },
      };
    });

    const pName = INVITEES.find((p) => p.id === personId)?.name || personId;
    showToast(`Status ${pName} diubah ke: ${newStatus.toUpperCase()}`);

    if (newStatus === 'hadir') {
      triggerCanvasConfetti();
    }
  };

  // Toggle Real Phone / Browser Geolocation
  const toggleDeviceGps = () => {
    if (isGpsStreaming) {
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
        setGeoWatchId(null);
      }
      setIsGpsStreaming(false);
      showToast('GPS Real-time dimatikan');
    } else {
      if (!('geolocation' in navigator)) {
        showToast('Browser Anda tidak mendukung GPS Geolocation');
        return;
      }

      setIsGpsStreaming(true);
      showToast(`Mengaktifkan GPS perangkat untuk ${selectedPerson.name}...`);

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updatePersonLocation(
            selectedPerson.id,
            pos.coords.latitude,
            pos.coords.longitude,
            'otw'
          );
        },
        (err) => {
          showToast(`Gagal membaca GPS: ${err.message}`);
          setIsGpsStreaming(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );

      setGeoWatchId(watchId);
    }
  };

  const copyToClipboard = async (text, key, toastLabel = 'Berhasil disalin!') => {
    try {
      await navigator.clipboard.writeText(text);
      playTacticalSound('click', isAudioMuted);
      setCopiedKey(key);
      showToast(toastLabel);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      showToast('Gagal menyalin text');
    }
  };

  // WhatsApp Broadcast Template for Group
  const waGroupText = useMemo(() => {
    const listText = enrichedPersonnel
      .map((p) => {
        const isInside = p.is_inside_radius === 1;
        const distLabel =
          p.distance_meters < 1000
            ? `${p.distance_meters}m`
            : `${(p.distance_meters / 1000).toFixed(2)}km`;
        const radiusIcon = isInside ? '🟢 [DALAM 500M]' : '🔴 [DI LUAR 500M]';
        return `${p.no}. ${p.name} (${p.phone}) — Jarak: ${distLabel} ${radiusIcon}`;
      })
      .join('\n');

    return `🚨 *PERINGATAN DARURAT RADIUS GEOFENCE (BATAS 18.00 WIB)* 🚨
*Titik Kumpul:* ${MEETING_INFO.venue}
*Radius Wajib:* 500 Meter
*Maps:* ${MEETING_INFO.mapsUrl}

📋 *STATUS POSISI 9 PASUKAN:*
${listText}

⚠️ _Peringatan: Seluruh personel yang masih di luar 500m wajib tancap gas sekarang juga tanpa alasan wacana!_`;
  }, [enrichedPersonnel]);

  // Generate specific WhatsApp urgent notification for a single person
  const createPersonalWaAlertLink = (person) => {
    const distLabel =
      person.distance_meters < 1000
        ? `${person.distance_meters} meter`
        : `${(person.distance_meters / 1000).toFixed(2)} km`;

    const text = `🚨 *PERINGATAN DARURAT (BATAS 18.00 WIB)* 🚨
Halo *${person.name}*, sistem radar mendeteksi posisi kamu saat ini berada sejauh *${distLabel}* di LUAR radius 500 meter dari Kopi Kenangan Kemang Timur.

📍 *Titik Kumpul:* ${MEETING_INFO.venue}
🗺️ *Link Lokasi:* ${MEETING_INFO.mapsUrl}
⚠️ *Instruksi:* Jam 18.00 WIB sudah berlaku! Segera merapat sekarang juga, dilarang ngaret & dilarang wacana!`;

    return `https://wa.me/${person.phone}?text=${encodeURIComponent(text)}`;
  };

  // Filtered invitees
  const filteredInvitees = useMemo(() => {
    if (activeTabFilter === 'hadir') {
      return enrichedPersonnel.filter((p) => p.status === 'hadir');
    }
    if (activeTabFilter === 'otw') {
      return enrichedPersonnel.filter((p) => p.status === 'otw');
    }
    if (activeTabFilter === 'belum') {
      return enrichedPersonnel.filter((p) => p.status === 'belum');
    }
    return enrichedPersonnel;
  }, [activeTabFilter, enrichedPersonnel]);

  return (
    <div className="dark-military-theme">
      {/* Background layers */}
      <div className="bg-photo-backdrop" />
      <div className="bg-grid-overlay" />
      <div className="scanline-fx" />

      {/* Red Alert Ambient Glow Overlay */}
      <div
        className={`emergency-strobe-overlay ${strobeActive ? 'active' : 'paused'}`}
      />

      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="tactical-toast">
          <Sparkles size={16} className="text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Modal for Evidence Photo */}
      {lightboxOpen && (
        <div className="lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <div
            className="lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                <span className="font-mono text-xs tracking-widest text-red-400 font-bold">
                  INSPEKSI VISUAL BERKAS #01 // 9 PERSONEL RESMI
                </span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxOpen(false)}
                title="Tutup Preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-body">
              <img
                src="/foto-pasukan.jpg"
                alt="Foto 9 Pasukan Lengkap"
                className="lightbox-img"
              />
              <div className="lightbox-hud-footer">
                <span>TARGET: DAPI, ADAI, KHAL, BINA, UCUP, HILAL, AWA, AYAS, TALITA</span>
                <span className="text-red-400">STATUS: TERVERIFIKASI ASLI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Critical Status Header */}
      <header className={`siren-top-bar ${strobeActive ? 'flashing' : ''}`}>
        <div className="siren-status-left">
          <span className="blinking-led" />
          <span className="siren-headline">
            RADAR PERTEMUAN DARURAT // BATAS 18.00 WIB // RADIUS 500M // {MEETING_INFO.venue.toUpperCase()}
          </span>
        </div>

        <div className="siren-controls">
          <button
            type="button"
            className="hud-toggle-btn"
            onClick={() => {
              setIsAudioMuted((prev) => !prev);
              playTacticalSound('click', !isAudioMuted);
            }}
            title={isAudioMuted ? 'Aktifkan Audio Efek' : 'Senyapkan Audio Efek'}
          >
            {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isAudioMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
          </button>

          <button
            type="button"
            className="hud-toggle-btn alert-toggle"
            onClick={() => {
              playTacticalSound('siren', isAudioMuted);
              setStrobeActive((prev) => !prev);
            }}
          >
            <Radio size={14} className={strobeActive ? 'animate-pulse' : ''} />
            <span>{strobeActive ? 'SIRENE: NYALA' : 'SIRENE: REDA'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="page-container">
        <div className="emergency-frame">
          {/* Tactical Metadata Bar */}
          <div className="meta-bar">
            <div className="meta-cell">
              <span className="meta-label">KODE DOKUMEN</span>
              <span className="meta-val font-mono">{MEETING_INFO.code}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">STATUS TINGKAT</span>
              <span className="meta-val blink-red">
                <span className="red-dot-inline" />
                {MEETING_INFO.status}
              </span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">GEOFENCE RADIUS 500M</span>
              <span className="meta-val font-mono text-emerald-400">
                {insideGeofenceCount} / 9 Masuk Radius ({outsideGeofencePersonnel.length} Terlambat)
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RADAR GPS LIVE & MONITOR POSISI USER (BISA DILIHAT SEMUA ORANG) */}
          {/* ============================================================== */}
          <section className="radar-monitor-section">
            <div className="radar-section-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crosshair size={18} className="text-red-500 animate-pulse" />
                  <h2 className="font-mono text-base font-extrabold text-white tracking-wide">
                    PETA RADAR LIVE // POSISI 9 PASUKAN & GEOFENCE 500M
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Semua personel dapat melihat posisi satu sama lain secara transparan di peta interaktif. Lingkaran merah merupakan batas radius <strong>500 meter</strong> dari Kopi Kenangan Kemang Timur.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className={`btn-trigger-1800 font-mono ${isPast1800 ? 'active-warning' : ''}`}
                  onClick={() => {
                    setIs1800Simulated((prev) => !prev);
                    playTacticalSound('siren', isAudioMuted);
                    showToast(
                      !is1800Simulated
                        ? 'Simulasi Jam 18.00 WIB Diaktifkan: Pelanggar Radius Terdeteksi!'
                        : 'Simulasi Jam 18.00 WIB Dinonaktifkan'
                    );
                  }}
                >
                  <Clock size={15} />
                  {isPast1800
                    ? '⚠️ BATAS 18.00 WIB AKTIF (KLIK UNTUK RESET)'
                    : '⚡ SIMULASI CEK JAM 18.00 WIB'}
                </button>
              </div>
            </div>

            {/* Tactical Leaflet Map with all 9 Personnel Pins */}
            <TacticalRadarMap
              venue={{
                name: MEETING_INFO.venue,
                address: MEETING_INFO.fullAddress,
                lat: MEETING_INFO.coordinates.lat,
                lng: MEETING_INFO.coordinates.lng,
                radiusMeters: MEETING_INFO.radiusMeters,
              }}
              personnel={enrichedPersonnel}
              currentUser={selectedPerson}
            />

            {/* Geofence Status Alert Banner if past 18:00 */}
            {isPast1800 && (
              <div className="geofence-alert-box">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500 animate-bounce" />
                    <span className="font-mono text-sm font-bold text-red-400">
                      PERINGATAN RESMI: WAKTU SUDAH MELEBIHI 18.00 WIB!
                    </span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {outsideGeofencePersonnel.length} PERSONEL MASIH DI LUAR RADIUS 500M
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mb-3">
                  Sesuai protokol darurat, seluruh personel yang belum berada di dalam radius 500m Kopi Kenangan Kemang Timur wajib segera dikirimi notifikasi WhatsApp.
                </p>

                {outsideGeofencePersonnel.length > 0 ? (
                  <div className="violators-quick-grid">
                    {outsideGeofencePersonnel.map((violator) => (
                      <div key={violator.id} className="violator-card">
                        <div className="violator-info">
                          <strong className="text-white text-xs">{violator.name}</strong>
                          <span className="text-[11px] font-mono text-red-400">
                            Jarak: {violator.distance_meters < 1000 ? `${violator.distance_meters}m` : `${(violator.distance_meters / 1000).toFixed(2)}km`}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            WA: {violator.phone}
                          </span>
                        </div>
                        <a
                          href={createPersonalWaAlertLink(violator)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-send-wa-single font-mono text-xs"
                          onClick={() => playTacticalSound('click', isAudioMuted)}
                        >
                          <Send size={13} />
                          KIRIM NOTIFIKASI WA
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-emerald-400 font-bold py-2">
                    ✅ SEMUA 9 PERSONEL SUDAH TIBA DI DALAM RADIUS 500M KOPI KENANGAN!
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ============================================================== */}
          {/* USER GPS TRANSMITTER & SIMULASI POSISI (UNTUK MASING-MASING USER) */}
          {/* ============================================================== */}
          <section className="user-control-section">
            <div className="user-control-header">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-emerald-400" />
                <span className="font-mono text-xs font-bold text-white">
                  BAGIKAN POSISI GPS KAMU KE RADAR
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                Pilih Nama Kamu: <strong className="text-white">{selectedPerson.name}</strong>
              </span>
            </div>

            <div className="user-control-body">
              <div className="person-chips-inline">
                {INVITEES.map((p) => {
                  const currentLoc = enrichedPersonnel.find((x) => x.id === p.id);
                  const isInside = currentLoc?.is_inside_radius === 1;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`person-select-chip font-mono ${
                        selectedId === p.id ? 'active' : ''
                      }`}
                      onClick={() => {
                        setSelectedId(p.id);
                        playTacticalSound('click', isAudioMuted);
                      }}
                    >
                      <span>{p.name}</span>
                      <span
                        className={`status-dot ${isInside ? 'dot-hadir' : 'dot-otw'}`}
                        title={isInside ? 'Dalam 500m' : 'Di Luar 500m'}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Status and Action Buttons for Selected User */}
              <div className="selected-user-card">
                <div className="selected-user-meta">
                  <div className="text-xs font-mono text-zinc-300">
                    Posisi <strong>{selectedPerson.name}</strong> saat ini:{' '}
                    <span className="text-white font-bold">
                      {enrichedPersonnel.find((p) => p.id === selectedPerson.id)?.distance_meters} meter
                    </span>{' '}
                    dari Kopi Kenangan (
                    {enrichedPersonnel.find((p) => p.id === selectedPerson.id)?.is_inside_radius === 1 ? (
                      <span className="text-emerald-400 font-bold">Aman di Dalam 500m</span>
                    ) : (
                      <span className="text-red-400 font-bold">Di Luar Radius 500m</span>
                    )}
                    )
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Nomor WhatsApp Terhubung: <strong>{selectedPerson.phone}</strong>
                  </div>
                </div>

                <div className="selected-user-buttons">
                  <button
                    type="button"
                    className={`btn-gps-stream font-mono ${isGpsStreaming ? 'streaming' : ''}`}
                    onClick={toggleDeviceGps}
                  >
                    <Radio size={14} className={isGpsStreaming ? 'animate-pulse' : ''} />
                    {isGpsStreaming ? 'GPS HP AKTIF (STREAMING)' : 'AKTIFKAN GPS HP SAYA'}
                  </button>

                  <div className="sim-quick-actions">
                    <span className="text-[11px] font-mono text-zinc-400">Atau Pilih Simulasi:</span>
                    <button
                      type="button"
                      className="btn-sim-quick font-mono"
                      onClick={() =>
                        updatePersonLocation(
                          selectedPerson.id,
                          MEETING_INFO.coordinates.lat,
                          MEETING_INFO.coordinates.lng,
                          'hadir'
                        )
                      }
                    >
                      ☕ Sudah Sampai di Kopi Kenangan (0m)
                    </button>
                    <button
                      type="button"
                      className="btn-sim-quick font-mono"
                      onClick={() =>
                        updatePersonLocation(
                          selectedPerson.id,
                          -6.273100,
                          106.824200,
                          'otw'
                        )
                      }
                    >
                      🛵 Dekat Indomaret Kemang (225m)
                    </button>
                    <button
                      type="button"
                      className="btn-sim-quick font-mono"
                      onClick={() =>
                        updatePersonLocation(
                          selectedPerson.id,
                          -6.265500,
                          106.825800,
                          'otw'
                        )
                      }
                    >
                      🚗 Macet di Mampang (686m)
                    </button>
                    <button
                      type="button"
                      className="btn-sim-quick font-mono"
                      onClick={() =>
                        updatePersonLocation(
                          selectedPerson.id,
                          -6.289500,
                          106.819000,
                          'belum'
                        )
                      }
                    >
                      🏠 Masih di Rumah (2.1 km)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hero Section */}
          <section className="hero-grid">
            <div className="hero-copy">
              <div>
                <div className="urgent-badge-row">
                  <div className="urgent-pill">
                    <span className="red-dot-inline" />
                    INSTRUKSI KUMPUL MENDADAK
                  </div>
                  <div className="military-tag">NO WACANA POLICY</div>
                </div>

                <h1 className="hero-headline">
                  PERTEMUAN <span className="highlight-red">DARURAT</span>
                  <br />
                  WAJIB HADIR 9 PERSONEL.
                </h1>

                <p className="hero-desc">
                  Surat instruksi mutlak ditujukan kepada{' '}
                  <strong>
                    Dapi, Adai, Khal, Bina, Ucup, Hilal, Awa, Ayas, dan Talita
                  </strong>
                  . Sembilan orang yang terdata wajib hadir fisik di{' '}
                  <strong className="text-white">{MEETING_INFO.venue}</strong> tanpa pengecualian dan tanpa alasan dadakan.
                </p>

                {/* Event Schedule & Location Grid */}
                <div className="key-schedule-grid">
                  <div className="schedule-box">
                    <div className="schedule-kicker">
                      <Calendar size={13} />
                      WAKTU OPERASI
                    </div>
                    <div className="schedule-main">{MEETING_INFO.dayDate}</div>
                    <div className="schedule-sub">
                      Pukul {MEETING_INFO.timeStart} – {MEETING_INFO.timeEnd} {MEETING_INFO.timezone}
                    </div>
                  </div>
                  <div className="schedule-box">
                    <div className="schedule-kicker">
                      <MapPin size={13} />
                      TITIK LOKASI
                    </div>
                    <div className="schedule-main">{MEETING_INFO.venue}</div>
                    <div className="schedule-sub">Kemang Timur, Jakarta Selatan</div>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="btn-action-row">
                <a
                  href={MEETING_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-red"
                  onClick={() => playTacticalSound('click', isAudioMuted)}
                >
                  <Navigation size={16} />
                  BUKA GOOGLE MAPS
                  <ExternalLink size={14} className="opacity-70 ml-1" />
                </a>

                <a
                  href="#lokasi-venue"
                  className="btn-secondary-hud"
                  onClick={() => playTacticalSound('click', isAudioMuted)}
                >
                  <MapPin size={15} />
                  LIHAT PETA & NAVIGASI
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waGroupText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                  onClick={() => playTacticalSound('click', isAudioMuted)}
                >
                  <Share2 size={15} />
                  KIRIM RADAR KE GRUP WA
                </a>
              </div>
            </div>

            {/* Right: Tactical Evidence Photo HUD */}
            <div className="hero-photo-panel">
              <div className="photo-header-bar">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-red-400">
                    LAMPIRAN BUKTI FISIK #01
                  </span>
                </div>
                <div className="rec-indicator">
                  <span className="red-dot-inline" /> 9 TARGET TERDETEKSI
                </div>
              </div>

              <div
                className="photo-frame-wrapper group"
                onClick={() => {
                  playTacticalSound('click', isAudioMuted);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src="/foto-pasukan.jpg"
                  alt="9 Personel Pertemuan Darurat"
                  className="evidence-photo tactical"
                />

                <div className="corner-bracket top-left" />
                <div className="corner-bracket top-right" />
                <div className="corner-bracket bottom-left" />
                <div className="corner-bracket bottom-right" />

                <div className="photo-hud-overlay">
                  <div className="photo-top-hud">
                    <span className="photo-stamp-tag">FORMASI LENGKAP WAJIB</span>
                    <button
                      type="button"
                      className="zoom-pill"
                      title="Perbesar Bukti Foto"
                    >
                      <Maximize2 size={13} />
                      INSPEKSI
                    </button>
                  </div>
                  <div className="photo-caption-bottom">
                    <span className="text-zinc-300">9 TARGET WAJIB MERAPAT</span>
                    <span className="font-mono text-red-400 font-bold">
                      05.11.2026 // 17:30 WIB
                    </span>
                  </div>
                </div>
              </div>

              <div className="photo-caption-note">
                <Coffee size={14} className="text-amber-500" />
                <span>Titik kumpul resmi: Kopi Kenangan Kemang Timur</span>
              </div>
            </div>
          </section>

          {/* Live Countdown Clock Strip */}
          <section className="countdown-strip">
            <div className="countdown-info-col">
              <div className="countdown-badge">
                <Clock size={13} className="text-red-400" />
                HITUNG MUNDUR OPERASI
              </div>
              <div className="countdown-info-title">
                MENUJU KAMIS, 5 NOV 2026 — 17.30 WIB
              </div>
              <div className="countdown-info-sub">
                {MEETING_INFO.venue} • Batas Radius Geofence: 18.00 WIB
              </div>
            </div>

            <div className="timer-blocks">
              <div className="timer-cell">
                <span className="timer-num font-mono">00</span>
                <span className="timer-lbl">Hari</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell">
                <span className="timer-num font-mono">
                  {String(now.getHours()).padStart(2, '0')}
                </span>
                <span className="timer-lbl">Jam Sekarang</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell">
                <span className="timer-num font-mono">
                  {String(now.getMinutes()).padStart(2, '0')}
                </span>
                <span className="timer-lbl">Menit</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell red-sec">
                <span className="timer-num font-mono">
                  {String(now.getSeconds()).padStart(2, '0')}
                </span>
                <span className="timer-lbl">Detik</span>
              </div>
            </div>
          </section>

          {/* Manifest 9 Personel Section */}
          <section id="manifest-personel" className="section-block">
            <div className="section-top-bar">
              <div>
                <div className="section-kicker font-mono">
                  DAFTAR ABSENSI KESIAPAN FISIK
                </div>
                <h2 className="section-heading">Manifest 9 Pasukan & Nomor WhatsApp</h2>
              </div>

              <div className="filter-pill-group">
                <button
                  type="button"
                  className={`filter-btn ${activeTabFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('all')}
                >
                  Semua ({INVITEES.length})
                </button>
                <button
                  type="button"
                  className={`filter-btn ${activeTabFilter === 'hadir' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('hadir')}
                >
                  Hadir ({confirmedCount})
                </button>
                <button
                  type="button"
                  className={`filter-btn ${activeTabFilter === 'otw' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('otw')}
                >
                  OTW ({otwCount})
                </button>
                <button
                  type="button"
                  className={`filter-btn ${activeTabFilter === 'belum' ? 'active' : ''}`}
                  onClick={() => setActiveTabFilter('belum')}
                >
                  Belum ({INVITEES.length - quorumScore})
                </button>
              </div>
            </div>

            <div className="manifest-grid">
              {filteredInvitees.map((person) => {
                const isInside = person.is_inside_radius === 1;
                const distLabel =
                  person.distance_meters < 1000
                    ? `${person.distance_meters}m`
                    : `${(person.distance_meters / 1000).toFixed(2)}km`;

                return (
                  <div
                    key={person.id}
                    className={`manifest-card ${
                      selectedId === person.id ? 'is-selected' : ''
                    }`}
                  >
                    <div className="manifest-card-content">
                      <div className="manifest-card-top">
                        <span className="manifest-no font-mono">
                          NO. {person.no} • {person.role}
                        </span>
                        <span
                          className={`manifest-badge ${
                            isInside ? 'hadir' : 'belum'
                          }`}
                        >
                          {isInside ? (
                            <>
                              <CheckCircle2 size={12} /> {distLabel} (AMAN)
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} /> {distLabel} (&gt;500M)
                            </>
                          )}
                        </span>
                      </div>
                      <h3 className="manifest-name">{person.name}</h3>
                      <p className="manifest-note">{person.note}</p>

                      <div className="manifest-contact-row font-mono text-[11px] text-zinc-400 mt-2 mb-3">
                        <span>WA: <strong>{person.phone}</strong></span>
                        <a
                          href={`https://wa.me/${person.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Chat <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>

                    <div className="manifest-btn-group">
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          person.status === 'hadir' ? 'active-hadir' : ''
                        }`}
                        onClick={() => setPersonStatusOnly(person.id, 'hadir')}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          person.status === 'otw' ? 'active-otw' : ''
                        }`}
                        onClick={() => setPersonStatusOnly(person.id, 'otw')}
                      >
                        OTW
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          person.status === 'belum' ? 'active-belum' : ''
                        }`}
                        onClick={() => setPersonStatusOnly(person.id, 'belum')}
                      >
                        Belum
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dedicated Location & Venue Radar Section */}
          <section id="lokasi-venue" className="section-block venue-radar-section">
            <div className="section-top-bar">
              <div>
                <div className="section-kicker font-mono flex items-center gap-1.5">
                  <Compass size={14} className="text-red-500" />
                  RADAR TITIK KUMPUL & NAVIGASI
                </div>
                <h2 className="section-heading">Lokasi: {MEETING_INFO.venue}</h2>
              </div>
              <div className="status-live-pill font-mono">
                <span className="live-dot" /> GOOGLE MAPS AKTIF
              </div>
            </div>

            <div className="venue-radar-grid">
              <div className="venue-card">
                <div className="venue-header">
                  <div className="venue-title-row">
                    <div>
                      <h3 className="venue-title">{MEETING_INFO.venue}</h3>
                      <p className="venue-address-text">{MEETING_INFO.fullAddress}</p>
                    </div>
                    <button
                      type="button"
                      className="btn-copy-address"
                      onClick={() =>
                        copyToClipboard(
                          MEETING_INFO.fullAddress,
                          'addr',
                          'Alamat lengkap berhasil disalin!'
                        )
                      }
                      title="Salin Alamat Lengkap"
                    >
                      {copiedKey === 'addr' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedKey === 'addr' ? 'TERSALIN' : 'SALIN'}</span>
                    </button>
                  </div>

                  <div className="venue-coords-bar font-mono">
                    <span>KOORDINAT: {MEETING_INFO.coordinates.lat}, {MEETING_INFO.coordinates.lng}</span>
                    <span className="text-zinc-500">JAKARTA SELATAN</span>
                  </div>
                </div>

                <div className="map-iframe-container">
                  <iframe
                    title="Peta Kopi Kenangan Kemang Timur"
                    src={MEETING_INFO.embedMapUrl}
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="map-iframe-overlay-hud">
                    <span className="map-hud-pin">
                      <MapPin size={14} className="text-red-500 animate-bounce" />
                      TITIK KUMPUL RESMI
                    </span>
                  </div>
                </div>

                <div className="venue-actions-row">
                  <a
                    href={MEETING_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-red flex-1"
                    onClick={() => playTacticalSound('click', isAudioMuted)}
                  >
                    <Navigation size={16} />
                    BUKA DI GOOGLE MAPS APP
                    <ExternalLink size={14} />
                  </a>

                  <a
                    href={MEETING_INFO.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary-hud flex-1"
                    onClick={() => playTacticalSound('click', isAudioMuted)}
                  >
                    <Car size={16} />
                    NAVIGASI WAZE
                    <ExternalLink size={14} />
                  </a>

                  <button
                    type="button"
                    className="btn-outline-tactical"
                    onClick={() =>
                      copyToClipboard(
                        MEETING_INFO.mapsUrl,
                        'mapslink',
                        'Link Google Maps berhasil disalin!'
                      )
                    }
                  >
                    {copiedKey === 'mapslink' ? <Check size={15} /> : <Copy size={15} />}
                    {copiedKey === 'mapslink' ? 'LINK TERSALIN' : 'SALIN LINK MAPS'}
                  </button>
                </div>
              </div>

              <div className="venue-intel-card">
                <div className="intel-header font-mono">
                  <ShieldAlert size={16} className="text-red-500" />
                  INFORMASI LAPANGAN & FASILITAS
                </div>

                <div className="intel-facility-list">
                  {MEETING_INFO.facilities.map((item, idx) => (
                    <div key={idx} className="intel-facility-item">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="intel-brief-box">
                  <div className="intel-brief-title font-mono text-amber-400">
                    CATATAN PENTING DARI DAPI:
                  </div>
                  <p className="intel-brief-text">
                    "Begitu sampai Kopi Kenangan Kemang Timur, langsung gabung meja 9 orang. Jangan nongkrong terpisah di luar atau malah keluyuran di tempat lain. Kita mulai jam 17.30 teng!"
                  </p>
                </div>

                <div className="intel-share-shortlink">
                  <div className="text-xs text-zinc-400 mb-1 font-mono">
                    LINK RESMI GOOGLE MAPS:
                  </div>
                  <div className="shortlink-box">
                    <span className="font-mono text-xs truncate">
                      {MEETING_INFO.mapsUrl}
                    </span>
                    <button
                      type="button"
                      className="btn-mini-copy"
                      onClick={() =>
                        copyToClipboard(
                          MEETING_INFO.mapsUrl,
                          'mapslink2',
                          'Link Google Maps disalin!'
                        )
                      }
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Split: Protocols & WhatsApp Dispatch */}
          <section className="bottom-split">
            <div className="split-col">
              <div className="section-kicker font-mono">KETENTUAN MUTLAK</div>
              <h2 className="section-heading mb-4">Protokol Anti-Wacana</h2>

              <div className="rule-list">
                {EMERGENCY_RULES.map((rule) => (
                  <div key={rule.code} className="rule-item">
                    <div className="rule-header">
                      <span className="rule-code font-mono">[{rule.code}]</span>
                      <h4 className="rule-title">{rule.title}</h4>
                    </div>
                    <p className="rule-desc">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="split-col">
              <div className="section-kicker font-mono">SIARAN KOMANDO GRUP</div>
              <h2 className="section-heading mb-4">Siaran Pesan WhatsApp</h2>

              <div className="wa-preview-card">
                <div className="wa-header-strip">
                  <div className="flex items-center gap-2">
                    <span className="wa-status-dot" />
                    <span className="font-mono text-xs text-zinc-300">
                      PREVIEW PESAN OTOMATIS
                    </span>
                  </div>
                  <span className="font-mono text-xs text-emerald-400">
                    KUORUM: {quorumScore}/9
                  </span>
                </div>
                <pre className="wa-box font-mono">{waGroupText}</pre>
              </div>

              <div className="wa-btn-actions">
                <button
                  type="button"
                  className="btn-primary-red flex-1"
                  onClick={() =>
                    copyToClipboard(
                      waGroupText,
                      'wa',
                      'Pesan siaran WhatsApp berhasil disalin!'
                    )
                  }
                >
                  {copiedKey === 'wa' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedKey === 'wa' ? 'BERHASIL DISALIN!' : 'SALIN PESAN GRUP'}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waGroupText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp flex-1"
                  onClick={() => playTacticalSound('click', isAudioMuted)}
                >
                  <Share2 size={16} />
                  KIRIM KE WHATSAPP
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer-bar">
            <div className="footer-line font-mono">
              PERTEMUAN DARURAT // {MEETING_INFO.dayDate.toUpperCase()} (17.30 - 21.00 WIB) // {MEETING_INFO.venue.toUpperCase()}
            </div>
            <div className="footer-crew-list">
              DAPI • ADAI • KHAL • BINA • UCUP • HILAL • AWA • AYAS • TALITA
            </div>
            <div className="footer-copyright font-mono">
              KOPI KENANGAN KEMANG TIMUR • JAKARTA SELATAN • PROTOKOL SIAGA MERAH
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
