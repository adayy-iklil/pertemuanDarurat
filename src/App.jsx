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
  BellRing
} from 'lucide-react';
import { MEETING_INFO, INVITEES, EMERGENCY_RULES } from './data/summonsData';

// Senior Web Dev Polish: Pure Web Audio API Sound Synthesizer (No external assets required)
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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
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
  } catch {
    // Graceful fallback if audio is disabled
  }
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
      p.vy += 0.35; // gravity
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

  // Selected target for personalized fast RSVP
  const [selectedId, setSelectedId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('untuk')?.toLowerCase();
    if (fromUrl && INVITEES.some((p) => p.id === fromUrl)) {
      return fromUrl;
    }
    return localStorage.getItem('pd_person_v3') || 'dapi';
  });

  // Attendance status persistence
  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem('pd_statuses_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const init = {};
    INVITEES.forEach((p) => {
      init[p.id] = p.defaultStatus;
    });
    return init;
  });

  const [copiedKey, setCopiedKey] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    localStorage.setItem('pd_person_v3', selectedId);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem('pd_statuses_v3', JSON.stringify(statuses));
  }, [statuses]);

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
    }, 2800);
  };

  const selectedPerson = useMemo(
    () => INVITEES.find((p) => p.id === selectedId) || INVITEES[0],
    [selectedId]
  );

  // Countdown timer for Kamis, 5 November 2026 17:30 WIB
  const countdown = useMemo(() => {
    const targetStart = new Date('2026-11-05T17:30:00+07:00');
    const targetEnd = new Date('2026-11-05T21:00:00+07:00');

    const diffStart = targetStart.getTime() - now.getTime();
    const diffEnd = targetEnd.getTime() - now.getTime();

    if (diffStart > 0) {
      const totalSec = Math.floor(diffStart / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return {
        state: 'UPCOMING',
        badge: 'HITUNG MUNDUR MISI',
        label: 'MENUJU KAMIS, 5 NOV 2026 — 17.30 WIB',
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      };
    } else if (diffEnd > 0) {
      const totalSec = Math.floor(diffEnd / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return {
        state: 'ACTIVE',
        badge: 'STATUS AKTIF',
        label: 'PERTEMUAN DARURAT SEDANG BERLANGSUNG DI KEMANG TIMUR!',
        days: '00',
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      };
    } else {
      return {
        state: 'ENDED',
        badge: 'SELESAI',
        label: 'PANGGILAN 5 NOV 2026 TELAH DITUTUP RESMI',
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
      };
    }
  }, [now]);

  // Attendance metrics
  const confirmedCount = useMemo(() => {
    return Object.values(statuses).filter((s) => s === 'hadir').length;
  }, [statuses]);

  const otwCount = useMemo(() => {
    return Object.values(statuses).filter((s) => s === 'otw').length;
  }, [statuses]);

  const quorumScore = confirmedCount + otwCount;
  const quorumPercentage = Math.round((quorumScore / INVITEES.length) * 100);

  const setPersonStatus = (id, status) => {
    playTacticalSound(status === 'hadir' ? 'success' : 'click', isAudioMuted);
    setStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
    const pName = INVITEES.find((p) => p.id === id)?.name || id;
    const statusLabel =
      status === 'hadir' ? 'SIAP HADIR' : status === 'otw' ? 'SEDANG OTW' : 'BELUM LAPOR';
    showToast(`${pName} diubah ke: ${statusLabel}`);

    if (status === 'hadir') {
      triggerCanvasConfetti();
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

  // WhatsApp Broadcast Template
  const waText = useMemo(() => {
    const listText = INVITEES.map((p) => {
      const st = statuses[p.id];
      const ket =
        st === 'hadir'
          ? '✅ SIAP HADIR'
          : st === 'otw'
          ? '🛵 OTW'
          : '⏳ BELUM KONFIRMASI';
      return `${p.no}. ${p.name} [${ket}]`;
    }).join('\n');

    return `🚨 *PERINGATAN DARURAT // SIAGA MERAH* 🚨
*Wajib Merapat Tanpa Wacana — Formasi 9 Orang!*

📅 *Hari/Tanggal:* ${MEETING_INFO.dayDate}
⏰ *Waktu:* ${MEETING_INFO.timeStart} – ${MEETING_INFO.timeEnd} ${MEETING_INFO.timezone}
📍 *Lokasi:* ${MEETING_INFO.venue}
📌 *Alamat:* ${MEETING_INFO.fullAddress}
🗺️ *Link Google Maps:* ${MEETING_INFO.mapsUrl}

📋 *MANIFEST KUORUM (${quorumScore}/${INVITEES.length}):*
${listText}

⚠️ _Peringatan: Seluruh personel wajib hadir fisik. Dilarang ngaret & dilarang izin dadakan!_`;
  }, [statuses, quorumScore]);

  // Filtered invitees
  const filteredInvitees = useMemo(() => {
    if (activeTabFilter === 'hadir') {
      return INVITEES.filter((p) => statuses[p.id] === 'hadir');
    }
    if (activeTabFilter === 'otw') {
      return INVITEES.filter((p) => statuses[p.id] === 'otw');
    }
    if (activeTabFilter === 'belum') {
      return INVITEES.filter((p) => statuses[p.id] === 'belum');
    }
    return INVITEES;
  }, [activeTabFilter, statuses]);

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
                <span className="font-mono text-xs tracking-widest text-red-400">
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
                <span>TARGET: ADAY, KOL, DAPI, HILAL, UCUP, AYAS, BINA, TALITA, AWA</span>
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
            PERINGATAN DARURAT // {MEETING_INFO.dayDate.toUpperCase()} // {MEETING_INFO.timeStart} – {MEETING_INFO.timeEnd} {MEETING_INFO.timezone} // {MEETING_INFO.venue.toUpperCase()}
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
              <span className="meta-label">KESIAPAN KUORUM</span>
              <span className="meta-val font-mono text-amber-400">
                {quorumScore} / {INVITEES.length} Personel Merapat ({quorumPercentage}%)
              </span>
            </div>
          </div>

          {/* Quorum Progress Bar HUD */}
          <div className="quorum-meter-wrapper">
            <div className="quorum-meter-header">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="meter-label">INDIKATOR KELENGKAPAN PASUKAN</span>
              </div>
              <span className="meter-val font-mono">
                {confirmedCount} Hadir • {otwCount} OTW • {INVITEES.length - quorumScore} Belum Lapor
              </span>
            </div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{ width: `${quorumPercentage}%` }}
              />
            </div>
          </div>

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
                    Aday, Kol, Dapi, Hilal, Ucup, Ayas, Bina, Talita, dan Awa
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
                  href={MEETING_INFO.calendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-tactical"
                  title="Simpan ke Google Calendar"
                  onClick={() => playTacticalSound('click', isAudioMuted)}
                >
                  <Calendar size={15} />
                  PASANG REMINDER
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

                {/* Tech Corner Overlays */}
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
                {countdown.badge}
              </div>
              <div className="countdown-info-title">{countdown.label}</div>
              <div className="countdown-info-sub">
                {MEETING_INFO.venue} • {MEETING_INFO.timeStart} – {MEETING_INFO.timeEnd} {MEETING_INFO.timezone}
              </div>
            </div>

            <div className="timer-blocks">
              <div className="timer-cell">
                <span className="timer-num font-mono">{countdown.days}</span>
                <span className="timer-lbl">Hari</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell">
                <span className="timer-num font-mono">{countdown.hours}</span>
                <span className="timer-lbl">Jam</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell">
                <span className="timer-num font-mono">{countdown.minutes}</span>
                <span className="timer-lbl">Menit</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-cell red-sec">
                <span className="timer-num font-mono">{countdown.seconds}</span>
                <span className="timer-lbl">Detik</span>
              </div>
            </div>
          </section>

          {/* Quick Identity Selector Bar */}
          <section className="personal-bar">
            <div className="personal-bar-header">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-red-500" />
                <span className="personal-bar-title">
                  PILIH IDENTITAS LO UNTUK LAPOR CEPAT:
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Target Terpilih: <strong className="text-white">{selectedPerson.name}</strong>
              </span>
            </div>

            <div className="person-chips">
              {INVITEES.map((p) => {
                const st = statuses[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      playTacticalSound('click', isAudioMuted);
                      setSelectedId(p.id);
                    }}
                    className={`person-chip ${selectedId === p.id ? 'active' : ''}`}
                  >
                    <span className="chip-no font-mono">{p.no}</span>
                    <span className="chip-name">{p.name}</span>
                    <span
                      className={`status-dot ${
                        st === 'hadir'
                          ? 'dot-hadir'
                          : st === 'otw'
                          ? 'dot-otw'
                          : 'dot-belum'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Directive Box for Selected User */}
            <div className="personal-directive-box">
              <div className="directive-info">
                <div className="directive-tag font-mono">
                  INSTRUKSI OPERASI KHUSUS #{selectedPerson.no} — {selectedPerson.name.toUpperCase()} [{selectedPerson.role}]
                </div>
                <div className="directive-text">{selectedPerson.note}</div>
              </div>

              <div className="directive-actions">
                <button
                  type="button"
                  className={`btn-action-rsvp hadir ${
                    statuses[selectedPerson.id] === 'hadir' ? 'is-active' : ''
                  }`}
                  onClick={() => setPersonStatus(selectedPerson.id, 'hadir')}
                >
                  <CheckCircle2 size={16} />
                  GUE SIAP HADIR
                </button>
                <button
                  type="button"
                  className={`btn-action-rsvp otw ${
                    statuses[selectedPerson.id] === 'otw' ? 'is-active' : ''
                  }`}
                  onClick={() => setPersonStatus(selectedPerson.id, 'otw')}
                >
                  <Car size={16} />
                  SEDANG OTW
                </button>
                <button
                  type="button"
                  className={`btn-action-rsvp belum ${
                    statuses[selectedPerson.id] === 'belum' ? 'is-active' : ''
                  }`}
                  onClick={() => setPersonStatus(selectedPerson.id, 'belum')}
                >
                  BELUM KONFIRMASI
                </button>
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
                <h2 className="section-heading">Manifest Pasukan Lengkap</h2>
              </div>

              {/* Filters */}
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
                const st = statuses[person.id] || 'belum';
                const badgeLabel =
                  st === 'hadir'
                    ? 'SIAP HADIR'
                    : st === 'otw'
                    ? 'SEDANG OTW'
                    : 'BELUM LAPOR';

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
                        <span className={`manifest-badge ${st}`}>
                          {st === 'hadir' && <CheckCircle2 size={12} />}
                          {st === 'otw' && <Car size={12} />}
                          {st === 'belum' && <AlertTriangle size={12} />}
                          {badgeLabel}
                        </span>
                      </div>
                      <h3 className="manifest-name">{person.name}</h3>
                      <p className="manifest-note">{person.note}</p>
                    </div>

                    <div className="manifest-btn-group">
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          st === 'hadir' ? 'active-hadir' : ''
                        }`}
                        onClick={() => setPersonStatus(person.id, 'hadir')}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          st === 'otw' ? 'active-otw' : ''
                        }`}
                        onClick={() => setPersonStatus(person.id, 'otw')}
                      >
                        OTW
                      </button>
                      <button
                        type="button"
                        className={`status-toggle-btn ${
                          st === 'belum' ? 'active-belum' : ''
                        }`}
                        onClick={() => setPersonStatus(person.id, 'belum')}
                      >
                        Belum
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dedicated Location & Venue Radar Section (Requested: Google Maps) */}
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
              {/* Left: Map Preview & Address details */}
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

                {/* Interactive Google Maps Iframe Embed */}
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

                {/* Direct Action Navigation Links */}
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

              {/* Right: Venue Facilities & Tactical Intel */}
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
            {/* Left: Anti-Wacana Protocol */}
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

            {/* Right: WhatsApp Broadcast Generator */}
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
                <pre className="wa-box font-mono">{waText}</pre>
              </div>

              <div className="wa-btn-actions">
                <button
                  type="button"
                  className="btn-primary-red flex-1"
                  onClick={() =>
                    copyToClipboard(
                      waText,
                      'wa',
                      'Pesan siaran WhatsApp berhasil disalin!'
                    )
                  }
                >
                  {copiedKey === 'wa' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedKey === 'wa' ? 'BERHASIL DISALIN!' : 'SALIN PESAN GRUP'}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
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
              ADAY • KOL • DAPI • HILAL • UCUP • AYAS • BINA • TALITA • AWA
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
