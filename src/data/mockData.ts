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
  VillageEvent,
  VillageOfficial
} from '../types';

export const initialVillageProfile: VillageProfile = {
  name: 'Desa Sukamaju',
  code: '32.01.1010.2003',
  village_type: 'desa',
  district: 'Kecamatan Cibeureum',
  regency: 'Kabupaten Bogor',
  province: 'Jawa Barat',
  postal_code: '16840',
  office_address: 'Jl. Raya Sukamaju No. 12, Dusun Mekar, Kec. Cibeureum, Kab. Bogor 16840',
  office_phone: '(0251) 8256-700',
  office_email: 'sekretariat@sukamaju.desa.id',
  kades_name: 'Ahmad Subarjo, S.Pd.',
  sekdes_name: 'Rudi Hartono, S.Sos.',
  vision:
    'Terwujudnya Desa Sukamaju yang mandiri, sejahtera, dan berdaya saing melalui tata kelola pemerintahan yang transparan, digital, dan partisipatif.',
  mission: [
    'Menyelenggarakan pelayanan administrasi publik yang cepat, mudah, dan gratis berbasis teknologi digital',
    'Meningkatkan kesejahteraan masyarakat melalui program kesehatan, pendidikan, dan pemberdayaan ekonomi kerakyatan',
    'Membangun infrastruktur desa yang merata melalui perencanaan partisipatif Musrenbangdes'
  ]
};

export const initialVillageOfficials: VillageOfficial[] = [
  {
    id: 'off-01',
    nik: '3201011005780001',
    nip: '19780510 200501 1 002',
    nama_lengkap: 'Ahmad Subarjo, S.Pd.',
    email: 'kades@sukamaju.desa.id',
    role: 'kades',
    jabatan: 'Kepala Desa Sukamaju',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0812-3456-7801',
    whatsapp: '081234567801',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: true,
    status: 'active',
    order_index: 1
  },
  {
    id: 'off-02',
    nik: '3201011508820002',
    nip: '19820815 200801 1 004',
    nama_lengkap: 'Rudi Hartono, S.Sos.',
    email: 'sekdes@sukamaju.desa.id',
    role: 'sekdes',
    jabatan: 'Sekretaris Desa (Carik)',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0812-3456-7802',
    whatsapp: '081234567802',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 2
  },
  {
    id: 'off-03',
    nik: '3201014502890003',
    nama_lengkap: 'Nurul Hidayati, S.E.',
    email: 'keuangan@sukamaju.desa.id',
    role: 'kaur_keuangan',
    jabatan: 'Kaur Keuangan (Bendahara Desa)',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0813-2233-4401',
    whatsapp: '081322334401',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 3
  },
  {
    id: 'off-04',
    nik: '3201012204850004',
    nama_lengkap: 'Bambang Irawan, S.T.',
    email: 'perencanaan@sukamaju.desa.id',
    role: 'kaur_pembangunan',
    jabatan: 'Kaur Perencanaan & Pembangunan',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0813-2233-4402',
    whatsapp: '081322334402',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 4
  },
  {
    id: 'off-05',
    nik: '3201015607870005',
    nama_lengkap: 'Endang Suryani, A.Md.',
    email: 'tu@sukamaju.desa.id',
    role: 'kaur_tu_umum',
    jabatan: 'Kaur Tata Usaha & Umum',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0813-2233-4403',
    whatsapp: '081322334403',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 5
  },
  {
    id: 'off-06',
    nik: '3201011809900006',
    nama_lengkap: 'Agus Setiawan',
    email: 'pelayanan@sukamaju.desa.id',
    role: 'kasi_layanan',
    jabatan: 'Kasi Pelayanan Masyarakat',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0821-4455-6601',
    whatsapp: '082144556601',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 6
  },
  {
    id: 'off-07',
    nik: '3201010911860007',
    nama_lengkap: 'Dedi Supriadi, S.IP.',
    email: 'pemerintahan@sukamaju.desa.id',
    role: 'kasi_pemerintahan',
    jabatan: 'Kasi Pemerintahan Desa',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0821-4455-6602',
    whatsapp: '082144556602',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 7
  },
  {
    id: 'off-08',
    nik: '3201014812880008',
    nama_lengkap: 'Siti Masitoh, S.Pd.',
    email: 'kesra@sukamaju.desa.id',
    role: 'kasi_kesra',
    jabatan: 'Kasi Kesejahteraan (Kesra)',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0821-4455-6603',
    whatsapp: '082144556603',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 8
  },
  {
    id: 'off-09',
    nik: '3201011103750009',
    nama_lengkap: 'M. Hendra Gunawan',
    email: 'kadus1@sukamaju.desa.id',
    role: 'kadus',
    jabatan: 'Kepala Dusun I (Dusun Sukamaju)',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0812-3456-7891',
    whatsapp: '081234567891',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 9
  },
  {
    id: 'off-10',
    nik: '3201011206760010',
    nama_lengkap: 'Sukirman',
    email: 'kadus2@sukamaju.desa.id',
    role: 'kadus',
    jabatan: 'Kepala Dusun II (Dusun Cikaret)',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0813-9988-7766',
    whatsapp: '081399887766',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 10
  },
  {
    id: 'off-11',
    nik: '3201011708700011',
    nama_lengkap: 'Serka (Purn) M. Dahlan',
    email: 'linmas@sukamaju.desa.id',
    role: 'satlinmas',
    jabatan: 'Komandan Satlinmas & Trantibum',
    village_code: '32.01.1010.2003',
    village_name: 'Desa Sukamaju',
    village_type: 'desa',
    phone_number: '0811-2233-4455',
    whatsapp: '081122334455',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    can_sign_tte: false,
    status: 'active',
    order_index: 11
  }
];

