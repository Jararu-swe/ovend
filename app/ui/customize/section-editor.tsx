'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  const toggle = (id: string) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
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

  // Drag handlers
  const handleDragStart = useCallback((idx: number) => {
    dragRef.current = idx;
    setDraggedIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIdx(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    const from = dragRef.current;
    if (from === null || from === idx) {
      setDraggedIdx(null);
      setDropTargetIdx(null);
      return;
    }
    const newSections = [...sorted];
    const [moved] = newSections.splice(from, 1);
    newSections.splice(idx, 0, moved);
    onSectionsChange(newSections.map((s, i) => ({ ...s, order: i })));
    setDraggedIdx(null);
    setDropTargetIdx(null);
    dragRef.current = null;
  }, [sorted, onSectionsChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIdx(null);
    setDropTargetIdx(null);
    dragRef.current = null;
  }, []);

  // Get a content preview snippet
  const getPreview = (id: string): string => {
    const c = sectionContent[id] || {};
    switch (id) {
      case 'hero-banner': return c.title || 'Welcome to our store';
      case 'announcement-bar': return c.text || 'Promo text';
      case 'featured-products': return c.title || 'Featured';
      case 'product-grid': return 'Auto-populated from your products';
      case 'trust-badges': return `${(c.badges || []).length} badges`;
      case 'image-gallery': return `${(c.images || []).length} images`;
      case 'faqs': return `${(c.items || []).length} questions`;
      case 'testimonials': return `${(c.quotes || []).length} reviews`;
      case 'about-section': return c.title || 'About Us';
      case 'contact-cta': return c.title || 'Contact CTA';
      default: return '';
    }
  };

  return (
    <div className="p-3 space-y-3">
      <p className="text-[11px] text-slate-400 px-1">Drag to reorder. Click to expand & edit content.</p>

      <div className="space-y-1">
        {sorted.map((section, idx) => {
          const meta = sectionMeta(section.id);
          if (!meta) return null;
          const isProductGrid = section.id === 'product-grid';
          const isExpanded = expandedId === section.id;
          const isDragging = draggedIdx === idx;
          const isDropTarget = dropTargetIdx === idx;

          return (
            <div key={section.id}>
              {/* Drop indicator line */}
              {isDropTarget && draggedIdx !== null && draggedIdx !== idx && (
                <div className="h-0.5 rounded-full bg-emerald-500 mx-2 -mb-0.5 transition-all" />
              )}

              <div
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl border transition-all ${
                  isDragging
                    ? 'opacity-40 scale-95 border-dashed border-slate-300'
                    : section.enabled
                      ? 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                      : 'border-slate-100 bg-slate-50/50 opacity-60'
                }`}
              >
                {/* Section header */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition shrink-0">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="19" r="1.5" />
                    </svg>
                  </div>

                  {/* Icon + info */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-sm shrink-0">{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 block">{meta.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{getPreview(section.id)}</span>
                    </div>
                    <svg
                      className={`h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Toggle */}
                  <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => { if (!isProductGrid) toggle(section.id); }}
                      disabled={isProductGrid}
                      className="peer sr-only"
                    />
                    <div className={`h-5 w-9 rounded-full transition-colors peer-checked:bg-emerald-500 ${
                      isProductGrid ? 'bg-emerald-500 opacity-60 cursor-not-allowed' : 'bg-slate-300'
                    }`}>
                      <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        section.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                </div>

                {/* Expandable content editor */}
                {section.enabled && isExpanded && (
                  <div className="border-t border-slate-50 px-3 py-3 space-y-2">
                    {section.id === 'hero-banner' && (
                      <>
                        <MiniInput label="Title" value={(sectionContent[section.id] || {}).title || ''} onChange={(v) => updateContent(section.id, 'title', v)} />
                        <MiniInput label="Subtitle" value={(sectionContent[section.id] || {}).subtitle || ''} onChange={(v) => updateContent(section.id, 'subtitle', v)} />
                        <div className="grid grid-cols-2 gap-2">
                          <MiniInput label="CTA Text" value={(sectionContent[section.id] || {}).cta_text || ''} onChange={(v) => updateContent(section.id, 'cta_text', v)} />
                          <MiniInput label="CTA Link" value={(sectionContent[section.id] || {}).cta_link || '#item-list'} onChange={(v) => updateContent(section.id, 'cta_link', v)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Text Align</label>
                          <div className="flex gap-1">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => updateContent(section.id, 'text_align', align)}
                                className={`flex-1 rounded-lg border px-3 py-1 text-[10px] font-semibold capitalize transition ${
                                  ((sectionContent[section.id] || {}).text_align || 'left') === align
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                        </div>
                        <MiniInput label="Background Image URL" value={(sectionContent[section.id] || {}).image_url || ''} onChange={(v) => updateContent(section.id, 'image_url', v)} />
                      </>
                    )}
                    {section.id === 'announcement-bar' && (
                      <>
                        <MiniInput label="Text" value={(sectionContent[section.id] || {}).text || ''} onChange={(v) => updateContent(section.id, 'text', v)} />
                        <div className="flex gap-2">
                          <MiniColor label="Background" value={(sectionContent[section.id] || {}).bg_color || '#10b981'} onChange={(v) => updateContent(section.id, 'bg_color', v)} />
                          <MiniColor label="Text" value={(sectionContent[section.id] || {}).text_color || '#ffffff'} onChange={(v) => updateContent(section.id, 'text_color', v)} />
                        </div>
                      </>
                    )}
                    {section.id === 'featured-products' && (
                      <MiniInput label="Section title" value={(sectionContent[section.id] || {}).title || 'Featured'} onChange={(v) => updateContent(section.id, 'title', v)} />
                    )}
                    {section.id === 'trust-badges' && (
                      <TrustBadgesEditor
                        badges={(sectionContent[section.id] || {}).badges || []}
                        onChange={(b) => updateContent(section.id, 'badges', b)}
                      />
                    )}
                    {section.id === 'image-gallery' && (
                      <>
                        <MiniInput label="Section title" value={(sectionContent[section.id] || {}).title || '📸 Gallery'} onChange={(v) => updateContent(section.id, 'title', v)} />
                        <ImageGalleryEditor
                          images={(sectionContent[section.id] || {}).images || []}
                          onChange={(imgs) => updateContent(section.id, 'images', imgs)}
                        />
                      </>
                    )}
                    {section.id === 'faqs' && (
                      <>
                        <MiniInput label="Section title" value={(sectionContent[section.id] || {}).title || 'FAQ'} onChange={(v) => updateContent(section.id, 'title', v)} />
                        <FaqsEditor
                          items={(sectionContent[section.id] || {}).items || []}
                          onChange={(items) => updateContent(section.id, 'items', items)}
                        />
                      </>
                    )}
                    {section.id === 'about-section' && (
                      <>
                        <MiniInput label="Title" value={(sectionContent[section.id] || {}).title || 'About Us'} onChange={(v) => updateContent(section.id, 'title', v)} />
                        <MiniTextarea label="Text" value={(sectionContent[section.id] || {}).text || ''} onChange={(v) => updateContent(section.id, 'text', v)} />
                      </>
                    )}
                    {section.id === 'contact-cta' && (
                      <>
                        <MiniInput label="Title" value={(sectionContent[section.id] || {}).title || 'Have questions?'} onChange={(v) => updateContent(section.id, 'title', v)} />
                        <MiniInput label="Subtitle" value={(sectionContent[section.id] || {}).subtitle || ''} onChange={(v) => updateContent(section.id, 'subtitle', v)} />
                        <MiniInput label="Button text" value={(sectionContent[section.id] || {}).button_text || 'Chat on WhatsApp'} onChange={(v) => updateContent(section.id, 'button_text', v)} />
                      </>
                    )}
                    {section.id === 'testimonials' && (
                      <TestimonialsEditor
                        quotes={(sectionContent[section.id] || {}).quotes || []}
                        onChange={(q) => updateContent(section.id, 'quotes', q)}
                      />
                    )}
                    {section.id === 'product-grid' && (
                      <p className="text-[10px] text-slate-400 italic">Configure layout, cards & spacing in the Layout panel.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────

function MiniInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 transition"
      />
    </div>
  );
}

function MiniTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-100 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500 transition resize-none"
      />
    </div>
  );
}

function MiniColor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] font-semibold text-slate-400">{label}</label>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 rounded border border-slate-200 cursor-pointer" />
    </div>
  );
}

type Quote = { name: string; text: string; rating: number };

function TestimonialsEditor({ quotes, onChange }: { quotes: Quote[]; onChange: (q: Quote[]) => void }) {
  return (
    <div className="space-y-2">
      {quotes.map((q, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <input type="text" value={q.name} onChange={(e) => onChange(quotes.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))} placeholder="Name" className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500" />
            <input type="text" value={q.text} onChange={(e) => onChange(quotes.map((r, i) => (i === idx ? { ...r, text: e.target.value } : r)))} placeholder="Review…" className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500" />
          </div>
          <button type="button" onClick={() => onChange(quotes.filter((_, i) => i !== idx))} className="text-[10px] text-red-400 hover:text-red-600 mt-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...quotes, { name: '', text: '', rating: 5 }])} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-500">+ Add testimonial</button>
    </div>
  );
}

type Badge = { icon: string; label: string };

function TrustBadgesEditor({ badges, onChange }: { badges: Badge[]; onChange: (b: Badge[]) => void }) {
  return (
    <div className="space-y-1.5">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex gap-1.5 items-center">
          <input type="text" value={badge.icon} onChange={(e) => onChange(badges.map((b, i) => (i === idx ? { ...b, icon: e.target.value } : b)))} className="w-10 rounded-lg border border-slate-100 px-1.5 py-1 text-center text-xs outline-none focus:border-emerald-500" maxLength={4} />
          <input type="text" value={badge.label} onChange={(e) => onChange(badges.map((b, i) => (i === idx ? { ...b, label: e.target.value } : b)))} placeholder="Label" className="flex-1 rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500" />
          <button type="button" onClick={() => onChange(badges.filter((_, i) => i !== idx))} className="text-[10px] text-red-400 hover:text-red-600">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...badges, { icon: '✅', label: 'New Badge' }])} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-500">+ Add badge</button>
    </div>
  );
}

type GalleryImage = { url: string; caption?: string };

function ImageGalleryEditor({ images, onChange }: { images: GalleryImage[]; onChange: (imgs: GalleryImage[]) => void }) {
  return (
    <div className="space-y-2">
      {images.map((img, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          {img.url && (
            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <input type="text" value={img.url} onChange={(e) => onChange(images.map((im, i) => (i === idx ? { ...im, url: e.target.value } : im)))} placeholder="Image URL" className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500" />
            <input type="text" value={img.caption || ''} onChange={(e) => onChange(images.map((im, i) => (i === idx ? { ...im, caption: e.target.value } : im)))} placeholder="Caption" className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500" />
          </div>
          <button type="button" onClick={() => onChange(images.filter((_, i) => i !== idx))} className="text-[10px] text-red-400 hover:text-red-600 mt-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...images, { url: '', caption: '' }])} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-500">+ Add image</button>
    </div>
  );
}

type FaqItem = { question: string; answer: string };

function FaqsEditor({ items, onChange }: { items: FaqItem[]; onChange: (items: FaqItem[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start border-l-2 border-emerald-500 pl-2">
          <div className="flex-1 space-y-1">
            <input type="text" value={item.question} onChange={(e) => onChange(items.map((it, i) => (i === idx ? { ...it, question: e.target.value } : it)))} placeholder="Question" className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500 font-semibold" />
            <textarea value={item.answer} onChange={(e) => onChange(items.map((it, i) => (i === idx ? { ...it, answer: e.target.value } : it)))} placeholder="Answer" rows={2} className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px] outline-none focus:border-emerald-500 resize-none" />
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))} className="text-[10px] text-red-400 hover:text-red-600 mt-1">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { question: '', answer: '' }])} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-500">+ Add question</button>
    </div>
  );
}
