import { useState } from 'react';
import ImageDropzone from './ImageDropzone';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: string;
  image: string;
  accent: string;
  isActive: boolean;
  sortOrder: number;
}

export type BannerFormData = Omit<Banner, 'id'>;

interface BannersTabProps {
  banners: Banner[];
  onAdd: (b: BannerFormData) => void;
  onEdit: (id: string, b: BannerFormData) => void;
  onDelete: (id: string) => void;
}

const CTA_ACTIONS = [
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'on-hand', label: 'On Hand' },
  { value: 'pre-order', label: 'Pre-Order' },
  { value: 'home', label: 'Home' },
];

const emptyForm = (): BannerFormData => ({
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  ctaAction: 'new-arrivals',
  image: '',
  accent: '#FF2D78',
  isActive: true,
  sortOrder: 0,
});

const inputStyle = {
  backgroundColor: '#0D0D10',
  border: '1px solid #222228',
  color: '#F0F0F4',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '0.5rem',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  padding: '8px 12px',
} as const;

const label = {
  color: '#80808C',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  marginBottom: 4,
  display: 'block',
} as const;

export default function BannersTab({ banners, onAdd, onEdit, onDelete }: BannersTabProps) {
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; id?: string } | null>(null);
  const [form, setForm] = useState<BannerFormData>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function set<K extends keyof BannerFormData>(key: K, value: BannerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openAdd() {
    setForm({ ...emptyForm(), sortOrder: banners.length });
    setModal({ mode: 'add' });
  }

  function openEdit(b: Banner) {
    const { id, ...rest } = b;
    setForm(rest);
    setModal({ mode: 'edit', id });
  }

  function save() {
    if (!form.title.trim() || !form.image.trim()) return;
    if (modal?.mode === 'edit' && modal.id) {
      onEdit(modal.id, form);
    } else {
      onAdd(form);
    }
    setModal(null);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">
            Homepage Banners
          </h1>
          <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">
            Controls the hero slider on the storefront homepage.
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: '#FF2D78', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
          className="px-4 py-2 rounded-full font-700 hover:opacity-90 transition-opacity"
        >
          + Add Banner
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {banners.map((b) => (
          <div
            key={b.id}
            style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.875rem', overflow: 'hidden' }}
          >
            <div className="relative" style={{ height: 110 }}>
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" style={{ opacity: b.isActive ? 1 : 0.35 }} />
              <span
                style={{
                  position: 'absolute', top: 8, left: 8,
                  backgroundColor: b.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(96,96,104,0.2)',
                  color: b.isActive ? '#22C55E' : '#80808C',
                  fontSize: 10, fontFamily: 'Outfit, sans-serif',
                  border: `1px solid ${b.isActive ? 'rgba(34,197,94,0.3)' : '#333340'}`,
                }}
                className="px-2 py-0.5 rounded-full font-700 uppercase tracking-wider"
              >
                {b.isActive ? 'Live' : 'Hidden'}
              </span>
            </div>
            <div className="p-4">
              <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 14 }} className="font-700 mb-1 truncate">
                {b.title}
              </p>
              <p style={{ color: '#606068', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="mb-3 truncate">
                {b.subtitle || '—'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(b)}
                  style={{ backgroundColor: '#1A1A20', color: '#B0B0BC', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                  className="flex-1 py-1.5 rounded-lg hover:bg-[#222228] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(b.id)}
                  style={{ backgroundColor: 'rgba(255,45,120,0.1)', color: '#FF2D78', fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                  className="flex-1 py-1.5 rounded-lg hover:bg-[rgba(255,45,120,0.18)] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div
            style={{ backgroundColor: '#141418', border: '1px dashed #222228', borderRadius: '0.875rem', padding: '40px 20px', color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}
            className="sm:col-span-2 xl:col-span-3 text-center"
          >
            No banners yet. The homepage hero will be empty until you add one.
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '1rem', padding: 24, width: '100%', maxWidth: 480 }}>
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 16 }} className="font-700 mb-4">
              {modal.mode === 'edit' ? 'Edit Banner' : 'Add Banner'}
            </p>

            <div className="mb-3">
              <label style={label}>Title</label>
              <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} />
            </div>

            <div className="mb-3">
              <label style={label}>Subtitle</label>
              <input style={inputStyle} value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </div>

            <div className="mb-3">
              <ImageDropzone
                label="Banner Image"
                images={form.image ? [form.image] : []}
                onChange={(imgs) => set('image', imgs[0] ?? '')}
                multiple={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label style={label}>Button Text</label>
                <input style={inputStyle} value={form.cta} onChange={(e) => set('cta', e.target.value)} />
              </div>
              <div>
                <label style={label}>Button Links To</label>
                <select style={inputStyle} value={form.ctaAction} onChange={(e) => set('ctaAction', e.target.value)}>
                  {CTA_ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label style={label}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accent} onChange={(e) => set('accent', e.target.value)}
                         style={{ width: 36, height: 34, border: '1px solid #222228', borderRadius: '0.4rem', background: 'none', padding: 2 }} />
                  <input style={inputStyle} value={form.accent} onChange={(e) => set('accent', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={label}>Visible on site</label>
                <button
                  onClick={() => set('isActive', !form.isActive)}
                  style={{
                    backgroundColor: form.isActive ? 'rgba(34,197,94,0.12)' : '#0D0D10',
                    border: `1px solid ${form.isActive ? 'rgba(34,197,94,0.3)' : '#222228'}`,
                    color: form.isActive ? '#22C55E' : '#80808C',
                    fontFamily: 'Inter, sans-serif', fontSize: 13,
                  }}
                  className="w-full py-2 rounded-lg transition-colors"
                >
                  {form.isActive ? 'Yes, shown' : 'No, hidden'}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                style={{ backgroundColor: '#1A1A20', color: '#B0B0BC', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                className="flex-1 py-2.5 rounded-full font-700"
              >
                Cancel
              </button>
              <button
                onClick={save}
                style={{ background: '#FF2D78', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                className="flex-1 py-2.5 rounded-full font-700 hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '1rem', padding: 24, width: '100%', maxWidth: 320, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif', fontSize: 15 }} className="font-700 mb-2">Delete this banner?</p>
            <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="mb-5">This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ backgroundColor: '#1A1A20', color: '#B0B0BC', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                className="flex-1 py-2 rounded-full font-700"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                style={{ backgroundColor: '#FF2D78', color: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                className="flex-1 py-2 rounded-full font-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
