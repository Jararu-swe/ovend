'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
  maxImages?: number;
}

export default function MultiImageUpload({ value, onChange, onRemove, maxImages = 5 }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (result: any) => {
    onChange([...value, result.info.secure_url]);
    setIsUploading(false);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
            <Image
              src={url}
              alt="Gallery image"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition hover:bg-red-600"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {value.length < maxImages && (
          <CldUploadWidget
            uploadPreset="ovend_products"
            onUpload={onUpload}
            onOpen={() => setIsUploading(true)}
            onClose={() => setIsUploading(false)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                disabled={isUploading}
                className="flex w-24 h-24 sm:w-32 sm:h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50 group"
              >
                <PlusIcon className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-slate-500 group-hover:text-emerald-600">
                  {isUploading ? 'Loading...' : 'Add Image'}
                </p>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>
      <p className="text-xs text-slate-400 block">
        You can add up to {maxImages} additional images for your product gallery.
      </p>
    </div>
  );
}
