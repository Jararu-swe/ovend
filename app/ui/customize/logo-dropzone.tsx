'use client';

import { useCallback, useRef, useState } from 'react';
import { ArrowUpTrayIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Props = {
  logoUrl: string | null;
  onLogoUrlChange: (url: string | null) => void;
};

export default function LogoDropzone({ logoUrl, onLogoUrlChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please choose an image file.');
        return;
      }
      setUploading(true);
      try {
        const body = new FormData();
        body.set('file', file);
        const res = await fetch('/api/upload/logo', {
          method: 'POST',
          body,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'Upload failed');
          return;
        }
        if (typeof data.url === 'string') {
          onLogoUrlChange(data.url);
        }
      } catch {
        setError('Upload failed. Try again.');
      } finally {
        setUploading(false);
      }
    },
    [onLogoUrlChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void uploadFile(file);
    },
    [uploadFile],
  );

  const onPasteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value.trim();
    onLogoUrlChange(t === '' ? null : t);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="logo_url" value={logoUrl ?? ''} readOnly />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-200 bg-slate-50/80 hover:border-emerald-300 hover:bg-emerald-50/40'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = '';
          }}
        />
        <ArrowUpTrayIcon className="h-10 w-10 text-slate-400" />
        <p className="mt-3 text-center text-sm font-medium text-slate-700">
          {uploading ? 'Uploading…' : 'Drag & drop your logo here'}
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          or click to browse — PNG, JPG, WebP, GIF, or SVG · max 2&nbsp;MB
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
        <label htmlFor="logo_url_manual" className="text-xs font-medium text-slate-500">
          Or paste an image URL (optional)
        </label>
        <input
          id="logo_url_manual"
          type="url"
          placeholder="https://…"
          value={logoUrl && !logoUrl.startsWith('/uploads/') ? logoUrl : ''}
          onChange={onPasteUrlChange}
          className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        {logoUrl?.startsWith('/uploads/') ? (
          <p className="mt-1 text-xs text-emerald-700">Using uploaded file. Paste a URL above to replace it.</p>
        ) : null}
      </div>

      {logoUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-contain p-1"
          />
          <span className="flex-1 text-xs text-slate-500">Header preview</span>
          <button
            type="button"
            onClick={() => onLogoUrlChange(null)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
            aria-label="Remove logo"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-400">
          <PhotoIcon className="h-5 w-5 shrink-0" />
          <span>No logo yet — upload one above or paste a URL.</span>
        </div>
      )}
    </div>
  );
}
