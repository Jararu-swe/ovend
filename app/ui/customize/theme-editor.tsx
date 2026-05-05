'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { updateThemeAction } from '@/app/lib/actions';
import { useActionState } from 'react';
import { Template, TemplateSection, TemplateSectionContent, getDefaultSections, getDefaultSectionContent } from '@/app/lib/template-presets';
import EditorToolbar from '@/app/ui/customize/editor-toolbar';
import EditorSidebar from '@/app/ui/customize/editor-sidebar';
import EditorPreview from '@/app/ui/customize/editor-preview';

type Viewport = 'desktop' | 'tablet' | 'phone';
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

export default function ThemeEditor({ theme, vendorSlug }: { theme: StoreTheme; vendorSlug: string }) {
  const draftData = useMemo(() => {
    if (!theme.draft_config) return null;
    try {
      return typeof theme.draft_config === 'string' ? JSON.parse(theme.draft_config) : theme.draft_config;
    } catch (e) {
      console.error('Failed to parse draft_config', e);
      return null;
    }
  }, [theme.draft_config]);

  const [localTheme, setLocalTheme] = useState<StoreTheme>(() => ({
    ...theme,
    ...(draftData || {}),
    template_id: draftData?.template_id ?? theme.template_id ?? 'fresh-market',
    logo_position: draftData?.logo_position ?? theme.logo_position ?? 'left',
    surface_color: draftData?.surface_color ?? theme.surface_color ?? '#ffffff',
    heading_color: draftData?.heading_color ?? theme.heading_color ?? '#0f172a',
    border_color: draftData?.border_color ?? theme.border_color ?? '#e2e8f0',
    card_shadow: draftData?.card_shadow ?? theme.card_shadow ?? 'soft',
    primary_gradient: draftData?.primary_gradient ?? theme.primary_gradient ?? null,
    glass_effect: draftData?.glass_effect ?? theme.glass_effect ?? false,
  }));

  const [sections, setSections] = useState<TemplateSection[]>(() =>
    safeParse(draftData?.sections ?? theme.sections, getDefaultSections())
  );
  const [sectionContent, setSectionContent] = useState<TemplateSectionContent>(() =>
    safeParse(draftData?.section_content ?? theme.section_content, getDefaultSectionContent())
  );

  const [state, formAction] = useActionState(updateThemeAction, { message: '', errors: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // ─── Undo / Redo ────────────────────────────────────────────
  const MAX_HISTORY = 30;
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
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
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
      'primary_gradient', 'glass_effect',
    ];
    const base = draftData || theme;
    const baseSections = draftData?.sections ?? theme.sections;
    const baseContent = draftData?.section_content ?? theme.section_content;

    const themeChanged = keys.some((k) => String(localTheme[k] ?? '') !== String(base[k] ?? ''));
    const sectionsChanged = JSON.stringify(sections) !== (typeof baseSections === 'string' ? baseSections : JSON.stringify(baseSections));
    const contentChanged = JSON.stringify(sectionContent) !== (typeof baseContent === 'string' ? baseContent : JSON.stringify(baseContent));

    return themeChanged || sectionsChanged || contentChanged;
  }, [localTheme, theme, draftData, sections, sectionContent]);

  const handleSave = async (isPublish: boolean = true) => {
    if (!formRef.current) return;
    setIsSaving(true);
    const formData = new FormData(formRef.current);
    formData.set('is_publish', isPublish ? 'true' : 'false');
    await formAction(formData);
    setIsSaving(false);
  };

  const updateLocalTheme = useCallback((key: keyof StoreTheme, value: any) => {
    pushHistory();
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  }, [pushHistory]);

  // Apply a template
  const applyTemplate = useCallback((template: Template) => {
    pushHistory();
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
      button_style: t.button_style,
      button_radius: t.button_radius,
      animation_style: t.animation_style,
      spacing: t.spacing,
      header_style: t.header_style,
      image_aspect_ratio: t.image_aspect_ratio,
    }));
    setSections(template.sections);
    setSectionContent(template.sectionContent);
  }, [pushHistory]);

  const resetDefaults = useCallback(() => {
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
  }, [pushHistory, theme]);

  // Send live preview updates to the iframe
  useEffect(() => {
    if (!vendorSlug || !previewFrameRef.current?.contentWindow) return;
    previewFrameRef.current.contentWindow.postMessage(
      {
        type: 'VENDLE_PREVIEW_THEME_UPDATE',
        payload: {
          ...localTheme,
          sections: JSON.stringify(sections),
          section_content: JSON.stringify(sectionContent),
        },
      },
      window.location.origin,
    );
  }, [localTheme, sections, sectionContent, vendorSlug]);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Hidden form for submission */}
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="hidden">
        <input type="hidden" name="template_id" value={localTheme.template_id} />
        <input type="hidden" name="primary_color" value={localTheme.primary_color} />
        <input type="hidden" name="secondary_color" value={localTheme.secondary_color} />
        <input type="hidden" name="background_color" value={localTheme.background_color} />
        <input type="hidden" name="text_color" value={localTheme.text_color} />
        <input type="hidden" name="accent_color" value={localTheme.accent_color} />
        <input type="hidden" name="surface_color" value={localTheme.surface_color} />
        <input type="hidden" name="heading_color" value={localTheme.heading_color} />
        <input type="hidden" name="border_color" value={localTheme.border_color} />
        <input type="hidden" name="font_family" value={localTheme.font_family} />
        <input type="hidden" name="heading_font" value={localTheme.heading_font} />
        <input type="hidden" name="font_size" value={localTheme.font_size} />
        <input type="hidden" name="layout_style" value={localTheme.layout_style} />
        <input type="hidden" name="card_style" value={localTheme.card_style} />
        <input type="hidden" name="border_radius" value={localTheme.border_radius} />
        <input type="hidden" name="card_shadow" value={localTheme.card_shadow} />
        <input type="hidden" name="button_style" value={localTheme.button_style ?? 'solid'} />
        <input type="hidden" name="button_radius" value={localTheme.button_radius ?? 'rounded'} />
        <input type="hidden" name="animation_style" value={localTheme.animation_style ?? 'none'} />
        <input type="hidden" name="spacing" value={localTheme.spacing} />
        <input type="hidden" name="header_style" value={localTheme.header_style} />
        <input type="hidden" name="show_product_images" value={localTheme.show_product_images ? 'true' : 'false'} />
        <input type="hidden" name="show_product_description" value={localTheme.show_product_description ? 'true' : 'false'} />
        <input type="hidden" name="image_aspect_ratio" value={localTheme.image_aspect_ratio} />
        <input type="hidden" name="show_logo" value={localTheme.show_logo ? 'true' : 'false'} />
        <input type="hidden" name="logo_position" value={localTheme.logo_position} />
        <input type="hidden" name="logo_frame" value={localTheme.logo_frame} />
        <input type="hidden" name="logo_url" value={localTheme.logo_url ?? ''} />
        <input type="hidden" name="custom_css" value={localTheme.custom_css ?? ''} />
        <input type="hidden" name="primary_gradient" value={localTheme.primary_gradient ?? ''} />
        <input type="hidden" name="glass_effect" value={localTheme.glass_effect ? 'true' : 'false'} />
        <input type="hidden" name="sections" value={JSON.stringify(sections)} />
        <input type="hidden" name="section_content" value={JSON.stringify(sectionContent)} />
      </form>

      {/* Toolbar */}
      <EditorToolbar
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={() => handleSave(true)}
        onSaveDraft={() => handleSave(false)}
        statusMessage={state.message}
      />

      {/* Main area: Sidebar + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          localTheme={localTheme}
          onThemeChange={updateLocalTheme}
          onApplyTemplate={applyTemplate}
          sections={sections}
          sectionContent={sectionContent}
          onSectionsChange={setSections}
          onSectionContentChange={setSectionContent}
          onResetDefaults={resetDefaults}
        />

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          <EditorPreview
            vendorSlug={vendorSlug}
            viewport={viewport}
            iframeRef={previewFrameRef}
          />
        </div>
      </div>
    </div>
  );
}
