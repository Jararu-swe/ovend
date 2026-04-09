'use client';

import { StoreTheme } from '@/app/lib/definitions';
import { FONT_MAP } from '@/app/lib/template-presets';

interface TypographyPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}

const FONTS = [
  { value: 'inter', label: 'Inter', sample: 'The quick brown fox' },
  { value: 'poppins', label: 'Poppins', sample: 'The quick brown fox' },
  { value: 'roboto', label: 'Roboto', sample: 'The quick brown fox' },
  { value: 'playfair', label: 'Playfair Display', sample: 'The quick brown fox' },
  { value: 'montserrat', label: 'Montserrat', sample: 'The quick brown fox' },
  { value: 'outfit', label: 'Outfit', sample: 'The quick brown fox' },
  { value: 'dmSans', label: 'DM Sans', sample: 'The quick brown fox' },
  { value: 'spaceGrotesk', label: 'Space Grotesk', sample: 'The quick brown fox' },
];

function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">{label}</label>
      <div className="space-y-1">
        {FONTS.map((font) => (
          <button
            key={font.value}
            type="button"
            onClick={() => onChange(font.value)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
              value === font.value
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-slate-700">{font.label}</span>
              <p
                className="text-[13px] text-slate-500 mt-0.5"
                style={{ fontFamily: FONT_MAP[font.value] }}
              >
                {font.sample}
              </p>
            </div>
            {value === font.value && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TypographyPanel({ theme, onChange }: TypographyPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Font size */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Font Size</label>
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { value: 'small', label: 'Small', icon: 'A' },
            { value: 'medium', label: 'Medium', icon: 'A' },
            { value: 'large', label: 'Large', icon: 'A' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('font_size', opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 transition-all ${
                theme.font_size === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`font-bold ${opt.value === 'small' ? 'text-xs' : opt.value === 'large' ? 'text-lg' : 'text-sm'}`}>{opt.icon}</span>
              <span className="text-[10px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <FontPicker label="Body Font" value={theme.font_family} onChange={(v) => onChange('font_family', v)} />
      <FontPicker label="Heading Font" value={theme.heading_font} onChange={(v) => onChange('heading_font', v)} />
    </div>
  );
}
