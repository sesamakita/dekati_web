import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  PieChart,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { ApbdesData, ApbdesItem } from '../types';

interface ApbdesManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'pendapatan' | 'belanja';
}

export const ApbdesManageModal: React.FC<ApbdesManageModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'pendapatan'
}) => {
  const { apbdes, saveFullApbdes } = useData();

  const [activeTab, setActiveTab] = useState<'pendapatan' | 'belanja'>(defaultTab);
  const [fiscalYear, setFiscalYear] = useState<number>(apbdes.fiscal_year || new Date().getFullYear());
  const [pendapatanItems, setPendapatanItems] = useState<ApbdesItem[]>([]);
  const [belanjaItems, setBelanjaItems] = useState<ApbdesItem[]>([]);

  // State untuk form tambah pos baru
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState<string>('');
  const [newRealized, setNewRealized] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync data ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFiscalYear(apbdes.fiscal_year || new Date().getFullYear());
      setPendapatanItems(
        apbdes.pendapatan?.items ? JSON.parse(JSON.stringify(apbdes.pendapatan.items)) : []
      );
      setBelanjaItems(
        apbdes.belanja?.items ? JSON.parse(JSON.stringify(apbdes.belanja.items)) : []
      );
      setActiveTab(defaultTab);
      setShowAddForm(false);
      setSaveSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Template Standar APBDes Kemendagri RI
  const handleLoadStandardTemplate = () => {
    const standardPendapatan: ApbdesItem[] = [
      {
        account_code: '4.1.01',
        name: 'Pendapatan Asli Desa (PADes & BUMDes)',
        budget_amount: 150000000,
        realized_amount: 95000000,
        percentage: 63.3
      },
      {
        account_code: '4.2.01',
        name: 'Dana Desa (DDS) - Transfer APBN',
        budget_amount: 980000000,
        realized_amount: 820000000,
        percentage: 83.7
      },
      {
        account_code: '4.2.02',
        name: 'Alokasi Dana Desa (ADD) - APBD Kabupaten',
        budget_amount: 420000000,
        realized_amount: 350000000,
        percentage: 83.3
      },
      {
        account_code: '4.2.03',
        name: 'Bagi Hasil Pajak & Retribusi Daerah (BHPR)',
        budget_amount: 85000000,
        realized_amount: 60000000,
        percentage: 70.6
      },
      {
        account_code: '4.2.04',
        name: 'Bantuan Keuangan Khusus Provinsi',
        budget_amount: 120000000,
        realized_amount: 100000000,
        percentage: 83.3
      }
    ];

    const standardBelanja: ApbdesItem[] = [
      {
        account_code: '5.1.01',
        name: 'Bidang Penyelenggaraan Pemerintahan Desa & Siltap',
        budget_amount: 550000000,
        realized_amount: 460000000,
        percentage: 83.6
      },
      {
        account_code: '5.2.01',
        name: 'Bidang Pembangunan Fisik, Irigasi, & Jalan Desa',
        budget_amount: 780000000,
        realized_amount: 620000000,
        percentage: 79.5
      },
      {
        account_code: '5.3.01',
        name: 'Bidang Pembinaan Kemasyarakatan, Seni & Budaya',
        budget_amount: 140000000,
        realized_amount: 95000000,
        percentage: 67.9
      },
      {
        account_code: '5.4.01',
        name: 'Bidang Pemberdayaan Masyarakat & Pelatihan Usaha',
        budget_amount: 210000000,
        realized_amount: 175000000,
        percentage: 83.3
      },
      {
        account_code: '5.5.01',
        name: 'Bidang Penanggulangan Bencana, Darurat, & Mendesak',
        budget_amount: 75000000,
        realized_amount: 40000000,
        percentage: 53.3
      }
    ];

    setPendapatanItems(standardPendapatan);
    setBelanjaItems(standardBelanja);
  };

  // Kalkulasi Dinamis
  const totalTargetPendapatan = pendapatanItems.reduce((s, i) => s + (Number(i.budget_amount) || 0), 0);
  const totalRealisasiPendapatan = pendapatanItems.reduce((s, i) => s + (Number(i.realized_amount) || 0), 0);
  const totalPlafonBelanja = belanjaItems.reduce((s, i) => s + (Number(i.budget_amount) || 0), 0);
  const totalRealisasiBelanja = belanjaItems.reduce((s, i) => s + (Number(i.realized_amount) || 0), 0);

  const surplusDefisit = totalRealisasiPendapatan - totalRealisasiBelanja;
  const grandTotalBudget = totalTargetPendapatan + totalPlafonBelanja;
  const grandTotalRealized = totalRealisasiPendapatan + totalRealisasiBelanja;
  const serapanPersen = grandTotalBudget > 0 ? Number(((grandTotalRealized / grandTotalBudget) * 100).toFixed(1)) : 0;

  // Handler update field item
  const handleItemFieldChange = (
    type: 'pendapatan' | 'belanja',
    index: number,
    field: 'account_code' | 'name' | 'budget_amount' | 'realized_amount',
    value: string
  ) => {
    const list = type === 'pendapatan' ? [...pendapatanItems] : [...belanjaItems];
    if (field === 'budget_amount' || field === 'realized_amount') {
      const numVal = Math.max(0, Number(value) || 0);
      list[index][field] = numVal;
      const budget = field === 'budget_amount' ? numVal : list[index].budget_amount;
      const realized = field === 'realized_amount' ? numVal : list[index].realized_amount;
      list[index].percentage = budget > 0 ? Number(((realized / budget) * 100).toFixed(1)) : 0;
    } else {
      list[index][field] = value;
    }

    if (type === 'pendapatan') setPendapatanItems(list);
    else setBelanjaItems(list);
  };

  // Handler hapus item
  const handleDeleteItem = (type: 'pendapatan' | 'belanja', index: number) => {
    if (type === 'pendapatan') {
      setPendapatanItems(pendapatanItems.filter((_, i) => i !== index));
    } else {
      setBelanjaItems(belanjaItems.filter((_, i) => i !== index));
    }
  };

  // Handler tambah item baru
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      setErrorMessage('Mohon isi kode rekening dan nama uraian pos anggaran.');
      return;
    }

    const bVal = Math.max(0, Number(newBudget) || 0);
    const rVal = Math.max(0, Number(newRealized) || 0);
    const pct = bVal > 0 ? Number(((rVal / bVal) * 100).toFixed(1)) : 0;

    const newItem: ApbdesItem = {
      account_code: newCode.trim(),
      name: newName.trim(),
      budget_amount: bVal,
      realized_amount: rVal,
      percentage: pct
    };

    if (activeTab === 'pendapatan') {
      setPendapatanItems([...pendapatanItems, newItem]);
    } else {
      setBelanjaItems([...belanjaItems, newItem]);
    }

    setNewCode('');
    setNewName('');
    setNewBudget('');
    setNewRealized('');
    setShowAddForm(false);
    setErrorMessage('');
  };

  // Simpan Seluruh APBDes
  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const fullPayload: ApbdesData = {
        fiscal_year: fiscalYear,
        pendapatan: {
          total_budget: totalTargetPendapatan,
          total_realized: totalRealisasiPendapatan,
          items: pendapatanItems
        },
        belanja: {
          total_budget: totalPlafonBelanja,
          total_realized: totalRealisasiBelanja,
          items: belanjaItems
        },
        realisasi_persen: serapanPersen
      };

      await saveFullApbdes(fullPayload);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan perubahan APBDes.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentList = activeTab === 'pendapatan' ? pendapatanItems : belanjaItems;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/80 via-purple-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Portal Kelola & Transparansi APBDes</span>
                <span className="text-[11px] font-mono font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                  TA {fiscalYear}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Atur target pendapatan, plafon belanja kegiatan pembangunan, dan realisasi anggaran desa
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

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Baris 1: Tahun Anggaran & Template Bantuan */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span>Tahun Anggaran (TA):</span>
              </div>
              <input
                type="number"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(Number(e.target.value))}
                min={2020}
                max={2035}
                className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold font-mono text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={handleLoadStandardTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-violet-800 hover:bg-violet-100/70 font-bold transition-all shadow-xs"
              title="Isi pos anggaran otomatis dengan format standar Kemendagri"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Muat Format Standar Kemendagri</span>
            </button>
          </div>

          {/* Baris 2: Kartu Metrik Ringkasan Real-Time */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">
                Target Pendapatan
              </span>
              <p className="font-extrabold text-emerald-950 font-mono text-sm sm:text-base">
                Rp {totalTargetPendapatan.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-emerald-700 mt-1">
                Realisasi: Rp {totalRealisasiPendapatan.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
              <span className="text-[10px] font-bold text-blue-800 uppercase block mb-0.5">
                Plafon Belanja
              </span>
              <p className="font-extrabold text-blue-950 font-mono text-sm sm:text-base">
                Rp {totalPlafonBelanja.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-blue-700 mt-1">
                Realisasi: Rp {totalRealisasiBelanja.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3.5 bg-violet-50/70 rounded-2xl border border-violet-200/80">
              <span className="text-[10px] font-bold text-violet-800 uppercase block mb-0.5">
                Surplus / (Defisit)
              </span>
              <p className={`font-extrabold font-mono text-sm sm:text-base ${surplusDefisit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                Rp {surplusDefisit.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Saldo Realisasi Kas
              </p>
            </div>

            <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80">
              <span className="text-[10px] font-bold text-purple-800 uppercase block mb-0.5">
                Rata-Rata Serapan
              </span>
              <p className="font-extrabold text-purple-950 text-sm sm:text-base">
                {serapanPersen}%
              </p>
              <div className="mt-1.5 w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${Math.min(serapanPersen, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Baris 3: Tab Switcher (Pendapatan vs Belanja) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pendapatan');
                  setShowAddForm(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-xs ${
                  activeTab === 'pendapatan'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Pos Pendapatan ({pendapatanItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('belanja');
                  setShowAddForm(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-xs ${
                  activeTab === 'belanja'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pos Belanja ({belanjaItems.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setNewCode(activeTab === 'pendapatan' ? `4.${pendapatanItems.length + 1}.01` : `5.${belanjaItems.length + 1}.01`);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pos {activeTab === 'pendapatan' ? 'Pendapatan' : 'Belanja'}</span>
            </button>
          </div>

          {/* Form Tambah Pos Baru */}
          {showAddForm && (
            <form onSubmit={handleAddNewItem} className="p-4 bg-violet-50/70 border border-violet-200 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-950 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-700" />
                  Tambah Pos {activeTab === 'pendapatan' ? 'Pendapatan Baru' : 'Belanja Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Kode Rekening:</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Contoh: 4.2.01"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Nama Uraian Pos Anggaran:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Dana Desa (DDS) APBN / Pembangunan Fisik Jalan"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    {activeTab === 'pendapatan' ? 'Target Anggaran (Rp):' : 'Plafon Anggaran (Rp):'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Realisasi Saat Ini (Rp):</label>
                  <input
                    type="number"
                    value={newRealized}
                    onChange={(e) => setNewRealized(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-white text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs"
                >
                  Tambahkan ke Daftar
                </button>
              </div>
            </form>
          )}

          {/* Daftar Pos Item Tabel */}
          <div className="space-y-2.5">
            {currentList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <PieChart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600 mb-1">Belum Ada Pos {activeTab === 'pendapatan' ? 'Pendapatan' : 'Belanja'}</p>
                <p className="text-[11px] mb-3">Klik tombol "Tambah Pos" atau gunakan "Muat Format Standar Kemendagri" di atas.</p>
              </div>
            ) : (
              currentList.map((item, index) => (
                <div
                  key={`${item.account_code}-${index}`}
                  className="p-3.5 bg-slate-50/90 hover:bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={item.account_code}
                        onChange={(e) =>
                          handleItemFieldChange(activeTab, index, 'account_code', e.target.value)
                        }
                        className="w-24 px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-[11px] font-bold text-slate-600 focus:outline-none focus:border-violet-500 shrink-0"
                        title="Kode Rekening Akun"
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemFieldChange(activeTab, index, 'name', e.target.value)
                        }
                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-violet-500"
                        placeholder="Nama Pos Anggaran"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                        item.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : item.percentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.percentage}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(activeTab, index)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all"
                        title="Hapus Pos Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        {activeTab === 'pendapatan' ? 'Pagu Target Anggaran (Rp):' : 'Plafon Anggaran (Rp):'}
                      </label>
                      <input
                        type="number"
                        value={item.budget_amount}
                        onChange={(e) =>
                          handleItemFieldChange(activeTab, index, 'budget_amount', e.target.value)
                        }
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-800 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Realisasi Saat Ini (Rp):
                      </label>
                      <input
                        type="number"
                        value={item.realized_amount}
                        onChange={(e) =>
                          handleItemFieldChange(activeTab, index, 'realized_amount', e.target.value)
                        }
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-800 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Seluruh Perubahan APBDes Berhasil Disimpan & Sinkron!
              </span>
            )}
            {errorMessage && (
              <span className="flex items-center gap-1.5 text-rose-600 font-bold text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                {errorMessage}
              </span>
            )}
            {!saveSuccess && !errorMessage && (
              <span className="text-[11px] text-slate-400">
                Perubahan langsung memutakhirkan dasbor keuangan dan grafik serapan anggaran.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white text-xs transition-all"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/25 transition-all disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Seluruh APBDes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
