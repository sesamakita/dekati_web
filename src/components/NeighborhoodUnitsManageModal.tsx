// src/components/NeighborhoodUnitsManageModal.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building,
  Plus,
  Edit3,
  Trash2,
  Save,
  CheckCircle2,
  RotateCcw,
  Search,
  MessageCircle,
  Phone,
  AlertTriangle,
  MapPin,
  Home,
  UserCheck,
  Send
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { NeighborhoodUnit } from '../types';
import { initialNeighborhoodUnits } from '../data/mockData';
import { wahaService } from '../services/wahaService';

interface NeighborhoodUnitsManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddMode?: boolean;
  initialEditUnit?: NeighborhoodUnit | null;
}

export const NeighborhoodUnitsManageModal: React.FC<NeighborhoodUnitsManageModalProps> = ({
  isOpen,
  onClose,
  initialAddMode = false,
  initialEditUnit = null
}) => {
  const { neighborhoodUnits, saveNeighborhoodUnit, updateNeighborhoodUnit, deleteNeighborhoodUnit, profile } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRw, setFilterRw] = useState<string>('all');

  // Form State (Tambah / Edit RT)
  const [isEditing, setIsEditing] = useState(initialAddMode || !!initialEditUnit);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formRtNumber, setFormRtNumber] = useState('');
  const [formRwNumber, setFormRwNumber] = useState('');
  const [formDusunName, setFormDusunName] = useState('');
  const [formRtLeaderName, setFormRtLeaderName] = useState('');
  const [formRtLeaderPhone, setFormRtLeaderPhone] = useState('');
  const [formRwLeaderName, setFormRwLeaderName] = useState('');
  const [formRwLeaderPhone, setFormRwLeaderPhone] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Modal konfirmasi hapus
  const [deletingUnit, setDeletingUnit] = useState<NeighborhoodUnit | null>(null);

  // Feedback status
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [testingWahaId, setTestingWahaId] = useState<string | null>(null);
  const [testingFormPhone, setTestingFormPhone] = useState(false);

  const handleTestWahaUnit = async (unit: NeighborhoodUnit) => {
    if (!unit.rt_leader_phone) {
      alert('Nomor WhatsApp Ketua RT belum diisi!');
      return;
    }
    setTestingWahaId(unit.id);
    try {
      const res = await wahaService.sendTextMessage(
        unit.rt_leader_phone,
        `🔔 *TES INTEGRASI WAHA - SISTEM DEKATI*\n\nHalo *${unit.rt_leader_name || 'Ketua RT'}* (RT ${unit.rt_number} / RW ${unit.rw_number}), nomor WhatsApp Anda ini berhasil terhubung dengan sistem pelayanan e-Surat Desa DEKATI. Nomor ini siap menerima pesan permohonan rekomendasi surat warga secara otomatis.`
      );
      if (res.success) {
        setActionSuccessMessage(`✅ Pesan tes WAHA berhasil dikirim ke WhatsApp ${unit.rt_leader_name} (${unit.rt_leader_phone})!`);
        setTimeout(() => setActionSuccessMessage(null), 6000);
      } else {
        alert(`Gagal mengirim WhatsApp via WAHA: ${res.error || 'Server WAHA tidak merespon'}`);
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setTestingWahaId(null);
    }
  };

  const handleTestWahaFormPhone = async () => {
    if (!formRtLeaderPhone.trim()) {
      alert('Ketik nomor WhatsApp Ketua RT terlebih dahulu!');
      return;
    }
    setTestingFormPhone(true);
    try {
      const res = await wahaService.sendTextMessage(
        formRtLeaderPhone,
        `🔔 *TES INTEGRASI WAHA - SISTEM DEKATI*\n\nHalo *${formRtLeaderName || 'Ketua RT'}* (RT ${formRtNumber || '-'} / RW ${formRwNumber || '-'}), nomor WhatsApp ini telah berhasil diverifikasi dan terhubung ke server WAHA Sistem Administrasi Desa DEKATI.`
      );
      if (res.success) {
        setActionSuccessMessage(`✅ Pesan tes WAHA terkirim ke ${formRtLeaderPhone}!`);
        setTimeout(() => setActionSuccessMessage(null), 6000);
      } else {
        alert(`Gagal mengirim WhatsApp via WAHA: ${res.error || 'Server WAHA tidak merespon'}`);
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setTestingFormPhone(false);
    }
  };

  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormRtNumber('');
    setFormRwNumber('');
    setFormDusunName('Dusun Sukamaju');
    setFormRtLeaderName('');
    setFormRtLeaderPhone('');
    setFormRwLeaderName('');
    setFormRwLeaderPhone('');
    setFormIsActive(true);
    setIsEditing(true);
  }, []);

  const handleOpenEdit = useCallback((unit: NeighborhoodUnit) => {
    setEditingId(unit.id);
    setFormRtNumber(unit.rt_number || '');
    setFormRwNumber(unit.rw_number || '');
    setFormDusunName(unit.dusun_name || 'Dusun Sukamaju');
    setFormRtLeaderName(unit.rt_leader_name || '');
    setFormRtLeaderPhone(unit.rt_leader_phone || '');
    setFormRwLeaderName(unit.rw_leader_name || '');
    setFormRwLeaderPhone(unit.rw_leader_phone || '');
    setFormIsActive(unit.is_active ?? true);
    setIsEditing(true);
  }, []);

  // Sync saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (initialEditUnit) {
        handleOpenEdit(initialEditUnit);
      } else if (initialAddMode) {
        handleOpenCreate();
      } else {
        setIsEditing(false);
        setEditingId(null);
      }
      setSearchQuery('');
      setFilterRw('all');
      setActionSuccessMessage(null);
    }
  }, [isOpen, initialAddMode, initialEditUnit, handleOpenCreate, handleOpenEdit]);

  // Unique list of RWs for filter dropdown
  const uniqueRws = useMemo(() => {
    const set = new Set<string>();
    neighborhoodUnits.forEach((u) => {
      if (u.rw_number) set.add(u.rw_number.replace(/^0+/, ''));
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [neighborhoodUnits]);

  // Filtered & Sorted Units
  const filteredUnits = useMemo(() => {
    return neighborhoodUnits.filter((u) => {
      if (filterRw !== 'all') {
        const cleanFilter = filterRw.replace(/^0+/, '');
        const cleanUnitRw = (u.rw_number || '').replace(/^0+/, '');
        if (cleanUnitRw !== cleanFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRt = (u.rt_number || '').includes(q);
        const matchRw = (u.rw_number || '').includes(q);
        const matchDusun = (u.dusun_name || '').toLowerCase().includes(q);
        const matchLeader = (u.rt_leader_name || '').toLowerCase().includes(q);
        const matchPhone = (u.rt_leader_phone || '').includes(q);
        if (!matchRt && !matchRw && !matchDusun && !matchLeader && !matchPhone) return false;
      }

      return true;
    }).sort((a, b) => {
      const rwA = Number((a.rw_number || '').replace(/^0+/, '')) || 0;
      const rwB = Number((b.rw_number || '').replace(/^0+/, '')) || 0;
      if (rwA !== rwB) return rwA - rwB;
      const rtA = Number((a.rt_number || '').replace(/^0+/, '')) || 0;
      const rtB = Number((b.rt_number || '').replace(/^0+/, '')) || 0;
      return rtA - rtB;
    });
  }, [neighborhoodUnits, filterRw, searchQuery]);

  const showSuccessFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 3000);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cleanRt = formRtNumber.trim().padStart(2, '0');
    const cleanRw = formRwNumber.trim().padStart(2, '0');

    if (!cleanRt || cleanRt === '00') {
      alert('Mohon isi nomor RT dengan benar (contoh: 01, 02).');
      return;
    }
    if (!cleanRw || cleanRw === '00') {
      alert('Mohon isi nomor RW dengan benar (contoh: 01, 02).');
      return;
    }
    if (!formRtLeaderName.trim()) {
      alert('Mohon isi nama Ketua RT.');
      return;
    }
    if (!formRtLeaderPhone.trim()) {
      alert('Mohon isi nomor WhatsApp resmi Ketua RT.');
      return;
    }

    if (editingId) {
      // Mode Edit
      await updateNeighborhoodUnit(editingId, {
        rt_number: cleanRt,
        rw_number: cleanRw,
        dusun_name: formDusunName.trim() || 'Dusun Sukamaju',
        rt_leader_name: formRtLeaderName.trim(),
        rt_leader_phone: formRtLeaderPhone.trim(),
        rw_leader_name: formRwLeaderName.trim() || undefined,
        rw_leader_phone: formRwLeaderPhone.trim() || undefined,
        is_active: formIsActive
      });
      showSuccessFeedback(`Data RT ${cleanRt} / RW ${cleanRw} berhasil diperbarui.`);
    } else {
      // Mode Tambah Baru
      const newUnit: NeighborhoodUnit = {
        id: `rt-${cleanRt}-rw-${cleanRw}-${Date.now()}`,
        village_code: profile.code || '3201012001',
        dusun_name: formDusunName.trim() || 'Dusun Sukamaju',
        rt_number: cleanRt,
        rw_number: cleanRw,
        rt_leader_name: formRtLeaderName.trim(),
        rt_leader_phone: formRtLeaderPhone.trim(),
        rw_leader_name: formRwLeaderName.trim() || undefined,
        rw_leader_phone: formRwLeaderPhone.trim() || undefined,
        is_active: formIsActive,
        created_at: new Date().toISOString()
      };
      await saveNeighborhoodUnit(newUnit);
      showSuccessFeedback(`Unit RT ${cleanRt} / RW ${cleanRw} berhasil ditambahkan.`);
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDeleteConfirm = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!deletingUnit) return;
    const label = `RT ${deletingUnit.rt_number} / RW ${deletingUnit.rw_number} (${deletingUnit.rt_leader_name})`;
    await deleteNeighborhoodUnit(deletingUnit.id);
    setDeletingUnit(null);
    showSuccessFeedback(`Data unit ${label} telah dihapus.`);
  };

  const handleResetToDefault = async () => {
    if (
      window.confirm(
        'Kembalikan daftar RT / RW ke data standar awal Desa Sukamaju? Perubahan kustom yang dibuat sebelumnya akan digantikan.'
      )
    ) {
      for (const unit of initialNeighborhoodUnits) {
        await saveNeighborhoodUnit(unit as NeighborhoodUnit);
      }
      showSuccessFeedback('Daftar RT / RW berhasil dikembalikan ke standar awal.');
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
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/25">
              {isEditing ? (
                editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />
              ) : (
                <Building className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {isEditing
                    ? editingId
                      ? `Edit Data RT ${formRtNumber || ''} / RW ${formRwNumber || ''}`
                      : 'Tambah Wilayah RT Baru'
                    : 'Kelola Wilayah Rukun Tetangga (RT & RW)'}
                </span>
                {!isEditing && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {neighborhoodUnits.length} RT Terdaftar
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isEditing
                  ? 'Lengkapi nomor RT, RW, dusun, dan kontak WhatsApp Ketua RT untuk aplikasi warga'
                  : 'Kelola wilayah RT, perbarui nomor WhatsApp Ketua RT, atau sesuaikan pembagian dusun'}
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
          {/* FORM MODE: TAMBAH / EDIT RT */}
          {isEditing ? (
            <div className="bg-slate-50 p-6 sm:p-7 rounded-3xl border border-slate-200/90 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  {editingId ? <Edit3 className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
                  <span>{editingId ? 'Formulir Pembaruan Data RT' : 'Formulir Tambah Wilayah RT'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  <span>&larr; Batal &amp; Kembali ke Daftar</span>
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Nomor RT */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Nomor RT <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      value={formRtNumber}
                      onChange={(e) => setFormRtNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Contoh: 01"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>

                  {/* Nomor RW */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Nomor RW <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      value={formRwNumber}
                      onChange={(e) => setFormRwNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Contoh: 01"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>

                  {/* Nama Dusun / Lingkungan */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Dusun / Lingkungan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formDusunName}
                      onChange={(e) => setFormDusunName(e.target.value)}
                      placeholder="Contoh: Dusun Sukamaju"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80">
                  {/* Nama Ketua RT */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">
                      Nama Ketua RT <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formRtLeaderName}
                      onChange={(e) => setFormRtLeaderName(e.target.value)}
                      placeholder="Contoh: Bpk. Hendra Gunawan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>

                  {/* Nomor WhatsApp Ketua RT */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block flex items-center justify-between">
                      <span>No. WhatsApp Ketua RT <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Tampil di APK warga</span>
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formRtLeaderPhone}
                        onChange={(e) => setFormRtLeaderPhone(e.target.value)}
                        placeholder="Contoh: 0812-3456-7891"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Target penerima permohonan surat via WAHA</span>
                      {formRtLeaderPhone.replace(/[^0-9]/g, '').length >= 8 && (
                        <button
                          type="button"
                          disabled={testingFormPhone}
                          onClick={handleTestWahaFormPhone}
                          className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>{testingFormPhone ? 'Mengirim...' : 'Tes Kirim WAHA'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nama Ketua RW (Opsional) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nama Ketua RW (Opsional)</label>
                    <input
                      type="text"
                      value={formRwLeaderName}
                      onChange={(e) => setFormRwLeaderName(e.target.value)}
                      placeholder="Contoh: Bpk. H. Mansyur"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>

                  {/* Nomor Telepon / WA Ketua RW (Opsional) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">No. Telepon / WA Ketua RW (Opsional)</label>
                    <input
                      type="text"
                      value={formRwLeaderPhone}
                      onChange={(e) => setFormRwLeaderPhone(e.target.value)}
                      placeholder="Contoh: 0812-3456-7800"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingId ? 'Simpan Perubahan RT' : 'Tambah Unit RT'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* TOOLBAR: SEARCH & FILTER */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  {/* Search */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari RT, RW, nama ketua, dusun..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Filter RW */}
                  {uniqueRws.length > 0 && (
                    <select
                      value={filterRw}
                      onChange={(e) => setFilterRw(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="all">Semua RW</option>
                      {uniqueRws.map((rw) => (
                        <option key={rw} value={rw}>
                          RW {rw}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                    title="Kembalikan susunan RT ke standar awal Desa Sukamaju"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Standar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah RT Baru</span>
                  </button>
                </div>
              </div>

              {/* DAFTAR KARTU RT / RW */}
              <div className="space-y-3">
                {filteredUnits.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                    <Building className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Tidak ada unit RT yang cocok</p>
                    <p className="text-[11px] text-slate-400">Silakan ubah kata kunci pencarian atau tambah unit RT baru.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredUnits.map((unit) => {
                      const cleanPhone = (unit.rt_leader_phone || '').replace(/[^0-9]/g, '');
                      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                      const waUrl = waNumber ? `https://wa.me/${waNumber}` : null;

                      return (
                        <div
                          key={unit.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3 text-xs"
                        >
                          <div>
                            {/* Top Badge: RT / RW & Dusun */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-xs border border-blue-200">
                                  RT {unit.rt_number} / RW {unit.rw_number}
                                </span>
                                {unit.dusun_name && (
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                                    {unit.dusun_name}
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(unit)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
                                  title="Edit Data RT"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingUnit(unit)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                                  title="Hapus Unit RT"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Leader Info */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="font-bold text-slate-900 text-sm truncate">
                                  {unit.rt_leader_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500 text-[11px] pl-6 font-mono">
                                <span>WhatsApp:</span>
                                <span className="font-bold text-slate-800">{unit.rt_leader_phone || '-'}</span>
                              </div>
                              {unit.rw_leader_name && (
                                <div className="text-[10.5px] text-slate-400 pl-6 mt-1">
                                  Ketua RW: {unit.rw_leader_name}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer: WhatsApp Quick Chat & WAHA Test */}
                          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Siaga Kontak
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={testingWahaId === unit.id}
                                onClick={() => handleTestWahaUnit(unit)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs border border-purple-200 transition-colors disabled:opacity-50"
                                title="Kirim pesan tes WhatsApp ke nomor Ketua RT ini via server WAHA"
                              >
                                <Send className="w-3 h-3" />
                                <span>{testingWahaId === unit.id ? 'Menguji...' : 'Tes WAHA'}</span>
                              </button>

                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200/80 transition-colors"
                                  title="Buka obrolan langsung WhatsApp Web"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  <span>Chat WA</span>
                                </a>
                              )}
                            </div>
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
              Perubahan nomor WhatsApp &amp; data Ketua RT langsung tersinkron ke tab Kontak Darurat di aplikasi mobile warga.
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
        {deletingUnit && (
          <div
            className="fixed inset-0 z-[100010] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingUnit(null);
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
                <h4 className="text-sm font-extrabold text-slate-900">Hapus Unit RT?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">RT {deletingUnit.rt_number} / RW {deletingUnit.rw_number}</span> ({deletingUnit.rt_leader_name}) dari daftar wilayah desa?
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingUnit(null);
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

export default NeighborhoodUnitsManageModal;
