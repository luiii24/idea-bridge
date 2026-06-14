export const currentUser = {
  id: 99,
  name: "Kamu (User)",
  handle: "@pengguna_baru",
  role: "Creator",
  bio: "Frontend Developer yang lagi cari ide-ide gila buat dibikin nyata.",
  skills: ["React", "Tailwind", "JavaScript"],
  portfolio: {
    github: "[github.com/kamu-user](https://github.com/kamu-user)",
    website: "kamu-dev.com"
  },
  completedProjects: [
    { id: 101, title: "Sistem Kasir UMKM Lokal", role: "Frontend" }
  ]
};

export const initialPosts = [
  {
    id: 1,
    title: "Aplikasi Pengingat Obat Virtual Pet", // Tambahan judul
    author: "Budi Santoso",
    handle: "@budisans",
    role: "Ideator",
    text: "Gimana kalau ada aplikasi pengingat minum obat, tapi pakai sistem 'Virtual Pet'? Kalau kita lupa minum obat, hewannya bakal sakit. Butuh mobile developer nih!",
    votes: 124,
    tags: ["Mobile", "Kesehatan", "Gamifikasi"],
    status: "Mencari Tim",
    bridged: 5
  },
  {
    id: 2,
    title: "Platform Solusi Digital UMKM Lokal", // Tambahan judul
    author: "Siti Aminah",
    handle: "@siticode",
    role: "Creator",
    text: "Lagi kosong weekend ini. Gue Fullstack Web Developer. Ada yang punya ide web app unik untuk problem UMKM lokal? Yuk discuss, gue yang coding.",
    votes: 89,
    tags: ["Web", "Open Collab", "UMKM"],
    status: "Sedang Dibangun",
    bridged: 12
  },
  {
    id: 3,
    title: "Text-to-Speech Logat Daerah Nusantara", // Tambahan judul
    author: "Rangga Pratama",
    handle: "@ranggap",
    role: "Ideator",
    text: "Ide: Platform text-to-speech khusus untuk logat daerah Indonesia (Jawa, Sunda, Batak, dll) buat bantu konten kreator lokal. Ada AI Engineer yang tertarik?",
    votes: 210,
    tags: ["AI", "Audio", "Lokal"],
    status: "Selesai",
    bridged: 8
  }
];

export const mockUsers = [
  { id: 1, name: "Budi Santoso", handle: "@budisans", role: "Ideator", bio: "Product Manager by day, Idea Machine by night." },
  { id: 2, name: "Siti Aminah", handle: "@siticode", role: "Creator", bio: "Membangun web satu per satu. React & Node.js enthusiast." },
  { id: 3, name: "Rangga Pratama", handle: "@ranggap", role: "Ideator", bio: "Senang mencari solusi untuk masalah sehari-hari." },
  { id: 4, name: "Dewi Lestari", handle: "@dewidesign", role: "Creator", bio: "UI/UX Designer. Mengubah ide abstrak jadi tampilan cantik." }
];