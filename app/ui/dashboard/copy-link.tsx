'use client';

import { useState, useEffect } from 'react';
import { LinkIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [storeUrl, setStoreUrl] = useState(`/s/${slug}`);

  useEffect(() => {
    // Set the full URL only on the client side
    setStoreUrl(`${window.location.origin}/s/${slug}`);
  }, [slug]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-mono text-slate-500 max-w-[200px] md:max-w-xs">
        {storeUrl.replace(/^https?:\/\//, '')}
      </div>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            Copy Store Link
          </>
        )}
      </button>
    </div>
  );
}
