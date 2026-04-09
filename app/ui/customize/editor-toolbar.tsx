'use client';

import Link from 'next/link';

type Viewport = 'desktop' | 'tablet' | 'phone';

interface EditorToolbarProps {
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  statusMessage?: string;
}

export default function EditorToolbar({
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasUnsavedChanges,
  isSaving,
  onSave,
  statusMessage,
}: EditorToolbarProps) {
  const viewports: { id: Viewport; icon: React.ReactNode; label: string }[] = [
    {
      id: 'desktop',
      label: 'Desktop',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
        </svg>
      ),
    },
    {
      id: 'tablet',
      label: 'Tablet',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      {/* Left: Back + title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="h-5 w-px bg-slate-200" />
        <h1 className="text-sm font-bold text-slate-800">Theme Editor</h1>
      </div>

      {/* Center: Viewport toggle */}
      <div className="hidden md:flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
        {viewports.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewportChange(v.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewport === v.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={v.label}
          >
            {v.icon}
            <span className="hidden lg:inline">{v.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Undo/Redo + Status + Save */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <span className={`hidden sm:inline text-xs font-medium ${statusMessage.toLowerCase().includes('success') || statusMessage.toLowerCase().includes('saved') ? 'text-emerald-600' : 'text-red-500'}`}>
            {statusMessage}
          </span>
        )}

        {/* Unsaved indicator */}
        {hasUnsavedChanges && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Unsaved
          </span>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className={`relative rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            hasUnsavedChanges
              ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-200'
              : 'bg-slate-400'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : hasUnsavedChanges ? (
            'Save'
          ) : (
            '✓ Saved'
          )}
        </button>
      </div>
    </div>
  );
}
