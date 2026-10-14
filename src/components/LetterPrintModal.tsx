import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { LetterRequest, LetterTemplate, VillageProfile } from '../types';
import { 
  getEffectiveTemplate, 
  buildTemplateContext, 
  interpolateTemplateText,
  DEFAULT_GARUDA_URL,
  DEFAULT_KAB_LOGO_URL,
} from '../utils/letterTemplateEngine';

interface LetterPrintModalProps {
  letter: LetterRequest;
  profile: VillageProfile;
  templates?: LetterTemplate[];
  onClose: () => void;
}

export const LetterPrintModal: React.FC<LetterPrintModalProps> = ({ 
  letter, 
  profile, 
  templates,
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const effectiveTemplate = getEffectiveTemplate(letter.letter_name, templates);
  const context = buildTemplateContext(letter, profile, effectiveTemplate.signer_role);

  const headerConfig = effectiveTemplate.header_config || {
    font_family: 'Times New Roman',
    line_spacing: 1.5,
    border_style: 'double',
  };

  const logoLayout = headerConfig.logo_layout || 'standard_left';
  const showKab = headerConfig.show_kab_logo !== false && logoLayout !== 'no_logo' && logoLayout !== 'center_garuda';
  const showDesa = (headerConfig.show_desa_logo || logoLayout === 'dual_logo') && logoLayout !== 'no_logo' && logoLayout !== 'center_garuda';
  const showGaruda = logoLayout === 'center_garuda' || Boolean(headerConfig.show_garuda_logo);

  const kabLogoUrl = headerConfig.kab_logo_url || profile.logo_kabupaten_url || DEFAULT_KAB_LOGO_URL;
  const desaLogoUrl = headerConfig.desa_logo_url || profile.logo_desa_url || '';
  const garudaLogoUrl = headerConfig.garuda_logo_url || DEFAULT_GARUDA_URL;

  const hasLeftLogo = showKab && Boolean(kabLogoUrl);
  const hasRightLogo = showDesa && Boolean(desaLogoUrl);

  const previewBorderClass =
    headerConfig.border_style === 'none'
      ? 'border-b-0 pb-0'
      : headerConfig.border_style === 'single'
      ? 'border-b-2 border-slate-900 pb-4'
      : 'border-b-4 border-double border-slate-900 pb-4';

  const titleText = interpolateTemplateText(effectiveTemplate.title_format, context);
  const openingText = interpolateTemplateText(effectiveTemplate.opening_text, context);
  const declarationText = interpolateTemplateText(effectiveTemplate.declaration_text, context);
  const closingText = interpolateTemplateText(effectiveTemplate.closing_text, context);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Container: Max-height with safe viewport distance up and down */}
      <div 
        className="my-auto bg-white rounded-3xl max-w-3xl w-full max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Controls (Fixed Header, Hidden in Print) */}
        <div className="no-print shrink-0 px-6 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau Dokumen Resmi Desa
            </h3>
            <p className="text-xs text-slate-500">
              Surat sah dengan Tanda Tangan Elektronik (TTE QR) terverifikasi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Official Village Letter Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div 
            className="printable-area bg-white text-slate-900 p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm"
            style={{
              fontFamily:
                headerConfig.font_family === 'Arial'
                  ? 'Arial, sans-serif'
                  : headerConfig.font_family === 'Bookman Old Style'
                  ? '"Bookman Old Style", Georgia, serif'
                  : '"Times New Roman", Times, serif',
              lineHeight: headerConfig.line_spacing || 1.5,
            }}
          >
          {/* Official Village Letterhead (KOP SURAT) */}
          <div className={`text-center mb-6 relative ${previewBorderClass}`}>
            {showGaruda && (
              <div className="flex justify-center mb-3">
                <img
                  src={garudaLogoUrl}
                  alt="Garuda Pancasila"
                  className="h-16 w-16 object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              {hasLeftLogo ? (
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <img
                    src={kabLogoUrl}
                    alt="Logo Pemda"
                    className="max-h-16 max-w-16 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              ) : hasRightLogo ? (
                <div className="w-16 shrink-0" />
              ) : null}

              <div className="flex-1 text-center">
                <h4 className="text-xs tracking-wider font-sans font-bold uppercase text-slate-700">
                  {profile.regency ? `PEMERINTAH ${profile.regency.toUpperCase()}` : 'PEMERINTAH KABUPATEN'}
                </h4>
                <h3 className="text-sm tracking-wider font-sans font-bold uppercase text-slate-800">
                  {profile.district ? `KECAMATAN ${profile.district.toUpperCase()}` : 'KECAMATAN'}
                </h3>
                <h2 className="text-xl tracking-wider font-sans font-extrabold uppercase text-slate-950">
                  {profile.name ? `PEMERINTAH ${profile.name.toUpperCase()}` : 'PEMERINTAH DESA'}
                </h2>
                <p className="text-[11px] font-sans text-slate-600 mt-1">
                  {[profile.office_address, profile.office_phone ? `Telp: ${profile.office_phone}` : '', profile.postal_code ? `Kode Pos: ${profile.postal_code}` : ''].filter(Boolean).join(' • ') || 'Alamat Kantor Pemerintahan Desa'}
                </p>
                <p className="text-[10px] font-sans text-slate-500">
                  Email: {profile.office_email || 'sekretariat@desa.id'}
                </p>
              </div>

              {hasRightLogo ? (
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <img
                    src={desaLogoUrl}
                    alt="Logo Desa"
                    className="max-h-16 max-w-16 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              ) : hasLeftLogo ? (
                <div className="w-16 shrink-0" />
              ) : null}
            </div>
          </div>

          {/* Letter Title & Number */}
          <div className="text-center my-6">
            <h3 className="text-base font-bold underline uppercase tracking-wide">
              {titleText || letter.letter_name}
            </h3>
            <p className="text-xs font-sans text-slate-700 mt-1 font-semibold">
              Nomor: {context.nomor_surat}
            </p>
          </div>

          {/* Letter Content Opening */}
          <div className="text-xs sm:text-sm leading-relaxed text-justify space-y-4 text-slate-800">
            <p>{openingText}</p>

            {/* Citizen Data Table */}
            <div className="pl-6 sm:pl-10 space-y-1.5 py-2 font-sans">
              <div className="grid grid-cols-12 text-xs">
                <span className="col-span-4 text-slate-600">Nama Lengkap</span>
                <span className="col-span-1">:</span>
                <span className="col-span-7 font-bold text-slate-900">{letter.citizen_name}</span>
              </div>
              <div className="grid grid-cols-12 text-xs">
                <span className="col-span-4 text-slate-600">NIK</span>
                <span className="col-span-1">:</span>
                <span className="col-span-7 font-mono font-semibold">{letter.citizen_nik}</span>
              </div>
              <div className="grid grid-cols-12 text-xs">
                <span className="col-span-4 text-slate-600">Alamat Kependudukan</span>
                <span className="col-span-1">:</span>
                <span className="col-span-7">{letter.citizen_address || 'Wilayah Desa'}</span>
              </div>
              <div className="grid grid-cols-12 text-xs">
                <span className="col-span-4 text-slate-600">Keperluan</span>
                <span className="col-span-1">:</span>
                <span className="col-span-7 font-semibold italic text-slate-900">{letter.purpose}</span>
              </div>
            </div>

            <p>{declarationText}</p>

            <p>{closingText}</p>
          </div>

          {/* Signature & TTE QR Section */}
          <div className="mt-10 pt-4 flex justify-between items-end">
            {/* QR Code Validation Notice */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs">
              <div className="bg-white p-1 rounded-lg border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                    letter.qr_verification_url || letter.tracking_number
                  )}`}
                  alt="TTE QR"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="text-[10px] font-sans text-slate-600 leading-tight">
                <div className="font-bold text-emerald-800 flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  TTE Sah Desa
                </div>
                Pindai QR untuk memeriksa keabsahan surat di portal resmi {profile.name || 'Desa'}.
                <div className="font-mono text-[9px] text-slate-400 mt-1">
                  ID: {letter.qr_verification_token?.slice(0, 16) || letter.tracking_number}
                </div>
              </div>
            </div>

            {/* Official Signer Box */}
            <div className="text-center font-sans">
              <p className="text-xs text-slate-700">
                {profile.name?.replace(/^(Desa|Kelurahan)\s+/i, '') || 'Wilayah'}, {letter.signed_at?.split(',')[0] || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs font-bold text-slate-900 mb-12">
                Kepala {profile.name || 'Desa'}
              </p>
              <p className="text-xs font-bold underline text-slate-950">
                {profile.kades_name || 'Kepala Desa'}
              </p>
              <p className="text-[10px] text-slate-500">
                NIP. 19740510 199903 1 004
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
