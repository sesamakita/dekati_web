// src/components/LetterTemplateModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Check, 
  Eye, 
  Settings2, 
  ShieldCheck, 
  Info,
  Type,
  Upload,
  Image,
  Building2
} from 'lucide-react';
import { LetterTemplate, LetterLogoLayout, VillageProfile } from '../types';
import { 
  DEFAULT_TEMPLATES, 
  AVAILABLE_PLACEHOLDERS, 
  interpolateTemplateText, 
  buildTemplateContext,
  DEFAULT_GARUDA_URL,
  DEFAULT_KAB_LOGO_URL,
  DEFAULT_GARUDA_DATA_URI,
  DEFAULT_KAB_LOGO_DATA_URI,
  DEFAULT_DESA_LOGO_DATA_URI,
} from '../utils/letterTemplateEngine';

interface LetterTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VillageProfile;
  templates: LetterTemplate[];
  onSaveTemplate: (template: LetterTemplate) => Promise<void>;
  onResetTemplate: (letterTypeCode: string) => Promise<void>;
}

export const LetterTemplateModal: React.FC<LetterTemplateModalProps> = ({
  isOpen,
  onClose,
  profile,
  templates,
  onSaveTemplate,
  onResetTemplate,
}) => {
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('SKTM');
  const [activeTab, setActiveTab] = useState<'editor' | 'header'>('editor');
  const [activeField, setActiveField] = useState<'title' | 'opening' | 'declaration' | 'closing'>('declaration');

  // Form states for current editing template
  const [titleFormat, setTitleFormat] = useState('');
  const [openingText, setOpeningText] = useState('');
  const [declarationText, setDeclarationText] = useState('');
  const [closingText, setClosingText] = useState('');
  const [signerRole, setSignerRole] = useState('Kepala Desa');
  const [fontFamily, setFontFamily] = useState<'Times New Roman' | 'Bookman Old Style' | 'Arial'>('Times New Roman');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [borderStyle, setBorderStyle] = useState<'double' | 'single' | 'none'>('double');
  const [logoLayout, setLogoLayout] = useState<LetterLogoLayout>('standard_left');
  const [kabLogoUrl, setKabLogoUrl] = useState('');
  const [desaLogoUrl, setDesaLogoUrl] = useState('');

  const kabFileInputRef = useRef<HTMLInputElement>(null);
  const desaFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'kab' | 'desa') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang sah (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran berkas logo maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (target === 'kab') {
        setKabLogoUrl(base64);
      } else {
        setDesaLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const letterTypeOptions = [
    { code: 'SKTM', name: 'Surat Keterangan Tidak Mampu' },
    { code: 'SKU', name: 'Surat Keterangan Usaha' },
    { code: 'SKCK_PENGANTAR', name: 'Surat Pengantar SKCK' },
    { code: 'SK_DOMISILI', name: 'Surat Keterangan Domisili' },
    { code: 'DEFAULT', name: 'Surat Keterangan Umum (Default)' },
  ];

  // Muat data template saat berganti jenis surat
  useEffect(() => {
    const existing = templates.find(
      (t) => t.letter_type_code.toUpperCase() === selectedTypeCode.toUpperCase()
    );
    const base = existing || DEFAULT_TEMPLATES[selectedTypeCode] || DEFAULT_TEMPLATES.DEFAULT;

    setTitleFormat(base.title_format || 'SURAT KETERANGAN');
    setOpeningText(base.opening_text || '');
    setDeclarationText(base.declaration_text || '');
    setClosingText(base.closing_text || '');
    setSignerRole(base.signer_role || 'Kepala Desa');

    if (base.header_config) {
      setFontFamily(base.header_config.font_family || 'Times New Roman');
      setLineSpacing(base.header_config.line_spacing || 1.5);
      setBorderStyle(base.header_config.border_style || 'double');
      setLogoLayout(base.header_config.logo_layout || 'standard_left');
      setKabLogoUrl(base.header_config.kab_logo_url || profile.logo_kabupaten_url || '');
      setDesaLogoUrl(base.header_config.desa_logo_url || profile.logo_desa_url || '');
    } else {
      setLogoLayout('standard_left');
      setKabLogoUrl(profile.logo_kabupaten_url || '');
      setDesaLogoUrl(profile.logo_desa_url || '');
    }
  }, [selectedTypeCode, templates, profile]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Data sampel untuk Live Preview
  const sampleContext = {
    nama_warga: 'Ahmad Fauzi, S.Kom.',
    nik: '3204121508920003',
    alamat: 'Dusun Sukamaju RT 02 / RW 05, ' + (profile.name || 'Desa'),
    keperluan:
      selectedTypeCode === 'SKTM'
        ? 'Permohonan Keringanan Biaya Rumah Sakit & Beasiswa Pendidikan Anak'
        : selectedTypeCode === 'SKU'
        ? 'Persyaratan Pengajuan Pinjaman Modal Usaha Mikro (KUR Bank)'
        : selectedTypeCode === 'SKCK_PENGANTAR'
        ? 'Persyaratan Pendaftaran Calon Aparatur Sipil Negara (CPNS) 2026'
        : 'Kelengkapan Berkas Administrasi Domisili',
    nomor_surat: '470/12/DS/' + selectedTypeCode + '/X/2026',
    tanggal_surat: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    nama_desa: profile.name || 'Desa Mekar Jaya',
    nama_kecamatan: profile.district || 'Kecamatan Cimenyan',
    nama_kabupaten: profile.regency || 'Kabupaten Bandung',
    alamat_kantor: profile.office_address || 'Jl. Raya Desa No. 12',
    telp_kantor: profile.office_phone || '(022) 87654321',
    email_kantor: profile.office_email || 'sekretariat@desa.id',
    nama_kades: profile.kades_name || 'H. Suryana, S.Sos.',
    jabatan_penandatangan: signerRole || 'Kepala ' + (profile.name || 'Desa'),
  };

  const handleInsertTag = (tag: string) => {
    if (activeField === 'title') {
      setTitleFormat((prev) => prev + ' ' + tag);
    } else if (activeField === 'opening') {
      setOpeningText((prev) => prev + ' ' + tag);
    } else if (activeField === 'declaration') {
      setDeclarationText((prev) => prev + ' ' + tag);
    } else if (activeField === 'closing') {
      setClosingText((prev) => prev + ' ' + tag);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const currentSelected = letterTypeOptions.find((o) => o.code === selectedTypeCode);
      const updatedTemplate: LetterTemplate = {
        letter_type_code: selectedTypeCode,
        letter_name: currentSelected?.name || selectedTypeCode,
        title_format: titleFormat,
        opening_text: openingText,
        declaration_text: declarationText,
        closing_text: closingText,
        signer_role: signerRole,
        header_config: {
          show_kab_logo: logoLayout === 'standard_left' || logoLayout === 'dual_logo',
          show_desa_logo: logoLayout === 'dual_logo',
          show_garuda_logo: logoLayout === 'center_garuda',
          logo_layout: logoLayout,
          kab_logo_url: kabLogoUrl,
          desa_logo_url: desaLogoUrl,
          font_family: fontFamily,
          line_spacing: lineSpacing,
          border_style: borderStyle,
        },
        is_active: true,
      };

      await onSaveTemplate(updatedTemplate);
      setToastMessage('Template surat berhasil disimpan & aktif seketika!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save letter template:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(`Kembalikan template ${selectedTypeCode} ke format standar Permendagri?`)) {
      try {
        setIsSaving(true);
        await onResetTemplate(selectedTypeCode);
        setToastMessage('Template berhasil direset ke standar Permendagri.');
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Failed to reset template:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Preview Interpolation
  const previewTitle = interpolateTemplateText(titleFormat, sampleContext);
  const previewOpening = interpolateTemplateText(openingText, sampleContext);
  const previewDeclaration = interpolateTemplateText(declarationText, sampleContext);
  const previewClosing = interpolateTemplateText(closingText, sampleContext);

  const showGarudaPreview = logoLayout === 'center_garuda';
  const showLeftPreview = (logoLayout === 'standard_left' || logoLayout === 'dual_logo');
  const showRightPreview = logoLayout === 'dual_logo';

  const effectiveKabLogoPreview = kabLogoUrl || profile.logo_kabupaten_url || DEFAULT_KAB_LOGO_DATA_URI;
  const effectiveDesaLogoPreview = desaLogoUrl || profile.logo_desa_url || (logoLayout === 'dual_logo' ? DEFAULT_DESA_LOGO_DATA_URI : '');

  const previewBorderClass =
    borderStyle === 'none'
      ? 'border-b-0'
      : borderStyle === 'single'
      ? 'border-b-2 border-slate-900 pb-3'
      : 'border-b-4 border-double border-slate-900 pb-3';

  return createPortal(
    <div
      className="fixed inset-0 z-[10003] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 rounded-3xl max-w-6xl w-full h-[92vh] max-h-[880px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Tata Naskah Dinas & Template Surat Desa
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Realtime Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Kustomisasi format surat, kop naskah dinas, dan redaksi kalimat agar sesuai Perbup/Perwal setempat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toastMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {toastMessage}
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Reset ke format standar Permendagri"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Bawaan
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header: Jenis Surat Selector */}
        <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Jenis Surat:
          </span>
          {letterTypeOptions.map((opt) => {
            const isActive = selectedTypeCode === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setSelectedTypeCode(opt.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        {/* Main Content: 2 Columns (Editor vs Live Preview) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Configuration & Text Editor */}
          <div className="w-full lg:w-1/2 p-5 sm:p-6 overflow-y-auto border-r border-slate-200 flex flex-col space-y-5 bg-white">
            {/* Tab Selector: Format Redaksi vs Tata Naskah Kop */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Redaksi Teks & Variabel
              </button>
              <button
                onClick={() => setActiveTab('header')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'header' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Kop Surat & Tipografi
              </button>
            </div>

            {activeTab === 'editor' ? (
              <div className="space-y-4">
                {/* Judul Surat Formatter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Resmi Dokumen
                  </label>
                  <input
                    type="text"
                    value={titleFormat}
                    onFocus={() => setActiveField('title')}
                    onChange={(e) => setTitleFormat(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none uppercase"
                    placeholder="CONTOH: SURAT KETERANGAN TIDAK MAMPU"
                  />
                </div>

                {/* Opening Text */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Kalimat Pembuka (Sebelum Identitas Pemohon)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">opening_text</span>
                  </div>
                  <textarea
                    rows={2}
                    value={openingText}
                    onFocus={() => setActiveField('opening')}
                    onChange={(e) => setOpeningText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none leading-relaxed"
                  />
                </div>

                {/* Declaration / Body Text */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Kalimat Keterangan / Badan Surat (Setelah Identitas Pemohon)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">declaration_text</span>
                  </div>
                  <textarea
                    rows={4}
                    value={declarationText}
                    onFocus={() => setActiveField('declaration')}
                    onChange={(e) => setDeclarationText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none leading-relaxed"
                  />
                </div>

                {/* Closing Text */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Kalimat Penutup
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">closing_text</span>
                  </div>
                  <textarea
                    rows={2}
                    value={closingText}
                    onFocus={() => setActiveField('closing')}
                    onChange={(e) => setClosingText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none leading-relaxed"
                  />
                </div>

                {/* Signer Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Pejabat Penandatangan
                  </label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="Contoh: Kepala Desa atau a.n. Kepala Desa, Sekretaris Desa"
                  />
                </div>

                {/* Variable Helper Chips */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Sisipkan Variabel Otomatis:
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    Klik tag variabel di bawah untuk menyisipkannya ke dalam kolom teks yang sedang aktif:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_PLACEHOLDERS.map((ph) => (
                      <button
                        key={ph.tag}
                        type="button"
                        onClick={() => handleInsertTag(ph.tag)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 rounded-lg text-[11px] font-mono border border-slate-200/80 transition-all flex items-center gap-1"
                        title={ph.desc}
                      >
                        <span>{ph.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Header & Typography Configuration Tab */
              <div className="space-y-5">
                {/* Logo Layout Configuration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tata Letak Logo Kop Surat (Sesuai Naskah Dinas Daerah)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                    {[
                      { id: 'standard_left', label: 'Standar Pemkab', desc: 'Logo Kab di Kiri', badge: 'Permendagri' },
                      { id: 'dual_logo', label: 'Dual Logo', desc: 'Kiri: Kab, Kanan: Desa', badge: 'Perdes' },
                      { id: 'center_garuda', label: 'Garuda Pancasila', desc: 'Tengah (Pilihan SK)', badge: 'Khusus SK' },
                      { id: 'no_logo', label: 'Tanpa Logo', desc: 'Hanya Teks Kop', badge: 'Polos' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLogoLayout(l.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          logoLayout === l.id
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{l.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">{l.badge}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{l.desc}</div>
                      </button>
                    ))}
                  </div>

                  {(logoLayout === 'standard_left' || logoLayout === 'dual_logo') && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 mb-3">
                      {/* Logo Pemkab (Kiri) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Lambang Pemkab / Pemkot (Kiri):</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {profile.logo_kabupaten_url && (
                              <button
                                type="button"
                                onClick={() => setKabLogoUrl(profile.logo_kabupaten_url || '')}
                                className="text-[10px] text-emerald-600 hover:underline font-semibold"
                              >
                                Pakai Profil Desa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setKabLogoUrl(DEFAULT_KAB_LOGO_DATA_URI)}
                              className="text-[10px] text-slate-500 hover:underline"
                            >
                              Reset Standar
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Mini Thumbnail */}
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                            <img
                              src={kabLogoUrl || profile.logo_kabupaten_url || DEFAULT_KAB_LOGO_DATA_URI}
                              alt="Logo Kab"
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_KAB_LOGO_DATA_URI;
                              }}
                            />
                          </div>

                          {/* File input & trigger */}
                          <input
                            ref={kabFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={(e) => handleLogoFileUpload(e, 'kab')}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => kabFileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5 text-blue-600" />
                            Pilih File Logo
                          </button>

                          <div className="flex-1">
                            <input
                              type="text"
                              value={kabLogoUrl.startsWith('data:') ? '✓ Berkas Gambar Terunggah (Base64)' : kabLogoUrl}
                              onChange={(e) => setKabLogoUrl(e.target.value)}
                              placeholder="Atau tempel URL gambar (https://...)"
                              readOnly={kabLogoUrl.startsWith('data:')}
                              className={`w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono ${
                                kabLogoUrl.startsWith('data:') ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'bg-white'
                              }`}
                            />
                          </div>
                          {kabLogoUrl.startsWith('data:') && (
                            <button
                              type="button"
                              onClick={() => setKabLogoUrl('')}
                              className="text-[10px] text-rose-600 hover:underline px-1"
                            >
                              Ganti
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Logo Desa (Kanan) pada Dual Logo */}
                      {logoLayout === 'dual_logo' && (
                        <div className="space-y-2 pt-2.5 border-t border-slate-200/70">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lambang Resmi Desa / Kelurahan (Kanan):</span>
                            </label>
                            <div className="flex items-center gap-2">
                              {profile.logo_desa_url && (
                                <button
                                  type="button"
                                  onClick={() => setDesaLogoUrl(profile.logo_desa_url || '')}
                                  className="text-[10px] text-emerald-600 hover:underline font-semibold"
                                >
                                  Pakai Profil Desa
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDesaLogoUrl(DEFAULT_DESA_LOGO_DATA_URI)}
                                className="text-[10px] text-slate-500 hover:underline"
                              >
                                Reset Standar
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {/* Mini Thumbnail */}
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                              <img
                                src={desaLogoUrl || profile.logo_desa_url || DEFAULT_DESA_LOGO_DATA_URI}
                                alt="Logo Desa"
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_DESA_LOGO_DATA_URI;
                                }}
                              />
                            </div>

                            {/* File input & trigger */}
                            <input
                              ref={desaFileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={(e) => handleLogoFileUpload(e, 'desa')}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => desaFileInputRef.current?.click()}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5 text-emerald-600" />
                              Pilih File Logo
                            </button>

                            <div className="flex-1">
                              <input
                                type="text"
                                value={desaLogoUrl.startsWith('data:') ? '✓ Berkas Gambar Terunggah (Base64)' : desaLogoUrl}
                                onChange={(e) => setDesaLogoUrl(e.target.value)}
                                placeholder="Atau tempel URL gambar (https://...)"
                                readOnly={desaLogoUrl.startsWith('data:')}
                                className={`w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono ${
                                  desaLogoUrl.startsWith('data:') ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'bg-white'
                                }`}
                              />
                            </div>
                            {desaLogoUrl.startsWith('data:') && (
                              <button
                                type="button"
                                onClick={() => setDesaLogoUrl('')}
                                className="text-[10px] text-rose-600 hover:underline px-1"
                              >
                                Ganti
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {logoLayout === 'center_garuda' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Lambang <strong>Garuda Pancasila</strong> resmi disertakan secara otomatis di bagian tengah atas kop dokumen (ideal untuk Keputusan Kades).
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Jenis Font Naskah Dinas (Sesuai Perbup / Perwal)
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'Times New Roman', label: 'Times New Roman', fontClass: 'font-serif' },
                      { id: 'Bookman Old Style', label: 'Bookman Old Style', fontClass: 'font-serif' },
                      { id: 'Arial', label: 'Arial (Modern)', fontClass: 'font-sans' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          fontFamily === f.id
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`text-sm font-bold ${f.fontClass}`}>{f.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Standar Naskah Dinas</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Garis Pembatas Kop Surat
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'double', label: 'Garis Ganda (Resmi)', desc: 'Double 3px border' },
                      { id: 'single', label: 'Garis Tunggal', desc: 'Solid 2px border' },
                      { id: 'none', label: 'Tanpa Garis', desc: 'Kosong' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBorderStyle(b.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          borderStyle === b.id
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{b.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Spasi Antar Baris (Line Spacing)
                  </label>
                  <div className="flex gap-2.5">
                    {[
                      { val: 1.15, label: '1.15 (Rapat)' },
                      { val: 1.5, label: '1.5 (Standar Permendagri)' },
                      { val: 1.8, label: '1.8 (Renggang)' },
                    ].map((sp) => (
                      <button
                        key={sp.val}
                        type="button"
                        onClick={() => setLineSpacing(sp.val)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          lineSpacing === sp.val
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    Informasi Logo & Header Kop:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Nama Desa, Kecamatan, Kabupaten, Alamat Kantor, dan Kontak diambil langsung dari 
                    <strong> Profil Desa</strong> di menu <em>APBDes & Profil</em>. Perubahan pada profil otomatis 
                    memperbarui seluruh surat yang diterbitkan.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Side-by-Side Sheet Preview */}
          <div className="hidden lg:flex flex-1 p-6 bg-slate-200/80 overflow-y-auto items-start justify-center">
            {/* Sheet Canvas (Simulasi Kertas Surat A4) */}
            <div
              className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-[560px] p-8 text-slate-900 select-none animate-fade-in"
              style={{
                fontFamily:
                  fontFamily === 'Arial'
                    ? 'Arial, sans-serif'
                    : fontFamily === 'Bookman Old Style'
                    ? '"Bookman Old Style", Georgia, serif'
                    : '"Times New Roman", Times, serif',
                lineHeight: lineSpacing,
              }}
            >
              {/* Kop Surat Live Preview */}
              <div className={`mb-5 ${previewBorderClass}`}>
                {showGarudaPreview && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={DEFAULT_GARUDA_DATA_URI}
                      alt="Garuda Pancasila"
                      className="h-12 w-12 object-contain"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== DEFAULT_GARUDA_DATA_URI) {
                          target.src = DEFAULT_GARUDA_DATA_URI;
                        }
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  {showLeftPreview ? (
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <img
                        src={effectiveKabLogoPreview}
                        alt="Logo Pemda"
                        className="max-h-12 max-w-12 object-contain"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== DEFAULT_KAB_LOGO_DATA_URI) {
                            target.src = DEFAULT_KAB_LOGO_DATA_URI;
                          }
                        }}
                      />
                    </div>
                  ) : showRightPreview ? (
                    <div className="w-12 shrink-0" />
                  ) : null}

                  <div className="flex-1 text-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 font-sans">
                      {profile.regency ? `PEMERINTAH ${profile.regency.toUpperCase()}` : 'PEMERINTAH KABUPATEN'}
                    </h4>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 font-sans">
                      {profile.district ? `KECAMATAN ${profile.district.toUpperCase()}` : 'KECAMATAN'}
                    </h3>
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950 font-sans">
                      {profile.name ? `PEMERINTAH ${profile.name.toUpperCase()}` : 'PEMERINTAH DESA'}
                    </h2>
                    <p className="text-[9px] text-slate-600 mt-0.5 font-sans leading-tight">
                      {[profile.office_address, profile.office_phone ? `Telp: ${profile.office_phone}` : ''].filter(Boolean).join(' • ') || 'Alamat Kantor Pemerintahan Desa'}
                    </p>
                    <p className="text-[8.5px] text-slate-500 font-sans">
                      Email: {profile.office_email || 'sekretariat@desa.id'}
                    </p>
                  </div>

                  {showRightPreview ? (
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <img
                        src={effectiveDesaLogoPreview}
                        alt="Logo Desa"
                        className="max-h-12 max-w-12 object-contain"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== DEFAULT_DESA_LOGO_DATA_URI) {
                            target.src = DEFAULT_DESA_LOGO_DATA_URI;
                          }
                        }}
                      />
                    </div>
                  ) : showLeftPreview ? (
                    <div className="w-12 shrink-0" />
                  ) : null}
                </div>
              </div>

              {/* Title & Official Number */}
              <div className="text-center my-4">
                <h3 className="text-xs font-bold uppercase underline tracking-wide">
                  {previewTitle || 'SURAT KETERANGAN'}
                </h3>
                <p className="text-[10px] font-sans text-slate-600 font-semibold mt-0.5">
                  Nomor: {sampleContext.nomor_surat}
                </p>
              </div>

              {/* Opening Paragraph */}
              <div className="text-[11px] leading-relaxed text-justify mb-3 text-slate-800">
                <p>{previewOpening}</p>
              </div>

              {/* Citizen Sample Table */}
              <div className="pl-4 space-y-1 my-3 text-[10.5px]">
                <div className="grid grid-cols-12">
                  <span className="col-span-4 text-slate-600">Nama Lengkap</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-7 font-bold text-slate-950">{sampleContext.nama_warga}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 text-slate-600">NIK</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-7 font-mono font-semibold">{sampleContext.nik}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 text-slate-600">Alamat Kependudukan</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-7">{sampleContext.alamat}</span>
                </div>
                <div className="grid grid-cols-12">
                  <span className="col-span-4 text-slate-600">Keperluan</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-7 font-semibold italic text-slate-900">{sampleContext.keperluan}</span>
                </div>
              </div>

              {/* Declaration / Body Paragraph */}
              <div className="text-[11px] leading-relaxed text-justify mb-3 text-slate-800">
                <p>{previewDeclaration}</p>
              </div>

              {/* Closing Paragraph */}
              <div className="text-[11px] leading-relaxed text-justify mb-6 text-slate-800">
                <p>{previewClosing}</p>
              </div>

              {/* TTE QR Code & Signature Section */}
              <div className="flex justify-between items-end pt-3">
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-w-[210px] font-sans">
                  <div className="w-12 h-12 bg-white border border-slate-300 rounded p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('https://desa.id/verify/sample')}`}
                      alt="QR TTE"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[8px] leading-tight text-slate-600">
                    <div className="font-bold text-emerald-800">✓ TTE Sah Resmi</div>
                    Disahkan secara digital dengan Tanda Tangan Elektronik resmi desa.
                  </div>
                </div>

                <div className="text-center font-sans min-w-[150px]">
                  <div className="text-[10px] text-slate-600 mb-0.5">
                    {profile.name ? profile.name.replace(/^(Desa|Kelurahan)\s+/i, '') : 'Desa'}, {sampleContext.tanggal_surat}
                  </div>
                  <div className="text-[10px] font-bold text-slate-950 mb-8">
                    {signerRole || 'Kepala ' + (profile.name || 'Desa')}
                  </div>
                  <div className="text-[10.5px] font-bold underline text-slate-950">
                    {sampleContext.nama_kades}
                  </div>
                  <div className="text-[8px] text-slate-500">NIP. 19740510 199903 1 004</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
