'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { updateThemeAction } from '@/app/lib/actions';
import { useActionState } from 'react';
import LogoDropzone from '@/app/ui/customize/logo-dropzone';
import TemplatePicker from '@/app/ui/customize/template-picker';
import SectionEditor from '@/app/ui/customize/section-editor';
import { Template, TemplateSection, TemplateSectionContent, getDefaultSections, getDefaultSectionContent } from '@/app/lib/template-presets';

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

  const [state, formAction] = useActionState(updateThemeAction, { message: null, errors: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'colors' | 'layout' | 'sections' | 'brand'>('templates');
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    setIsSaving(false);
  };

  const updateLocalTheme = useCallback((key: keyof StoreTheme, value: any) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  }, []);

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
                  <ColorInput label="Primary" value={localTheme.primary_color} onChange={(v) => updateLocalTheme('primary_color', v)} />
                  <ColorInput label="Secondary" value={localTheme.secondary_color} onChange={(v) => updateLocalTheme('secondary_color', v)} />
                  <ColorInput label="Background" value={localTheme.background_color} onChange={(v) => updateLocalTheme('background_color', v)} />
                  <ColorInput label="Surface" value={localTheme.surface_color} onChange={(v) => updateLocalTheme('surface_color', v)} />
                  <ColorInput label="Text" value={localTheme.text_color} onChange={(v) => updateLocalTheme('text_color', v)} />
                  <ColorInput label="Headings" value={localTheme.heading_color} onChange={(v) => updateLocalTheme('heading_color', v)} />
                  <ColorInput label="Accent" value={localTheme.accent_color} onChange={(v) => updateLocalTheme('accent_color', v)} />
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
        <div>
          {state.message && (
            <p className={`text-sm font-medium ${state.message.includes('success') || state.message.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>
              {state.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
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
            disabled={isSaving}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Shared sub-components ────────────────────────────────────

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
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
