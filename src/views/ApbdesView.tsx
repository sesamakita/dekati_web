// src/views/ApbdesView.tsx
import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Edit3, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useData } from '../hooks/useData';

export const ApbdesView: React.FC = () => {
  const { apbdes, profile, updateApbdesItem, updateVillageProfile } = useData();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [kadesName, setKadesName] = useState(profile.kades_name);
  const [sekdesName, setSekdesName] = useState(profile.sekdes_name);
  const [officePhone, setOfficePhone] = useState(profile.office_phone);
  const [officeAddress, setOfficeAddress] = useState(profile.office_address);

  const handleStartEdit = (code: string, currentAmount: number) => {
    setEditingCode(code);
    setEditAmount(currentAmount);
  };

  const handleSaveEdit = (type: 'pendapatan' | 'belanja', code: string) => {
    updateApbdesItem(type, code, editAmount);
    setEditingCode(null);
  };

  const handleSaveProfile = () => {
    updateVillageProfile({
      kades_name: kadesName,
      sekdes_name: sekdesName,
      office_phone: officePhone,
      office_address: officeAddress,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <PieChart className="w-5 h-5 text-violet-600" />
          Transparansi APBDes & Profil Pemerintahan Desa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Publikasi anggaran pendapatan dan belanja desa tahun berjalan serta struktur aparatur {profile.name}.
        </p>
      </div>

      {/* Top 3 Visual Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Pendapatan */}
        <div className="bento-card p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-200/80">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Total Pendapatan Desa
          </span>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono">
            Rp {(apbdes.pendapatan.total_realized).toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Target APBDes: Rp {(apbdes.pendapatan.total_budget).toLocaleString('id-ID')}
          </p>
          <div className="mt-3 w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{
                width: `${(apbdes.pendapatan?.total_budget || 0) > 0 ? Math.min(((apbdes.pendapatan.total_realized / apbdes.pendapatan.total_budget) * 100), 100) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Belanja */}
        <div className="bento-card p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-200/80">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
            Total Belanja & Kegiatan
          </span>
          <div className="text-2xl font-extrabold text-blue-950 font-mono">
            Rp {(apbdes.belanja.total_realized).toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Plafon Anggaran: Rp {(apbdes.belanja.total_budget).toLocaleString('id-ID')}
          </p>
          <div className="mt-3 w-full bg-blue-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{
                width: `${(apbdes.belanja?.total_budget || 0) > 0 ? Math.min(((apbdes.belanja.total_realized / apbdes.belanja.total_budget) * 100), 100) : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Serapan Realisasi */}
        <div className="bento-card p-5 bg-gradient-to-br from-violet-50/70 to-purple-50/40 border-violet-200/80">
          <span className="text-xs font-bold text-violet-800 uppercase tracking-wider block mb-1">
            Persentase Serapan Anggaran
          </span>
          <div className="text-3xl font-extrabold text-violet-950">
            {apbdes.realisasi_persen}%
          </div>
          <p className="text-xs text-violet-700 mt-1">
            Tahun Anggaran {apbdes.fiscal_year} (Realisasi Aktif)
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Status Keuangan Desa Sehat
          </div>
        </div>
      </div>

      {/* Rincian Pos Pendapatan & Belanja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Pendapatan */}
        <div className="bento-card p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
              Pos Pendapatan Desa (DDS, ADD, PADes)
            </span>
          </h3>

          <div className="space-y-3">
            {apbdes.pendapatan.items.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada rincian pos pendapatan.
              </div>
            ) : (
              apbdes.pendapatan.items.map((item) => (
                <div
                  key={item.account_code}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {item.account_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span>Anggaran: Rp {item.budget_amount.toLocaleString('id-ID')}</span>
                    <span className="font-bold text-emerald-700">{item.percentage}%</span>
                  </div>

                  {editingCode === item.account_code ? (
                    <div className="flex gap-2 items-center mt-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono w-full"
                      />
                      <button
                        onClick={() => handleSaveEdit('pendapatan', item.account_code)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                      <span className="font-bold font-mono">
                        Realisasi: Rp {item.realized_amount.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item.account_code, item.realized_amount)}
                        className="text-slate-400 hover:text-emerald-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table Belanja */}
        <div className="bento-card p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-800">
              <DollarSign className="w-4 h-4" />
              Pos Belanja Bidang Pembangunan & Layanan
            </span>
          </h3>

          <div className="space-y-3">
            {apbdes.belanja.items.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada rincian pos belanja.
              </div>
            ) : (
              apbdes.belanja.items.map((item) => (
                <div
                  key={item.account_code}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {item.account_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span>Plafon: Rp {item.budget_amount.toLocaleString('id-ID')}</span>
                    <span className="font-bold text-blue-700">{item.percentage}%</span>
                  </div>

                  {editingCode === item.account_code ? (
                    <div className="flex gap-2 items-center mt-2">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono w-full"
                      />
                      <button
                        onClick={() => handleSaveEdit('belanja', item.account_code)}
                        className="p-1.5 bg-blue-600 text-white rounded-lg"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                      <span className="font-bold font-mono">
                        Realisasi: Rp {item.realized_amount.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item.account_code, item.realized_amount)}
                        className="text-slate-400 hover:text-blue-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profil Desa Bento Card */}
      <div className="bento-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Profil & Struktur Pemerintahan Desa
            </h3>
            <p className="text-xs text-slate-500">
              Informasi kontak resmi kantor desa, pimpinan, dan visi-misi pembangunan
            </p>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditingProfile ? 'Batal Edit' : 'Ubah Data Profil'}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Desa:</label>
              <input
                type="text"
                value={kadesName}
                onChange={(e) => setKadesName(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Sekretaris Desa:</label>
              <input
                type="text"
                value={sekdesName}
                onChange={(e) => setSekdesName(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telepon Kantor:</label>
              <input
                type="text"
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Balai Desa:</label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Simpan Profil
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-slate-400 font-bold block mb-1">Kepala Desa:</span>
              <p className="font-bold text-slate-900 text-sm">{profile.kades_name}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Penanggung Jawab Wilayah</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-slate-400 font-bold block mb-1">Sekretaris Desa:</span>
              <p className="font-bold text-slate-900 text-sm">{profile.sekdes_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pimpinan Administrasi</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-slate-400 font-bold block mb-1">Kontak Kantor:</span>
              <p className="font-bold text-slate-900">{profile.office_phone}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{profile.office_email}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="text-slate-400 font-bold block mb-1">Alamat Balai Desa:</span>
              <p className="font-bold text-slate-900 line-clamp-2">{profile.office_address}</p>
            </div>
          </div>
        )}

        {/* Visi Misi */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 mb-3">
            <span className="font-bold text-emerald-950 block mb-1">Visi Desa:</span>
            <p className="italic text-emerald-900 leading-relaxed">
              "{profile.vision}"
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-2">Misi Pembangunan Desa:</span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              {profile.mission.map((m, idx) => (
                <li key={idx} className="leading-relaxed">{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
