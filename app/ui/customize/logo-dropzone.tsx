'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

type Props = {
  logoUrl: string | null;
  onLogoUrlChange: (url: string | null) => void;
};

export default function LogoDropzone({ logoUrl, onLogoUrlChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const onSuccess = (result: any) => {
    console.log('Logo upload success result:', result);
    if (result && result.event === 'success') {
      const url = result.info?.secure_url || result.info?.url;
      if (url) {
        console.log('Setting logo URL:', url);
        onLogoUrlChange(url);
      } else {
        console.warn('No URL found in logo-upload result.info:', result.info);
      }
    }
    setIsUploading(false);
  };

  const onPasteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value.trim();
    onLogoUrlChange(t === '' ? null : t);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="logo_url" value={logoUrl ?? ''} readOnly />

      {!logoUrl ? (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={onSuccess}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isUploading}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-70"
            >
              <ArrowUpTrayIcon className="h-10 w-10 text-slate-400" />
              <p className="mt-3 text-center text-sm font-medium text-slate-700">
                {isUploading ? 'Uploading…' : 'Click to upload logo'}
              </p>
              <p className="mt-1 text-center text-xs text-slate-500">
                PNG, JPG, WebP, GIF, or SVG · max 10MB
              </p>
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Store logo"
            className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-contain p-1"
          />
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-slate-700 truncate">Logo Active</span>
            <span className="block text-[10px] text-slate-400">Successfully uploaded to Cloudinary</span>
          </div>
          <button
            type="button"
            onClick={() => onLogoUrlChange(null)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
            aria-label="Remove logo"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
        <label htmlFor="logo_url_manual" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Manual URL
        </label>
        <input
          id="logo_url_manual"
          type="url"
          placeholder="https://…"
          value={logoUrl?.startsWith('http') ? logoUrl : ''}
          onChange={onPasteUrlChange}
          className="mt-1 w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>

      {!logoUrl && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-400">
          <PhotoIcon className="h-5 w-5 shrink-0" />
          <span>No logo yet — upload one above or paste a URL.</span>
        </div>
      )}
    </div>
  );
}
