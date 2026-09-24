// src/data/mockData.ts
import {
  Citizen,
  LetterType,
  LetterRequest,
  Complaint,
  Announcement,
  ApbdesData,
  VillageProfile,
  EmergencyContact,
  VillageEvent
} from '../types';

export const initialVillageProfile: VillageProfile = {
  name: 'Desa Sukamaju',
  code: '32.01.01.2005',
  district: 'Kecamatan Ciawi',
  regency: 'Kabupaten Bogor',
  province: 'Jawa Barat',
  postal_code: '16720',
  office_address: 'Jl. Raya Sukamaju No. 12, Ciawi, Bogor',
  office_phone: '(0251) 8245678',
  office_email: 'sekretariat@sukamaju.desa.id',
  kades_name: 'Drs. H. Mulyadi Kartodirdjo, M.Si',
  sekdes_name: 'Bambang Irawan, S.AP',
  vision: 'Mewujudkan Desa Sukamaju yang Mandiri, Sejahtera, Transparan, dan Berdaya Saing Berbasis Pelayanan Digital Ramah Warga.',
  mission: [
    'Meningkatkan transparansi tata kelola pemerintahan desa berbasis teknologi informasi.',
    'Mempercepat dan mempermudah layanan administrasi kependudukan tanpa pungutan liar.',
    'Pemberdayaan ekonomi kerakyatan melalui BUMDes dan optimalisasi potensi lokal.',
    'Pemerataan pembangunan infrastruktur pertanian, jalan lingkungan, dan fasilitas umum desa.'
  ]
};

export const initialCitizens: Citizen[] = [
  {
    id: 'usr-001',
    user_id: 'u-001',
    nik: '3201012345670001',
    no_kk: '3201012345670000',
    nama_lengkap: 'Ahmad Subarjo',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '1978-05-14',
    jenis_kelamin: 'L',
    agama: 'Islam',
    pekerjaan: 'Wiraswasta',
    status_perkawinan: 'Kawin',
    status_dalam_keluarga: 'Kepala Keluarga',
    alamat_lengkap: 'Kp. Sukamaju RT 02 / RW 01',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekar',
    phone_number: '081234567890',
    email: 'ahmad.subarjo@gmail.com',
    foto_ktp_path: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    foto_kk_path: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    foto_selfie_ktp_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    is_verified: true,
    verified_at: '2026-09-10 09:30 WIB',
    verified_by: 'Bambang Irawan (Sekdes)'
  },
  {
    id: 'usr-002',
    user_id: 'u-002',
    nik: '3201012345670002',
    no_kk: '3201012345670000',
    nama_lengkap: 'Siti Rahmawati',
    tempat_lahir: 'Sukabumi',
    tanggal_lahir: '1982-08-20',
    jenis_kelamin: 'P',
    agama: 'Islam',
    pekerjaan: 'Mengurus Rumah Tangga',
    status_perkawinan: 'Kawin',
    status_dalam_keluarga: 'Istri',
    alamat_lengkap: 'Kp. Sukamaju RT 02 / RW 01',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekar',
    phone_number: '081234567891',
    is_verified: true,
    verified_at: '2026-09-10 09:30 WIB',
    verified_by: 'Bambang Irawan (Sekdes)'
  },
  {
    id: 'usr-003',
    user_id: 'u-003',
    nik: '3201016543210002',
    no_kk: '3201012345670000',
    nama_lengkap: 'Siti Subarjo',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '2005-11-10',
    jenis_kelamin: 'P',
    agama: 'Islam',
    pekerjaan: 'Pelajar / Mahasiswa',
    status_perkawinan: 'Belum Kawin',
    status_dalam_keluarga: 'Anak',
    alamat_lengkap: 'Kp. Sukamaju RT 02 / RW 01',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekar',
    is_verified: true
  },
  {
    id: 'usr-004',
    user_id: 'u-004',
    nik: '3201016543210003',
    no_kk: '3201012345670000',
    nama_lengkap: 'Doni Subarjo',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '2010-02-18',
    jenis_kelamin: 'L',
    agama: 'Islam',
    pekerjaan: 'Pelajar',
    status_perkawinan: 'Belum Kawin',
    status_dalam_keluarga: 'Anak',
    alamat_lengkap: 'Kp. Sukamaju RT 02 / RW 01',
    rt: '02',
    rw: '01',
    dusun: 'Dusun Mekar',
    is_verified: true
  },
  {
    id: 'usr-005',
    user_id: 'u-005',
    nik: '3201019988770001',
    no_kk: '3201019988770000',
    nama_lengkap: 'Budi Santoso',
    tempat_lahir: 'Cianjur',
    tanggal_lahir: '1985-03-22',
    jenis_kelamin: 'L',
    agama: 'Islam',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'Kawin',
    status_dalam_keluarga: 'Kepala Keluarga',
    alamat_lengkap: 'Kp. Sukamaju RT 01 / RW 02',
    rt: '01',
    rw: '02',
    dusun: 'Dusun Krajan',
    phone_number: '085712349988',
    email: 'budi.santoso@yahoo.com',
    foto_ktp_path: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    foto_kk_path: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    foto_selfie_ktp_path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    is_verified: false // Butuh verifikasi admin!
  },
  {
    id: 'usr-006',
    user_id: 'u-006',
    nik: '3201018877660002',
    no_kk: '3201018877660000',
    nama_lengkap: 'Dewi Lestari',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '1992-07-15',
    jenis_kelamin: 'P',
    agama: 'Islam',
    pekerjaan: 'Guru Honorer',
    status_perkawinan: 'Kawin',
    status_dalam_keluarga: 'Istri',
    alamat_lengkap: 'Kp. Sukahening RT 03 / RW 03',
    rt: '03',
    rw: '03',
    dusun: 'Dusun Sukahening',
    phone_number: '081388776655',
    foto_ktp_path: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    foto_kk_path: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    foto_selfie_ktp_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    is_verified: false // Butuh verifikasi admin!
  }
];

