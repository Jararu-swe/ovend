'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { updateThemeAction } from '@/app/lib/actions';
import { useActionState } from 'react';
import LogoDropzone from '@/app/ui/customize/logo-dropzone';
import TemplatePicker from '@/app/ui/customize/template-picker';
import SectionEditor from '@/app/ui/customize/section-editor';
import { Template, TemplateSection, TemplateSectionContent, getDefaultSections, getDefaultSectionContent } from '@/app/lib/template-presets';

// ─── WCAG Contrast Ratio Calculator ──────────────────────────
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
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function contrastBadge(fg: string, bg: string): { label: string; color: string } {
  const ratio = contrastRatio(fg, bg);
  if (ratio >= 7) return { label: `✅ AAA (${ratio.toFixed(1)})`, color: 'text-green-600' };
  if (ratio >= 4.5) return { label: `✅ AA (${ratio.toFixed(1)})`, color: 'text-green-600' };
  if (ratio >= 3) return { label: `⚠️ AA-Large (${ratio.toFixed(1)})`, color: 'text-amber-600' };
  return { label: `🔴 Fail (${ratio.toFixed(1)})`, color: 'text-red-500' };
}

type HistoryEntry = { theme: StoreTheme; sections: TemplateSection[]; sectionContent: TemplateSectionContent };

/** Safely parse JSON with a fallback. */
function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return fallback;
  }
}

