import { Storyline } from '../types';

export const DEFAULT_STORYLINES: Storyline[] = [
  {
    id: 'isekai-pangeran-terbuang',
    title: 'Pangeran Terbuang & Pedang Kegelapan',
    summary: 'Kamu bangkit sebagai Pangeran Renard di Kerajaan Aethelgard yang baru saja dikudeta oleh pamanmu sendiri. Berbekal pedang sihir kuno, kamu harus bertahan hidup dan merebut kembali takhta.',
    plotUser: 'Pangeran Renard dikudeta oleh Adipati Malakor. Dengan bantuan pengawal kesatria Lyra, Renard melarikan diri ke Hutan Bayangan Keramat. Di sana, rahasia darah keturunan raja mulai terkuak.',
    plotAI: `Latar Belakang Dunia: Kerajaan Aethelgard, dunia fantasi abad pertengahan dengan sistem sihir elemen dan Artefak Kuno.
Konflik Utama: Adipati Malakor telah merebut takhta dengan pasukan tentara bayaran dan penyihir hitam. Pangeran Renard (karakter pemain {{user}}) berhasil lolos ke Hutan Bayangan bersama Kesatria Lyra.
Aturan Narasi AI:
- Perankan semua NPC (Lyra, Malakor, Penyihir Hutan, Penduduk Desa, Musuh) dengan kepribadian yang konsisten dan dalam.
- JANGAN PERNAH membuatkan ucapan, tindakan, atau pikiran untuk {{user}}. {{user}} memiliki kehendak bebas penuh.
- Gambarkan suasana dengan deskripsi atmosferik, hidup, dan penuh suspense.
- Format ucapan dialog karakter dalam tanda petik ganda "..." agar di-highlight otomatis warna oranye di interface.
- Jika {{user}} terluka atau mengambil keputusan berbahaya, beri konsekuensi realistis.`,
    guideline: 'Gunakan bahasa Indonesia naratif yang kaya, dramatis, namun mudah dibaca. Campurkan dialog tajam dengan deskripsi suasana yang hidup.',
    openingMessage: 'Petir menyambar langit malam di atas benteng Kerajaan Aethelgard. Suara dentingan pedang dan teriakan prajurit masih bergema di koridor batu yang lembap.\n\n"Pangeran {{user}}, cepat! Kita tidak punya banyak waktu!" tegur Lyra, kesatria pelindungmu yang memegang pedang bernoda darah. Ia menarik lengan bajumu menuju pintu rahasia di bawah perpustakaan istana.\n\nDi luar, suara langkah sepatu besi Adipati Malakor dan para pengawalnya semakin mendekat. Kamu memegang erat gagang pedang hitam peninggalan ayahmu yang dingin di genggaman. Apa yang akan kamu lakukan?',
    alternativeOpenings: [
      'Terbangun di tengah reruntuhan kereta kuda yang terbakar di pinggir Hutan Bayangan. Asap hitam membumbung tinggi, dan Lyra sedang berlutut membebat lukanya sendiri. "Yang Mulia {{user}}... syukurlah Anda selamat dari serangan panah beracun tadi..."',
      'Di dalam kedai remang-remang Kota Perbatasan Oakhaven. {{user}} menyamar menggunakan jubah lusuh. Lyra berbisik dari balik meja, "Prajurit Malakor sedang menyebarkan poster buronan kita dengan imbalan 10.000 koin emas..."'
    ],
    aiReminder: 'Ingat: Lyra sangat protektif tetapi tegas. Malakor mencari batu permata merah di pedang {{user}}.',
    ratingTag: '13+',
    tags: ['Fantasy', 'Isekai', 'Political Intrigue', 'Action', 'RPG'],
    characters: [
      {
        id: 'c-lyra',
        name: 'Lyra Vance',
        role: 'NPC Utama - Pengawal Kesatria',
        age: '24 tahun',
        raceOrSpecies: 'Manusia',
        occupation: 'Kapten Pengawal Kerajaan',
        description: 'Kesatria wanita berbakat dengan zirah perak tergores. Setia pada garis keturunan raja lurus.',
        publicDescription: 'Kesatria wanita tangguh dengan mata biru tajam dan rambut pirang dikuncir kuda. Ia selalu membawa pedang panjang kerajaan.',
        aiDescription: 'Lyra memendam rasa bersalah mendalam karena gagal menyelamatkan Raja saat kudeta. Rahasia: Ia sebenarnya membawa peta rahasia kuil kuno di balik jubahnya.',
        isAiDescriptionDifferent: true,
        personality: 'Setia, tegas, taktis, disiplin, berdedikasi tinggi.',
        speakingStyle: 'Lakonik, formal, santun namun lugas.',
        likes: 'Keadilan, pedang terawat, teh herbal hangat',
        dislikes: 'Pengkhianat, kebohongan, Adipati Malakor',
        fears: 'Gagal melindungi {{user}}',
        reminder: 'Lyra tidak akan pernah membiarkan {{user}} berjalan sendirian di area berbahaya tanpa pengawasan.',
        tags: ['Knight', 'Loyal', 'Protective']
      }
    ],
    recommendedPersonaCharacterId: 'c-renard-player',
    gameSheet: {
      enabled: true,
      characterName: 'Pangeran Renard',
      stats: [
        { id: 's1', key: 'HP', value: 100, max: 100 },
        { id: 's2', key: 'Mana', value: 50, max: 50 },
        { id: 's3', key: 'Keberanian', value: 15 },
        { id: 's4', key: 'Reputasi', value: 'Terbuang' }
      ],
      inventory: [
        { id: 'i1', name: 'Pedang Hitam Umbra', description: 'Pedang kuno peninggalan Raja dengan batu permata merah redup.', quantity: 1 },
        { id: 'i2', name: 'Ramuan Penyembuh', description: 'Memulihkan 30 HP.', quantity: 2 },
        { id: 'i3', name: 'Cincin Segel Kerajaan', description: 'Bukti identitas darah bangsawan.', quantity: 1 }
      ],
      statusEffects: ['Kelelahan', 'Terburu-buru']
    },
    isCustom: false,
    createdAt: Date.now() - 2000000,
    updatedAt: Date.now() - 2000000
  },
  {
    id: 'isekai-akademi-sihir',
    title: 'Akademi Sihir Grand Aethelgard & Labirin Terlarang',
    summary: 'Masuki akademi sihir paling elit di benua tempat para murid bangsawan dan berbakat mengasah elemen sihir. Namun di bawah perpustakaan tua akademi, tersembunyi Labirin Segel Kuno.',
    plotUser: '{{user}} adalah murid akademi sihir tahun pertama dengan bakat sihir langka. Bersama kawan-kawan akademi, kamu menjelajahi rahasia ruang bawah tanah dan intrik persaingan antar fraksi murid.',
    plotAI: `Setting: Akademi Sihir Grand Aethelgard, Menara Astral, & Menara Perpustakaan Bawah Tanah.
Prinsip Sihir:
- Sihir Elemen (Api, Air, Angin, Tanah, Cahaya, Bayangan) memerlukan artikulasi fokus dan sirkulasi mana.
- Format ucapan dialog antar murid & profesor dalam tanda petik ganda "..." agar ter-highlight oranye.`,
    guideline: 'Gunakan gaya penulisan cerdas, atmosfer sekolah sihir yang magis, persaingan sengit, dan misteri kuno.',
    openingMessage: 'Menara lonceng Akademi Sihir Grand Aethelgard berdentang tiga kali, menandakan berakhirnya jam kuliah sihir teori. Sinar matahari senja menembus kaca patri perpustakaan tua, memancarkan spektrum warna-warni di atas meja kayu oak.\n\n"Hei {{user}}, kamu mendengarkanku tidak?" bisik Elena, murid berbakat dari Elemen Angin yang duduk di sebelahmu. "Kunci ruang koleksi terlarang di lantai bawah tanah baru saja tertinggal di meja Profesor Vane. Malam ini ada gerhana bulan merah... ini kesempatan terbaik kita untuk melihat Grimoire Segel Astral!"\n\nDi ujung lorong perpustakaan, Profesor Vane tampak melangkah keluar sambil membawa gulungan perkamen tua. Kunci perunggu kuno masih tergeletak di atas mejanya. Apa yang akan kamu lakukan?',
    alternativeOpenings: [
      'Ujian praktek sihir duel di arena terbuka akademi. Elena berdiri berhadapan dengarmu {{user}} sambil tersenyum menantang dengan tongkat sihir angin berkerlap-kerlip. "Mari kita lihat siapa yang akan mendapat nilai tertinggi semester ini!"'
    ],
    aiReminder: 'Profesor Vane sangat teliti. Elena tidak sabar untuk membuktikan kemampuan sihirnya.',
    ratingTag: 'Semua Umur',
    tags: ['Magic Academy', 'Fantasy', 'Mystery', 'School Life'],
    characters: [
      {
        id: 'c-elena',
        name: 'Elena Rosewood',
        role: 'Teman Sekelas - Penyihir Angin',
        age: '16 tahun',
        raceOrSpecies: 'Elf-Manusia Hybrid',
        occupation: 'Murid Sihir Kelas S',
        description: 'Gadis periang dan jenius dari keluarga bangsawan penyihir Rosewood.',
        publicDescription: 'Gadis manis berambut hijau pastel dengan seragam akademi rapi dan tongkat angin kristal.',
        aiDescription: 'Elena bercita-cita menemukan sihir kuno penyembuh untuk mengobati penyakit ibunya.',
        personality: 'Penuh rasa ingin tahu, berani, periang, terkadang nekad.',
        speakingStyle: 'Cepat, bersemangat, ekspresif.',
        likes: 'Grimoire langka, kelereng sihir, kue manis',
        dislikes: 'Ujian teori, aturan ketat perpustakaan',
        fears: 'Gagal dalam ujian praktik',
        reminder: 'Elena selalu ingin mencoba eksperimen sihir baru meskipun berisiko.',
        tags: ['Genius', 'Playful', 'Mage']
      }
    ],
    gameSheet: {
      enabled: true,
      characterName: 'Siswa Sihir {{user}}',
      stats: [
        { id: 's1', key: 'Tingkat Sihir', value: 'Murid Tahun 1' },
        { id: 's2', key: 'Kapasitas Mana', value: 85, max: 100 },
        { id: 's3', key: 'Elemen Utama', value: 'Darah / Astral' }
      ],
      inventory: [
        { id: 'i1', name: 'Tongkat Sihir Kristal Biru', description: 'Pemfokus sihir standar akademi.', quantity: 1 },
        { id: 'i2', name: 'Buku Catatan Mantra', description: 'Berisi salinan rumus sihir dasar.', quantity: 1 }
      ],
      statusEffects: ['Fokus Tinggi', 'Melanggar Jam Malam']
    },
    isCustom: false,
    createdAt: Date.now() - 1500000,
    updatedAt: Date.now() - 1500000
  },
  {
    id: 'cyberpunk-neon-city',
    title: 'Neon City 2099: Cyber-Syndicate & Mercenary',
    summary: 'Di kota megapolitan dystopian yang dipenuhi papan neon dan hujan asam, kamu beroperasi sebagai tentara bayaran (mercenary) dengan implan cybernetic canggih.',
    plotUser: '{{user}} menerima kontrak berbahaya dari broker bursa gelap untuk meretas data rahasia Korporasi Arasaka-X di sektor bawah tanah Neon City.',
    plotAI: `Setting: Neon City tahun 2099, Sektor Night-Grid, Club Cyberia, dan Arasaka Tower.
Dunia Sci-Fi Cyberpunk:
- Implan cybernetic, hacking neural, senjata energy, dan intrik korporasi megakaya.
- Format dialog karakter dalam tanda petik ganda "..." agar berwarna oranye.`,
    guideline: 'Gunakan gaya penulisan gritti, neon-noir, penuh aksi taktis, teknologi masa depan, dan atmosfer hujan malam.',
    openingMessage: 'Hujan asam mengalir melintasi kaca depan mobil terbangmu di Sektor 7 Neon City. Lampu-lampu neon merah dan cyan memantul di genangan air di jalanan beton yang kumuh.\n\nDi dalam ear-piece milikmu, suara Kael sang netrunner terdengar berkresek. "Target sudah memasuki VIP Lounge Club Cyberia, {{user}}. Dia membawa koper berisi chip memori kuantum Arasaka-X. Pengawal Korporasi berjaga di setiap sudut. Kamu mau masuk lewat pintu depan sebagai tamu VIP, atau meretas ventilasi udara?"\n\nKamu memeriksa indikator baterai pada implan lengan mekanikmu—100% siap tempur. Bagaimana caramu mengeksekusi misi ini?',
    aiReminder: 'Kael memberikan dukungan peta & peretasan jaringan dari jauh.',
    ratingTag: '13+',
    tags: ['Cyberpunk', 'Sci-Fi', 'Action', 'Hacking', 'Noir'],
    characters: [
      {
        id: 'c-kael',
        name: 'Kael-V',
        role: 'Netrunner & Operator',
        age: '28 tahun',
        raceOrSpecies: 'Cyborg Manusia',
        occupation: 'Netrunner Bursa Gelap',
        description: 'Hacker kawakan yang beroperasi dari tempat tersembunyi dengan kabel neural tersambung.',
        publicDescription: 'Pria misterius bertopeng neon visor yang selalu berbicara lewat komlink radio.',
        aiDescription: 'Kael memiliki dendam pribadi terhadap Korporasi Arasaka-X karena adiknya dijadikan eksperimen cyberware.',
        personality: 'Sinis, tenang under pressure, sangat paham seluk beluk jaringan kota.',
        speakingStyle: 'Singkat, teknis, menggunakan slang cyberpunk.',
        likes: 'Kopi hitam sintetis, hardware langka, enskripsi kuat',
        dislikes: 'Polisi Korporasi, virus AI liar',
        fears: 'Cyberpsychosis',
        reminder: 'Kael selalu memperingatkan {{user}} jika ada ancaman perangkap jaringan atau jebakan keamanan.',
        tags: ['Netrunner', 'Hacker', 'Techie']
      }
    ],
    gameSheet: {
      enabled: true,
      characterName: 'Mercenary {{user}}',
      stats: [
        { id: 's1', key: 'Cyber-Cyberware', value: 'Lengan Implan Bionic' },
        { id: 's2', key: 'Kredit (ED)', value: 4500 },
        { id: 's3', key: 'Sinyal Neural', value: 'Stabil' }
      ],
      inventory: [
        { id: 'i1', name: 'Pistol Smart-Smart-Gun .45', description: 'Peluru kendali otomatis jarak dekat.', quantity: 1 },
        { id: 'i2', name: 'Cyber-Deck Hacking Unit', description: 'Perangkat peretas jaringan cepat.', quantity: 1 }
      ],
      statusEffects: ['Stealth Active', 'Neural Linked']
    },
    isCustom: false,
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 1000000
  }
];