export const initialCitizens: Citizen[] = [];

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
    id: 'demo-ltr-0012',
    tracking_number: 'SRT-202609-0012',
    letter_type_id: 1,
    letter_name: 'Surat Keterangan Tidak Mampu (SKTM)',
    applicant_user_id: 'demo-user-001',
    applicant_name: 'Siti Nurhaliza',
    applicant_phone: '0812-9988-7766',
    citizen_id: 'demo-cit-001',
    citizen_name: 'Siti Nurhaliza',
    citizen_nik: '3201096712010003',
    citizen_address: 'Dusun Mekar, RT 02 / RW 01, Desa Sukamaju',
    rt_number: '01',
    rw_number: '01',
    rt_status: 'approved_by_rt',
    rt_leader_name: 'Bpk. Hendra Gunawan',
    rt_leader_phone: '0812-3456-7891',
    rt_approved_at: '18 September 2026, 09.00 WIB',
    status: 'signed',
    purpose: 'Persyaratan pengajuan keringanan biaya pendidikan (beasiswa)',
    letter_official_number: '470/15/Kesra/IX/2026',
    qr_verification_token: 'DEKATI-SRT0012-7F3A9C',
    qr_verification_url: 'https://dekati.sukamaju.desa.id/#/verify/DEKATI-SRT0012-7F3A9C',
    signed_by_name: 'Ahmad Subarjo, S.Pd.',
    signed_at: '19 September 2026, 11.20 WIB',
    created_at: '18 September 2026, 08.30 WIB',
    timeline: [
      { title: 'Permohonan diajukan warga', time: '18 Sep 2026, 08.30', done: true, actor: 'Siti Nurhaliza' },
      { title: 'Rekomendasi disetujui Ketua RT 01', time: '18 Sep 2026, 09.00', done: true, actor: 'Bpk. Hendra Gunawan' },
      { title: 'Berkas diverifikasi operator', time: '18 Sep 2026, 13.45', done: true, actor: 'Kasi Pelayanan' },
      { title: 'Nomor surat resmi diterbitkan', time: '19 Sep 2026, 09.10', done: true, actor: 'Sekretariat Desa' },
      { title: 'Disahkan TTE QR oleh Kepala Desa', time: '19 Sep 2026, 11.20', done: true, actor: 'Ahmad Subarjo, S.Pd.' }
    ]
  },
  {
    id: 'demo-ltr-5522',
    tracking_number: 'SRT-202609-5522',
    letter_type_id: 2,
    letter_name: 'Surat Keterangan Usaha (SKU)',
    applicant_user_id: 'demo-user-002',
    applicant_name: 'Budi Santoso',
    applicant_phone: '0813-1122-3344',
    citizen_id: 'demo-cit-002',
    citizen_name: 'Budi Santoso',
    citizen_nik: '3201010808900006',
    citizen_address: 'Dusun Cikaret, RT 05 / RW 02, Desa Sukamaju',
    rt_number: '05',
    rw_number: '02',
    rt_status: 'approved_by_rt',
    rt_leader_name: 'Bpk. Sukirman',
    rt_leader_phone: '0813-9988-7766',
    rt_approved_at: '20 September 2026, 10.30 WIB',
    status: 'in_verification',
    purpose: 'Pengajuan pinjaman modal usaha KUR ke bank',
    created_at: '20 September 2026, 09.15 WIB',
    timeline: [
      { title: 'Permohonan diajukan warga', time: '20 Sep 2026, 09.15', done: true, actor: 'Budi Santoso' },
      { title: 'Rekomendasi disetujui Ketua RT 05', time: '20 Sep 2026, 10.30', done: true, actor: 'Bpk. Sukirman' },
      { title: 'Berkas diverifikasi operator', time: '20 Sep 2026, 14.05', done: true, actor: 'Kasi Pelayanan' },
      { title: 'Persetujuan Kepala Desa', time: 'Menunggu', done: false, actor: 'Ahmad Subarjo, S.Pd.' },
      { title: 'Pengesahan TTE QR & siap unduh', time: 'Menunggu', done: false }
    ]
  },
  {
    id: 'demo-ltr-0005',
    tracking_number: 'SRT-202609-0005',
    letter_type_id: 3,
    letter_name: 'Surat Pengantar SKCK Kepolisian',
    applicant_user_id: 'demo-user-003',
    applicant_name: 'Asep Saepudin',
    applicant_phone: '0821-4455-6677',
    citizen_id: 'demo-cit-003',
    citizen_name: 'Asep Saepudin',
    citizen_nik: '3201012506980009',
    citizen_address: 'Dusun Sukamaju, RT 03 / RW 01, Desa Sukamaju',
    rt_number: '03',
    rw_number: '01',
    rt_status: 'pending_rt',
    rt_leader_name: 'Bpk. Bambang Herwanto',
    rt_leader_phone: '0812-3456-7893',
    status: 'pending_rt',
    purpose: 'Lamaran kerja & pembuatan SKCK tingkat desa',
    created_at: '21 September 2026, 10.00 WIB',
    timeline: [
      { title: 'Permohonan diajukan warga', time: '21 Sep 2026, 10.00', done: true, actor: 'Asep Saepudin' },
      { title: 'Verifikasi & Rekomendasi Ketua RT 03', time: 'Menunggu konfirmasi', done: false, actor: 'Bpk. Bambang Herwanto' },
      { title: 'Pemeriksaan berkas oleh operator', time: 'Menunggu', done: false, actor: 'Kasi Pelayanan' },
      { title: 'Persetujuan Kepala Desa', time: 'Menunggu', done: false, actor: 'Ahmad Subarjo, S.Pd.' },
      { title: 'Pengesahan TTE QR & siap unduh', time: 'Menunggu', done: false }
    ]
  }
];

