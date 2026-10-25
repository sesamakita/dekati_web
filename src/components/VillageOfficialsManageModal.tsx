// src/components/VillageOfficialsManageModal.tsx
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  Plus,
  Edit3,
  Trash2,
  Save,
  CheckCircle2,
  RotateCcw,
  Search,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Upload,
  Camera,
  Image as ImageIcon,
  Loader2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { VillageOfficial } from '../types';
import { initialVillageOfficials } from '../data/mockData';
import { supabase } from '../services/supabase';

interface VillageOfficialsManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddMode?: boolean;
  initialEditOfficial?: VillageOfficial | null;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
];

export const VillageOfficialsManageModal: React.FC<VillageOfficialsManageModalProps> = ({
  isOpen,
  onClose,
  initialAddMode = false,
  initialEditOfficial = null
}) => {
  const { officials, saveOfficial, updateOfficial, deleteOfficial, profile } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Form State (untuk Tambah / Edit)
  const [isEditing, setIsEditing] = useState(initialAddMode || !!initialEditOfficial);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formNama, setFormNama] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formRole, setFormRole] = useState<string>('kasi_layanan');
  const [formNik, setFormNik] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formAvatar, setFormAvatar] = useState(DEFAULT_AVATARS[0]);
  const [formCanTte, setFormCanTte] = useState(false);
  const [formOrder, setFormOrder] = useState<number>(10);

  // Photo upload from file state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Kompresi dan penyesuaian foto agar proporsional (square crop) dan ringan
  const compressImage = (file: File, maxSize = 600): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Format berkas bukan gambar valid.'));
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const canvas = document.createElement('canvas');
          const targetDim = Math.min(maxSize, minDim);
          canvas.width = targetDim;
          canvas.height = targetDim;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetDim, targetDim);

          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const processPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas foto/gambar yang sah (JPG, JPEG, PNG, atau WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 10 MB.');
      return;
    }

    setIsProcessingPhoto(true);
    setPhotoUploadError(null);

    try {
      // 1. Dapatkan versi kompresi Base64 lokal yang ringan & proporsional
      const compressedDataUri = await compressImage(file, 600);

      // Tampilkan pratinjau instan langsung
      setFormAvatar(compressedDataUri);

      // 2. Unggah ke Supabase Storage (bucket: 'documents', path: 'officials/...')
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt.toLowerCase())
          ? fileExt.toLowerCase()
          : 'jpg';
        const fileName = `official_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
        const filePath = `officials/${fileName}`;

        // Konversi Data URI ke Blob untuk upload Supabase Storage
        const res = await fetch(compressedDataUri);
        const blob = await res.blob();

        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(filePath, blob, {
            contentType: `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
            upsert: true
          });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            setFormAvatar(urlData.publicUrl);
          }
        } else {
          console.warn('[Dekati Storage] Upload fallback ke Data URI lokal:', uploadErr.message);
        }
      } catch (storageErr) {
        console.warn('[Dekati Storage] Supabase Storage offline/error:', storageErr);
      }
    } catch (err: any) {
      console.error('[Dekati Profile Photo] Error:', err);
      setPhotoUploadError(err.message || 'Gagal memproses berkas foto.');
      alert('Gagal memuat foto profil: ' + (err.message || 'Format tidak didukung'));
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  // Modal konfirmasi hapus
  const [deletingOfficial, setDeletingOfficial] = useState<VillageOfficial | null>(null);

  // Feedback status
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleOpenCreate = React.useCallback(() => {
    setEditingId(null);
    setFormNama('');
    setFormJabatan('');
    setFormRole('kasi_layanan');
    setFormNik('');
    setFormNip('');
    setFormWhatsapp('');
    setFormPhone('');
    setFormEmail('');
    setFormPassword('desa123456');
    setShowFormPassword(false);
    setFormAvatar(DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]);
    setFormCanTte(false);
    setFormOrder(officials.length + 1);
    setPhotoUploadError(null);
    setIsProcessingPhoto(false);
    setIsEditing(true);
  }, [officials.length]);

  const handleOpenEdit = React.useCallback((official: VillageOfficial) => {
    setEditingId(official.id);
    setFormNama(official.nama_lengkap || '');
    setFormJabatan(official.jabatan || '');
    setFormRole(official.role || 'kasi_layanan');
    setFormNik(official.nik || '');
    setFormNip(official.nip || '');
    setFormWhatsapp(official.whatsapp || official.phone_number || '');
    setFormPhone(official.phone_number || official.whatsapp || '');
    setFormEmail(official.email || '');
    setFormPassword(official.password || '');
    setShowFormPassword(false);
    setFormAvatar(official.avatar_url || DEFAULT_AVATARS[0]);
    setFormCanTte(!!official.can_sign_tte);
    setFormOrder(official.order_index ?? 10);
    setPhotoUploadError(null);
    setIsProcessingPhoto(false);
    setIsEditing(true);
  }, []);

  // Sync saat modal buka
  React.useEffect(() => {
    if (isOpen) {
      if (initialEditOfficial) {
        handleOpenEdit(initialEditOfficial);
      } else if (initialAddMode) {
        handleOpenCreate();
      } else {
        setIsEditing(false);
        setEditingId(null);
      }
      setSearchQuery('');
      setFilterRole('all');
      setActionSuccessMessage(null);
    }
  }, [isOpen, initialAddMode, initialEditOfficial, handleOpenCreate, handleOpenEdit]);

  // Filtered Officials (unconditional hook execution)
  const filteredOfficials = useMemo(() => {
    return officials.filter((o) => {
      if (filterRole !== 'all') {
        if (filterRole === 'pimpinan' && o.role !== 'kades' && o.role !== 'lurah' && o.role !== 'sekdes') {
          return false;
        }
        if (filterRole === 'kaur' && !o.role.includes('kaur')) return false;
        if (filterRole === 'kasi' && !o.role.includes('kasi')) return false;
        if (filterRole === 'wilayah' && o.role !== 'kadus' && o.role !== 'satlinmas') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = o.nama_lengkap.toLowerCase().includes(q);
        const matchJabatan = (o.jabatan || '').toLowerCase().includes(q);
        const matchPhone = (o.whatsapp || o.phone_number || '').includes(q);
        const matchRole = o.role.toLowerCase().includes(q);
        if (!matchName && !matchJabatan && !matchPhone && !matchRole) return false;
      }

      return true;
    }).sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99));
  }, [officials, filterRole, searchQuery]);

  const showSuccessFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 3000);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formNama.trim()) {
      alert('Mohon isi nama lengkap pamong desa.');
      return;
    }

    if (editingId) {
      // Mode Edit
      await updateOfficial(editingId, {
        nama_lengkap: formNama.trim(),
        jabatan: formJabatan.trim() || undefined,
        role: formRole as any,
        nik: formNik.trim(),
        nip: formNip.trim() || undefined,
        whatsapp: formWhatsapp.trim() || undefined,
        phone_number: formPhone.trim() || formWhatsapp.trim() || undefined,
        email: formEmail.trim() || undefined,
        password: formPassword.trim() || undefined,
        avatar_url: formAvatar.trim() || undefined,
        can_sign_tte: formCanTte,
        order_index: Number(formOrder) || 10
      });
      showSuccessFeedback(`Data pamong "${formNama}" berhasil diperbarui.`);
    } else {
      // Mode Tambah Baru
      const newOfficial: VillageOfficial = {
        id: `off-${Date.now()}`,
        nama_lengkap: formNama.trim(),
        jabatan: formJabatan.trim() || 'Aparatur Pemerintah Desa',
        role: formRole as any,
        nik: formNik.trim() || `${Date.now()}`.slice(0, 16),
        nip: formNip.trim() || undefined,
        whatsapp: formWhatsapp.trim() || undefined,
        phone_number: formPhone.trim() || formWhatsapp.trim() || undefined,
        email: formEmail.trim() || `${formNama.toLowerCase().replace(/\s+/g, '')}@${profile.code || 'desa.id'}`,
        password: formPassword.trim() || 'desa123456',
        village_code: profile.code || '32.01.1010.2003',
        village_name: profile.name || 'Desa Sukamaju',
        village_type: profile.village_type || 'desa',
        avatar_url: formAvatar.trim() || undefined,
        can_sign_tte: formCanTte,
        status: 'active',
        order_index: Number(formOrder) || officials.length + 1
      };
      await saveOfficial(newOfficial);
      showSuccessFeedback(`Pamong baru "${formNama}" berhasil ditambahkan ke susunan organisasi.`);
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDeleteConfirm = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!deletingOfficial) return;
    const name = deletingOfficial.nama_lengkap;
    await deleteOfficial(deletingOfficial.id);
    setDeletingOfficial(null);
    showSuccessFeedback(`Pamong "${name}" telah dihapus dari struktur organisasi.`);
  };

  const handleResetToDefault = async () => {
    if (
      window.confirm(
        'Kembalikan susunan organisasi ke aparatur standar Kemendagri / Desa Sukamaju? Perubahan kustom yang dibuat sebelumnya akan digantikan.'
      )
    ) {
      for (const off of initialVillageOfficials) {
        await saveOfficial(off);
      }
      showSuccessFeedback('Susunan aparatur berhasil dikembalikan ke standar awal.');
    }
  };

  // Early return ONLY after all hooks have been invoked
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-y-auto">
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] my-auto flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/25">
              {isEditing ? (
                editingId ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {isEditing
                    ? editingId
                      ? `Edit Data Pamong: ${formNama || 'Pamong'}`
                      : 'Tambah Pamong / Aparatur Baru'
                    : 'Kelola Struktur Organisasi & Pamong Desa'}
                </span>
                {!isEditing && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {officials.length} Pamong
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing
                  ? 'Lengkapi jabatan, nomor kontak WhatsApp, dan wewenang TTE QR surat digital'
                  : 'Tambah aparatur baru, edit nomor WhatsApp resmi, atau sesuaikan penugasan dan otoritas TTE'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={isEditing ? () => { setIsEditing(false); setEditingId(null); } : onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all"
            title={isEditing ? 'Kembali ke Daftar' : 'Tutup'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {actionSuccessMessage && (
          <div className="px-6 py-2.5 bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* FORM MODE: TAMBAH / EDIT PAMONG */}
          {isEditing ? (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  {editingId ? <Edit3 className="w-4 h-4 text-emerald-600" /> : <UserPlus className="w-4 h-4 text-emerald-600" />}
                  <span>{editingId ? 'Edit Data Pamong Desa' : 'Tambah Pamong / Aparatur Baru'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Kembali ke Daftar
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      placeholder="Contoh: Ahmad Subarjo, S.Pd."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  {/* Jabatan Resmi */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Jabatan Resmi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formJabatan}
                      onChange={(e) => setFormJabatan(e.target.value)}
                      placeholder="Contoh: Kepala Seksi Kesejahteraan (Kesra)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  {/* Kategori Role */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Kategori / Fungsi</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="kades">Kepala Desa (Kades)</option>
                      <option value="lurah">Lurah (Kelurahan)</option>
                      <option value="sekdes">Sekretaris Desa (Sekdes/Carik)</option>
                      <option value="kaur_keuangan">Kaur Keuangan (Bendahara Desa)</option>
                      <option value="kaur_pembangunan">Kaur Perencanaan &amp; Pembangunan</option>
                      <option value="kaur_tu_umum">Kaur Tata Usaha &amp; Umum</option>
                      <option value="kasi_layanan">Kasi Pelayanan Masyarakat</option>
                      <option value="kasi_pemerintahan">Kasi Pemerintahan</option>
                      <option value="kasi_kesra">Kasi Kesejahteraan (Kesra)</option>
                      <option value="kadus">Kepala Dusun (Kadus) / Kepala Lingkungan</option>
                      <option value="satlinmas">Komandan Satlinmas / Trantibum</option>
                      <option value="operator">Operator Layanan Digital</option>
                    </select>
                  </div>

                  {/* Nomor WhatsApp */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block flex items-center justify-between">
                      <span>Nomor WhatsApp Resmi <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-emerald-600 font-normal">Tampil ke warga</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formWhatsapp}
                        onChange={(e) => setFormWhatsapp(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* NIK */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">NIK (Nomor Induk Kependudukan)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formNik}
                      onChange={(e) => setFormNik(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="16 digit NIK..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  {/* NIP / NRPDes */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">NIP / NRPDes (Opsional)</label>
                    <input
                      type="text"
                      value={formNip}
                      onChange={(e) => setFormNip(e.target.value)}
                      placeholder="Contoh: 19820815 200801 1 004"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>

                  {/* Nomor Telepon Tambahan */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nomor Telepon Kantor / Alternatif</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="Contoh: (0251) 8256-700"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                {/* Akun Login Portal Web DEKATI */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Kredensial Login Portal Staf</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Akses Web Terpadu
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">Email Login Resmi</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="nama@sukamaju.desa.id"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-700 block">Kata Sandi (Password)</label>
                        <button
                          type="button"
                          onClick={() => setFormPassword(`Desa${Math.floor(1000 + Math.random() * 9000)}!`)}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                        >
                          Acak Sandi
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showFormPassword ? 'text' : 'password'}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          title={showFormPassword ? "Sembunyikan Sandi" : "Lihat Sandi"}
                        >
                          {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Foto Profil Pamong (Unggah Berkas & Preset) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>Foto Profil Pamong</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Bisa unggah foto pribadi atau gunakan avatar
                    </span>
                  </div>

                  {/* Upload Box & Preview */}
                  <div
                    className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 transition-colors hover:border-emerald-300"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) processPhotoFile(droppedFile);
                    }}
                  >
                    {/* Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-emerald-500/80 overflow-hidden shadow-sm flex items-center justify-center">
                        {formAvatar ? (
                          <img
                            src={formAvatar}
                            alt="Pratinjau Foto Pamong"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-slate-400" />
                        )}
                        {isProcessingPhoto && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] gap-1 z-10">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                            <span>Memproses...</span>
                          </div>
                        )}
                      </div>
                      {/* Click overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingPhoto}
                        title="Klik untuk memilih foto dari berkas"
                        className="absolute inset-0 rounded-2xl bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer"
                      >
                        <Camera className="w-4 h-4 mb-0.5" />
                        <span>Ganti Foto</span>
                      </button>
                    </div>

                    {/* Action buttons & info */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {/* Hidden input file */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingPhoto}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ambil Foto dari File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormAvatar(DEFAULT_AVATARS[0])}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors"
                          title="Gunakan avatar default"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>Reset Avatar</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Format yang didukung: <strong>JPG, PNG, atau WebP</strong> (maksimal 10 MB). Foto otomatis di-crop persegi &amp; dikompresi agar ringan di browser &amp; cloud Supabase.
                      </p>
                      {photoUploadError && (
                        <p className="text-[11px] text-rose-600 font-semibold">
                          {photoUploadError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preset Avatar Standar */}
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Atau pilih dari koleksi avatar siap pakai:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {DEFAULT_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormAvatar(av)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                            formAvatar === av
                              ? 'border-emerald-500 scale-105 shadow-xs'
                              : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          title={`Avatar Standar ${idx + 1}`}
                        >
                          <img src={av} alt="avatar" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Otoritas TTE */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Otoritas TTE Digital QR Code</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500">
                        Beri hak tandatangan elektronik digital untuk pengesahan surat keluar (Kepala Desa/Lurah).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formCanTte}
                        onChange={(e) => setFormCanTte(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingId ? 'Simpan Perubahan Pamong' : 'Tambah Pamong'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* TOOLBAR: PENCARIAN & FILTER KATEGORI */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, jabatan, nomor WA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                    title="Kembalikan susunan ke standar awal Kemendagri / Desa Sukamaju"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Standar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pamong</span>
                  </button>
                </div>
              </div>

              {/* TABEL / KARTU DAFTAR PAMONG */}
              <div className="space-y-3">
                {filteredOfficials.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Tidak ada pamong yang cocok</p>
                    <p className="text-[11px] text-slate-400">Silakan ubah kata kunci pencarian atau tambah data baru.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                    {filteredOfficials.map((official) => {
                      const cleanWa = (official.whatsapp || official.phone_number || '').replace(/[^0-9]/g, '');
                      const waNumber = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
                      const waUrl = waNumber ? `https://wa.me/${waNumber}` : null;

                      return (
                        <div
                          key={official.id}
                          className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-700 text-sm">
                              {official.avatar_url ? (
                                <img src={official.avatar_url} alt={official.nama_lengkap} className="w-full h-full object-cover" />
                              ) : (
                                official.nama_lengkap.charAt(0)
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-sm truncate">
                                  {official.nama_lengkap}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                  {official.jabatan || official.role}
                                </span>
                                {official.can_sign_tte && (
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                                    TTE
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                                {official.nip && <span className="font-mono">NIP: {official.nip}</span>}
                                <span className="flex items-center gap-1 text-emerald-700 font-mono font-semibold">
                                  <MessageCircle className="w-3 h-3 fill-current" />
                                  WA: {official.whatsapp || official.phone_number || 'Belum ada'}
                                </span>
                                {official.email && <span className="text-slate-400 truncate">{official.email}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                                title="Buka Chat WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(official)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingOfficial(official)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 transition-colors"
                              title="Hapus dari Struktur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        {!isEditing && (
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Perubahan susunan aparatur dan nomor WhatsApp langsung tersinkron ke halaman publik warga.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
            >
              Selesai
            </button>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {deletingOfficial && (
          <div
            className="fixed inset-0 z-[100010] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingOfficial(null);
            }}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">Hapus Pamong Desa?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">"{deletingOfficial.nama_lengkap}"</span> ({deletingOfficial.jabatan}) dari struktur organisasi desa?
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingOfficial(null);
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default VillageOfficialsManageModal;
