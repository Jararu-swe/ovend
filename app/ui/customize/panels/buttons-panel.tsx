'use client';

import { StoreTheme } from '@/app/lib/definitions';

interface ButtonsPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}

export default function ButtonsPanel({ theme, onChange }: ButtonsPanelProps) {
  const btnRadiusClass =
    theme.button_radius === 'sharp' ? 'rounded-none' :
    theme.button_radius === 'pill' ? 'rounded-full' : 'rounded-lg';

  const getPreviewStyle = (style: string) => {
    switch (style) {
      case 'outline': return { border: `2px solid ${theme.primary_color}`, color: theme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${theme.primary_color}20`, color: theme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: `${theme.surface_color || '#fff'}cc`, backdropFilter: 'blur(8px)', border: `1px solid ${theme.border_color || '#e2e8f0'}`, color: theme.primary_color };
      default: return { backgroundColor: theme.primary_color, color: '#ffffff', border: 'none' };
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Live button preview */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 flex items-center justify-center">
        <button
          type="button"
          className={`px-6 py-2.5 text-sm font-bold transition-all ${btnRadiusClass}`}
          style={getPreviewStyle(theme.button_style)}
        >
          Add to Cart
        </button>
      </div>

      {/* Button Style */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Button Style</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { value: 'solid', label: 'Solid' },
            { value: 'outline', label: 'Outline' },
            { value: 'soft', label: 'Soft' },
            { value: 'glass', label: 'Glass' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('button_style', opt.value)}
              className={`flex items-center justify-center rounded-xl border py-3 transition-all ${
                theme.button_style === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span
                className={`inline-block px-3 py-1 text-[10px] font-bold ${
                  theme.button_radius === 'sharp' ? 'rounded-none' :
                  theme.button_radius === 'pill' ? 'rounded-full' : 'rounded-md'
                }`}
                style={getPreviewStyle(opt.value)}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Button Radius */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Button Radius</label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: 'sharp', label: 'Sharp', className: 'rounded-none' },
            { value: 'rounded', label: 'Rounded', className: 'rounded-lg' },
            { value: 'pill', label: 'Pill', className: 'rounded-full' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('button_radius', opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                theme.button_radius === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-5 bg-current opacity-30 ${opt.className}`} />
              <span className="text-[10px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Style */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Micro-Animations</label>
        <div className="space-y-1">
          {([
            { value: 'none', label: 'None', desc: 'No animations' },
            { value: 'fade', label: 'Soft Fade', desc: 'Gentle opacity transitions' },
            { value: 'slide', label: 'Slide In', desc: 'Elements slide up on scroll' },
            { value: 'zoom', label: 'Zoom', desc: 'Scale-in entrance effect' },
            { value: 'bounce', label: 'Playful Bounce', desc: 'Bouncy, fun animations' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('animation_style', opt.value)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                theme.animation_style === opt.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                theme.animation_style === opt.value ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {opt.value === 'none' ? '—' : opt.value === 'fade' ? '◐' : opt.value === 'slide' ? '↑' : opt.value === 'zoom' ? '⊕' : '⤴'}
              </div>
              <div>
                <span className={`text-xs font-semibold ${theme.animation_style === opt.value ? 'text-emerald-700' : 'text-slate-700'}`}>{opt.label}</span>
                <p className="text-[10px] text-slate-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
