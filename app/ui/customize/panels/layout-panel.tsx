'use client';

import { StoreTheme } from '@/app/lib/definitions';

interface LayoutPanelProps {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}

function VisualSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; visual: React.ReactNode }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">{label}</label>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 transition-all ${
              value === opt.value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
            }`}
          >
            {opt.visual}
            <span className="text-[10px] font-semibold">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LayoutPanel({ theme, onChange }: LayoutPanelProps) {
  return (
    <div className="p-4 space-y-5">
      {/* Layout Style */}
      <VisualSelect
        label="Layout Style"
        value={theme.layout_style}
        onChange={(v) => onChange('layout_style', v)}
        options={[
          {
            value: 'grid',
            label: 'Grid',
            visual: <div className="grid grid-cols-2 gap-0.5 w-8 h-8">{[1,2,3,4].map(i => <div key={i} className="rounded-sm bg-current opacity-30" />)}</div>,
          },
          {
            value: 'list',
            label: 'List',
            visual: <div className="flex flex-col gap-0.5 w-8 h-8">{[1,2,3].map(i => <div key={i} className="rounded-sm bg-current opacity-30 h-2" />)}</div>,
          },
          {
            value: 'masonry',
            label: 'Masonry',
            visual: <div className="grid grid-cols-2 gap-0.5 w-8 h-8"><div className="rounded-sm bg-current opacity-30 row-span-2" /><div className="rounded-sm bg-current opacity-30" /><div className="rounded-sm bg-current opacity-30" /></div>,
          },
        ]}
      />

      {/* Card Style */}
      <VisualSelect
        label="Card Style"
        value={theme.card_style}
        onChange={(v) => onChange('card_style', v)}
        options={[
          {
            value: 'modern',
            label: 'Modern',
            visual: <div className="w-8 h-8 rounded-lg border border-current/20 bg-current/5 shadow-sm" />,
          },
          {
            value: 'classic',
            label: 'Classic',
            visual: <div className="w-8 h-8 rounded-md border-2 border-current/20 bg-current/5" />,
          },
          {
            value: 'minimal',
            label: 'Minimal',
            visual: <div className="w-8 h-8 rounded-sm bg-current/5" />,
          },
          {
            value: 'bold',
            label: 'Bold',
            visual: <div className="w-8 h-8 rounded-lg border-2 border-current/40 bg-current/5 shadow-[2px_2px_0_currentColor] opacity-30" />,
          },
        ]}
      />

      {/* Border Radius */}
      <VisualSelect
        label="Corner Radius"
        value={theme.border_radius}
        onChange={(v) => onChange('border_radius', v)}
        options={[
          {
            value: 'sharp',
            label: 'Sharp',
            visual: <div className="w-8 h-8 rounded-none border-2 border-current/30 bg-current/5" />,
          },
          {
            value: 'rounded',
            label: 'Rounded',
            visual: <div className="w-8 h-8 rounded-lg border-2 border-current/30 bg-current/5" />,
          },
          {
            value: 'pill',
            label: 'Pill',
            visual: <div className="w-8 h-8 rounded-2xl border-2 border-current/30 bg-current/5" />,
          },
        ]}
      />

      {/* Card Shadow */}
      <VisualSelect
        label="Card Shadow"
        value={theme.card_shadow}
        onChange={(v) => onChange('card_shadow', v)}
        options={[
          {
            value: 'none',
            label: 'None',
            visual: <div className="w-8 h-8 rounded-md border border-slate-200 bg-white" />,
          },
          {
            value: 'soft',
            label: 'Soft',
            visual: <div className="w-8 h-8 rounded-md border border-slate-100 bg-white shadow-sm" />,
          },
          {
            value: 'elevated',
            label: 'Elevated',
            visual: <div className="w-8 h-8 rounded-md bg-white shadow-lg" />,
          },
          {
            value: 'hard',
            label: 'Offset',
            visual: <div className="w-8 h-8 rounded-md bg-white border border-slate-200 shadow-[3px_3px_0_rgba(0,0,0,0.1)]" />,
          },
        ]}
      />

      {/* Spacing */}
      <VisualSelect
        label="Spacing"
        value={theme.spacing}
        onChange={(v) => onChange('spacing', v)}
        options={[
          {
            value: 'compact',
            label: 'Compact',
            visual: <div className="flex flex-col gap-0.5 w-8 h-8 justify-center">{[1,2,3].map(i => <div key={i} className="rounded-sm bg-current opacity-30 h-1.5" />)}</div>,
          },
          {
            value: 'comfortable',
            label: 'Comfort',
            visual: <div className="flex flex-col gap-1 w-8 h-8 justify-center">{[1,2,3].map(i => <div key={i} className="rounded-sm bg-current opacity-30 h-1.5" />)}</div>,
          },
          {
            value: 'spacious',
            label: 'Spacious',
            visual: <div className="flex flex-col gap-1.5 w-8 h-8 justify-center">{[1,2].map(i => <div key={i} className="rounded-sm bg-current opacity-30 h-1.5" />)}</div>,
          },
        ]}
      />

      {/* Header Style */}
      <VisualSelect
        label="Header Style"
        value={theme.header_style}
        onChange={(v) => onChange('header_style', v)}
        options={[
          { value: 'sticky', label: 'Sticky', visual: <div className="w-8 h-8 flex flex-col"><div className="h-2 bg-current opacity-40 rounded-t-sm" /><div className="flex-1 bg-current/5" /></div> },
          { value: 'static', label: 'Static', visual: <div className="w-8 h-8 flex flex-col"><div className="h-2 bg-current opacity-20 rounded-t-sm" /><div className="flex-1 bg-current/5" /></div> },
          { value: 'transparent', label: 'Float', visual: <div className="w-8 h-8 flex flex-col relative"><div className="absolute top-0 left-0 right-0 h-2 bg-current opacity-10 rounded-t-sm" /><div className="flex-1 bg-current/5 rounded-sm" /></div> },
        ]}
      />

      {/* Product Display */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Product Display</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50 cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Show images</span>
            <input type="checkbox" checked={theme.show_product_images} onChange={(e) => onChange('show_product_images', e.target.checked)} className="h-4 w-4 accent-emerald-500 rounded" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50 cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Show descriptions</span>
            <input type="checkbox" checked={theme.show_product_description} onChange={(e) => onChange('show_product_description', e.target.checked)} className="h-4 w-4 accent-emerald-500 rounded" />
          </label>
        </div>

        {/* Image Aspect Ratio */}
        <div className="mt-3">
          <VisualSelect
            label="Image Ratio"
            value={theme.image_aspect_ratio}
            onChange={(v) => onChange('image_aspect_ratio', v)}
            options={[
              { value: 'square', label: '1:1', visual: <div className="w-6 h-6 rounded-sm border-2 border-current/30 bg-current/5" /> },
              { value: 'portrait', label: '3:4', visual: <div className="w-5 h-7 rounded-sm border-2 border-current/30 bg-current/5" /> },
              { value: 'landscape', label: '4:3', visual: <div className="w-7 h-5 rounded-sm border-2 border-current/30 bg-current/5" /> },
            ]}
          />
        </div>

        {/* Container Width */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <VisualSelect
            label="Container Width"
            value={(theme.container_width as any) || 'standard'}
            onChange={(v) => onChange('container_width', v)}
            options={[
              {
                value: 'narrow',
                label: 'Narrow',
                visual: <div className="w-4 h-8 border-x-2 border-current/30 bg-current/5 mx-auto" />,
              },
              {
                value: 'standard',
                label: 'Standard',
                visual: <div className="w-6 h-8 border-x-2 border-current/20 bg-current/5 mx-auto" />,
              },
              {
                value: 'wide',
                label: 'Wide',
                visual: <div className="w-8 h-8 border-x-2 border-current/20 bg-current/5 mx-auto" />,
              },
              {
                value: 'full',
                label: 'Full',
                visual: <div className="w-full h-8 bg-current/10 rounded-sm" />,
              },
            ]}
          />
        </div>

        {/* Page Width */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <VisualSelect
            label="Page Width"
            value={theme.layout_width}
            onChange={(v) => onChange('layout_width', v)}
            options={[
              { value: 'standard', label: 'Standard', visual: <div className="w-6 h-8 border-x-2 border-current/20 bg-current/5 mx-auto" /> },
              { value: 'wide', label: 'Wide', visual: <div className="w-8 h-8 border-x-2 border-current/20 bg-current/5 mx-auto" /> },
              { value: 'full', label: 'Full', visual: <div className="w-full h-8 bg-current/10 rounded-sm" /> },
            ]}
          />
        </div>

        {/* Mobile Optimisation */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Mobile Optimisation</h3>
          <label className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">Sticky Checkout Bar</span>
              <span className="text-[10px] text-slate-400">Fixed cart button at bottom of mobile</span>
            </div>
            <input 
              type="checkbox" 
              checked={theme.show_mobile_checkout_bar} 
              onChange={(e) => onChange('show_mobile_checkout_bar', e.target.checked)} 
              className="h-4 w-4 accent-emerald-500 rounded" 
            />
          </label>
        </div>
      </div>
    </div>
  );
}

