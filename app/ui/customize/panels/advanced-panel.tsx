'use client';

import { StoreTheme } from '@/app/lib/definitions';

interface AdvancedPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
  onResetDefaults: () => void;
}

export default function AdvancedPanel({ theme, onChange, onResetDefaults }: AdvancedPanelProps) {
  return (
    <div className="p-4 space-y-5">
      {/* Custom CSS */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom CSS</label>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Advanced</span>
        </div>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5">
            <span className="text-[10px] font-mono text-slate-400">styles.css</span>
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500/60" />
              <div className="h-2 w-2 rounded-full bg-amber-500/60" />
              <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
            </div>
          </div>
          <textarea
            value={theme.custom_css || ''}
            onChange={(e) => onChange('custom_css', e.target.value)}
            placeholder={`/* Your custom CSS */\n.ovd-hero {\n  background: linear-gradient(\n    135deg, #667eea, #764ba2\n  );\n}`}
            rows={14}
            className="w-full px-4 py-3 font-mono text-xs bg-slate-900 text-green-400 outline-none resize-none placeholder:text-slate-600"
            spellCheck={false}
          />
        </div>
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <p className="text-[10px] text-amber-700 leading-relaxed">
            ⚠️ CSS scoped to your storefront only. Avoid <code className="bg-amber-100 px-1 rounded text-[9px]">!important</code> unless necessary.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-dashed border-red-200 p-4">
        <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-[11px] text-slate-500 mb-4">Reset all customizations to factory defaults. This cannot be undone.</p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Reset everything to the default template? This cannot be undone.')) {
              onResetDefaults();
            }
          }}
          className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
        >
          🗑️ Reset to Factory Defaults
        </button>
      </div>
    </div>
  );
}
