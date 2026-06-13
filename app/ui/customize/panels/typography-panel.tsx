'use client';

import { useState } from 'react';
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
      <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-1 bg-slate-50/30">
        {FONTS.map((font) => (
          <button
            key={font.value}
            type="button"
            onClick={() => onChange(font.value)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
              value === font.value
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
                : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-slate-700">{font.label}</span>
              <p
                className="text-[11px] text-slate-400 mt-0.5"
                style={{ fontFamily: FONT_MAP[font.value] }}
              >
                {font.sample}
              </p>
            </div>
            {value === font.value && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px]">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TypographyPanel({ theme, onChange }: TypographyPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      {/* Advanced Typography Section */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 outline-none"
        >
          <span>Advanced Typography</span>
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
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Line Height */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Line Height</label>
                <span className="text-xs font-bold text-slate-600">{theme.line_height ?? 1.5}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={theme.line_height ?? 1.5}
                onChange={(e) => onChange('line_height', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Letter Spacing */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Letter Spacing</label>
                <span className="text-xs font-bold text-slate-600">{(theme.letter_spacing ?? 0).toFixed(2)}em</span>
              </div>
              <input
                type="range"
                min="-0.10"
                max="0.50"
                step="0.01"
                value={theme.letter_spacing ?? 0}
                onChange={(e) => onChange('letter_spacing', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Text Transform */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Text Transform</label>
              <select
                value={theme.text_transform ?? 'none'}
                onChange={(e) => onChange('text_transform', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>

            {/* Body Font Weight */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Body Font Weight</label>
              <div className="flex flex-wrap gap-1">
                {[300, 400, 500, 600, 700].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChange('body_font_weight', w)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      (theme.body_font_weight ?? 400) === w
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Heading Font Weight */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Heading Font Weight</label>
              <div className="flex flex-wrap gap-1">
                {[400, 500, 600, 700, 800, 900].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChange('heading_font_weight', w)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      (theme.heading_font_weight ?? 700) === w
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Box */}
            <div className="mt-4 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
              <span className="text-[9px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">Live Preview</span>
              <h4
                style={{
                  fontFamily: FONT_MAP[theme.heading_font] || 'sans-serif',
                  fontWeight: theme.heading_font_weight ?? 700,
                  textTransform: theme.text_transform ?? 'none',
                  letterSpacing: `${theme.letter_spacing ?? 0}em`,
                  lineHeight: theme.line_height ?? 1.5,
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              >
                Heading Sample
              </h4>
              <p
                className="mt-1.5 text-xs text-slate-500"
                style={{
                  fontFamily: FONT_MAP[theme.font_family] || 'sans-serif',
                  fontWeight: theme.body_font_weight ?? 400,
                  lineHeight: theme.line_height ?? 1.5,
                  letterSpacing: `${theme.letter_spacing ?? 0}em`
                }}
              >
                The quick brown fox jumps over the lazy dog. 1234567890.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
