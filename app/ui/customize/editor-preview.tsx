'use client';

type Viewport = 'desktop' | 'tablet' | 'phone';

interface EditorPreviewProps {
  vendorSlug: string;
  viewport: Viewport;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export default function EditorPreview({ vendorSlug, viewport, iframeRef }: EditorPreviewProps) {
  const viewportWidths: Record<Viewport, string> = {
    desktop: '100%',
    tablet: '768px',
    phone: '375px',
  };

  const width = viewportWidths[viewport];

  if (!vendorSlug) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center max-w-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            🏪
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Set up your store first</h3>
          <p className="text-sm text-slate-500">
            Go to Settings and set your store slug to enable the live preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-start bg-slate-100/80 overflow-hidden">
      {/* Preview frame */}
      <div
        className="relative flex-1 transition-all duration-500 ease-in-out"
        style={{
          width,
          maxWidth: '100%',
          height: '100%',
        }}
      >
        {/* Device frame */}
        <div
          className={`h-full transition-all duration-500 ${
            viewport !== 'desktop'
              ? 'mx-auto rounded-2xl border-[6px] border-slate-800 shadow-2xl bg-white overflow-hidden my-4'
              : 'bg-white'
          }`}
          style={viewport !== 'desktop' ? { maxHeight: 'calc(100% - 2rem)' } : undefined}
        >
          {/* Notch for phone */}
          {viewport === 'phone' && (
            <div className="flex h-6 items-center justify-center bg-slate-800">
              <div className="h-3 w-20 rounded-full bg-slate-700" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={`/s/${vendorSlug}?preview=true`}
            className="h-full w-full"
            title="Store Preview"
            style={viewport === 'phone' ? { height: 'calc(100% - 1.5rem)' } : undefined}
          />
        </div>
      </div>

      {/* View live store link - hidden on small screens */}
      <div className="hidden sm:flex flex-shrink-0 py-2">
        <a
          href={`/s/${vendorSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-600 hover:bg-white/80"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          View live store
        </a>
      </div>
    </div>
  );
}
