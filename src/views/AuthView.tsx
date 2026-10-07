// src/views/AuthView.tsx
import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCog, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  User, 
  FileText, 
  KeyRound, 
  Check, 
  AlertCircle,
  Compass,
  Search,
  MapPin
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { wilayahService, Province, Regency, District, Village, toTitleCase } from '../services/wilayahService';
import { CustomDialog } from '../components/CustomDialog';

interface AuthViewProps {
  onLoginSuccess: (role: 'admin_desa' | 'kades', userEmail?: string) => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onBackToLanding,
  initialMode = 'login',
}) => {
  const { profile, loginOfficial, registerOfficial } = useData();
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginRole, setLoginRole] = useState<'admin_desa' | 'kades'>('admin_desa');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('kades');
  const [regNik, setRegNik] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVillage, setRegVillage] = useState(profile.name && profile.name !== 'Pemerintah Desa' ? profile.name : '');
  const [regVillageCode, setRegVillageCode] = useState(profile.code || '');
  const [regDistrict, setRegDistrict] = useState(profile.district || '');
  const [regRegency, setRegRegency] = useState(profile.regency || '');
  const [regProvince, setRegProvince] = useState(profile.province || '');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAgree, setRegAgree] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Wilayah Indonesia Picker states
  const [showWilayahPicker, setShowWilayahPicker] = useState(false);
  const [searchWilayah, setSearchWilayah] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selProvId, setSelProvId] = useState('');
  const [selRegId, setSelRegId] = useState('');
  const [selDistId, setSelDistId] = useState('');
  const [selVilId, setSelVilId] = useState('');
  const [loadingWilayah, setLoadingWilayah] = useState(false);

  const toggleWilayahPicker = async () => {
    const nextState = !showWilayahPicker;
    setShowWilayahPicker(nextState);
    if (nextState && provinces.length === 0) {
      setLoadingWilayah(true);
      const data = await wilayahService.getProvinces();
      setProvinces(data);
      setLoadingWilayah(false);
    }
  };

  const handleProvChange = async (provId: string) => {
    setSelProvId(provId);
    setSelRegId('');
    setSelDistId('');
    setSelVilId('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    const provObj = provinces.find((p) => p.id === provId);
    if (provObj) {
      setRegProvince(toTitleCase(provObj.name));
    }
    if (provId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getRegencies(provId);
      setRegencies(data);
      setLoadingWilayah(false);
    }
  };

  const handleRegChange = async (regId: string) => {
    setSelRegId(regId);
    setSelDistId('');
    setSelVilId('');
    setDistricts([]);
    setVillages([]);
    const regObj = regencies.find((r) => r.id === regId);
    if (regObj) {
      setRegRegency(toTitleCase(regObj.name));
    }
    if (regId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getDistricts(regId);
      setDistricts(data);
      setLoadingWilayah(false);
    }
  };

  const handleDistChange = async (distId: string) => {
    setSelDistId(distId);
    setSelVilId('');
    setVillages([]);
    const distObj = districts.find((d) => d.id === distId);
    if (distObj) {
      setRegDistrict(`Kecamatan ${toTitleCase(distObj.name)}`);
    }
    if (distId) {
      setLoadingWilayah(true);
      const data = await wilayahService.getVillages(distId);
      setVillages(data);
      setLoadingWilayah(false);
    }
  };

  const handleVilChange = (vilId: string) => {
    setSelVilId(vilId);
    const v = villages.find((item) => item.id === vilId);
    if (v) {
      const prefix = regRole === 'lurah' ? 'Kelurahan' : 'Desa';
      setRegVillage(`${prefix} ${toTitleCase(v.name)}`);
      setRegVillageCode(v.id);
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Mohon isi email/NIK dan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginOfficial(loginEmail, loginPassword);
      if (result.success && result.user) {
        const determinedRole =
          result.user.role === 'kades' || result.user.role === 'lurah'
            ? 'kades'
            : 'admin_desa';

        onLoginSuccess(determinedRole, result.user.email);
      } else {
        setLoginError(result.error || 'Email atau kata sandi tidak cocok.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regName.trim() || !regNik.trim() || !regEmail.trim() || !regPassword.trim() || !regVillage.trim()) {
      setLoginError('Mohon lengkapi formulir registrasi termasuk nama desa/kelurahan.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLoginError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!regAgree) {
      setLoginError('Anda harus menyetujui pakta integritas dan standar regulasi data desa.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerOfficial({
        nama: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        nik: regNik,
        village_code: regVillageCode,
        village_name: regVillage,
        district: regDistrict,
        regency: regRegency,
        province: regProvince,
      });

      if (result.success && result.user) {
        setRegisterSuccess(true);
        setTimeout(() => {
          setAuthMode('login');
          setLoginEmail(regEmail);
          setLoginPassword(regPassword);
          setLoginRole(regRole === 'kades' || regRole === 'lurah' ? 'kades' : 'admin_desa');
          setRegisterSuccess(false);
        }, 1500);
      } else {
        setLoginError(result.error || 'Gagal mendaftarkan akun aparat desa.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      {/* Top Bar for Back Navigation */}
      <div className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">Server Keamanan Aktif</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: BRANDING & PORTAL BENEFITS                                  */}
        {/* ========================================================================= */}
        <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Emblem / Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight">Dekati</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-medium">
                  {profile.name} • {profile.district}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-200 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5" />
                Portal Khusus Aparatur Pamong
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
                Pusat Kendali Pelayanan Desa & Kelurahan Digital
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
                Akses aman untuk Kepala Desa, Lurah, Sekretaris Desa, dan staf operator pelayanan publik.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3.5 pt-4 text-xs">
              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">TTE QR Code Kades / Lurah</div>
                  <div className="text-emerald-200/80 text-[11px]">Pengesahan surat resmi digital berkekuatan hukum UU ITE.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <FileText className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Buku Induk Kependudukan & E-Surat</div>
                  <div className="text-emerald-200/80 text-[11px]">Verifikasi berkas pemohon dan pencatatan nomor registrasi desa.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Sinkronisasi Real-Time ke Warga</div>
                  <div className="text-emerald-200/80 text-[11px]">Setiap disposisi dan update surat langsung terkirim ke HP warga.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of Left Column */}
          <div className="pt-8 border-t border-white/15 text-[11px] text-emerald-200/70 relative z-10 flex items-center justify-between">
            <span>Standar Kemendagri & BSSN RI</span>
            <span>256-Bit SSL</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LOGIN & REGISTER FORM                                      */}
        {/* ========================================================================= */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Tab Header Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk Akun (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Aparat Baru (Register)
              </button>
            </div>

            {/* Error / Alert Display */}
            {loginError && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Success Alert */}
            {registerSuccess && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1 animate-fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pendaftaran Berhasil!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Akun aparat Anda telah terdaftar. Mengalihkan ke formulir masuk...
                </p>
              </div>
            )}

            {/* =================================================================== */}
            {/* A. FORM LOGIN                                                      */}
            {/* =================================================================== */}
            {authMode === 'login' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Selamat Datang Kembali</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan masukkan email kedinasan atau NIK Anda untuk mengakses dashboard.
                  </p>
                </div>


                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Role Selector Pill */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Kewenangan Akses:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLoginRole('admin_desa')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          loginRole === 'admin_desa'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        <span>Operator / Sekdes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginRole('kades')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          loginRole === 'kades'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Kepala Desa / Lurah</span>
                      </button>
                    </div>
                  </div>

                  {/* Email / NIK */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Dinas / NIK Aparat:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@desa.id atau NIK..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">Kata Sandi:</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPasswordDialog(true)}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        tabIndex={-1}
                        title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer font-medium">
                      Ingat perangkat ini untuk akses berikutnya
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Memverifikasi Kredensial...
                      </span>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Web Admin</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* =================================================================== */}
            {/* B. FORM REGISTER                                                   */}
            {/* =================================================================== */}
            {authMode === 'register' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Registrasi Aparat Desa / Lurah</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Daftarkan akun kedinasan untuk pamong desa baru di wilayah Anda.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  {/* Jabatan */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Jabatan / Kewenangan:</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="kades">Kepala Desa / Lurah (Otoritas TTE)</option>
                      <option value="sekdes">Sekretaris Desa (Carik)</option>
                      <option value="kasi_layanan">Kasi Pelayanan (Verifikator Surat)</option>
                      <option value="kaur_pembangunan">Kaur Pembangunan (Penanganan Aduan)</option>
                      <option value="kaur_keuangan">Kaur Keuangan (Bendahara APBDes)</option>
                      <option value="satlinmas">Satlinmas & Ketenteraman</option>
                    </select>
                  </div>

                  {/* Nama Lengkap & Gelar */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Drs. H. Mulyadi Kartodirdjo, M.Si"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* NIK & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">NIK (16 Digit):</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value)}
                        placeholder="320101..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Email Dinas:</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@desa.id"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Bantuan Pemilih Wilayah Indonesia */}
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                        <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                        <span>Pilih dari Database Wilayah Kemendagri RI</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleWilayahPicker}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-100 text-[11px] shadow-xs transition-all"
                      >
                        {showWilayahPicker ? 'Tutup Pilihan' : 'Tarik Data Desa'}
                      </button>
                    </div>

                    <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                      Pilih wilayah kerja secara hierarkis (Provinsi &rarr; Kab/Kota &rarr; Kecamatan &rarr; Desa) untuk otomatis mengisi seluruh data administrasi.
                    </p>

                    {showWilayahPicker && (
                      <div className="space-y-2.5 pt-2 border-t border-emerald-200/60">
                        {/* Search Filter input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={searchWilayah}
                            onChange={(e) => setSearchWilayah(e.target.value)}
                            placeholder="Ketik untuk filter nama daerah..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">1. Provinsi:</label>
                            <select
                              value={selProvId}
                              onChange={(e) => handleProvChange(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-[11px] focus:outline-none focus:border-emerald-500"
                            >
                              <option value="">-- Pilih Provinsi --</option>
                              {provinces
                                .filter((p) => !searchWilayah || p.name.toLowerCase().includes(searchWilayah.toLowerCase()))
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {toTitleCase(p.name)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">2. Kabupaten / Kota:</label>
                            <select
                              value={selRegId}
                              onChange={(e) => handleRegChange(e.target.value)}
                              disabled={!selProvId}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-[11px] focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                            >
                              <option value="">-- Pilih Kab/Kota --</option>
                              {regencies
                                .filter((r) => !searchWilayah || r.name.toLowerCase().includes(searchWilayah.toLowerCase()))
                                .map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {toTitleCase(r.name)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">3. Kecamatan:</label>
                            <select
                              value={selDistId}
                              onChange={(e) => handleDistChange(e.target.value)}
                              disabled={!selRegId}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-[11px] focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                            >
                              <option value="">-- Pilih Kecamatan --</option>
                              {districts
                                .filter((d) => !searchWilayah || d.name.toLowerCase().includes(searchWilayah.toLowerCase()))
                                .map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {toTitleCase(d.name)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">4. Desa / Kelurahan:</label>
                            <select
                              value={selVilId}
                              onChange={(e) => handleVilChange(e.target.value)}
                              disabled={!selDistId}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-[11px] focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                            >
                              <option value="">-- Pilih Desa/Kelurahan --</option>
                              {villages
                                .filter((v) => !searchWilayah || v.name.toLowerCase().includes(searchWilayah.toLowerCase()))
                                .map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {toTitleCase(v.name)}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {loadingWilayah && (
                            <div className="sm:col-span-2 text-center text-[10px] text-emerald-700 animate-pulse font-semibold">
                              Memuat data wilayah...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kartu Ringkasan Wilayah Terpilih */}
                  {regVillage && (
                    <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 animate-fade-in">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-emerald-950 text-xs truncate">
                            {regVillage}
                          </p>
                          {regVillageCode && (
                            <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-semibold shrink-0">
                              Kode: {regVillageCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          {[regDistrict, regRegency, regProvince].filter(Boolean).join(' • ') || 'Wilayah kedaerahan'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form Detail Lengkap Wilayah */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Data Wilayah Administrasi Pemerintahan:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Nama Desa / Kelurahan:</label>
                        <input
                          type="text"
                          required
                          value={regVillage}
                          onChange={(e) => setRegVillage(e.target.value)}
                          placeholder="Contoh: Desa Sukamaju"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Kode Wilayah Kemendagri:</label>
                        <input
                          type="text"
                          value={regVillageCode}
                          onChange={(e) => setRegVillageCode(e.target.value)}
                          placeholder="Contoh: 32.01.01.2005"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[10px]">Kecamatan:</label>
                        <input
                          type="text"
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          placeholder="Contoh: Kecamatan Ciawi"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[10px]">Kabupaten / Kota:</label>
                        <input
                          type="text"
                          value={regRegency}
                          onChange={(e) => setRegRegency(e.target.value)}
                          placeholder="Contoh: Kabupaten Bogor"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[10px]">Provinsi:</label>
                        <input
                          type="text"
                          value={regProvince}
                          onChange={(e) => setRegProvince(e.target.value)}
                          placeholder="Contoh: Jawa Barat"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kata Sandi & Konfirmasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Kata Sandi:</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                          title={showRegPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Ulangi Sandi:</label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                          title={showRegConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Pakta Integritas */}
                  <div className="pt-2 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="regAgree"
                      checked={regAgree}
                      onChange={(e) => setRegAgree(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="regAgree" className="text-[11px] text-slate-600 cursor-pointer leading-tight">
                      Saya menyatakan data ini benar, bersedia menjaga kerahasiaan data kependudukan (UU PDP No. 27/2022), serta memegang teguh pakta integritas aparatur pemerintahan desa.
                    </label>
                  </div>

                  {/* Submit Register Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span>Mendaftarkan Akun Aparat...</span>
                    ) : (
                      <>
                        <span>Daftarkan Akun Aparatur Pamong</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Help Text */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Butuh bantuan teknis atau asistensi integrasi? Hubungi{' '}
            <a href="mailto:bantuan@desa.id" className="text-emerald-700 font-bold hover:underline">
              Helpdesk Layanan Terpadu
            </a>
          </div>
        </div>
      </div>

      <CustomDialog
        isOpen={showForgotPasswordDialog}
        onClose={() => setShowForgotPasswordDialog(false)}
        type="info"
        title="Pemulihan Akses Pamong Desa"
        message="Untuk menjaga kerahasiaan dan integritas data kependudukan desa, pemulihan akun aparatur desa dapat dikoordinasikan langsung melalui Administrator Diskominfo Kabupaten atau pengurus teknis desa Anda."
        confirmText="Saya Mengerti"
      />
    </div>
  );
};
