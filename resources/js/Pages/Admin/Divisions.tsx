import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Division, PageProps } from '@/types';
import { 
    Building2, 
    Plus, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    User, 
    MapPin, 
    Layers,
    X,
    Users
} from 'lucide-react';

interface DivisionsProps {
    divisions: Division[];
}

export default function Divisions({ auth, divisions }: PageProps<DivisionsProps>) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState<Division | null>(null);

    const addForm = useForm({
        division_name: '',
        pic_name: '',
        room_location: '',
        is_active: true,
    });

    const editForm = useForm({
        division_name: '',
        pic_name: '',
        room_location: '',
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('admin.divisions.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleOpenEdit = (division: Division) => {
        setEditingDivision(division);
        editForm.setData({
            division_name: division.division_name,
            pic_name: division.pic_name || '',
            room_location: division.room_location || '',
            is_active: division.is_active,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDivision) return;
        editForm.put(route('admin.divisions.update', editingDivision.id), {
            onSuccess: () => {
                setEditingDivision(null);
            },
        });
    };

    const handleToggle = (division: Division) => {
        router.patch(route('admin.divisions.toggle', division.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (division: Division) => {
        if (confirm(`Hapus divisi ${division.division_name}? Tamu yang terkait divisi ini juga dapat terpengaruh.`)) {
            router.delete(route('admin.divisions.destroy', division.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                            Master Data Divisi & Pejabat Tujuan
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Kelola daftar unit kerja, ruangan, dan penanggung jawab yang tampil pada form tamu lobi.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Divisi Baru</span>
                    </button>
                </div>
            }
        >
            <Head title="Master Divisi - Buku Tamu Digital" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Division Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {divisions.map((div) => (
                        <div
                            key={div.id}
                            className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-zinc-900 ${
                                div.is_active
                                    ? 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                                    : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60 bg-zinc-50 dark:bg-zinc-950'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            div.is_active
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                            {div.is_active ? 'Aktif di Form' : 'Non-Aktif'}
                                        </span>
                                        {div.division_name.toLowerCase().includes('lainnya') && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                                                Opsi Isi Sendiri
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5 leading-snug">
                                        {div.division_name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(div)}
                                        className="p-1.5 text-zinc-400 hover:text-brand-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                        title="Edit Divisi"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(div)}
                                        className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                        title="Hapus Divisi"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>PIC: {div.pic_name || 'Tidak ada penanggung jawab'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>Lokasi: {div.room_location || 'Lantai/Ruang belum diatur'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                                    <span>Total Kunjungan: {div.visits_count || 0} Tamu</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                                <button
                                    onClick={() => handleToggle(div)}
                                    className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                                        div.is_active
                                            ? 'text-amber-600 dark:text-amber-400 hover:underline'
                                            : 'text-emerald-600 dark:text-emerald-400 hover:underline'
                                    }`}
                                >
                                    {div.is_active ? 'Non-aktifkan' : 'Aktifkan Kembali'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Modal Tambah Divisi */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                                Tambah Divisi / Pejabat Tujuan
                            </h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Nama Divisi / Bagian <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.data.division_name}
                                    onChange={(e) => addForm.setData('division_name', e.target.value)}
                                    placeholder="Contoh: Bagian Humas & Protokol"
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Nama Penanggung Jawab (PIC)
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.pic_name}
                                    onChange={(e) => addForm.setData('pic_name', e.target.value)}
                                    placeholder="Contoh: Bpk. Bambang Sutopo"
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Lantai & Lokasi Ruangan
                                </label>
                                <input
                                    type="text"
                                    value={addForm.data.room_location}
                                    onChange={(e) => addForm.setData('room_location', e.target.value)}
                                    placeholder="Contoh: Lantai 2, Gedung A"
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
                                >
                                    Simpan Divisi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Divisi */}
            {editingDivision && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                                Edit Data Divisi
                            </h3>
                            <button
                                onClick={() => setEditingDivision(null)}
                                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Nama Divisi / Bagian <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.division_name}
                                    onChange={(e) => editForm.setData('division_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Nama Penanggung Jawab (PIC)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.pic_name}
                                    onChange={(e) => editForm.setData('pic_name', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                    Lantai & Lokasi Ruangan
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.room_location}
                                    onChange={(e) => editForm.setData('room_location', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingDivision(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
                                >
                                    Perbarui Divisi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
