'use client';

import { StoreTheme } from '@/app/lib/definitions';
import LogoDropzone from '@/app/ui/customize/logo-dropzone';

interface BrandPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}

export default function BrandPanel({ theme, onChange }: BrandPanelProps) {
  return (
    <div className="p-4 space-y-5">
      {/* Show Logo Toggle */}
      <label className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-slate-50 cursor-pointer">
        <div>
          <span className="text-sm font-semibold text-slate-700">Show logo</span>
          <p className="text-[11px] text-slate-400 mt-0.5">Display logo in store header</p>
        </div>
        <input
          type="checkbox"
          checked={theme.show_logo}
          onChange={(e) => onChange('show_logo', e.target.checked)}
          className="h-4 w-4 accent-emerald-500 rounded"
        />
      </label>

      {/* Logo Position */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Logo Position</label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: 'left', label: 'Left', visual: <div className="flex items-center gap-1 w-10"><div className="h-3 w-3 rounded-full bg-current opacity-40" /><div className="h-1.5 flex-1 rounded-full bg-current opacity-20" /></div> },
            { value: 'center', label: 'Center', visual: <div className="flex flex-col items-center gap-0.5"><div className="h-3 w-3 rounded-full bg-current opacity-40" /><div className="h-1 w-6 rounded-full bg-current opacity-20" /></div> },
            { value: 'right', label: 'Right', visual: <div className="flex items-center gap-1 w-10"><div className="h-1.5 flex-1 rounded-full bg-current opacity-20" /><div className="h-3 w-3 rounded-full bg-current opacity-40" /></div> },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('logo_position', opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                theme.logo_position === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {opt.visual}
              <span className="text-[10px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Frame Style */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Logo Style</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { value: 'profile', label: 'Circular', visual: <div className="h-8 w-8 rounded-full bg-current opacity-30 ring-2 ring-current/10" /> },
            { value: 'rounded', label: 'Rounded', visual: <div className="h-8 w-8 rounded-xl bg-current opacity-30 ring-2 ring-current/10" /> },
            { value: 'plain', label: 'Square', visual: <div className="h-8 w-8 rounded-md bg-current opacity-30" /> },
            { value: 'minimal', label: 'Compact', visual: <div className="h-6 w-6 rounded-md bg-current opacity-30" /> },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('logo_frame', opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                theme.logo_frame === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {opt.visual}
              <span className="text-[10px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Logo Image</label>
        <LogoDropzone
          logoUrl={theme.logo_url}
          onLogoUrlChange={(url) => onChange('logo_url', url)}
        />
      </div>
    </div>
  );
}