export const initialLetterTypes: LetterType[] = [
  {
    id: 1,
    code: 'SKTM',
    name: 'Surat Keterangan Tidak Mampu (SKTM)',
    description: 'Keperluan beasiswa kuliah, permohonan keringanan RS, atau bantuan pendidikan.',
    estimated_days: 1,
    icon: 'GraduationCap',
    required_docs: ['Foto KTP Pemohon', 'Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW']
  },
  {
    id: 2,
    code: 'SKU',
    name: 'Surat Keterangan Usaha (SKU)',
    description: 'Persyaratan pengajuan pinjaman modal usaha/KUR perbankan dan legalitas tempat usaha.',
    estimated_days: 1,
    icon: 'Store',
    required_docs: ['Foto KTP Pemilik Usaha', 'Foto Kartu Keluarga (KK)', 'Foto Tempat/Kegiatan Usaha']
  },
  {
    id: 3,
    code: 'SKCK_PENGANTAR',
    name: 'Surat Pengantar SKCK Kepolisian',
    description: 'Surat pengantar resmi ke Polsek untuk pembuatan SKCK melamar kerja / CPNS.',
    estimated_days: 1,
    icon: 'ShieldCheck',
    required_docs: ['Foto KTP', 'Foto Kartu Keluarga (KK)', 'Pas Foto Berwarna 4x6']
  },
  {
    id: 4,
    code: 'SK_DOMISILI',
    name: 'Surat Keterangan Domisili',
    description: 'Keterangan tempat tinggal sah bagi warga atau perorangan.',
    estimated_days: 1,
    icon: 'Home',
    required_docs: ['Foto KTP', 'Foto Kartu Keluarga', 'Bukti Pengantar RT/RW']
  }
];

