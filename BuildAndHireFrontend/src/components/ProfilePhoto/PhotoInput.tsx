import { useEffect, useId, useState, type ReactNode } from 'react';

export default function PhotoInput({ file, onChange, disabled = false, required = false, existing, label = 'Photo' }:
  { file: File | null; onChange: (file: File | null) => void; disabled?: boolean; required?: boolean; existing?: ReactNode; label?: string }) {
  const id = useId();
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview({ file, url: String(reader.result) });
    reader.readAsDataURL(file);
    return () => { reader.onload = null; if (reader.readyState === FileReader.LOADING) reader.abort(); };
  }, [file]);
  return <div className="photo-input">
    <label htmlFor={id}>{label}{required ? ' (required)' : ''}</label>
    <div className="photo-preview">{file && preview?.file === file ? <img src={preview.url} alt="Selected photo preview" /> : existing}</div>
    <input id={id} name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled}
      required={required && !file} aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
      onChange={event => {
        const selected = event.target.files?.[0] ?? null;
        if (selected && (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 5 * 1024 * 1024)) {
          setError('Choose a JPEG, PNG, or WebP photo, 5 MB or smaller.'); event.target.value = ''; onChange(null); return;
        }
        setError(''); onChange(selected);
      }} />
    <p className="hint" id={`${id}-help`}>JPEG, PNG or WebP. Up to 5 MB and 20 megapixels. Photos are resized and camera metadata is removed.</p>
    {error && <p id={`${id}-error`} className="error-message" role="alert">{error}</p>}
  </div>;
}
