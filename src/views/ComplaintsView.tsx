// src/views/ComplaintsView.tsx
import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  MapPin, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Filter, 
  Search, 
  Eye,
  User
} from 'lucide-react';
import { useData } from '../hooks/useData';
import { ComplaintStatusBadge } from '../components/StatusBadge';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { Complaint, ComplaintStatus } from '../types';

export const ComplaintsView: React.FC = () => {
  const { complaints } = useData();
  const [activeFilter, setActiveFilter] = useState<'all' | ComplaintStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = activeFilter === 'all' ? true : c.status === activeFilter;
    const matchesSearch =
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.ticket_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location_address || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ? true : (c.category || '').includes(selectedCategory);

    return matchesStatus && matchesSearch && matchesCategory;
  });

  const filterTabs: { id: 'all' | ComplaintStatus; label: string; count: number }[] = [
    { id: 'all', label: 'Semua Aduan', count: complaints.length },
    { id: 'submitted', label: 'Laporan Masuk', count: complaints.filter((c) => c.status === 'submitted').length },
    { id: 'in_progress', label: 'Dalam Penanganan', count: complaints.filter((c) => c.status === 'in_progress').length },
    { id: 'resolved', label: 'Selesai', count: complaints.filter((c) => c.status === 'resolved').length },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Title & Stats */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-rose-600" />
          Helpdesk Pengaduan & Aspirasi Warga
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pantau keluhan fasilitas umum, disposisikan petugas lapangan (Satlinmas & Kaur Pembangunan), dan unggah bukti hasil penanganan.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci masalah, jalan, nomor tiket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none"
          >
            <option value="all">Semua Kategori Aduan</option>
            <option value="Infrastruktur">Infrastruktur & Jalan</option>
            <option value="Penerangan">Penerangan Jalan (PJU)</option>
            <option value="Sampah">Kebersihan & Sampah</option>
            <option value="Pelayanan">Pelayanan Aparatur</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid Layout (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComplaints.length === 0 ? (
          <div className="col-span-full bento-card py-16 text-center text-slate-400">
            <MessageSquareWarning className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Tidak ada tiket aduan sesuai filter.</p>
          </div>
        ) : (
          filteredComplaints.map((cmp) => (
            <div
              key={cmp.id}
              onClick={() => setSelectedComplaint(cmp)}
              className="bento-card p-5 cursor-pointer flex flex-col justify-between hover:border-rose-300 transition-all group"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {cmp.ticket_number}
                  </span>
                  <ComplaintStatusBadge status={cmp.status} />
                </div>

                {/* Photo thumbnail */}
                {cmp.photo_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                    <img
                      src={cmp.photo_url}
                      alt={cmp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Title and details */}
                <span className="text-[11px] font-bold text-rose-700 block mb-1">
                  {cmp.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1">
                  {cmp.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {cmp.description}
                </p>
              </div>

              {/* Bottom location & reporter info */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{cmp.location_address} ({cmp.dusun})</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {cmp.reporter_name}
                  </span>
                  <span>{cmp.created_at}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};
