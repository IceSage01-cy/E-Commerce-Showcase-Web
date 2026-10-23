import { useState } from 'react';
import type { CategoryInfo, CategoryStyle, Product } from '../data/products';
import { CATEGORY_STYLES } from '../data/products';
import { CategoryCard } from './CategoriesSection';
import ImageDropzone from './ImageDropzone';

export interface CategoryFormData {
  label: string;
  sublabel: string;
  description: string;
  image: string | null;
  accent: string;
  style: CategoryStyle;
}

interface CategoriesTabProps {
  categories: CategoryInfo[];
  products: Product[];
  onAdd: (data: CategoryFormData) => Promise<boolean>;
  onEdit: (id: string, data: CategoryFormData) => Promise<boolean>;
  onDelete: (id: string, moveTo?: string) => Promise<boolean>;
}

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

const labelStyle = { color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 } as const;

const EMPTY_FORM: CategoryFormData = { label: '', sublabel: '', description: '', image: null, accent: '#FF2D78', style: 'classic' };

const validColor = (c: string) => /^#[0-9a-f]{6}$/i.test(c);

/** One editable category card. With no `category` it is the "new category" form. */
function CategoryEditor({
  category, onSave, onDelete, onCancel,
}: {
  category?: CategoryInfo;
  onSave: (data: CategoryFormData) => Promise<boolean>;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const initial: CategoryFormData = category
    ? { label: category.label, sublabel: category.sublabel, description: category.description, image: category.image, accent: category.accent, style: category.style }
    : EMPTY_FORM;

  const [form, setForm] = useState<CategoryFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = !category
    || form.label !== initial.label
    || form.sublabel !== initial.sublabel
    || form.description !== initial.description
    || form.image !== initial.image
    || form.accent.toLowerCase() !== initial.accent.toLowerCase()
    || form.style !== initial.style;

  function patch(p: Partial<CategoryFormData>) {
    setSaved(false);
    setForm((f) => ({ ...f, ...p }));
  }

  async function save() {
    if (!form.label.trim()) return;
    setSaving(true);
    const ok = await onSave({ ...form, label: form.label.trim() });
    setSaving(false);
    setSaved(ok);
  }

  const canSave = dirty && !saving && !!form.label.trim() && validColor(form.accent);

  return (
    <div style={{ backgroundColor: '#141418', border: `1px solid ${category ? '#222228' : 'rgba(255,45,120,0.4)'}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
      {/* Live preview: the exact card visitors see */}
      <div className="p-4 pb-0">
        <CategoryCard
          cat={{
            id: category?.id ?? 'new', slug: category?.slug ?? 'new', sortOrder: category?.sortOrder ?? 0, description: form.description,
            label: form.label || 'New category', sublabel: form.sublabel, image: form.image, accent: form.accent, style: form.style,
          }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        <ImageDropzone
          label="Background picture"
          images={form.image ? [form.image] : []}
          onChange={(imgs) => patch({ image: imgs[0] ?? null })}
          multiple={false}
          folder="categories"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle} className="uppercase tracking-wider font-500">Name *</label>
            <input style={inputStyle} value={form.label} maxLength={80} placeholder="e.g. Gundam Kits" onChange={(e) => patch({ label: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle} className="uppercase tracking-wider font-500">Subtitle</label>
            <input style={inputStyle} value={form.sublabel} maxLength={120} onChange={(e) => patch({ sublabel: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={labelStyle} className="uppercase tracking-wider font-500">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={validColor(form.accent) ? form.accent : '#ff2d78'}
                onChange={(e) => patch({ accent: e.target.value })}
                aria-label="Category color"
                style={{ width: 40, height: 34, background: 'none', border: '1px solid #222228', borderRadius: 8, padding: 2, cursor: 'pointer' }}
              />
              <input style={inputStyle} value={form.accent} maxLength={7} onChange={(e) => patch({ accent: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={labelStyle} className="uppercase tracking-wider font-500">Card style</label>
            <div className="flex gap-2">
              {CATEGORY_STYLES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => patch({ style: st.value })}
                  aria-pressed={form.style === st.value}
                  style={{
                    flex: 1,
                    color: form.style === st.value ? '#FF2D78' : '#80808C',
                    backgroundColor: form.style === st.value ? 'rgba(255,45,120,0.12)' : '#0D0D10',
                    border: `1px solid ${form.style === st.value ? 'rgba(255,45,120,0.4)' : '#222228'}`,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 12,
                    borderRadius: 8,
                    padding: '7px 10px',
                  }}
                  className="font-700 transition-all"
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              style={{ color: '#F87171', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 18px' }}
              className="font-700 hover:bg-[rgba(248,113,113,0.16)] transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          {saved && !dirty && <span style={{ color: '#22C55E', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>Saved</span>}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 18px' }}
              className="font-500 hover:text-[#F0F0F4] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            style={{
              background: '#FF2D78',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13,
              borderRadius: 9999,
              padding: '8px 22px',
              border: 'none',
              opacity: canSave ? 1 : 0.4,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
            className="font-700"
          >
            {saving ? 'Saving…' : category ? 'Save' : 'Save new category'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Confirm deleting a category. If products are filed under it, they must be moved to another one first. */
function DeleteDialog({
  category, others, count, onClose, onConfirm,
}: {
  category: CategoryInfo;
  others: CategoryInfo[];
  count: number;
  onClose: () => void;
  onConfirm: (moveTo?: string) => Promise<boolean>;
}) {
  const [moveTo, setMoveTo] = useState(others[0]?.slug ?? '');
  const [busy, setBusy] = useState(false);
  const blocked = others.length === 0;

  async function confirm() {
    setBusy(true);
    const ok = await onConfirm(count > 0 ? moveTo : undefined);
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '1rem', padding: 24, width: '100%', maxWidth: 400 }}
      >
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 16, marginBottom: 8 }} className="font-700">
          Delete “{category.label}”?
        </p>
        {blocked ? (
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#80808C', fontSize: 13, marginBottom: 20 }}>
            This is your only category, so it can’t be deleted. Add another one first.
          </p>
        ) : count > 0 ? (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#80808C', fontSize: 13, marginBottom: 12 }}>
              {count} product{count === 1 ? ' is' : 's are'} filed here. Choose where to move {count === 1 ? 'it' : 'them'}:
            </p>
            <select style={{ ...inputStyle, cursor: 'pointer', marginBottom: 20 }} value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
              {others.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </>
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#80808C', fontSize: 13, marginBottom: 20 }}>
            No products are filed here. It will disappear from the shop right away.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            style={{ color: '#80808C', backgroundColor: '#1A1A20', border: '1px solid #222228', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px' }}
            className="font-500"
          >
            Cancel
          </button>
          {!blocked && (
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', border: '1px solid rgba(248,113,113,0.35)', fontFamily: 'Outfit, sans-serif', fontSize: 13, borderRadius: 9999, padding: '8px 20px', opacity: busy ? 0.5 : 1 }}
              className="font-700"
            >
              {busy ? 'Deleting…' : count > 0 ? 'Move & delete' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesTab({ categories, products, onAdd, onEdit, onDelete }: CategoriesTabProps) {
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<CategoryInfo | null>(null);

  const countFor = (slug: string) => products.filter((p) => p.collection === slug).length;

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Categories</h1>
          <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">
            Add, edit or delete the category cards on the homepage. The preview shows exactly how each one will look. Press Save to publish.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{ background: '#FF2D78', fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 16px rgba(255,45,120,0.3)' }}
            className="px-5 py-2.5 rounded-full text-white text-sm font-600 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            + Add category
          </button>
        )}
      </div>

      {categories.length === 0 && !adding ? (
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Loading categories…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {adding && (
            <CategoryEditor
              onSave={async (data) => {
                const ok = await onAdd(data);
                if (ok) setAdding(false);
                return ok;
              }}
              onCancel={() => setAdding(false)}
            />
          )}
          {categories.map((c) => (
            <CategoryEditor
              key={c.id}
              category={c}
              onSave={(data) => onEdit(c.id, data)}
              onDelete={() => setDeleting(c)}
            />
          ))}
        </div>
      )}

      {deleting && (
        <DeleteDialog
          category={deleting}
          others={categories.filter((c) => c.id !== deleting.id)}
          count={countFor(deleting.slug)}
          onClose={() => setDeleting(null)}
          onConfirm={(moveTo) => onDelete(deleting.id, moveTo)}
        />
      )}
    </div>
  );
}
