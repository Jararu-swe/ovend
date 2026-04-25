'use client';

import { useState, useCallback } from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { Template, TemplateSection, TemplateSectionContent } from '@/app/lib/template-presets';
import TemplatePicker from '@/app/ui/customize/template-picker';
import SectionEditor from '@/app/ui/customize/section-editor';
import ColorsPanel from '@/app/ui/customize/panels/colors-panel';
import TypographyPanel from '@/app/ui/customize/panels/typography-panel';
import LayoutPanel from '@/app/ui/customize/panels/layout-panel';
import ButtonsPanel from '@/app/ui/customize/panels/buttons-panel';
import BrandPanel from '@/app/ui/customize/panels/brand-panel';
import AdvancedPanel from '@/app/ui/customize/panels/advanced-panel';
import IconographyPanel from '@/app/ui/customize/panels/iconography-panel';

type PanelId = 'home' | 'themes' | 'sections' | 'section-detail' | 'colors' | 'typography' | 'layout' | 'buttons' | 'brand' | 'iconography' | 'advanced';

interface EditorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  localTheme: StoreTheme;
  onThemeChange: (key: keyof StoreTheme, value: any) => void;
  onApplyTemplate: (template: Template) => void;
  sections: TemplateSection[];
  sectionContent: TemplateSectionContent;
  onSectionsChange: (sections: TemplateSection[]) => void;
  onSectionContentChange: (content: TemplateSectionContent) => void;
  onResetDefaults: () => void;
}

type PanelHistoryEntry = { id: PanelId; label: string; sectionId?: string };

export default function EditorSidebar({
  isOpen,
  onToggle,
  localTheme,
  onThemeChange,
  onApplyTemplate,
  sections,
  sectionContent,
  onSectionsChange,
  onSectionContentChange,
  onResetDefaults,
}: EditorSidebarProps) {
  const [panelStack, setPanelStack] = useState<PanelHistoryEntry[]>([{ id: 'home', label: 'Customize' }]);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');

  const currentPanel = panelStack[panelStack.length - 1];

  const pushPanel = useCallback((entry: PanelHistoryEntry) => {
    setSlideDir('left');
    setPanelStack((prev) => [...prev, entry]);
  }, []);

  const popPanel = useCallback(() => {
    if (panelStack.length <= 1) return;
    setSlideDir('right');
    setPanelStack((prev) => prev.slice(0, -1));
  }, [panelStack.length]);

  const homeItems: { id: PanelId; icon: React.ReactNode; label: string; description: string }[] = [
    {
      id: 'themes',
      label: 'Themes',
      description: 'Browse and apply store themes',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" /></svg>,
    },
    {
      id: 'brand',
      label: 'Brand & Logo',
      description: 'Logo, position & store identity',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>,
    },
    {
      id: 'sections',
      label: 'Sections',
      description: 'Add, remove & reorder page sections',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>,
    },
    {
      id: 'colors',
      label: 'Colors',
      description: 'Customize your color palette',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" /></svg>,
    },
    {
      id: 'typography',
      label: 'Typography',
      description: 'Fonts, sizes & text styling',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>,
    },
    {
      id: 'layout',
      label: 'Layout & Cards',
      description: 'Grid style, spacing & product display',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z" /></svg>,
    },
    {
      id: 'buttons',
      label: 'Buttons & Animations',
      description: 'Button style, radius & micro-animations',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" /></svg>,
    },
    {
      id: 'iconography',
      label: 'Iconography',
      description: 'Icon library, style & weight',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>,
    },
    {
      id: 'advanced',
      label: 'Store Settings',
      description: 'Custom CSS & dynamic effects',
      icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3l2 1" /></svg>,
    },
  ];

  return (
    <>
      <div
        className={`flex h-full flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="flex h-full w-[360px] flex-col p-4 bg-slate-50/30">
          <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Panel header with back navigation */}
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 px-4 bg-white/50 backdrop-blur-sm">
              {panelStack.length > 1 ? (
                <button
                  type="button"
                  onClick={popPanel}
                  className="group flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-500 transition-all hover:bg-slate-900 hover:text-white"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                  title="Collapse sidebar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                </button>
              )}
              <span className="text-sm font-black uppercase tracking-widest text-slate-800">{currentPanel.label}</span>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="animate-in fade-in duration-200">
                {/* Home panel */}
                {currentPanel.id === 'home' && (
                  <div className="p-3 space-y-1">
                    {homeItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => pushPanel({ id: item.id, label: item.label })}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-slate-50 group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{item.label}</span>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.description}</p>
                        </div>
                        <svg className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* Themes panel */}
                {currentPanel.id === 'themes' && (
                  <TemplatePicker
                    activeTemplateId={localTheme.template_id}
                    onSelect={onApplyTemplate}
                  />
                )}

                {/* Sections panel */}
                {currentPanel.id === 'sections' && (
                  <SectionEditor
                    sections={sections}
                    sectionContent={sectionContent}
                    onSectionsChange={onSectionsChange}
                    onSectionContentChange={onSectionContentChange}
                  />
                )}

                {/* Colors panel */}
                {currentPanel.id === 'colors' && (
                  <ColorsPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Typography panel */}
                {currentPanel.id === 'typography' && (
                  <TypographyPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Layout panel */}
                {currentPanel.id === 'layout' && (
                  <LayoutPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Buttons panel */}
                {currentPanel.id === 'buttons' && (
                  <ButtonsPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Brand panel */}
                {currentPanel.id === 'brand' && (
                  <BrandPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Iconography panel */}
                {currentPanel.id === 'iconography' && (
                  <IconographyPanel theme={localTheme} onChange={onThemeChange} />
                )}

                {/* Advanced panel */}
                {currentPanel.id === 'advanced' && (
                  <AdvancedPanel theme={localTheme} onChange={onThemeChange} onResetDefaults={onResetDefaults} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="fixed left-2 top-[72px] z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          title="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </>
  );
}
