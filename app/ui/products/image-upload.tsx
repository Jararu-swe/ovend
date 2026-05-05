'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
    setIsUploading(false);
  };

  return (
    <div>
      {value ? (
        <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden border-2 border-slate-200">
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset="vendle_products"
          onUpload={onUpload}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isUploading}
              className="flex w-full max-w-xs flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
            >
              <PhotoIcon className="h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-600">
                {isUploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PNG, JPG up to 10MB
              </p>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
