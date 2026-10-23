import { useState } from 'react';
import ImageDropzone from './ImageDropzone';

export interface AnimeCover {
  series: string;
  image: string | null;
}

interface AnimeCoversTabProps {
  covers: AnimeCover[];
  /** Resolves to null when saved, or to a message to show on that row. */
  onSave: (series: string, image: string | null) => Promise<string | null>;
}

/** One anime series: its cover picture, shown before its characters on the storefront. */
function CoverRow({ cover, onSave }: { cover: AnimeCover; onSave: AnimeCoversTabProps['onSave'] }) {
  const [draft, setDraft] = useState<string | null>(cover.image);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = draft !== cover.image;

  async function save() {
    setSaving(true);
    setError(null);
    const message = await onSave(cover.series, draft);
    setSaving(false);
    if (message) setError(message);
  }

  return (
    <div style={{ backgroundColor: '#141418', border: '1px solid #222228', borderRadius: '0.75rem' }} className="p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="font-semibold">{cover.series}</p>
        <span style={{ color: draft ? '#22C55E' : '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 11 }} className="uppercase tracking-wider">
          {draft ? 'Cover set' : 'No cover yet'}
        </span>
      </div>

      <ImageDropzone
        label=""
        images={draft ? [draft] : []}
        onChange={(imgs) => setDraft(imgs[imgs.length - 1] ?? null)}
        multiple={false}
        folder="series"
      />

      <div className="flex items-center justify-between gap-3 mt-3">
        <button
          type="button"
          onClick={() => setDraft(null)}
          disabled={!draft || saving}
          style={{ color: '#80808C', fontFamily: 'Inter, sans-serif', fontSize: 12, opacity: draft ? 1 : 0.4 }}
          className="hover:text-[#F0F0F4] transition-colors"
        >
          Remove cover
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!changed || saving}
          style={{
            background: '#FF2D78',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 13,
            borderRadius: 9999,
            padding: '6px 18px',
            opacity: !changed || saving ? 0.4 : 1,
            border: 'none',
          }}
          className="font-semibold"
        >
          {saving ? 'Saving…' : 'Save cover'}
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: '#F87171', fontFamily: 'Inter, sans-serif', fontSize: 12 }} className="mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AnimeCoversTab({ covers, onSave }: AnimeCoversTabProps) {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <p style={{ color: '#80808C', fontFamily: 'Outfit, sans-serif', fontSize: 11 }} className="font-semibold uppercase tracking-widest mb-1">
          Anime covers
        </p>
        <h1 style={{ color: '#F0F0F4', fontFamily: 'Outfit, sans-serif' }} className="text-2xl font-bold">
          Series covers
        </h1>
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif', fontSize: 13 }} className="mt-1">
          The cover picture is shown first, before the characters, for each anime. Without one, the first figure's photo is used.
        </p>
      </div>

      {covers.length === 0 ? (
        <p style={{ color: '#50505C', fontFamily: 'Inter, sans-serif' }} className="text-sm">
          No anime series yet. Add a product first.
        </p>
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {covers.map((c) => (
            <CoverRow key={c.series} cover={c} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  );
}
