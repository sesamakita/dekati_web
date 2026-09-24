// src/views/EventsView.tsx
import React, { useState } from 'react';
import { 
  Calendar, 
  PhoneCall, 
  PlusCircle, 
  Clock, 
  MapPin, 
  User, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Shield, 
  Flame, 
  Heart, 
  Car, 
  X,
  Phone,
  Radio,
  Tag
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { VillageEvent, EmergencyContact } from '../types';

export const EventsView: React.FC = () => {
  const { 
    villageEvents, 
    emergencyContacts, 
    createVillageEvent, 
    updateVillageEvent, 
    deleteVillageEvent,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact
  } = useData();

  const [activeTab, setActiveTab] = useState<'events' | 'emergency'>('events');
  const [eventSearch, setEventSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Modal States for Events
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VillageEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Kesehatan',
    event_date: '',
    event_time: '',
    location: '',
    organizer: '',
    description: '',
    is_active: true
  });

  // Modal States for Emergency Contacts
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({
    title: '',
    phone: '',
    icon: 'call',
    description: '',
    order_index: 1,
    is_active: true
  });

  // Filtered Events
  const filteredEvents = villageEvents.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      evt.location.toLowerCase().includes(eventSearch.toLowerCase()) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(eventSearch.toLowerCase()));
    const matchesCategory = categoryFilter === 'Semua' || evt.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handlers for Events
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      category: 'Kesehatan',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '08.30 - 11.30 WIB',
      location: '',
      organizer: '',
      description: '',
      is_active: true
    });
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (evt: VillageEvent) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      category: evt.category,
      event_date: evt.event_date,
      event_time: evt.event_time,
      location: evt.location,
      organizer: evt.organizer || '',
      description: evt.description || '',
      is_active: evt.is_active ?? true
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.event_date || !eventForm.location) {
      alert('Mohon isi judul kegiatan, tanggal, dan lokasi pelaksanaan.');
      return;
    }

    if (editingEvent) {
      await updateVillageEvent(editingEvent.id, eventForm);
    } else {
      await createVillageEvent(eventForm);
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Hapus agenda kegiatan "${title}"?`)) {
      await deleteVillageEvent(id);
    }
  };

  // Handlers for Emergency Contacts
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({
      title: '',
      phone: '',
      icon: 'call',
      description: '',
      order_index: (emergencyContacts.length || 0) + 1,
      is_active: true
    });
    setShowContactModal(true);
  };

  const handleOpenEditContact = (c: EmergencyContact) => {
    setEditingContact(c);
    setContactForm({
      title: c.title,
      phone: c.phone,
      icon: c.icon || 'call',
      description: c.description || '',
      order_index: c.order_index || 1,
      is_active: c.is_active ?? true
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.title || !contactForm.phone) {
      alert('Mohon isi nama kontak dan nomor telepon darurat.');
      return;
    }

    if (editingContact) {
      await updateEmergencyContact(editingContact.id, contactForm);
    } else {
      await createEmergencyContact(contactForm);
    }
    setShowContactModal(false);
  };

  const handleDeleteContact = async (id: string, title: string) => {
    if (window.confirm(`Hapus kontak darurat "${title}"?`)) {
      await deleteEmergencyContact(id);
    }
  };

  const getContactIcon = (iconName?: string) => {
    switch (iconName) {
      case 'car':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'shield-alert':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'heart':
      case 'medkit':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-red-600" />;
      default:
        return <PhoneCall className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Agenda Kegiatan & Layanan Siaga Desa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola jadwal resmi musyawarah, posyandu, dan nomor kontak siaga darurat 24 jam yang tersinkronisasi langsung ke HP warga.
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'events' ? (
          <button
            onClick={handleOpenAddEvent}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Agenda Kegiatan
          </button>
        ) : (
          <button
            onClick={handleOpenAddContact}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Kontak Darurat
          </button>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agenda Kegiatan Resmi ({villageEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          Kontak Darurat 24 Jam ({emergencyContacts.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AGENDA KEGIATAN DESA                                    */}
      {/* ============================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="Cari judul kegiatan, lokasi, atau penyelenggara..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['Semua', 'Kesehatan', 'Pemerintahan', 'Lingkungan', 'Kemasyarakatan', 'Pembangunan'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events List */}
          {filteredEvents.length === 0 ? (
            <div className="bento-card p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Belum ada agenda kegiatan yang cocok.</p>
              <p className="text-xs text-slate-500 mt-1">Silakan tambahkan jadwal kegiatan baru untuk warga desa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bento-card p-5 flex flex-col justify-between hover:border-emerald-200 transition-all group"
                >
                  <div>
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {evt.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.is_active !== false 
                          ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {evt.is_active !== false ? '● Aktif' : '○ Arsip'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                      {evt.title}
                    </h3>

                    {/* Description */}
                    {evt.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                        {evt.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{evt.event_date}</span>
                        <span>•</span>
                        <span>{evt.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                      {evt.organizer && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">PIC: {evt.organizer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditEvent(evt)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Edit Agenda"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: KONTAK DARURAT 24 JAM                                   */}
      {/* ============================================================== */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="bento-card p-4 bg-rose-50/70 border-rose-200 flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Integrasi Layanan Gawat Darurat Desa</span>
              Nomor-nomor ini akan muncul di jendela darurat aplikasi mobile warga Dekati saat tombol kontak siaga ditekan. Warga dapat langsung menelepon ambulans, Bhabinkamtibmas, Babinsa, atau Linmas dalam 1 ketukan.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((c) => (
              <div
                key={c.id}
                className="bento-card p-5 flex flex-col justify-between hover:border-rose-200 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform">
                      {getContactIcon(c.icon)}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Prioritas #{c.order_index || 0}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {c.title}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      {c.phone}
                    </span>
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 ml-1"
                    >
                      <Phone className="w-3 h-3" />
                      Tes Panggil
                    </a>
                  </div>

                  {c.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditContact(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Edit Kontak"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(c.id, c.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Kontak"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH / EDIT AGENDA EVENT                              */}
      {/* ============================================================== */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {editingEvent ? 'Ubah Agenda Kegiatan' : 'Tambah Agenda Kegiatan Desa'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Contoh: Posyandu Balita & Skrining Lansia"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pemerintahan">Pemerintahan</option>
                    <option value="Lingkungan">Lingkungan</option>
                    <option value="Kemasyarakatan">Kemasyarakatan</option>
                    <option value="Pembangunan">Pembangunan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu / Jam *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.event_time}
                    onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                    placeholder="08.30 - 11.30 WIB"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penyelenggara / PIC</label>
                  <input
                    type="text"
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    placeholder="Kader Posyandu / BPD"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Contoh: Balai RW 01 Dusun Mekar"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uraian / Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Keterangan agenda, syarat membawa buku KIA, dll..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="eventActive"
                  checked={eventForm.is_active}
                  onChange={(e) => setEventForm({ ...eventForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="eventActive" className="text-xs font-semibold text-slate-700">
                  Tampilkan aktif di beranda mobile warga
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH / EDIT KONTAK DARURAT                            */}
      {/* ============================================================== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                {editingContact ? 'Ubah Kontak Siaga Darurat' : 'Tambah Kontak Siaga Darurat'}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Layanan / Instansi *</label>
                <input
                  type="text"
                  required
                  value={contactForm.title}
                  onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                  placeholder="Contoh: Ambulans Siaga Desa 24 Jam"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ikon Representasi</label>
                  <select
                    value={contactForm.icon}
                    onChange={(e) => setContactForm({ ...contactForm, icon: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="car">Ambulans / Kendaraan Siaga</option>
                    <option value="shield">Polisi / Bhabinkamtibmas / Babinsa</option>
                    <option value="heart">Medis / Bidan / Puskesmas</option>
                    <option value="flame">Pemadam Kebakaran (Damkar)</option>
                    <option value="shield-alert">Satlinmas Desa</option>
                    <option value="call">Telepon Kantor Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urutan Tampil (Prioritas)</label>
                <input
                  type="number"
                  min={1}
                  value={contactForm.order_index}
                  onChange={(e) => setContactForm({ ...contactForm, order_index: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Layanan yang Dicakup</label>
                <textarea
                  rows={2}
                  value={contactForm.description}
                  onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                  placeholder="Layanan rujukan darurat gratis untuk seluruh warga desa..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="contactActive"
                  checked={contactForm.is_active}
                  onChange={(e) => setContactForm({ ...contactForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="contactActive" className="text-xs font-semibold text-slate-700">
                  Aktifkan di daftar kontak darurat mobile
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
