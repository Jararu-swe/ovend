'use client';

import { useState } from 'react';
import { StoreTheme } from '@/app/lib/definitions';
import { updateThemeAction } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function CustomizeForm({ theme, vendorSlug }: { theme: StoreTheme; vendorSlug: string }) {
  const [localTheme, setLocalTheme] = useState(theme);
  const [state, formAction] = useActionState(updateThemeAction, { message: null, errors: {} });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await formAction(formData);
    setIsSaving(false);
  };

  const updateLocalTheme = (key: keyof StoreTheme, value: any) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Primary Color"
                name="primary_color"
                value={localTheme.primary_color}
                onChange={(val) => updateLocalTheme('primary_color', val)}
              />
              <ColorInput
                label="Secondary Color"
                name="secondary_color"
                value={localTheme.secondary_color}
                onChange={(val) => updateLocalTheme('secondary_color', val)}
              />
              <ColorInput
                label="Background"
                name="background_color"
                value={localTheme.background_color}
                onChange={(val) => updateLocalTheme('background_color', val)}
              />
              <ColorInput
                label="Text Color"
                name="text_color"
                value={localTheme.text_color}
                onChange={(val) => updateLocalTheme('text_color', val)}
              />
            </div>
          </div>

          {/* Layout Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Layout</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Layout Style
                </label>
                <select
                  name="layout_style"
                  value={localTheme.layout_style}
                  onChange={(e) => updateLocalTheme('layout_style', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                  <option value="masonry">Masonry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Style
                </label>
                <select
                  name="card_style"
                  value={localTheme.card_style}
                  onChange={(e) => updateLocalTheme('card_style', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Border Radius
                </label>
                <select
                  name="border_radius"
                  value={localTheme.border_radius}
                  onChange={(e) => updateLocalTheme('border_radius', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="sharp">Sharp</option>
                  <option value="rounded">Rounded</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Typography</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Font Family
                </label>
                <select
                  name="font_family"
                  value={localTheme.font_family}
                  onChange={(e) => updateLocalTheme('font_family', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="inter">Inter</option>
                  <option value="poppins">Poppins</option>
                  <option value="roboto">Roboto</option>
                  <option value="playfair">Playfair Display</option>
                  <option value="montserrat">Montserrat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Font Size
                </label>
                <select
                  name="font_size"
                  value={localTheme.font_size}
                  onChange={(e) => updateLocalTheme('font_size', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
            <div className="aspect-[9/16] rounded-xl border-2 border-slate-200 overflow-hidden">
              <iframe
                src={`/s/${vendorSlug}?preview=true`}
                className="w-full h-full"
                title="Store Preview"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Live preview of your store
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setLocalTheme(theme)}
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

      {state.message && (
        <p className={`text-sm font-medium text-center ${state.message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function ColorInput({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (val: string) => void }) {
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
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
