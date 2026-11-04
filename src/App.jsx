import React, { useState, useEffect, useMemo } from 'react';
import { MEETING_INFO, INVITEES, EMERGENCY_RULES } from './data/summonsData';

export default function App() {
  const [strobeActive, setStrobeActive] = useState(true);

  const [selectedId, setSelectedId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('untuk')?.toLowerCase();
    if (fromUrl && INVITEES.some((p) => p.id === fromUrl)) {
      return fromUrl;
    }
    return localStorage.getItem('pd_person_v2') || 'dapi';
  });

  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem('pd_statuses_v2');
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
    localStorage.setItem('pd_person_v2', selectedId);
  }, [selectedId]);

  useEffect(() => {
    localStorage.setItem('pd_statuses_v2', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedPerson = useMemo(
    () => INVITEES.find((p) => p.id === selectedId) || INVITEES[0],
    [selectedId]
  );

  // Target: Kamis, 5 November 2026 17:30:00 WIB (+07:00)
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
        label: 'HITUNG MUNDUR MENUJU KAMIS, 5 NOV 2026 — 17.30 WIB',
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
        label: 'DARURAT: PERTEMUAN SEDANG BERLANGSUNG DI KEMANG TIMUR!',
        days: '00',
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      };
    } else {
      return {
        label: 'WAKTU PANGGILAN 5 NOV 2026 (17.30 - 21.00) TELAH BERAKHIR',
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
      };
    }
  }, [now]);

  const confirmedTotal = useMemo(() => {
    return Object.values(statuses).filter((s) => s === 'hadir' || s === 'otw').length;
  }, [statuses]);

  const setPersonStatus = (id, status) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const waText = useMemo(() => {
    const listText = INVITEES.map((p) => {
      const st = statuses[p.id];
      const ket =
        st === 'hadir' ? 'SIAP HADIR' : st === 'otw' ? 'OTW' : 'BELUM KONFIRMASI';
      return `${p.no}. ${p.name} [${ket}]`;
    }).join('\n');

    return `*PANGGILAN PERTEMUAN DARURAT*
Status: *SIAGA MERAH — WAJIB KUMPUL*

• *Hari/Tanggal:* Kamis, 5 November 2026
• *Waktu:* 17.30 – 21.00 WIB
• *Lokasi:* Kopi Kenangan Kemang Timur
• *Maps:* ${MEETING_INFO.mapsUrl}

*MANIFEST 9 PERSONEL:*
${listText}

_Wajib merapat tepat waktu. Tidak menerima alasan wacana._`;
  }, [statuses]);

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <>
      {/* Subtle Group Photo Background + Grid */}
      <div className="bg-photo-backdrop" />
      <div className="bg-grid-overlay" />

      {/* Red Flashing Emergency Strobe Overlay */}
      <div
        className={`emergency-strobe-overlay ${strobeActive ? '' : 'paused'}`}
      />

      {/* Sticky Top Emergency Bar */}
      <header className={`siren-top-bar ${strobeActive ? 'flashing' : ''}`}>
        <div className="siren-status-left">
          <span className="blinking-led" />
          <span>
            PERINGATAN DARURAT // KAMIS, 5 NOVEMBER 2026 // 17.30 – 21.00 WIB // KOPI
            KENANGAN KEMANG TIMUR
          </span>
        </div>
        <button
          type="button"
          className="strobe-toggle"
          onClick={() => setStrobeActive((prev) => !prev)}
        >
          {strobeActive ? 'SIRENE MERAH: NYALA' : 'SIRENE MERAH: REDA'}
        </button>
      </header>

      <main className="page-container">
        <div className="emergency-frame">
          {/* Document Meta Strip */}
          <div className="meta-bar">
            <div className="meta-cell">
              <span className="meta-label">KODE PANGGILAN</span>
              <span className="meta-val">{MEETING_INFO.code}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">STATUS KEADAAN</span>
              <span className="meta-val blink-red">
                <span className="red-dot-inline" />
                {MEETING_INFO.status}
              </span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">KONFIRMASI PASUKAN</span>
              <span className="meta-val">
                {confirmedTotal} / 9 Personel Merapat
              </span>
            </div>
          </div>

          {/* Hero Section + Uploaded Photo */}
          <section className="hero-grid">
            <div className="hero-copy">
              <div>
                <div className="urgent-pill">
                  <span className="red-dot-inline" />
                  INSTRUKSI KUMPUL MENDADAK
                </div>

                <h1 className="hero-headline">
                  PERTEMUAN <span>DARURAT</span> TANPA ALASAN.
                </h1>

                <p className="hero-desc">
                  Panggilan resmi dan mutlak untuk{' '}
                  <strong>
                    Aday, Kol, Dapi, Hilal, Ucup, Ayas, Bina, Talita, dan Awa
                  </strong>
                  . Seluruh personel di foto wajib hadir secara fisik di{' '}
                  <strong>Kopi Kenangan Kemang Timur</strong> pada{' '}
                  <strong>Kamis, 5 November 2026</strong>.
                </p>

                <div className="key-schedule-grid">
                  <div className="schedule-box">
                    <div className="schedule-kicker">WAKTU EKSEKUSI</div>
                    <div className="schedule-main">Kamis, 5 Nov 2026</div>
                    <div className="schedule-sub">Pukul 17.30 – 21.00 WIB</div>
                  </div>
                  <div className="schedule-box">
                    <div className="schedule-kicker">TITIK LOKASI</div>
                    <div className="schedule-main">Kopi Kenangan</div>
                    <div className="schedule-sub">Kemang Timur, Jakarta Selatan</div>
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <a
                  href={MEETING_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-red"
                >
                  BUKA LOKASI DI GOOGLE MAPS →
                </a>
                <a href="#manifest-personel" className="btn-outline">
                  CEK DAFTAR 9 ORANG
                </a>
              </div>
            </div>

            {/* Right: Uploaded Photo Showcase */}
            <div className="hero-photo-panel">
              <div className="photo-header-bar">
                <span>LAMPIRAN BUKTI FISIK #01</span>
                <span className="rec-indicator">
                  <span className="red-dot-inline" /> 9 TARGET TERDETEKSI
                </span>
              </div>

              <div className="photo-frame-wrapper">
                <img
                  src="/foto-pasukan.jpg"
                  alt="9 Personel Pertemuan Darurat"
                  className="evidence-photo tactical"
                />
                <div className="photo-Hud-overlay">
                  <span className="photo-stamp-tag">WAJIB FULL TEAM — 9 ORANG</span>
                  <div className="photo-caption-bottom">
                    <span>FORMASI WAJIB KOMPLIT</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 700 }}>
                      05.11.2026 // 17:30
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Countdown Strip */}
          <section className="countdown-strip">
            <div>
              <div className="countdown-info-title">{countdown.label}</div>
              <div className="countdown-info-sub">
                Kopi Kenangan Kemang Timur • 17.30 – 21.00 WIB
              </div>
            </div>

            <div className="timer-blocks">
              <div className="timer-cell">
                <span className="timer-num">{countdown.days}</span>
                <span className="timer-lbl">Hari</span>
              </div>
              <div className="timer-cell">
                <span className="timer-num">{countdown.hours}</span>
                <span className="timer-lbl">Jam</span>
              </div>
              <div className="timer-cell">
                <span className="timer-num">{countdown.minutes}</span>
                <span className="timer-lbl">Menit</span>
              </div>
              <div className="timer-cell">
                <span className="timer-num">{countdown.seconds}</span>
                <span className="timer-lbl">Detik</span>
              </div>
            </div>
          </section>

          {/* Personal Selector */}
          <section className="personal-bar">
            <div className="personal-bar-title">
              KLIK NAMA LO BUAT KONFIRMASI CEPAT:
            </div>
            <div className="person-chips">
              {INVITEES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`person-chip ${selectedId === p.id ? 'active' : ''}`}
                >
                  {p.no}. {p.name}
                </button>
              ))}
            </div>

            <div className="personal-directive-box">
              <div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#ff6b6b',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  PANGGILAN KHUSUS UNTUK {selectedPerson.name.toUpperCase()} (NO.{' '}
                  {selectedPerson.no})
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.15rem' }}>
                  {selectedPerson.note}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-primary-red"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.72rem' }}
                  onClick={() => setPersonStatus(selectedPerson.id, 'hadir')}
                >
                  GUE SIAP HADIR
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.72rem' }}
                  onClick={() => setPersonStatus(selectedPerson.id, 'otw')}
                >
                  OTW
                </button>
              </div>
            </div>
          </section>

          {/* Manifest 9 Personel (Talita #08 & Awa #09 Swapped) */}
          <section id="manifest-personel" className="section-block">
            <div className="section-top-bar">
              <div>
                <div className="section-kicker">DAFTAR ABSENSI WAJIB</div>
                <h2 className="section-heading">Manifest 9 Personel</h2>
              </div>
              <div className="quorum-pill">
                TERKONFIRMASI: {confirmedTotal} DARI 9 ORANG
              </div>
            </div>

            <div className="manifest-grid">
              {INVITEES.map((person) => {
                const st = statuses[person.id] || 'belum';
                const badgeText =
                  st === 'hadir'
                    ? 'SIAP HADIR'
                    : st === 'otw'
                    ? 'SEDANG OTW'
                    : 'WAJIB LAPOR';

                return (
                  <div
                    key={person.id}
                    className={`manifest-card ${
                      selectedId === person.id ? 'is-selected' : ''
                    }`}
                  >
                    <div>
                      <div className="manifest-card-top">
                        <span className="manifest-no">
                          PERSONEL #{person.no} • {person.tag}
                        </span>
                        <span className={`manifest-badge ${st}`}>{badgeText}</span>
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

          {/* Bottom Split: Rules & WhatsApp Copy */}
          <section className="bottom-split">
            <div className="split-col">
              <div className="section-kicker">KETENTUAN MUTLAK</div>
              <h2 className="section-heading" style={{ marginBottom: '1.1rem' }}>
                Protokol Anti-Wacana
              </h2>

              <div className="rule-list">
                {EMERGENCY_RULES.map((rule) => (
                  <div key={rule.code} className="rule-item">
                    <div className="rule-title">
                      [{rule.code}] {rule.title}
                    </div>
                    <p className="rule-desc">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="split-col">
              <div className="section-kicker">SIARAN GRUP WHATSAPP</div>
              <h2 className="section-heading">Kirim Panggilan ke Grup</h2>

              <pre className="wa-box">{waText}</pre>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn-primary-red"
                  onClick={() => copyToClipboard(waText, 'wa')}
                >
                  {copiedKey === 'wa'
                    ? 'BERHASIL DISALIN!'
                    : 'SALIN TEKS PANGGILAN GRUP'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  KIRIM KE WHATSAPP
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer-bar">
            <span>
              PERTEMUAN DARURAT // KAMIS, 5 NOV 2026 (17.30 - 21.00 WIB) // KOPI
              KENANGAN KEMANG TIMUR
            </span>
            <span>
              ADAY • KOL • DAPI • HILAL • UCUP • AYAS • BINA • TALITA • AWA
            </span>
          </footer>
        </div>
      </main>
    </>
  );
}
