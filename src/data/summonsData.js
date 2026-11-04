export const MEETING_INFO = {
  code: 'ALRT-09 / KK-KMT / 05-NOV-2026',
  status: 'SIAGA MERAH — WAJIB MERAPAT',
  dayDate: 'Kamis, 5 November 2026',
  isoDate: '2026-11-05',
  timeStart: '17.30',
  timeEnd: '21.00',
  deadlineTime: '18:00', // Batas waktu geofence
  timezone: 'WIB',
  venue: 'Kopi Kenangan - Kemang Timur',
  address: 'Jl. Kemang Timur No. 83, Bangka, Mampang Prapatan, Jakarta Selatan',
  fullAddress: 'Jl. Kemang Timur No. 83, RT.6/RW.3, Bangka, Kec. Mampang Prapatan, Kota Jakarta Selatan, DKI Jakarta 12730',
  mapsUrl: 'https://maps.app.goo.gl/PwHyY9pbiW1bjbqPA',
  wazeUrl: 'https://waze.com/ul?ll=-6.271212,106.8234562&navigate=yes',
  embedMapUrl: 'https://maps.google.com/maps?q=-6.271212,106.8234562&hl=id&z=17&output=embed',
  coordinates: {
    lat: -6.271212,
    lng: 106.8234562,
  },
  radiusMeters: 500, // 500 Meter Geofence
  facilities: [
    'Stopkontak Meja Tersedia',
    'Indoor AC & Area Outdoor',
    'Parkir Kendaraan Aman',
    'Wi-Fi Stabil',
    'Kapasitas Meja 9+ Orang'
  ],
  calendarLink: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=PERTEMUAN+DARURAT+9+PASUKAN&dates=20261105T103000Z/20261105T140000Z&details=Panggilan+resmi+wajib+merapat+tanpa+wacana.+Formasi+penuh+9+orang!&location=Kopi+Kenangan+-+Kemang+Timur,+Jl.+Kemang+Timur+No.+83,+Jakarta+Selatan',
};

// Formula Haversine Geodesic (Client-Side, Tanpa DB)
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 9 Personel Resmi lengkap dengan Nomor WhatsApp & Titik Koordinat Awal
export const INVITEES = [
  {
    id: 'dapi',
    no: '01',
    name: 'Dapi',
    phone: '6283895739116',
    role: 'Command Leader',
    tag: 'PENANGGUNG JAWAB',
    note: 'Pemegang komando titik kumpul Kopi Kenangan Kemang Timur.',
    defaultStatus: 'hadir',
    lat: -6.271212,
    lng: 106.8234562, // 0m (Tepat di Kopi Kenangan)
  },
  {
    id: 'aday',
    no: '02',
    name: 'Adai',
    phone: '6287782390705',
    role: 'Frontline Ops',
    tag: 'PANGGILAN UTAMA',
    note: 'Wajib sudah di lokasi jam 17.30 teng. Dilarang ngaret satu detik pun.',
    defaultStatus: 'hadir',
    lat: -6.271850,
    lng: 106.823900, // ~86m from venue (Dalam 500m)
  },
  {
    id: 'kol',
    no: '03',
    name: 'Khal',
    phone: '6285719185974',
    role: 'Tactical Recon',
    tag: 'PANGGILAN UTAMA',
    note: 'Kehadiran mutlak. Tidak ada izin susulan atau wacana dadakan.',
    defaultStatus: 'otw',
    lat: -6.274200,
    lng: 106.822500, // ~349m from venue (Dalam 500m)
  },
  {
    id: 'bina',
    no: '04',
    name: 'Bina',
    phone: '6285718902075',
    role: 'Strategic Support',
    tag: 'PANGGILAN UTAMA',
    note: 'Ditunggu dari jam 17.30 sampai tuntas bubar jam 21.00 WIB.',
    defaultStatus: 'otw',
    lat: -6.273100,
    lng: 106.824200, // ~225m from venue (Dalam 500m)
  },
  {
    id: 'ucup',
    no: '05',
    name: 'Ucup',
    phone: '6285179690648',
    role: 'Logistics Vanguard',
    tag: 'PANGGILAN UTAMA',
    note: 'Merapat tepat waktu, amankan barisan meja buat 9 orang.',
    defaultStatus: 'otw',
    lat: -6.265500,
    lng: 106.825800, // ~686m from venue (DI LUAR 500M)
  },
  {
    id: 'hilal',
    no: '06',
    name: 'Hilal',
    phone: '6285280087561',
    role: 'Field Officer',
    tag: 'PANGGILAN UTAMA',
    note: 'Jangan tiba-tiba hilang kabar pas sore menjelang 17.30.',
    defaultStatus: 'belum',
    lat: -6.279200,
    lng: 106.820500, // ~946m from venue (DI LUAR 500M)
  },
  {
    id: 'awa',
    no: '07',
    name: 'Awa',
    phone: '6281776082322',
    role: 'Quorum Anchor',
    tag: 'PANGGILAN UTAMA',
    note: 'Penutup kuorum 9 orang. Tanpa kamu, operasi dinyatakan cacat.',
    defaultStatus: 'belum',
    lat: -6.261800,
    lng: 106.828500, // ~1.18 km from venue (DI LUAR 500M)
  },
  {
    id: 'ayas',
    no: '08',
    name: 'Ayas',
    phone: '6282121698363',
    role: 'Special Envoy',
    tag: 'PANGGILAN UTAMA',
    note: 'Wajib datang langsung ke TKP, tidak terima titip salam.',
    defaultStatus: 'belum',
    lat: -6.257000,
    lng: 106.832000, // ~1.84 km from venue (DI LUAR 500M)
  },
  {
    id: 'talita',
    no: '09',
    name: 'Talita',
    role: 'Formasi Inti',
    tag: 'PANGGILAN UTAMA',
    note: 'Wajib hadir. Personel ke-9 penentu status formasi lengkap.',
    defaultStatus: 'belum',
    lat: -6.289500,
    lng: 106.819000, // ~2.09 km from venue (DI LUAR 500M)
  },
];

export const EMERGENCY_RULES = [
  {
    code: '01',
    title: 'Formasi Penuh 9 Orang Mutlak',
    desc: 'Dapi, Adai, Khal, Bina, Ucup, Hilal, Awa, Ayas, dan Talita wajib hadir fisik di Kopi Kenangan Kemang Timur. Tidak boleh digantikan perwakilan.',
  },
  {
    code: '02',
    title: 'Batas Geofence 500 Meter & Jam 18.00 WIB',
    desc: 'Semua personel wajib sudah berada di dalam radius 500m Kopi Kenangan Kemang Timur sebelum pukul 18.00 WIB. Lewat jam 18.00, sistem otomatis memicu notifikasi peringatan WhatsApp.',
  },
  {
    code: '03',
    title: 'Zero Tolerance Wacana & Alasan Dadakan',
    desc: 'Alasan ketiduran, mager, lembur dadakan fiktif, atau lupa jadwal otomatis ditolak dan dikenai sanksi traktiran.',
  },
  {
    code: '04',
    title: 'Protokol Titik Kumpul (Assembly Protocol)',
    desc: 'Personel yang tiba duluan wajib mengamankan area meja (kapasitas 9 orang), mencolok charger, dan mengirim foto live status ke grup.',
  },
];