export const initialNeighborhoodUnits = [
  {
    id: 'rt-lk-001',
    village_code: '2102050003',
    dusun_name: 'Dusun I Lancang Kuning',
    rw_number: '01',
    rt_number: '01',
    rt_leader_name: 'Bpk. Hendra Gunawan',
    rt_leader_phone: '0812-6600-0001',
    is_active: true
  },
  {
    id: 'rt-lk-002',
    village_code: '2102050003',
    dusun_name: 'Dusun I Lancang Kuning',
    rw_number: '01',
    rt_number: '02',
    rt_leader_name: 'Bpk. Wawan Setiawan',
    rt_leader_phone: '0812-6600-0002',
    is_active: true
  },
  {
    id: 'rt-lk-003',
    village_code: '2102050003',
    dusun_name: 'Dusun II Lancang Kuning',
    rw_number: '02',
    rt_number: '03',
    rt_leader_name: 'Bpk. Bambang Herwanto',
    rt_leader_phone: '0812-6600-0003',
    is_active: true
  },
  {
    id: 'rt-lk-004',
    village_code: '2102050003',
    dusun_name: 'Dusun II Lancang Kuning',
    rw_number: '02',
    rt_number: '04',
    rt_leader_name: 'Bpk. Sukirman',
    rt_leader_phone: '0813-6600-0004',
    is_active: true
  }
];

