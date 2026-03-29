'use client';

import { TemplateSection, SECTION_TYPES, TemplateSectionContent } from '@/app/lib/template-presets';

interface SectionEditorProps {
  sections: TemplateSection[];
  sectionContent: TemplateSectionContent;
  onSectionsChange: (sections: TemplateSection[]) => void;
  onSectionContentChange: (content: TemplateSectionContent) => void;
}

export default function SectionEditor({
  sections,
  sectionContent,
  onSectionsChange,
  onSectionContentChange,
}: SectionEditorProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const toggle = (id: string) => {
    onSectionsChange(
      sections.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const newSections = [...sorted];
    [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
    onSectionsChange(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const moveDown = (idx: number) => {
    if (idx >= sorted.length - 1) return;
    const newSections = [...sorted];
    [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
    onSectionsChange(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const updateContent = (sectionId: string, key: string, value: any) => {
    onSectionContentChange({
      ...sectionContent,
      [sectionId]: {
        ...(sectionContent[sectionId] || {}),
        [key]: value,
      },
    });
  };

  const sectionMeta = (id: string) => SECTION_TYPES.find((t) => t.id === id);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Page Sections</h2>
        <p className="text-sm text-slate-500 mt-1">
          Toggle sections on/off and reorder them. Click to edit content.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((section, idx) => {
          const meta = sectionMeta(section.id);
          if (!meta) return null;
          const content = sectionContent[section.id] || {};
          const isProductGrid = section.id === 'product-grid';

          return (
            <div
              key={section.id}
              className={`rounded-xl border transition-all ${
                section.enabled
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              {/* Section header */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === sorted.length - 1}
                    className="text-[10px] text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Icon + label */}
                <span className="text-base">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800">{meta.label}</span>
                  <span className="text-[11px] text-slate-500 ml-2 hidden sm:inline">
                    {meta.description}
                  </span>
                </div>

                {/* Toggle */}
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => {
                      if (!isProductGrid) toggle(section.id);
                    }}
                    disabled={isProductGrid}
                    className="peer sr-only"
                  />
                  <div className={`h-6 w-10 rounded-full transition-colors peer-checked:bg-emerald-500 ${
                    isProductGrid ? 'bg-emerald-500 opacity-60 cursor-not-allowed' : 'bg-slate-300'
                  }`}>
                    <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      section.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              </div>

              {/* Inline content editor (expandable) */}
              {section.enabled && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                  {section.id === 'hero-banner' && (
                    <>
                      <MiniInput
                        label="Title"
                        value={content.title || ''}
                        onChange={(v) => updateContent(section.id, 'title', v)}
                      />
                      <MiniInput
                        label="Subtitle"
                        value={content.subtitle || ''}
                        onChange={(v) => updateContent(section.id, 'subtitle', v)}
                      />
                    </>
                  )}
                  {section.id === 'announcement-bar' && (
                    <>
                      <MiniInput
                        label="Text"
                        value={content.text || ''}
                        onChange={(v) => updateContent(section.id, 'text', v)}
                      />
                      <div className="flex gap-2">
                        <MiniColor
                          label="Background"
                          value={content.bg_color || '#10b981'}
                          onChange={(v) => updateContent(section.id, 'bg_color', v)}
                        />
                        <MiniColor
                          label="Text"
                          value={content.text_color || '#ffffff'}
                          onChange={(v) => updateContent(section.id, 'text_color', v)}
                        />
                      </div>
                    </>
                  )}
                  {section.id === 'featured-products' && (
                    <MiniInput
                      label="Section title"
                      value={content.title || 'Featured'}
                      onChange={(v) => updateContent(section.id, 'title', v)}
                    />
                  )}
                  {section.id === 'about-section' && (
                    <>
                      <MiniInput
                        label="Title"
                        value={content.title || 'About Us'}
                        onChange={(v) => updateContent(section.id, 'title', v)}
                      />
                      <MiniTextarea
                        label="Text"
                        value={content.text || ''}
                        onChange={(v) => updateContent(section.id, 'text', v)}
                      />
                    </>
                  )}
                  {section.id === 'contact-cta' && (
                    <>
                      <MiniInput
                        label="Title"
                        value={content.title || 'Have questions?'}
                        onChange={(v) => updateContent(section.id, 'title', v)}
                      />
                      <MiniInput
                        label="Subtitle"
                        value={content.subtitle || ''}
                        onChange={(v) => updateContent(section.id, 'subtitle', v)}
                      />
                      <MiniInput
                        label="Button text"
                        value={content.button_text || 'Chat on WhatsApp'}
                        onChange={(v) => updateContent(section.id, 'button_text', v)}
                      />
                    </>
                  )}
                  {section.id === 'testimonials' && (
                    <TestimonialsEditor
                      quotes={content.quotes || []}
                      onChange={(q) => updateContent(section.id, 'quotes', q)}
                    />
                  )}
                  {section.id === 'product-grid' && (
                    <p className="text-[11px] text-slate-400 italic">
                      Configure layout, card style, and spacing in the Layout section above.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────

function MiniInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 transition"
      />
    </div>
  );
}

function MiniTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 transition resize-none"
      />
    </div>
  );
}

function MiniColor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-semibold text-slate-500">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-8 rounded border border-slate-200 cursor-pointer"
      />
    </div>
  );
}

type Quote = { name: string; text: string; rating: number };

function TestimonialsEditor({
  quotes,
  onChange,
}: {
  quotes: Quote[];
  onChange: (q: Quote[]) => void;
}) {
  const addQuote = () => {
    onChange([...quotes, { name: '', text: '', rating: 5 }]);
  };
  const removeQuote = (idx: number) => {
    onChange(quotes.filter((_, i) => i !== idx));
  };
  const updateQuote = (idx: number, key: keyof Quote, val: any) => {
    onChange(quotes.map((q, i) => (i === idx ? { ...q, [key]: val } : q)));
  };

  return (
    <div className="space-y-3">
      {quotes.map((q, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={q.name}
              onChange={(e) => updateQuote(idx, 'name', e.target.value)}
              placeholder="Customer name"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={q.text}
              onChange={(e) => updateQuote(idx, 'text', e.target.value)}
              placeholder="Their review…"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => removeQuote(idx)}
            className="text-xs text-red-400 hover:text-red-600 mt-1 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addQuote}
        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition"
      >
        + Add testimonial
      </button>
    </div>
  );
}
