import { useState } from 'react';
<<<<<<< HEAD
import type { CategoryInfo, CategoryStyle } from '../data/products';
import { CATEGORY_FONTS, CATEGORY_STYLES } from '../data/products';
import { CategoryCard } from './CategoriesSection';
=======
import type { CategoryInfo } from '../data/products';
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
import ImageDropzone from './ImageDropzone';

export interface CategoryFormData {
  label: string;
  sublabel: string;
  description: string;
  image: string | null;
<<<<<<< HEAD
  accent: string;
  font: string;
  style: CategoryStyle;
=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
}

interface CategoriesTabProps {
  categories: CategoryInfo[];
  onEdit: (id: string, data: CategoryFormData) => Promise<boolean>;
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

function CategoryEditor({ category, onEdit }: { category: CategoryInfo; onEdit: CategoriesTabProps['onEdit'] }) {
  const [form, setForm] = useState<CategoryFormData>({
    label: category.label,
    sublabel: category.sublabel,
    description: category.description,
    image: category.image,
<<<<<<< HEAD
    accent: category.accent,
    font: category.font,
    style: category.style,
=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty =
    form.label !== category.label ||
    form.sublabel !== category.sublabel ||
    form.description !== category.description ||
<<<<<<< HEAD
    form.image !== category.image ||
    form.accent.toLowerCase() !== category.accent.toLowerCase() ||
    form.font !== category.font ||
    form.style !== category.style;
=======
    form.image !== category.image;
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629

  function patch(p: Partial<CategoryFormData>) {
    setSaved(false);
    setForm((f) => ({ ...f, ...p }));
  }

  async function save() {
    if (!form.label.trim()) return;
    setSaving(true);
    const ok = await onEdit(category.id, form);
    setSaving(false);
    setSaved(ok);
  }

  return (
    <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.875rem', overflow: 'hidden' }}>
<<<<<<< HEAD
      {/* Live preview: the exact card visitors see */}
      <div className="p-4 pb-0">
        <CategoryCard
          cat={{ ...category, label: form.label || 'Untitled', sublabel: form.sublabel, image: form.image, accent: form.accent, font: form.font, style: form.style }}
        />
=======
      {/* Live preview of the storefront card */}
      <div
        style={{
          position: 'relative',
          height: 140,
          backgroundColor: '#1A1A1F',
          backgroundImage: form.image ? undefined : `linear-gradient(135deg, ${category.accent}38, #141418 70%)`,
        }}
      >
        {form.image && (
          <img src={form.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.62) saturate(1.1)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.92), rgba(10,10,11,0.1))' }} />
        <div className="absolute left-4 bottom-3 right-4">
          <p style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4', fontSize: 16 }} className="font-800 leading-tight">{form.label || 'Untitled'}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#B0B0BC', fontSize: 11 }}>{form.sublabel}</p>
        </div>
        {!form.image && (
          <span style={{ position: 'absolute', top: 10, right: 12, color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
            No picture yet
          </span>
        )}
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
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
            <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">Name</label>
            <input style={inputStyle} value={form.label} maxLength={80} onChange={(e) => patch({ label: e.target.value })} />
          </div>
          <div>
            <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">Subtitle</label>
            <input style={inputStyle} value={form.sublabel} maxLength={120} onChange={(e) => patch({ sublabel: e.target.value })} />
          </div>
        </div>

<<<<<<< HEAD
        {/* Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(form.accent) ? form.accent : '#ff2d78'}
                onChange={(e) => patch({ accent: e.target.value })}
                aria-label="Category color"
                style={{ width: 40, height: 34, background: 'none', border: '1px solid #222228', borderRadius: 8, padding: 2, cursor: 'pointer' }}
              />
              <input style={inputStyle} value={form.accent} maxLength={7} onChange={(e) => patch({ accent: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">Font</label>
            <select style={{ ...inputStyle, cursor: 'pointer', fontFamily: `'${form.font}', sans-serif` }} value={form.font} onChange={(e) => patch({ font: e.target.value })}>
              {CATEGORY_FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11, display: 'block', marginBottom: 5 }} className="uppercase tracking-wider font-500">Card style</label>
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

=======
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
        <div className="flex items-center justify-end gap-3">
          {saved && !dirty && <span style={{ color: '#22C55E', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>Saved</span>}
          <button
            type="button"
            onClick={save}
<<<<<<< HEAD
            disabled={!dirty || saving || !form.label.trim() || !/^#[0-9a-f]{6}$/i.test(form.accent)}
=======
            disabled={!dirty || saving || !form.label.trim()}
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
            style={{
              background: '#FF2D78',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13,
              borderRadius: 9999,
              padding: '8px 22px',
              border: 'none',
              opacity: !dirty || saving ? 0.4 : 1,
              cursor: !dirty || saving ? 'not-allowed' : 'pointer',
            }}
            className="font-700"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesTab({ categories, onEdit }: CategoriesTabProps) {
  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F0F4' }} className="text-2xl font-800">Categories</h1>
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">
<<<<<<< HEAD
          Picture, color, font and style of each category card on the homepage. The preview shows exactly how it will look. Press Save to publish.
=======
          The background picture of each category on the homepage. Drop a photo or paste a link, then press Save.
>>>>>>> 2e7fe6d42416307addf4ea9d6dd51c414ed52629
        </p>
      </div>

      {categories.length === 0 ? (
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Loading categories…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <CategoryEditor key={c.id} category={c} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
