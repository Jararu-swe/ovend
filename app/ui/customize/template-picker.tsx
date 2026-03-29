'use client';

import { Template, TEMPLATES } from '@/app/lib/template-presets';

interface TemplatePickerProps {
  activeTemplateId: string;
  onSelect: (template: Template) => void;
}

export default function TemplatePicker({ activeTemplateId, onSelect }: TemplatePickerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Templates</h2>
        <p className="text-sm text-slate-500 mt-1">
          Pick a starting point — then tweak every detail below.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl) => {
          const isActive = tpl.id === activeTemplateId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              className={`group relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-200
                ${isActive
                  ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
            >
              {/* Color preview dots */}
              <div className="flex gap-1.5 mb-3">
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: tpl.theme.primary_color }}
                />
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: tpl.theme.secondary_color }}
                />
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: tpl.theme.accent_color }}
                />
                <span
                  className="h-4 w-4 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: tpl.theme.background_color }}
                />
              </div>

              {/* Template info */}
              <span className="text-lg mb-0.5">{tpl.emoji}</span>
              <span className={`text-sm font-bold ${isActive ? 'text-emerald-700' : 'text-slate-900'}`}>
                {tpl.name}
              </span>
              <span className="text-[11px] text-slate-500 leading-snug mt-1 line-clamp-2">
                {tpl.description}
              </span>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Active badge */}
              {isActive && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