export const initialComplaints: Complaint[] = [];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-blt-4',
    title: 'Penyaluran BLT-DD Tahap 4 Tahun 2026 Dipercepat',
    category: 'Bansos',
    summary:
      'Bantuan Langsung Tunai Dana Desa tahap 4 untuk 214 Keluarga Penerima Manfaat (KPM) di 4 dusun mulai disalurkan Senin, 12 Oktober 2026 di Aula Balai Desa Sukamaju. Wajib membawa KTP asli.',
    content:
      'Pemerintah Desa Sukamaju mempercepat penyaluran Bantuan Langsung Tunai (BLT) Dana Desa tahap 4. Penyaluran digelar bertahap per dusun mulai Senin, 12 Oktober 2026 pukul 09.00 WIB di Aula Balai Desa. Warga KPM diharapkan membawa KTP asli dan datang sesuai jadwal pembagian per RW. Bagi warga yang berhalangan hadir, dapat diwakilkan oleh anggota keluarga dengan membawa surat kuasa dan fotokopi KTP.',
    date: '10 Oktober 2026',
    is_urgent: false,
    author: 'Sekretariat Desa Sukamaju',
    views: 842,
    target_type: 'all'
  },
  {
    id: 'ann-posyandu',
    title: 'Posyandu Balita & Lansia Dusun Mekar: Cek Kesehatan Gratis',
    category: 'Kesehatan',
    summary:
      'Kader Posyandu Melati mengadakan pemeriksaan tumbuh kembang balita, imunisasi dasar, serta cek tekanan darah dan gula darah bagi lansia. Ajak keluarga Anda, gratis!',
    content:
      'Posyandu Melati Dusun Mekar kembali menggelar layanan rutin bulanan berupa penimbangan dan pemeriksaan tumbuh kembang balita, imunisasi dasar lengkap, vitamin A, serta cek tekanan darah dan gula darah bagi lansia. Kegiatan dilaksanakan di Posyandu Melati, Jl. Kp. Sukamaju RT 02/RW 01, mulai pukul 08.30 WIB. Seluruh layanan gratis bagi warga Desa Sukamaju.',
    date: '08 Oktober 2026',
    is_urgent: false,
    author: 'Kader Posyandu Melati',
    views: 621,
    target_type: 'dusun',
    target_value: 'Dusun Mekar'
  },
  {
    id: 'ann-urgent-hujan',
    title: 'Siaga Bencana: Waspada Curah Hujan Tinggi di Bantaran Sungai Cikaret',
    category: 'Darurat',
    summary:
      'BMKG memprediksi hujan lebat hingga awal November. Warga bantaran Sungai Cikaret agar siaga dan segera lapor ke Posko Siaga Desa Sukamaju (0251) 8256-700 bila terjadi genangan.',
    content:
      'Memasuki puncak musim hujan, Pemerintah Desa Sukamaju bersama Satlinmas dan Babinsa mengimbau seluruh warga, khususnya yang bermukim di bantaran Sungai Cikaret, untuk meningkatkan kewaspadaan. Apabila terjadi genangan atau longsor, segera hubungi Posko Siaga Bencana Desa di (0251) 8256-700 atau melalui aplikasi DEKATI menu Lapor Warga. Perangkat desa dan relawan siaga 24 jam.',
    date: '06 Oktober 2026',
    is_urgent: true,
    author: 'Satlinmas & Posko Siaga Bencana Desa',
    views: 1503,
    target_type: 'all'
  }
];

