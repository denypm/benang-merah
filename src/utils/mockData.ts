export const mockArticles = [
  {
    id: "1",
    title: "Seni Membaca di Era Kecepatan",
    author_name: "Ahmad Prasetyo",
    mood: "Kontemplatif",
    excerpt: "Bagaimana kita bisa benar-benar meresapi makna di balik baris kalimat saat algoritma terus memaksa kita untuk berpindah ke konten berikutnya?",
    read_time: "5 min read",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Dapur Kurasi: Di Balik Meja Redaksi Benang Merah",
    author_name: "Tim Kurator",
    mood: "Inspiratif",
    excerpt: "Menemukan 'benang merah' dalam ribuan naskah yang masuk membutuhkan lebih dari sekadar logika; ia membutuhkan empati.",
    read_time: "8 min read",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Sajak-Sajak Sore yang Tak Selesai",
    author_name: "Dian Sastro",
    mood: "Melankolis",
    excerpt: "Kumpulan baris yang terputus di tengah jalan, mencari muara dalam ingatan yang mulai memudar...",
    read_time: "3 min read",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const mockCompetitions = [
  {
    id: "comp-1",
    title: "Sayembara Esai: Jejak Langkah di Kota Kosong",
    theme: "Kesunyian Urban",
    description: "Tuliskan refleksi Anda tentang kehidupan di tengah kota metropolitan yang perlahan kehilangan manusianya. Esai maksimal 1500 kata.",
    status: "active",
    start_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 15).toISOString(),
    prize: "Rp 5.000.000 + Kurasi Premium"
  },
  {
    id: "comp-2",
    title: "Lomba Cipta Puisi Bulan Purnama",
    theme: "Romansa Malam",
    description: "Rangkai kata tentang apa saja yang terjadi di bawah sinar bulan purnama. Bentuk bebas, maksimal 3 bait.",
    status: "judging",
    start_date: new Date(Date.now() - 86400000 * 30).toISOString(),
    end_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    prize: "Terbit Antologi Fisik"
  },
  {
    id: "comp-3",
    title: "Cerita Pendek: Relikui Keluarga",
    theme: "Nostalgia dan Kenangan",
    description: "Satu benda, sejuta cerita. Tuliskan cerpen tentang benda warisan keluarga yang menyimpan rahasia.",
    status: "completed",
    start_date: new Date(Date.now() - 86400000 * 60).toISOString(),
    end_date: new Date(Date.now() - 86400000 * 30).toISOString(),
    prize: "Penerbitan Eksklusif Benang Merah"
  }
];
