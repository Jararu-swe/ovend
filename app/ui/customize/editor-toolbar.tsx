'use client';

import Link from 'next/link';

type Viewport = 'desktop' | 'tablet' | 'phone';

interface EditorToolbarProps {
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  mobileMode?: 'edit' | 'preview';
  onMobileModeChange?: (m: 'edit' | 'preview') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onSaveDraft: () => void;
  statusMessage?: string;
}

export default function EditorToolbar({
  viewport,
  onViewportChange,
  mobileMode = 'edit',
  onMobileModeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onSaveDraft,
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

  const isSuccess = statusMessage?.toLowerCase().includes('success') || statusMessage?.toLowerCase().includes('saved');

  return (
    <div className="z-50 px-4 py-3">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        {/* Left: Project Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="group flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 text-white transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95"
            title="Back to Dashboard"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xs font-black uppercase tracking-widest text-slate-400">Customizing</h1>
            <span className="text-sm font-bold text-slate-800">Your Storefront</span>
          </div>
        </div>

        {/* Center: Viewport Toggle (Desktop) / Mode Toggle (Mobile) */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100/50 p-1 border border-slate-200/50">
          {/* Desktop Viewports */}
          <div className="hidden lg:flex items-center gap-1">
            {viewports.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewportChange(v.id)}
                className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 ${
                  viewport === v.id
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                {v.icon}
                <span className="hidden xl:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Modes (Edit vs Preview) */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => onMobileModeChange?.('edit')}
              className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 ${
                mobileMode === 'edit'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onMobileModeChange?.('preview')}
              className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 ${
                mobileMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* History Controls */}
          <div className="hidden sm:flex items-center border-r border-slate-100 pr-4 mr-2">
            <div className="flex items-center gap-0.5 rounded-xl bg-slate-50 p-0.5 border border-slate-200/50">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex h-8 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-20 disabled:pointer-events-none"
                title="Undo (Ctrl+Z)"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex h-8 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-20 disabled:pointer-events-none"
                title="Redo (Ctrl+Y)"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex flex-col items-end min-w-[100px]">
            {isSaving ? (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saving Changes
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Unsaved Edits
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider animate-in fade-in slide-in-from-right-2">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Up to date
              </div>
            )}
            {statusMessage && !isSaving && (
              <span className={`text-[10px] mt-0.5 line-clamp-1 ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
                {statusMessage}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving || !hasUnsavedChanges}
              className={`hidden sm:flex h-10 items-center justify-center rounded-xl px-5 text-xs font-bold transition-all active:scale-95 disabled:pointer-events-none ${
                hasUnsavedChanges
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300'
              }`}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`group relative overflow-hidden rounded-xl h-10 px-6 text-xs font-black uppercase tracking-widest transition-all duration-500 active:scale-95 disabled:pointer-events-none ${
                hasUnsavedChanges
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="relative z-10">
                {isSaving ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  'Publish'
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