export const initialApbdes: ApbdesData = {
  fiscal_year: 2026,
  pendapatan: {
    total_budget: 2090000000,
    total_realized: 1647800000,
    items: [
      {
        name: 'Dana Desa (DD) APBN',
        account_code: '4.1.1',
        budget_amount: 1200000000,
        realized_amount: 979200000,
        percentage: 81.6
      },
      {
        name: 'Alokasi Dana Desa (ADD) APBD',
        account_code: '4.1.2',
        budget_amount: 650000000,
        realized_amount: 509600000,
        percentage: 78.4
      },
      {
        name: 'Pendapatan Asli Desa (PADes)',
        account_code: '4.1.3',
        budget_amount: 150000000,
        realized_amount: 96000000,
        percentage: 64
      },
      {
        name: 'Bagi Hasil Pajak & Retribusi',
        account_code: '4.1.4',
        budget_amount: 90000000,
        realized_amount: 63000000,
        percentage: 70
      }
    ]
  },
  belanja: {
    total_budget: 2090000000,
    total_realized: 1569850000,
    items: [
      {
        name: 'Pembangunan Infrastruktur Desa',
        account_code: '5.2.1',
        budget_amount: 950000000,
        realized_amount: 739100000,
        percentage: 77.8
      },
      {
        name: 'Penyelenggaraan Pemerintahan & Siltap',
        account_code: '5.2.2',
        budget_amount: 550000000,
        realized_amount: 429550000,
        percentage: 78.1
      },
      {
        name: 'Pemberdayaan Masyarakat (BUMDes & Posyandu)',
        account_code: '5.2.3',
        budget_amount: 320000000,
        realized_amount: 217600000,
        percentage: 68
      },
      {
        name: 'Penanggulangan Bencana & Keadaan Darurat',
        account_code: '5.2.4',
        budget_amount: 270000000,
        realized_amount: 183600000,
        percentage: 68
      }
    ]
  },
  realisasi_persen: 76.9
};

export const initialEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emg-1',
    title: 'Ambulans Desa 24 Jam',
    phone: '0812-3456-7890',
    icon: 'car',
    description: 'Layanan antar rujukan medis & persalinan darurat gratis warga',
    order_index: 1,
    is_active: true
  },
  {
    id: 'emg-2',
    title: 'Bhabinkamtibmas Polsek',
    phone: '0813-9876-5432',
    icon: 'shield',
    description: 'Petugas kepolisian pembina kamtibmas & keamanan wilayah desa',
    order_index: 2,
    is_active: true
  },
  {
    id: 'emg-3',
    title: 'Babinsa Koramil',
    phone: '0811-2233-4455',
    icon: 'shield-checkmark',
    description: 'Bintara pembina ketahanan wilayah & penanggulangan bencana',
    order_index: 3,
    is_active: true
  },
  {
    id: 'emg-4',
    title: 'Puskesmas / Bidan Desa',
    phone: '0821-5566-7788',
    icon: 'medkit',
    description: 'Pemeriksaan darurat medis, posyandu & layanan ibu-anak',
    order_index: 4,
    is_active: true
  },
  {
    id: 'emg-5',
    title: 'Sekretariat Kantor Desa',
    phone: '0251-876543',
    icon: 'business',
    description: 'Layanan informasi umum & pengaduan administrasi kantor desa',
    order_index: 5,
    is_active: true
  }
];

export const initialVillageEvents: VillageEvent[] = [
  {
    id: 'evt-1',
    title: 'Posyandu Balita & Lansia Dusun Mekar',
    category: 'Kesehatan',
    event_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    event_time: '08.30 - 11.30 WIB',
    location: 'Pos RW 01 Kp. Sukamaju',
    organizer: 'Kader Posyandu Melati',
    description: 'Pemeriksaan rutin tumbuh kembang balita, imunisasi dasar lengkap, serta cek tensi dan gula darah gratis bagi warga lansia.',
    is_active: true
  },
  {
    id: 'evt-2',
    title: 'Kerja Bakti Lingkungan & Normalisasi Drainase',
    category: 'Lingkungan',
    event_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    event_time: '07.00 - 10.00 WIB',
    location: 'Saluran Drainase RT 01 - RT 04',
    organizer: 'Karang Taruna & Satlinmas Desa',
    description: 'Gotong royong warga membersihkan sedimentasi saluran air untuk mengantisipasi genangan air di musim penghujan.',
    is_active: true
  },
  {
    id: 'evt-3',
    title: 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
    category: 'Pemerintahan',
    event_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    event_time: '09.00 - 12.30 WIB',
    location: 'Aula Balai Desa',
    organizer: 'BPD & Pemerintah Desa',
    description: 'Penyusunan usulan prioritas program kerja pembangunan desa bersama ketua RT, RW, dan tokoh masyarakat.',
    is_active: true
  }
];
