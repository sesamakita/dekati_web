// src/components/VillageProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Save,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Compass,
  ListPlus,
  Trash2,
  Search,
  ChevronDown
} from 'lucide-react';
import { useData } from '../hooks/useData';
import {
  wilayahService,
  Province,
  Regency,
  District,
  Village,
  toTitleCase
} from '../services/wilayahService';

interface VillageProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VillageProfileModal: React.FC<VillageProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateVillageProfile } = useData();

  // Local form states
  const [name, setName] = useState(profile.name || '');
  const [code, setCode] = useState(profile.code || '');
  const [district, setDistrict] = useState(profile.district || '');
  const [regency, setRegency] = useState(profile.regency || '');
  const [province, setProvince] = useState(profile.province || '');
  const [postalCode, setPostalCode] = useState(profile.postal_code || '');
  const [officeAddress, setOfficeAddress] = useState(profile.office_address || '');
  const [officePhone, setOfficePhone] = useState(profile.office_phone || '');
  const [officeEmail, setOfficeEmail] = useState(profile.office_email || '');
  const [kadesName, setKadesName] = useState(profile.kades_name || '');
  const [sekdesName, setSekdesName] = useState(profile.sekdes_name || '');
  const [vision, setVision] = useState(profile.vision || '');
  const [mission, setMission] = useState<string[]>(
    profile.mission && profile.mission.length > 0 ? [...profile.mission] : ['']
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Wilayah Indonesia Picker states
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  const [loadingWilayah, setLoadingWilayah] = useState(false);

  // Sync profile when opened
  useEffect(() => {
    if (isOpen) {
      setName(profile.name || '');
      setCode(profile.code || '');
      setDistrict(profile.district || '');
      setRegency(profile.regency || '');
      setProvince(profile.province || '');
      setPostalCode(profile.postal_code || '');
      setOfficeAddress(profile.office_address || '');
      setOfficePhone(profile.office_phone || '');
      setOfficeEmail(profile.office_email || '');
      setKadesName(profile.kades_name || '');
      setSekdesName(profile.sekdes_name || '');
      setVision(profile.vision || '');
      setMission(profile.mission && profile.mission.length > 0 ? [...profile.mission] : ['']);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  // Load provinces on picker active
  useEffect(() => {
    if (isPickerActive && provinces.length === 0) {
      setLoadingWilayah(true);
      wilayahService.getProvinces().then((data) => {
        setProvinces(data);
        setLoadingWilayah(false);
      });
    }
  }, [isPickerActive, provinces.length]);

  // Handle Province change
  const handleProvinceChange = async (provId: string) => {
    setSelectedProvinceId(provId);
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    const provObj = provinces.find((p) => p.id === provId);
    if (provObj) {
      setProvince(toTitleCase(provObj.name));
    }

    if (provId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getRegencies(provId);
      setRegencies(data);
      setLoadingWilayah(false);
    }
  };

  // Handle Regency change
  const handleRegencyChange = async (regId: string) => {
    setSelectedRegencyId(regId);
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setDistricts([]);
    setVillages([]);

    const regObj = regencies.find((r) => r.id === regId);
    if (regObj) {
      setRegency(toTitleCase(regObj.name));
    }

    if (regId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getDistricts(regId);
      setDistricts(data);
      setLoadingWilayah(false);
    }
  };

  // Handle District change
  const handleDistrictChange = async (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedVillageId('');
    setVillages([]);

    const distObj = districts.find((d) => d.id === distId);
    if (distObj) {
      setDistrict(`Kecamatan ${toTitleCase(distObj.name)}`);
    }

    if (distId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getVillages(distId);
      setVillages(data);
      setLoadingWilayah(false);
    }
  };

  // Handle Village change
  const handleVillageChange = (vilId: string) => {
    setSelectedVillageId(vilId);
    const vilObj = villages.find((v) => v.id === vilId);
    if (vilObj) {
      const vName = toTitleCase(vilObj.name);
      setName(`Desa ${vName}`);
      setCode(vilObj.id);
    }
  };

  // Mission handlers
  const handleAddMission = () => {
    setMission([...mission, '']);
  };

  const handleUpdateMission = (index: number, val: string) => {
    const updated = [...mission];
    updated[index] = val;
    setMission(updated);
  };

  const handleRemoveMission = (index: number) => {
    setMission(mission.filter((_, i) => i !== index));
  };

  // Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateVillageProfile({
        name,
        code,
        district,
        regency,
        province,
        postal_code: postalCode,
        office_address: officeAddress,
        office_phone: officePhone,
        office_email: officeEmail,
        kades_name: kadesName,
        sekdes_name: sekdesName,
        vision,
        mission: mission.filter((m) => m.trim().length > 0)
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Gagal menyimpan profil desa:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex items-center justify-center overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] my-auto flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Identitas & Profil Desa</h3>
              <p className="text-xs text-slate-500 font-medium">
                Sesuaikan nama desa/kelurahan, pimpinan, dan wilayah kerja pemerintahan Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 border border-transparent hover:border-slate-200/60 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* A. Tombol Bantuan Tarik Data Wilayah Indonesia */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Pilih Wilayah Otomatis (Database Kemendagri RI)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerActive(!isPickerActive)}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100 transition-all text-xs"
              >
                {isPickerActive ? 'Tutup Pilihan Wilayah' : 'Tarik Data Wilayah'}
              </button>
            </div>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              Gunakan pemilih ini untuk mencari nama Desa / Kelurahan Anda berdasarkan Provinsi, Kabupaten, dan Kecamatan secara berjenjang dari data resmi nasional.
            </p>

            {isPickerActive && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-200/60">
                {/* 1. Provinsi */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">1. Provinsi:</label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {toTitleCase(p.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Kabupaten/Kota */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">2. Kabupaten / Kota:</label>
                  <select
                    value={selectedRegencyId}
                    onChange={(e) => handleRegencyChange(e.target.value)}
                    disabled={!selectedProvinceId}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kab/Kota --</option>
                    {regencies.map((r) => (
                      <option key={r.id} value={r.id}>
                        {toTitleCase(r.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Kecamatan */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">3. Kecamatan:</label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!selectedRegencyId}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {toTitleCase(d.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Desa / Kelurahan */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">4. Desa / Kelurahan:</label>
                  <select
                    value={selectedVillageId}
                    onChange={(e) => handleVillageChange(e.target.value)}
                    disabled={!selectedDistrictId}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">-- Pilih Desa/Kelurahan --</option>
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {toTitleCase(v.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingWilayah && (
                  <div className="sm:col-span-2 text-center py-1 text-emerald-700 font-semibold animate-pulse text-[11px]">
                    Memuat data wilayah...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B. Identitas Utama Desa */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Identitas & Kode Wilayah</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Desa / Kelurahan:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Desa Sukamaju / Kelurahan Sukamaju"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Kode Wilayah Kemendagri:</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: 32.01.01.2005"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Kecamatan:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Contoh: Kecamatan Ciawi"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Kabupaten / Kota:</label>
                <input
                  type="text"
                  value={regency}
                  onChange={(e) => setRegency(e.target.value)}
                  placeholder="Contoh: Kabupaten Bogor"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Provinsi:</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Contoh: Jawa Barat"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Kode Pos:</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Contoh: 16720"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* C. Pimpinan & Kantor Pelayanan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Pimpinan & Kontak Balai Desa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Kepala Desa / Lurah:</label>
                <input
                  type="text"
                  value={kadesName}
                  onChange={(e) => setKadesName(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Kades/Lurah"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Sekretaris Desa (Sekdes):</label>
                <input
                  type="text"
                  value={sekdesName}
                  onChange={(e) => setSekdesName(e.target.value)}
                  placeholder="Nama Lengkap & Gelar Sekdes/Carik"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Telepon Kantor Balai Desa:</label>
                <input
                  type="text"
                  value={officePhone}
                  onChange={(e) => setOfficePhone(e.target.value)}
                  placeholder="Contoh: (0251) 8245678 / 0812..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Email Resmi Desa:</label>
                <input
                  type="email"
                  value={officeEmail}
                  onChange={(e) => setOfficeEmail(e.target.value)}
                  placeholder="Contoh: sekretariat@desa.id"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Alamat Kantor / Balai Desa:</label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Jl. Raya Desa No. ..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* D. Visi & Misi Pembangunan */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Visi & Misi Pembangunan</span>
            </h4>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Visi Desa / Kelurahan:</label>
              <textarea
                rows={2}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Tuliskan visi pembangunan desa..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-normal focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block">Misi Pembangunan:</label>
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Tambah Butir Misi</span>
                </button>
              </div>

              <div className="space-y-2">
                {mission.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleUpdateMission(idx, e.target.value)}
                      placeholder={`Butir misi ke-${idx + 1}`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                    {mission.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(idx)}
                        className="w-8 h-8 rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center shrink-0 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saveSuccess ? (
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profil Desa Berhasil Disimpan & Sinkron!</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">
                Perubahan akan langsung tampil di seluruh dashboard, permohonan surat, dan portal warga.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold shadow-md shadow-emerald-600/25 transition-all disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil Desa'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