export default function CustomizeForm({ theme, vendorSlug }: { theme: StoreTheme; vendorSlug: string }) {
  const [localTheme, setLocalTheme] = useState<StoreTheme>(() => ({
    ...theme,
    template_id: theme.template_id ?? 'fresh-market',
    logo_position: theme.logo_position ?? 'left',
    logo_frame: theme.logo_frame ?? 'profile',
    surface_color: theme.surface_color ?? '#ffffff',
    heading_color: theme.heading_color ?? '#0f172a',
    border_color: theme.border_color ?? '#e2e8f0',
    card_shadow: theme.card_shadow ?? 'soft',
  }));

  const [sections, setSections] = useState<TemplateSection[]>(() =>
    safeParse(theme.sections, getDefaultSections())
  );
  const [sectionContent, setSectionContent] = useState<TemplateSectionContent>(() =>
    safeParse(theme.section_content, getDefaultSectionContent())
  );

  const [state, formAction] = useActionState(updateThemeAction, { message: '', errors: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'colors' | 'layout' | 'sections' | 'brand' | 'advanced'>('templates');
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  // ─── Undo / Redo ────────────────────────────────────────────
  const MAX_HISTORY = 20;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-MAX_HISTORY + 1),
      { theme: { ...localTheme }, sections: [...sections], sectionContent: { ...sectionContent } },
    ]);
    setFuture([]);
  }, [localTheme, sections, sectionContent]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setFuture((f) => [{ theme: { ...localTheme }, sections: [...sections], sectionContent: { ...sectionContent } }, ...f]);
      setLocalTheme(last.theme);
      setSections(last.sections);
      setSectionContent(last.sectionContent);
      return prev.slice(0, -1);
    });
  }, [localTheme, sections, sectionContent]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setHistory((h) => [...h, { theme: { ...localTheme }, sections: [...sections], sectionContent: { ...sectionContent } }]);
      setLocalTheme(next.theme);
      setSections(next.sections);
      setSectionContent(next.sectionContent);
      return prev.slice(1);
    });
  }, [localTheme, sections, sectionContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  // ─── Unsaved changes detection ──────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    const keys: (keyof StoreTheme)[] = [
      'primary_color', 'secondary_color', 'background_color', 'text_color',
      'accent_color', 'surface_color', 'heading_color', 'border_color',
      'font_family', 'heading_font', 'font_size', 'layout_style',
      'card_style', 'border_radius', 'spacing', 'header_style',
      'image_aspect_ratio', 'template_id', 'card_shadow',
      'show_product_images', 'show_product_description',
      'show_logo', 'logo_position', 'logo_frame', 'logo_url',
      'button_style', 'button_radius', 'animation_style', 'custom_css',
    ];
    return keys.some((k) => String(localTheme[k] ?? '') !== String(theme[k] ?? ''));
  }, [localTheme, theme]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    setIsSaving(false);
  };

  const updateLocalTheme = useCallback((key: keyof StoreTheme, value: any) => {
    pushHistory();
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  }, [pushHistory]);

  // Apply a template
  const applyTemplate = useCallback((template: Template) => {
    const t = template.theme;
    setLocalTheme(prev => ({
      ...prev,
      template_id: template.id,
      primary_color: t.primary_color,
      secondary_color: t.secondary_color,
      background_color: t.background_color,
      text_color: t.text_color,
      accent_color: t.accent_color,
      surface_color: t.surface_color,
      heading_color: t.heading_color,
      border_color: t.border_color,
      font_family: t.font_family,
      heading_font: t.heading_font,
      font_size: t.font_size,
      layout_style: t.layout_style,
      card_style: t.card_style,
      border_radius: t.border_radius,
      card_shadow: t.card_shadow,
      spacing: t.spacing,
      header_style: t.header_style,
      image_aspect_ratio: t.image_aspect_ratio,
    }));
    setSections(template.sections);
    setSectionContent(template.sectionContent);
  }, []);

  // Send live preview updates to the iframe
  useEffect(() => {
    if (!vendorSlug || !previewFrameRef.current?.contentWindow) return;
    previewFrameRef.current.contentWindow.postMessage(
      {
        type: 'OVEND_PREVIEW_THEME_UPDATE',
        payload: {
          ...localTheme,
          sections: JSON.stringify(sections),
          section_content: JSON.stringify(sectionContent),
        },
      },
      window.location.origin,
    );
  }, [localTheme, sections, sectionContent, vendorSlug]);

  const tabs = [
    { id: 'templates' as const, label: '🎨 Templates' },
    { id: 'colors' as const, label: '🖌️ Colors' },
    { id: 'layout' as const, label: '📐 Layout' },
    { id: 'sections' as const, label: '📦 Sections' },
    { id: 'brand' as const, label: '🏷️ Brand' },
    { id: 'advanced' as const, label: '⚙️ Advanced' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hidden fields for new data */}
      <input type="hidden" name="template_id" value={localTheme.template_id} />
      <input type="hidden" name="surface_color" value={localTheme.surface_color} />
      <input type="hidden" name="heading_color" value={localTheme.heading_color} />
      <input type="hidden" name="border_color" value={localTheme.border_color} />
      <input type="hidden" name="card_shadow" value={localTheme.card_shadow} />
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <input type="hidden" name="section_content" value={JSON.stringify(sectionContent)} />

      {/* Existing form fields (for backward compat) */}
      <input type="hidden" name="primary_color" value={localTheme.primary_color} />
      <input type="hidden" name="secondary_color" value={localTheme.secondary_color} />
      <input type="hidden" name="background_color" value={localTheme.background_color} />
      <input type="hidden" name="text_color" value={localTheme.text_color} />
      <input type="hidden" name="accent_color" value={localTheme.accent_color} />
      <input type="hidden" name="layout_style" value={localTheme.layout_style} />
      <input type="hidden" name="card_style" value={localTheme.card_style} />
      <input type="hidden" name="border_radius" value={localTheme.border_radius} />
      <input type="hidden" name="font_family" value={localTheme.font_family} />
      <input type="hidden" name="heading_font" value={localTheme.heading_font} />
      <input type="hidden" name="font_size" value={localTheme.font_size} />
      <input type="hidden" name="header_style" value={localTheme.header_style} />
      <input type="hidden" name="show_product_images" value={localTheme.show_product_images ? 'true' : 'false'} />
      <input type="hidden" name="show_product_description" value={localTheme.show_product_description ? 'true' : 'false'} />
      <input type="hidden" name="image_aspect_ratio" value={localTheme.image_aspect_ratio} />
      <input type="hidden" name="spacing" value={localTheme.spacing} />
      <input type="hidden" name="show_logo" value={localTheme.show_logo ? 'true' : 'false'} />
      <input type="hidden" name="logo_position" value={localTheme.logo_position} />
      <input type="hidden" name="logo_frame" value={localTheme.logo_frame} />
      <input type="hidden" name="logo_url" value={localTheme.logo_url ?? ''} />
      <input type="hidden" name="button_style" value={localTheme.button_style ?? 'solid'} />
      <input type="hidden" name="button_radius" value={localTheme.button_radius ?? 'rounded'} />
      <input type="hidden" name="animation_style" value={localTheme.animation_style ?? 'none'} />
      <input type="hidden" name="custom_css" value={localTheme.custom_css ?? ''} />

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-sm font-medium text-amber-800">You have unsaved changes</p>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button type="button" onClick={undo} className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition" title="Ctrl+Z">
                ↩ Undo
              </button>
            )}
            {future.length > 0 && (
              <button type="button" onClick={redo} className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition" title="Ctrl+Y">
                ↪ Redo
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Templates Tab ─── */}
          {activeTab === 'templates' && (
            <TemplatePicker
              activeTemplateId={localTheme.template_id}
              onSelect={applyTemplate}
            />
          )}

          {/* ─── Colors Tab ─── */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Colors</h2>
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput label="Primary" value={localTheme.primary_color} onChange={(v) => updateLocalTheme('primary_color', v)} contrastAgainst={localTheme.background_color} />
                  <ColorInput label="Secondary" value={localTheme.secondary_color} onChange={(v) => updateLocalTheme('secondary_color', v)} contrastAgainst={localTheme.background_color} />
                  <ColorInput label="Background" value={localTheme.background_color} onChange={(v) => updateLocalTheme('background_color', v)} />
                  <ColorInput label="Surface" value={localTheme.surface_color} onChange={(v) => updateLocalTheme('surface_color', v)} />
                  <ColorInput label="Text" value={localTheme.text_color} onChange={(v) => updateLocalTheme('text_color', v)} contrastAgainst={localTheme.background_color} />
                  <ColorInput label="Headings" value={localTheme.heading_color} onChange={(v) => updateLocalTheme('heading_color', v)} contrastAgainst={localTheme.surface_color} />
                  <ColorInput label="Accent" value={localTheme.accent_color} onChange={(v) => updateLocalTheme('accent_color', v)} contrastAgainst={localTheme.background_color} />
                  <ColorInput label="Borders" value={localTheme.border_color} onChange={(v) => updateLocalTheme('border_color', v)} />
                </div>
              </div>

              {/* Typography */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Typography</h2>
                <div className="space-y-4">
                  <SelectField label="Body Font" value={localTheme.font_family} onChange={(v) => updateLocalTheme('font_family', v)}
                    options={[
                      { value: 'inter', label: 'Inter' },
                      { value: 'poppins', label: 'Poppins' },
                      { value: 'roboto', label: 'Roboto' },
                      { value: 'playfair', label: 'Playfair Display' },
                      { value: 'montserrat', label: 'Montserrat' },
                    ]}
                  />
                  <SelectField label="Heading Font" value={localTheme.heading_font} onChange={(v) => updateLocalTheme('heading_font', v)}
                    options={[
                      { value: 'inter', label: 'Inter' },
                      { value: 'poppins', label: 'Poppins' },
                      { value: 'roboto', label: 'Roboto' },
                      { value: 'playfair', label: 'Playfair Display' },
                      { value: 'montserrat', label: 'Montserrat' },
                    ]}
                  />
                  <SelectField label="Font Size" value={localTheme.font_size} onChange={(v) => updateLocalTheme('font_size', v as any)}
                    options={[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Layout Tab ─── */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Layout & Cards</h2>
                <div className="space-y-4">
                  <SelectField label="Layout Style" value={localTheme.layout_style} onChange={(v) => updateLocalTheme('layout_style', v as any)}
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'list', label: 'List' },
                      { value: 'masonry', label: 'Masonry' },
                    ]}
                  />
                  <SelectField label="Card Style" value={localTheme.card_style} onChange={(v) => updateLocalTheme('card_style', v as any)}
                    options={[
                      { value: 'modern', label: 'Modern' },
                      { value: 'classic', label: 'Classic' },
                      { value: 'minimal', label: 'Minimal' },
                      { value: 'bold', label: 'Bold' },
                    ]}
                  />
                  <SelectField label="Border Radius" value={localTheme.border_radius} onChange={(v) => updateLocalTheme('border_radius', v as any)}
                    options={[
                      { value: 'sharp', label: 'Sharp' },
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'pill', label: 'Pill' },
                    ]}
                  />
                  <SelectField label="Card Shadow" value={localTheme.card_shadow} onChange={(v) => updateLocalTheme('card_shadow', v as any)}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'soft', label: 'Soft' },
                      { value: 'elevated', label: 'Elevated' },
                      { value: 'hard', label: 'Hard offset' },
                    ]}
                  />
                  <SelectField label="Spacing" value={localTheme.spacing} onChange={(v) => updateLocalTheme('spacing', v as any)}
                    options={[
                      { value: 'compact', label: 'Compact' },
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'spacious', label: 'Spacious' },
                    ]}
                  />
                  <SelectField label="Header Style" value={localTheme.header_style} onChange={(v) => updateLocalTheme('header_style', v as any)}
                    options={[
                      { value: 'sticky', label: 'Sticky' },
                      { value: 'static', label: 'Static' },
                      { value: 'transparent', label: 'Transparent' },
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Interaction & Buttons</h2>
                <div className="space-y-4">
                  <SelectField label="Button Style" value={localTheme.button_style} onChange={(v) => updateLocalTheme('button_style', v as any)}
                    options={[
                      { value: 'solid', label: 'Solid' },
                      { value: 'outline', label: 'Outline' },
                      { value: 'soft', label: 'Soft' },
                      { value: 'glass', label: 'Glassmorphism' },
                    ]}
                  />
                  <SelectField label="Button Radius" value={localTheme.button_radius} onChange={(v) => updateLocalTheme('button_radius', v as any)}
                    options={[
                      { value: 'sharp', label: 'Sharp' },
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'pill', label: 'Pill' },
                    ]}
                  />
                  <SelectField label="Micro-Animations" value={localTheme.animation_style} onChange={(v) => updateLocalTheme('animation_style', v as any)}
                    options={[
                      { value: 'none', label: 'None' },
                      { value: 'fade', label: 'Soft Fade' },
                      { value: 'slide', label: 'Slide In' },
                      { value: 'zoom', label: 'Zoom' },
                      { value: 'bounce', label: 'Playful Bounce' },
                    ]}
                  />
                </div>
              </div>

              {/* Product Display */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Product Display</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ToggleField label="Show Images" value={localTheme.show_product_images} onChange={(v) => updateLocalTheme('show_product_images', v)} />
                    <ToggleField label="Show Descriptions" value={localTheme.show_product_description} onChange={(v) => updateLocalTheme('show_product_description', v)} />
                  </div>
                  <SelectField label="Image Aspect Ratio" value={localTheme.image_aspect_ratio} onChange={(v) => updateLocalTheme('image_aspect_ratio', v as any)}
                    options={[
                      { value: 'square', label: 'Square (1:1)' },
                      { value: 'portrait', label: 'Portrait (3:4)' },
                      { value: 'landscape', label: 'Landscape (4:3)' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─── Sections Tab ─── */}
          {activeTab === 'sections' && (
            <SectionEditor
              sections={sections}
              sectionContent={sectionContent}
              onSectionsChange={setSections}
              onSectionContentChange={setSectionContent}
            />
          )}

          {/* ─── Brand Tab ─── */}
          {activeTab === 'brand' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Brand & Logo</h2>
              <p className="mb-4 text-sm text-slate-500">
                Upload a logo for your store header, or paste an image URL.
              </p>
              <div className="space-y-4">
                <ToggleField
                  label="Show logo in store header"
                  value={localTheme.show_logo}
                  onChange={(value) => updateLocalTheme('show_logo', value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Logo Position" value={localTheme.logo_position} onChange={(v) => updateLocalTheme('logo_position', v as any)}
                    options={[
                      { value: 'left', label: 'Left — beside store name' },
                      { value: 'center', label: 'Center — above name' },
                      { value: 'right', label: 'Right — beside cart' },
                    ]}
                  />
                  <SelectField label="Logo Style" value={localTheme.logo_frame} onChange={(v) => updateLocalTheme('logo_frame', v as any)}
                    options={[
                      { value: 'profile', label: 'Profile — circular' },
                      { value: 'rounded', label: 'Rounded square' },
                      { value: 'plain', label: 'Plain — light corners' },
                      { value: 'minimal', label: 'Minimal — compact' },
                    ]}
                  />
                </div>
                <LogoDropzone
                  logoUrl={localTheme.logo_url}
                  onLogoUrlChange={(url) => updateLocalTheme('logo_url', url)}
                />
              </div>
            </div>
          )}

          {/* ─── Advanced Tab ─── */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Custom CSS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Custom CSS</h2>
                <p className="text-sm text-slate-500 mb-4">Add custom CSS that only applies to your storefront. Use with caution.</p>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border-b border-slate-200">
                    <span className="text-xs font-mono text-slate-500">styles.css</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Advanced</span>
                  </div>
                  <textarea
                    value={localTheme.custom_css || ''}
                    onChange={(e) => updateLocalTheme('custom_css', e.target.value)}
                    placeholder={`/* Your custom CSS here */\n.ovd-hero { background: linear-gradient(135deg, #667eea, #764ba2); }\n.ovd-product-card { border: 2px solid gold; }`}
                    rows={12}
                    className="w-full px-4 py-3 font-mono text-xs text-slate-700 bg-slate-900 text-green-300 outline-none resize-none"
                    spellCheck={false}
                  />
                </div>
                <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs text-amber-700">
                    ⚠️ Custom CSS is scoped to your storefront only. Avoid using <code className="bg-amber-100 px-1 rounded">!important</code> unless necessary.
                    Malicious code like <code className="bg-amber-100 px-1 rounded">{`<script>`}</code> will be stripped.
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h2>
                <p className="text-sm text-slate-500 mb-4">These actions are irreversible.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset everything to the default template? This cannot be undone.')) {
                      pushHistory();
                      setLocalTheme({
                        ...theme,
                        template_id: 'fresh-market',
                        logo_position: 'left',
                        logo_frame: 'profile',
                        surface_color: '#ffffff',
                        heading_color: '#0f172a',
                        border_color: '#e2e8f0',
                        card_shadow: 'soft',
                        custom_css: '',
                      } as StoreTheme);
                      setSections(getDefaultSections());
                      setSectionContent(getDefaultSectionContent());
                    }
                  }}
                  className="rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  🗑️ Reset to Factory Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
            {vendorSlug ? (
              <>
                <div className="aspect-[9/16] rounded-xl border-2 border-slate-200 overflow-hidden">
                  <iframe
                    ref={previewFrameRef}
                    src={`/s/${vendorSlug}?preview=true`}
                    className="w-full h-full"
                    title="Store Preview"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Live preview of your store
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Set your store slug in Settings to enable live preview.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          {state.message && (
            <p className={`text-sm font-medium ${state.message.includes('success') || state.message.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>
              {state.message}
            </p>
          )}
          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={future.length === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              pushHistory();
              setLocalTheme({
                ...theme,
                template_id: theme.template_id ?? 'fresh-market',
                logo_position: theme.logo_position ?? 'left',
                logo_frame: theme.logo_frame ?? 'profile',
                surface_color: theme.surface_color ?? '#ffffff',
                heading_color: theme.heading_color ?? '#0f172a',
                border_color: theme.border_color ?? '#e2e8f0',
                card_shadow: theme.card_shadow ?? 'soft',
              });
              setSections(safeParse(theme.sections, getDefaultSections()));
              setSectionContent(safeParse(theme.section_content, getDefaultSectionContent()));
            }}
            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving || !hasUnsavedChanges}
            className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:opacity-50 ${
              hasUnsavedChanges ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-slate-400'
            }`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved ✓'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Shared sub-components ────────────────────────────────────

function ColorInput({ label, value, onChange, contrastAgainst }: { label: string; value: string; onChange: (val: string) => void; contrastAgainst?: string }) {
  const badge = contrastAgainst && value.match(/^#[0-9a-fA-F]{6}$/) && contrastAgainst.match(/^#[0-9a-fA-F]{6}$/)
    ? contrastBadge(value, contrastAgainst)
    : null;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {badge && <span className={`text-[10px] font-semibold ${badge.color}`}>{badge.label}</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 rounded-lg border border-slate-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
      <span className="text-sm text-slate-700">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-500"
      />
    </label>
  );
}
