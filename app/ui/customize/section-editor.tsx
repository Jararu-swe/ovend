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
                      <div className="grid grid-cols-2 gap-2">
                        <MiniInput
                          label="CTA Button Text"
                          value={content.cta_text || ''}
                          onChange={(v) => updateContent(section.id, 'cta_text', v)}
                        />
                        <MiniInput
                          label="CTA Link"
                          value={content.cta_link || '#item-list'}
                          onChange={(v) => updateContent(section.id, 'cta_link', v)}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Text Alignment</label>
                        <div className="flex gap-2">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => updateContent(section.id, 'text_align', align)}
                              className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                                (content.text_align || 'left') === align
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>
                      <MiniInput
                        label="Background Image URL (optional)"
                        value={content.image_url || ''}
                        onChange={(v) => updateContent(section.id, 'image_url', v)}
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
                  {section.id === 'trust-badges' && (
                    <TrustBadgesEditor
                      badges={content.badges || []}
                      onChange={(b) => updateContent(section.id, 'badges', b)}
                    />
                  )}
                  {section.id === 'image-gallery' && (
                    <>
                      <MiniInput
                        label="Section title"
                        value={content.title || '📸 Gallery'}
                        onChange={(v) => updateContent(section.id, 'title', v)}
                      />
                      <ImageGalleryEditor
                        images={content.images || []}
                        onChange={(imgs) => updateContent(section.id, 'images', imgs)}
                      />
                    </>
                  )}
                  {section.id === 'faqs' && (
                    <>
                      <MiniInput
                        label="Section title"
                        value={content.title || 'Frequently Asked Questions'}
                        onChange={(v) => updateContent(section.id, 'title', v)}
                      />
                      <FaqsEditor
                        items={content.items || []}
                        onChange={(items) => updateContent(section.id, 'items', items)}
                      />
                    </>
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

type Badge = { icon: string; label: string };

function TrustBadgesEditor({
  badges,
  onChange,
}: {
  badges: Badge[];
  onChange: (b: Badge[]) => void;
}) {
  const addBadge = () => {
    onChange([...badges, { icon: '✅', label: 'New Badge' }]);
  };
  const removeBadge = (idx: number) => {
    onChange(badges.filter((_, i) => i !== idx));
  };
  const updateBadge = (idx: number, key: keyof Badge, val: string) => {
    onChange(badges.map((b, i) => (i === idx ? { ...b, [key]: val } : b)));
  };

  return (
    <div className="space-y-2">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            value={badge.icon}
            onChange={(e) => updateBadge(idx, 'icon', e.target.value)}
            className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm outline-none focus:border-emerald-500"
            maxLength={4}
            title="Emoji icon"
          />
          <input
            type="text"
            value={badge.label}
            onChange={(e) => updateBadge(idx, 'label', e.target.value)}
            placeholder="Badge label"
            className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => removeBadge(idx)}
            className="text-xs text-red-400 hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addBadge}
        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition"
      >
        + Add badge
      </button>
    </div>
  );
}

type GalleryImage = { url: string; caption?: string };

function ImageGalleryEditor({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (imgs: GalleryImage[]) => void;
}) {
  const addImage = () => {
    onChange([...images, { url: '', caption: '' }]);
  };
  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };
  const updateImage = (idx: number, key: keyof GalleryImage, val: string) => {
    onChange(images.map((img, i) => (i === idx ? { ...img, [key]: val } : img)));
  };

  return (
    <div className="space-y-3">
      {images.map((img, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          {/* Thumbnail preview */}
          {img.url && (
            <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={img.url}
              onChange={(e) => updateImage(idx, 'url', e.target.value)}
              placeholder="Image URL (https://...)"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={img.caption || ''}
              onChange={(e) => updateImage(idx, 'caption', e.target.value)}
              placeholder="Caption (optional)"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="text-xs text-red-400 hover:text-red-600 mt-1 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addImage}
        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition"
      >
        + Add image
      </button>
    </div>
  );
}

type FaqItem = { question: string; answer: string };

function FaqsEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  const addItem = () => onChange([...items, { question: '', answer: '' }]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof FaqItem, val: string) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start border-l-2 border-emerald-500 pl-2">
          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(idx, 'question', e.target.value)}
              placeholder="Question"
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500 font-semibold"
            />
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(idx, 'answer', e.target.value)}
              placeholder="Answer..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="text-xs text-red-400 hover:text-red-600 mt-1 transition"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition"
      >
        + Add Question
      </button>
    </div>
  );
}