export const initialLetterRequests: LetterRequest[] = [
  {
    id: 'req-001',
    tracking_number: 'SRT-202609-0012',
    letter_type_id: 1,
    letter_name: 'Surat Keterangan Tidak Mampu (SKTM)',
    applicant_user_id: 'usr-001',
    applicant_name: 'Ahmad Subarjo',
    applicant_phone: '081234567890',
    citizen_id: 'usr-003',
    citizen_name: 'Siti Subarjo (Anak)',
    citizen_nik: '3201016543210002',
    citizen_address: 'Kp. Sukamaju RT 02 / RW 01, Dusun Mekar',
    status: 'signed',
    purpose: 'Syarat permohonan beasiswa kuliah KIP Kuliah di Perguruan Tinggi Negeri',
    letter_official_number: '470/12/SKTM/IX/2026',
    qr_verification_token: 'valid-4f8a92-sktm-2026',
    qr_verification_url: 'https://dekati.sukamaju.desa.id/verify/valid-4f8a92-sktm-2026',
    pdf_file_url: '/letters/SRT-202609-0012.pdf',
    signed_by_name: 'Drs. H. Mulyadi Kartodirdjo, M.Si (Kades)',
    signed_at: '19 September 2026, 10:20 WIB',
    created_at: '19 September 2026, 08:30 WIB',
    updated_at: '19 September 2026, 10:25 WIB',
    attachments: [
      { name: 'KTP Pemohon', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', verified: true },
      { name: 'Kartu Keluarga', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', verified: true },
      { name: 'Pengantar RT/RW', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', verified: true }
    ],
    timeline: [
      { title: 'Permohonan Dikirim Warga', time: '19 Sep 08:30', done: true, actor: 'Ahmad Subarjo' },
      { title: 'Berkas Diverifikasi Petugas Desa', time: '19 Sep 09:15', done: true, actor: 'Operator Pelayanan' },
      { title: 'Diterbitkan No. Registrasi Desa (470/12/SKTM/IX/2026)', time: '19 Sep 10:00', done: true, actor: 'Sekretariat Desa' },
      { title: 'Tanda Tangan Elektronik QR Kades Disahkan', time: '19 Sep 10:20', done: true, actor: 'Drs. H. Mulyadi Kartodirdjo' },
      { title: 'Surat Selesai & Siap Diunduh Warga', time: '19 Sep 10:25', done: true }
    ]
  },
  {
    id: 'req-002',
    tracking_number: 'SRT-202609-0005',
    letter_type_id: 2,
    letter_name: 'Surat Keterangan Usaha (SKU)',
    applicant_user_id: 'usr-001',
    applicant_name: 'Ahmad Subarjo',
    applicant_phone: '081234567890',
    citizen_id: 'usr-001',
    citizen_name: 'Ahmad Subarjo',
    citizen_nik: '3201012345670001',
    citizen_address: 'Kp. Sukamaju RT 02 / RW 01, Dusun Mekar',
    status: 'in_verification',
    purpose: 'Pengajuan modal kerja KUR Mikro Bank BRI Unit Ciawi untuk usaha warung kelontong',
    letter_official_number: '503/05/SKU/IX/2026',
    created_at: '18 September 2026, 14:10 WIB',
    updated_at: '19 September 2026, 08:00 WIB',
    attachments: [
      { name: 'KTP Pemilik Usaha', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', verified: true },
      { name: 'Kartu Keluarga', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', verified: true },
      { name: 'Foto Toko / Usaha', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80', verified: false }
    ],
    timeline: [
      { title: 'Permohonan Dikirim Warga', time: '18 Sep 14:10', done: true, actor: 'Ahmad Subarjo' },
      { title: 'Sedang Diverifikasi Petugas Pelayanan', time: '19 Sep 08:00', done: true, actor: 'Staf Pelayanan' },
      { title: 'Penerbitan No. Registrasi Desa', time: '-', done: false },
      { title: 'Pengesahan TTE Kades', time: '-', done: false }
    ]
  },
  {
    id: 'req-003',
    tracking_number: 'SRT-202609-0018',
    letter_type_id: 3,
    letter_name: 'Surat Pengantar SKCK Kepolisian',
    applicant_user_id: 'usr-005',
    applicant_name: 'Budi Santoso',
    applicant_phone: '085712349988',
    citizen_id: 'usr-005',
    citizen_name: 'Budi Santoso',
    citizen_nik: '3201019988770001',
    citizen_address: 'Kp. Sukamaju RT 01 / RW 02, Dusun Krajan',
    status: 'submitted',
    purpose: 'Melengkapi berkas pendaftaran Seleksi Calon Pegawai Negeri Sipil (CPNS) 2026',
    created_at: '19 September 2026, 11:45 WIB',
    attachments: [
      { name: 'KTP Pemohon', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', verified: false },
      { name: 'Kartu Keluarga', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', verified: false },
      { name: 'Pas Foto 4x6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', verified: false }
    ],
    timeline: [
      { title: 'Permohonan Dikirim Warga', time: '19 Sep 11:45', done: true, actor: 'Budi Santoso' },
      { title: 'Pemeriksaan Berkas Operator', time: '-', done: false },
      { title: 'Penerbitan Nomor Resmi Desa', time: '-', done: false },
      { title: 'Pengesahan TTE Kades', time: '-', done: false }
    ]
  },
  {
    id: 'req-004',
    tracking_number: 'SRT-202609-0021',
    letter_type_id: 4,
    letter_name: 'Surat Keterangan Domisili',
    applicant_user_id: 'usr-006',
    applicant_name: 'Dewi Lestari',
    applicant_phone: '081388776655',
    citizen_id: 'usr-006',
    citizen_name: 'Dewi Lestari',
    citizen_nik: '3201018877660002',
    citizen_address: 'Kp. Sukahening RT 03 / RW 03, Dusun Sukahening',
    status: 'submitted',
    purpose: 'Persyaratan pembukaan rekening bank sertifikasi pendidik di Bank BJB',
    created_at: '19 September 2026, 13:20 WIB',
    attachments: [
      { name: 'KTP Pemohon', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80', verified: false },
      { name: 'Kartu Keluarga', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80', verified: false }
    ],
    timeline: [
      { title: 'Permohonan Dikirim Warga', time: '19 Sep 13:20', done: true, actor: 'Dewi Lestari' },
      { title: 'Pemeriksaan Berkas Operator', time: '-', done: false },
      { title: 'Penerbitan Nomor Resmi Desa', time: '-', done: false },
      { title: 'Pengesahan TTE Kades', time: '-', done: false }
    ]
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'cmp-001',
    ticket_number: 'ADU-202609-0012',
    category: 'Infrastruktur Jalan',
    title: 'Jalan Berlubang Parah Dekat Jembatan RT 03',
    description: 'Kedalaman lubang sekitar 30cm dan sering menimbulkan genangan air serta kecelakaan pengendara motor saat malam hari.',
    location_address: 'Jl. Raya Desa Km 2 dekat Jembatan Saluran Irigasi',
    rt: '03',
    rw: '01',
    dusun: 'Dusun Mekar',
    reporter_name: 'Warga Dusun Mekar (Anonim)',
    reporter_phone: '081234567890',
    is_anonymous: true,
    status: 'in_progress',
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    assigned_department: 'Seksi Kesejahteraan & Pembangunan Desa',
    assigned_officer: 'Ir. Hendro Wijoyo (Kaur Pembangunan)',
    created_at: '18 September 2026, 16:45 WIB'
  },
  {
    id: 'cmp-002',
    ticket_number: 'ADU-202609-0008',
    category: 'Penerangan Jalan (PJU)',
    title: 'Lampu PJU Padam di Gang Mawar',
    description: 'Sudah 4 hari lampu penerangan jalan mati total membuat jalanan lorong gelap gulita dan rawan kriminalitas.',
    location_address: 'Gang Mawar No. 4, RT 01 / RW 01',
    rt: '01',
    rw: '01',
    dusun: 'Dusun Mekar',
    reporter_name: 'Ahmad Subarjo',
    reporter_phone: '081234567890',
    is_anonymous: false,
    status: 'resolved',
    photo_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    resolution_proof: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    resolution_notes: 'Bohlam penerangan LED 50W baru telah dipasang oleh Tim Reaksi Cepat Satlinmas Desa.',
    assigned_department: 'Satuan Linmas & Ketenteraman Desa',
    assigned_officer: 'Danru Supriatna',
    created_at: '15 September 2026, 19:20 WIB',
    resolved_at: '17 September 2026, 10:15 WIB'
  },
  {
    id: 'cmp-003',
    ticket_number: 'ADU-202609-0015',
    category: 'Kebersihan & Sampah',
    title: 'Penumpukan Sampah Liar di Pinggir Kali Sukamaju',
    description: 'Ada oknum pembuang sampah liar yang meninggalkan tumpukan plastik bau menyengat di tikungan kali Sukamaju.',
    location_address: 'Bantaran Kali Sukamaju perbatasan RT 04 / RW 02',
    rt: '04',
    rw: '02',
    dusun: 'Dusun Krajan',
    reporter_name: 'Budi Santoso',
    reporter_phone: '085712349988',
    is_anonymous: false,
    status: 'submitted',
    photo_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80',
    created_at: '19 September 2026, 14:15 WIB'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'anc-001',
    title: 'Penyaluran Bantuan Langsung Tunai (BLT) Dana Desa Tahap 3',
    category: 'Bansos',
    summary: 'Penyaluran BLT-DD akan dilaksanakan pada Sabtu, 21 September 2026 mulai pukul 09.00 WIB di Aula Balai Desa Sukamaju.',
    content: 'Pemerintah Desa Sukamaju akan menyalurkan Bantuan Langsung Tunai Dana Desa (BLT-DD) Tahap III Tahun Anggaran 2026. Kepada seluruh Keluarga Penerima Manfaat (KPM) terdaftar diharapkan membawa KTP Asli, KK Asli, dan surat undangan resmi. Penyaluran dimulai pukul 09.00 WIB sampai selesai.',
    date: '18 Sep 2026',
    is_urgent: true,
    author: 'Sekretariat Desa Sukamaju',
    views: 412,
    target_type: 'all'
  },
  {
    id: 'anc-002',
    title: 'Jadwal Pelayanan Posyandu Balita & Lansia Dusun Mekar',
    category: 'Kesehatan',
    summary: 'Pemeriksaan rutin kesehatan anak dan lansia bertempat di Pos RW 01 Sukamaju.',
    content: 'Diberitahukan kepada ibu-ibu yang memiliki balita dan lansia di wilayah Dusun Mekar, jadwal posyandu bulanan akan diadakan pada hari Selasa pekan depan. Disediakan imunisasi gratis, penimbangan balita, dan pemberian vitamin.',
    date: '17 Sep 2026',
    is_urgent: false,
    author: 'Kader Posyandu Melati',
    views: 185,
    target_type: 'dusun',
    target_value: 'Dusun Mekar'
  },
  {
    id: 'anc-003',
    title: 'Kerja Bakti & Gotong Royong Pembersihan Saluran Air Musim Hujan',
    category: 'Lingkungan',
    summary: 'Dihimbau seluruh warga RT 01 s/d RT 04 untuk berpartisipasi menjaga kebersihan parit dan drainase.',
    content: 'Menghadapi potensi curah hujan tinggi akhir September, dimohon kehadiran warga dalam aksi gotong royong massal membersihkan selokan dan pemotongan ranting pohon rawan tumbang pada Minggu pagi pukul 07.00 WIB.',
    date: '14 Sep 2026',
    is_urgent: false,
    author: 'Kepala Dusun Mekar',
    views: 320,
    target_type: 'rw',
    target_value: 'RW 01'
  }
];

export const initialApbdes: ApbdesData = {
  fiscal_year: 2026,
  pendapatan: {
    total_budget: 2150000000,
    total_realized: 1680000000,
    items: [
      { name: 'Dana Desa (DDS) APBN', account_code: '4.1.1', budget_amount: 1200000000, realized_amount: 980000000, percentage: 81.6 },
      { name: 'Alokasi Dana Desa (ADD) APBD', account_code: '4.1.2', budget_amount: 650000000, realized_amount: 510000000, percentage: 78.4 },
      { name: 'Bagi Hasil Pajak & Retribusi Daerah', account_code: '4.1.3', budget_amount: 180000000, realized_amount: 120000000, percentage: 66.6 },
      { name: 'Pendapatan Asli Desa (BUMDes & Pasar)', account_code: '4.2.1', budget_amount: 120000000, realized_amount: 70000000, percentage: 58.3 }
    ]
  },
  belanja: {
    total_budget: 2100000000,
    total_realized: 1565000000,
    items: [
      { name: 'Pembangunan Infrastruktur & Jalan Desa', account_code: '5.2.1', budget_amount: 950000000, realized_amount: 740000000, percentage: 77.8 },
      { name: 'Penyelenggaraan Pemerintahan Desa & Siltap', account_code: '5.1.1', budget_amount: 550000000, realized_amount: 430000000, percentage: 78.1 },
      { name: 'Pembinaan & Pemberdayaan Masyarakat', account_code: '5.3.1', budget_amount: 350000000, realized_amount: 245000000, percentage: 70.0 },
      { name: 'Penanggulangan Bencana & Mendesak (BLT-DD)', account_code: '5.4.1', budget_amount: 250000000, realized_amount: 150000000, percentage: 60.0 }
    ]
  },
  realisasi_persen: 74.5
};

export const initialEmergencyContacts: EmergencyContact[] = [
  { id: 'emg-1', title: 'Ambulans Siaga Desa 24 Jam', phone: '0812-3456-7890', icon: 'car', description: 'Layanan antar rujukan darurat medis gratis warga', order_index: 1, is_active: true },
  { id: 'emg-2', title: 'Bhabinkamtibmas Polsek', phone: '0813-9876-5432', icon: 'shield', description: 'Petugas kepolisian pembina ketertiban umum desa', order_index: 2, is_active: true },
  { id: 'emg-3', title: 'Babinsa Koramil', phone: '0811-2233-4455', icon: 'shield', description: 'Bintara pembina keamanan dan ketahanan desa', order_index: 3, is_active: true },
  { id: 'emg-4', title: 'Puskesmas / Bidan Desa', phone: '0821-5566-7788', icon: 'heart', description: 'Pelayanan gawat darurat medis & persalinan', order_index: 4, is_active: true },
  { id: 'emg-5', title: 'Pos Pemadam Kebakaran (Damkar)', phone: '0251-8321113', icon: 'flame', description: 'Penanganan insiden kebakaran & evakuasi penyelamatan', order_index: 5, is_active: true },
  { id: 'emg-6', title: 'Regu Satlinmas Desa', phone: '0815-4433-2211', icon: 'shield-alert', description: 'Patroli ketenteraman lingkungan RT/RW', order_index: 6, is_active: true },
];

export const initialVillageEvents: VillageEvent[] = [
  {
    id: 'evt-1',
    title: 'Posyandu Balita & Skrining Lansia Sehat',
    category: 'Kesehatan',
    event_date: '2026-09-24',
    event_time: '08.30 - 11.30 WIB',
    location: 'Balai Warga RW 01 Dusun Mekar',
    organizer: 'Kader Posyandu Melati & Bidan Desa',
    description: 'Pemeriksaan rutin tumbuh kembang balita, imunisasi dasar lengkap, serta cek tekanan darah dan gula darah gratis bagi lansia.',
    is_active: true
  },
  {
    id: 'evt-2',
    title: 'Musyawarah Perencanaan Desa (Musrenbangdes)',
    category: 'Pemerintahan',
    event_date: '2026-09-28',
    event_time: '09.00 - 13.00 WIB',
    location: 'Aula Graha Balai Desa Sukamaju',
    organizer: 'BPD & Pemerintah Desa Sukamaju',
    description: 'Penyusunan RKPDes dan penetapan prioritas usulan pembangunan fisik tahun anggaran 2027 bersama ketua RT/RW dan tokoh masyarakat.',
    is_active: true
  },
  {
    id: 'evt-3',
    title: 'Aksi Bersih Lingkungan & Gotong Royong Musim Hujan',
    category: 'Lingkungan',
    event_date: '2026-10-04',
    event_time: '07.00 - 10.30 WIB',
    location: 'Saluran Drainase Utama RT 01 s/d RT 04 Dusun Mekar',
    organizer: 'Karang Taruna & Satlinmas Desa',
    description: 'Pembersihan endapan sedimentasi selokan, pemotongan dahan pohon rawan tumbang, dan kerja bakti serentak warga.',
    is_active: true
  }
];
