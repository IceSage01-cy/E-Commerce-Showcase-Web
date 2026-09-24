import { useState, useRef } from 'react';
import axios from 'axios';

interface ImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
}

/**
 * Drag files in from the desktop (or click to browse) to upload them straight to
 * the server — no more pasting image URLs by hand. Uploaded thumbnails can be
 * dragged to reorder, or removed with the × button.
 */
export default function ImageDropzone({ images, onChange, multiple = true, label }: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/admin/api/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.url);
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
    } catch {
      setError('Upload failed. Try a smaller image (max 5MB).');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  const zoneStyle: React.CSSProperties = {
    backgroundColor: dragOver ? 'var(--color-primary-glow)' : 'var(--color-bg)',
    border: `1.5px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
    borderRadius: '0.625rem',
    padding: '20px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  return (
    <div>
      {label && (
        <label
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'Karla, sans-serif',
            fontSize: 11,
            display: 'block',
            marginBottom: 5,
          }}
          className="uppercase tracking-wider font-500"
        >
          {label}
        </label>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((src, i) => (
            <div
              key={src + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              className="relative group"
              style={{
                width: 64,
                height: 64,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                cursor: 'grab',
                flexShrink: 0,
              }}
              title="Drag to reorder"
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
              {i === 0 && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: 2,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    fontSize: 8,
                    padding: '1px 4px',
                    borderRadius: 4,
                    fontFamily: 'Karla, sans-serif',
                  }}
                >
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 10,
                  lineHeight: '16px',
                  border: 'none',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {(multiple || images.length === 0) && (
        <div
          style={zoneStyle}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            hidden
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'Karla, sans-serif', fontSize: 13 }}>
            {uploading ? 'Uploading…' : 'Drag photos here, or click to browse'}
          </p>
          <p style={{ color: 'var(--color-text-faint)', fontFamily: 'Karla, sans-serif', fontSize: 11 }} className="mt-1">
            JPG or PNG, up to 5MB each
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-primary)', fontFamily: 'Karla, sans-serif', fontSize: 11 }} className="mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
