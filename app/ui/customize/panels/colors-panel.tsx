'use client';

import { useState } from 'react';
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

// ─── Gradient Presets ────────────────────────────────────────

const GRADIENT_PRESETS = [
  { name: 'None', value: null },
  { name: 'Sunset', value: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' },
  { name: 'Deep Sea', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #e91e63 0%, #ff6090 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)' },
];

// ─── Gradient Stop Type ───────────────────────────────────────

type GradientStop = { color: string; position: number };
type GradientConfig = {
  type: 'linear' | 'radial';
  angle: number;
  position: string;
  stops: GradientStop[];
};

function parseGradientConfig(value: string | null): GradientConfig | null {
  if (!value) return null;
  const trimmed = value.trim();

  // Try parsing linear-gradient
  const linearMatch = trimmed.match(/^linear-gradient\(\s*(\d+)deg\s*,\s*(.+)\s*\)$/);
  if (linearMatch) {
    const angle = parseInt(linearMatch[1], 10);
    const stopsStr = linearMatch[2];
    const stops = parseStops(stopsStr);
    return { type: 'linear', angle, position: 'center', stops };
  }

  // Try parsing radial-gradient
  const radialMatch = trimmed.match(/^radial-gradient\(\s*circle\s+at\s+(\w+)\s*,\s*(.+)\s*\)$/);
  if (radialMatch) {
    const position = radialMatch[1];
    const stopsStr = radialMatch[2];
    const stops = parseStops(stopsStr);
    return { type: 'radial', angle: 135, position, stops };
  }

  return null;
}

function parseStops(stopsStr: string): GradientStop[] {
  const parts = stopsStr.split(/,\s*/).filter(Boolean);
  return parts.map((part) => {
    const segments = part.trim().split(/\s+/);
    return {
      color: segments[0] || '#000000',
      position: parseInt(segments[1] || '0', 10),
    };
  });
}

function configToCSS(config: GradientConfig): string {
  const stopsStr = config.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (config.type === 'radial') {
    return `radial-gradient(circle at ${config.position}, ${stopsStr})`;
  }
  return `linear-gradient(${config.angle}deg, ${stopsStr})`;
}

// ─── Interactive Gradient Editor ──────────────────────────────

function GradientEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const [showEditor, setShowEditor] = useState(false);
  const [config, setConfig] = useState<GradientConfig>(() => {
    const parsed = value ? parseGradientConfig(value) : null;
    return parsed || { type: 'linear', angle: 135, position: 'center', stops: [{ color: '#FF512F', position: 0 }, { color: '#DD2476', position: 100 }] };
  });

  const applyConfig = (newConfig: GradientConfig) => {
    setConfig(newConfig);
    onChange(configToCSS(newConfig));
  };

  const updateStop = (idx: number, field: keyof GradientStop, val: string | number) => {
    const newStops = config.stops.map((s, i) => (i === idx ? { ...s, [field]: val } : s));
    applyConfig({ ...config, stops: newStops });
  };

  const addStop = () => {
    const lastPos = config.stops[config.stops.length - 1]?.position ?? 100;
    const newPos = Math.min(100, Math.round((lastPos + (config.stops[0]?.position ?? 0)) / 2));
    const newStops = [...config.stops, { color: '#888888', position: newPos }].sort((a, b) => a.position - b.position);
    applyConfig({ ...config, stops: newStops });
  };

  const removeStop = (idx: number) => {
    if (config.stops.length <= 2) return;
    applyConfig({ ...config, stops: config.stops.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 px-1">{label}</h3>

      {/* Presets grid */}
      <div className="grid grid-cols-4 gap-2">
        {GRADIENT_PRESETS.map((g) => (
          <button
            key={g.name}
            type="button"
            onClick={() => {
              onChange(g.value);
              if (g.value) {
                const parsed = parseGradientConfig(g.value);
                if (parsed) setConfig(parsed);
              }
            }}
            className={`h-10 rounded-xl border-2 transition-all ${
              value === g.value ? 'border-emerald-500 scale-105' : 'border-transparent hover:scale-105'
            } ${!g.value ? 'bg-slate-100 flex items-center justify-center' : ''}`}
            style={g.value ? { background: g.value } : {}}
            title={g.name}
          >
            {!g.value && <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
          </button>
        ))}
      </div>

      {/* Custom editor toggle */}
      {value && (
        <button
          type="button"
          onClick={() => setShowEditor(!showEditor)}
          className="flex w-full items-center justify-between py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 outline-none transition-colors"
        >
          <span>Custom Gradient Editor</span>
          <svg className={`h-3.5 w-3.5 transform transition-transform ${showEditor ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}

      {value && showEditor && (
        <div className="space-y-3 p-3 border border-slate-100 rounded-xl bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
          {/* Preview */}
          <div className="h-12 rounded-xl border border-slate-200/50 shadow-inner" style={{ background: value }} />

          {/* Type toggle */}
          <div className="flex gap-1.5">
            {(['linear', 'radial'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => applyConfig({ ...config, type: t })}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  config.type === t ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Angle slider (linear) */}
          {config.type === 'linear' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Angle</label>
                <span className="text-xs font-bold text-slate-600">{config.angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={config.angle}
                onChange={(e) => applyConfig({ ...config, angle: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          {/* Position select (radial) */}
          {config.type === 'radial' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Position</label>
              <div className="grid grid-cols-3 gap-1">
                {['top', 'center', 'bottom', 'left', 'right', 'top-left'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => applyConfig({ ...config, position: pos.replace('-', ' ') })}
                    className={`py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all ${
                      config.position === pos.replace('-', ' ') ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color stops */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Color Stops</label>
              <button type="button" onClick={addStop} className="text-[9px] font-bold text-emerald-600 hover:text-emerald-500">+ Add</button>
            </div>
            <div className="space-y-1.5">
              {config.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(i, 'color', e.target.value)}
                    className="h-6 w-6 rounded border border-slate-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => updateStop(i, 'position', parseInt(e.target.value))}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[9px] font-mono text-slate-400 w-6 text-right">{stop.position}%</span>
                  {config.stops.length > 2 && (
                    <button type="button" onClick={() => removeStop(i)} className="text-[10px] text-red-400 hover:text-red-600">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw CSS */}
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              const parsed = parseGradientConfig(e.target.value);
              if (parsed) setConfig(parsed);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-mono text-slate-500 outline-none focus:border-emerald-500"
            placeholder="linear-gradient(...)"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Colors Panel ────────────────────────────────────────

export default function ColorsPanel({ theme, onChange }: ColorsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="p-4 space-y-6">
      {/* Color swatches preview */}
      <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/50">
        {[theme.primary_color, theme.secondary_color, theme.accent_color, theme.background_color, theme.surface_color, theme.text_color, theme.heading_color, theme.border_color].map((c, i) => (
          <div key={i} className="h-6 flex-1 rounded-lg ring-1 ring-black/5" style={{ backgroundColor: c }} />
        ))}
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

      {/* Primary Gradient */}
      <GradientEditor
        label="Primary Gradient"
        value={theme.primary_gradient}
        onChange={(v) => onChange('primary_gradient', v)}
      />

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

      {/* Advanced Color Options */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 outline-none"
        >
          <span>Advanced Color Options</span>
          <svg
            className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-5 animate-in slide-in-from-top-2 duration-200">
            {/* Secondary Gradient */}
            <GradientEditor
              label="Secondary Gradient"
              value={theme.secondary_gradient}
              onChange={(v) => onChange('secondary_gradient', v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
