'use client';

import { StoreTheme } from '@/app/lib/definitions';
import { SparklesIcon } from '@heroicons/react/24/outline'; // heroicons
import { ShoppingBag as LucideShoppingBag } from 'lucide-react'; // Example lucide usage later

export default function IconographyPanel({
  theme,
  onChange,
}: {
  theme: StoreTheme;
  onChange: (key: keyof StoreTheme, value: any) => void;
}) {
  return (
    <div className="p-5 space-y-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Icon Library</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">Choose the primary icon set for your store navigation and UI.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'heroicons', label: 'Heroicons', stroke: '2px' },
            { value: 'lucide', label: 'Lucide', stroke: '1.5px' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('icon_library', opt.value)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                theme.icon_library === opt.value
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SparklesIcon className="h-6 w-6" strokeWidth={opt.stroke} />
              <span className="text-xs font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Icon Fill</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'outline', label: 'Outline' },
            { value: 'solid', label: 'Solid' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('icon_fill', opt.value)}
              className={`flex items-center justify-center rounded-lg border py-2.5 transition-all text-xs font-medium ${
                theme.icon_fill === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Icon Weight</h3>
        <select
          value={theme.icon_weight}
          onChange={(e) => onChange('icon_weight', e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="light">Light (1px)</option>
          <option value="regular">Regular (1.5px)</option>
          <option value="bold">Bold (2px)</option>
        </select>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Cart Icon Style</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'shopping-bag', label: 'Bag' },
            { value: 'shopping-cart', label: 'Cart' },
            { value: 'basket', label: 'Basket' },
            { value: 'tote', label: 'Tote' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('cart_icon', opt.value)}
              className={`flex items-center justify-center rounded-lg border py-2.5 transition-all text-xs font-medium ${
                theme.cart_icon === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">User Profile Icon</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'user', label: 'User' },
            { value: 'face', label: 'Face' },
            { value: 'smile', label: 'Smile' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('user_icon', opt.value)}
              className={`flex items-center justify-center rounded-lg border py-2 transition-all text-xs font-medium ${
                theme.user_icon === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Share Icon</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'arrow-square', label: 'Box Arrow' },
            { value: 'paper-plane', label: 'Plane' },
            { value: 'arrow-curve', label: 'Curve' },
            { value: 'dots', label: 'Dots' },
            { value: 'nodes', label: 'Nodes' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('share_icon', opt.value)}
              className={`flex items-center justify-center rounded-lg border py-2 transition-all text-xs font-medium ${
                theme.share_icon === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Add to Cart Button Icon</h3>
        <p className="text-[10px] text-slate-500 mb-2">The icon explicitly shown on product grids for quick-add.</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'plus', label: 'Plus' },
            { value: 'bag', label: 'Bag' },
            { value: 'cart', label: 'Cart' },
            { value: 'arrow', label: 'Arrow' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('add_icon', opt.value)}
              className={`flex items-center justify-center rounded-lg border py-2 transition-all text-xs font-medium ${
                theme.add_icon === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
