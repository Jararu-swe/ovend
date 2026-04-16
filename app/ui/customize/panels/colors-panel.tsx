'use client';

import { StoreTheme } from '@/app/lib/definitions';

interface ColorsPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function luminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function contrastRatio(c1: string, c2: string): number {
  const l1 = luminance(hexToRgb(c1));
  const l2 = luminance(hexToRgb(c2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function contrastBadge(fg: string, bg: string): { label: string; color: string } | null {
  if (!fg?.match(/^#[0-9a-fA-F]{6}$/) || !bg?.match(/^#[0-9a-fA-F]{6}$/)) return null;
  const ratio = contrastRatio(fg, bg);
  if (ratio >= 7) return { label: `AAA (${ratio.toFixed(1)})`, color: 'text-emerald-600 bg-emerald-50' };
  if (ratio >= 4.5) return { label: `AA (${ratio.toFixed(1)})`, color: 'text-emerald-600 bg-emerald-50' };
  if (ratio >= 3) return { label: `AA-L (${ratio.toFixed(1)})`, color: 'text-amber-600 bg-amber-50' };
  return { label: `Fail (${ratio.toFixed(1)})`, color: 'text-red-500 bg-red-50' };
}

function ColorInput({ label, value, onChange, contrastAgainst }: { label: string; value: string; onChange: (val: string) => void; contrastAgainst?: string }) {
  const badge = contrastAgainst ? contrastBadge(value, contrastAgainst) : null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50/50">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">{label}</label>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-full bg-transparent text-[11px] font-mono text-slate-500 outline-none"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

const GRADIENT_PRESETS = [
  { name: 'None', value: null },
  { name: 'Sunset', value: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
  { name: 'Deep Sea', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #e91e63 0%, #ff6090 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)' },
];

export default function ColorsPanel({ theme, onChange }: ColorsPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Color swatches preview */}
      <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/50">
        {[theme.primary_color, theme.secondary_color, theme.accent_color, theme.background_color, theme.surface_color, theme.text_color, theme.heading_color, theme.border_color].map((c, i) => (
          <div key={i} className="h-6 flex-1 rounded-lg ring-1 ring-black/5" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* Primary Gradients */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Primary Gradient</h3>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => onChange('primary_gradient', g.value)}
              className={`h-10 rounded-xl border-2 transition-all ${
                theme.primary_gradient === g.value ? 'border-emerald-500 scale-105' : 'border-transparent hover:scale-105'
              } ${!g.value ? 'bg-slate-100 flex items-center justify-center' : ''}`}
              style={g.value ? { background: g.value } : {}}
              title={g.name}
            >
              {!g.value && <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
            </button>
          ))}
        </div>
        {theme.primary_gradient && (
          <div className="mt-2">
            <input
              type="text"
              value={theme.primary_gradient}
              onChange={(e) => onChange('primary_gradient', e.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-mono text-slate-500 transition-all focus:border-emerald-500 outline-none"
              placeholder="linear-gradient(...)"
            />
          </div>
        )}
      </div>

      {/* Glassmorphism Toggle */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Special Effects</h3>
        <button
          type="button"
          onClick={() => onChange('glass_effect', !theme.glass_effect)}
          className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all ${
            theme.glass_effect ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50 ${theme.glass_effect ? 'text-emerald-600' : 'text-slate-400'}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">Glass Effect</span>
              <p className="text-[10px] text-slate-400">Glassmorphism on cards & header</p>
            </div>
          </div>
          <div className={`h-6 w-11 rounded-full transition-colors relative ${theme.glass_effect ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${theme.glass_effect ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Color inputs */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Brand Colors</h3>
        <ColorInput label="Primary" value={theme.primary_color} onChange={(v) => onChange('primary_color', v)} contrastAgainst={theme.background_color} />
        <ColorInput label="Secondary" value={theme.secondary_color} onChange={(v) => onChange('secondary_color', v)} contrastAgainst={theme.background_color} />
        <ColorInput label="Accent" value={theme.accent_color} onChange={(v) => onChange('accent_color', v)} contrastAgainst={theme.background_color} />
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Interface</h3>
        <ColorInput label="Background" value={theme.background_color} onChange={(v) => onChange('background_color', v)} />
        <ColorInput label="Surface" value={theme.surface_color} onChange={(v) => onChange('surface_color', v)} />
        <ColorInput label="Borders" value={theme.border_color} onChange={(v) => onChange('border_color', v)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">Typography</h3>
        <ColorInput label="Body Text" value={theme.text_color} onChange={(v) => onChange('text_color', v)} contrastAgainst={theme.background_color} />
        <ColorInput label="Headings" value={theme.heading_color} onChange={(v) => onChange('heading_color', v)} contrastAgainst={theme.surface_color} />
      </div>
    </div>
  );
}
