'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  TagIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { createProduct, State } from '@/app/lib/actions';
import ImageUpload from './image-upload';
import MultiImageUpload from './multi-image-upload';

export default function CreateProductForm() {
  const initialState: State = { message: '', errors: {} };
  const [state, formAction, isPending] = useActionState(createProduct as any, initialState as any);
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Track Inventory Toggle
  const [trackQuantity, setTrackQuantity] = useState(false);

  // Variant Options State
  const [options, setOptions] = useState<{ id: string; name: string; price: string }[]>([]);

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), name: '', price: '' }]);
  };
  
  const removeOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
  };
  
  const updateOption = (id: string, field: 'name' | 'price', value: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden Fields for complex JSON structures */}
      <input type="hidden" name="image_url" value={mainImage} />
      <input type="hidden" name="gallery_images" value={JSON.stringify(galleryImages)} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      {!trackQuantity && <input type="hidden" name="stock_quantity" value="" />}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Basic Details</h2>
        <div className="space-y-4">
          
          {/* Product Images section */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Main Formular Image</label>
              <ImageUpload value={mainImage} onChange={setMainImage} onRemove={() => setMainImage('')} />
              <p className="mt-2 text-xs text-slate-400">Main photo visible on the storefront grid</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gallery Images</label>
              <MultiImageUpload 
                value={galleryImages} 
                onChange={setGalleryImages} 
                onRemove={(urlToRemove) => setGalleryImages(galleryImages.filter(url => url !== urlToRemove))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
              <div className="relative">
                <input
                  id="name" name="name" type="text" placeholder="e.g. Ankara Two-Piece"
                  defaultValue={state.values?.name || ''}
                  className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
              {state.errors?.name && <p className="mt-1 text-xs text-red-500">{state.errors.name[0]}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">Category Tag</label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  defaultValue={state.values?.category || ''}
                  className="peer block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="Food & Drinks">Food & Drinks</option>
                  <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                  <option value="Clothing & Fashion">Clothing & Fashion</option>
                  <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Art & Craft">Art & Craft</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Base Price */}
             <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">Selling Price (NGN)</label>
              <div className="relative">
                <input
                  id="price" name="price" type="number" step="1" min="0" placeholder="0"
                  defaultValue={state.values?.price || ''}
                  required
                  className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm outline-none focus:border-emerald-500"
                />
                <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
              {state.errors?.price && <p className="mt-1 text-xs text-red-500">{state.errors.price[0]}</p>}
            </div>

            {/* Compare at Price */}
            <div>
              <label htmlFor="compare_at_price" className="mb-2 block text-sm font-medium text-slate-700">Original Price (Show Discount)</label>
              <div className="relative">
                <input
                  id="compare_at_price" name="compare_at_price" type="number" step="1" placeholder="e.g. 50000"
                  defaultValue={state.values?.compare_at_price || ''}
                  className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm outline-none focus:border-emerald-500"
                />
                <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <div className="relative">
              <textarea
                id="description" name="description" rows={3} placeholder="Tell customers about this product..."
                defaultValue={state.values?.description || ''}
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm outline-none focus:border-emerald-500"
              ></textarea>
              <DocumentTextIcon className="pointer-events-none absolute left-3 top-7 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            {state.errors?.description && <p className="mt-1 text-xs text-red-500">{state.errors.description[0]}</p>}
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <h2 className="mb-4 text-lg font-bold text-slate-800">Inventory</h2>
           <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={trackQuantity} onChange={(e) => setTrackQuantity(e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Track limited quantity (e.g. 1 pair left)</span>
           </label>
           
           {trackQuantity && (
             <div className="mt-4">
               <label htmlFor="stock_quantity" className="mb-2 block text-sm font-medium text-slate-700">How many available?</label>
               <input
                 id="stock_quantity" name="stock_quantity" type="number" step="1" min="0" placeholder="e.g. 5"
                 defaultValue={state.values?.stock_quantity || ''}
                 className="block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm outline-none focus:border-emerald-500"
               />
             </div>
           )}
           
          <div className="mt-6 border-t border-slate-100 pt-6">
             <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_digital" className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                <span className="text-sm font-medium text-slate-700">This is a digital product (no delivery required)</span>
             </label>
           </div>

           <div className="mt-6 border-t border-slate-100 pt-6">
             <legend className="mb-3 block text-sm font-medium text-slate-700">Visibility Status</legend>
             <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <input type="radio" name="status" value="active" defaultChecked={state.values?.status ? state.values.status === 'active' : true} className="h-4 w-4 border-slate-300 text-emerald-600" />
                  Active <CheckIcon className="h-4 w-4" />
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                  <input type="radio" name="status" value="inactive" defaultChecked={state.values?.status === 'inactive'} className="h-4 w-4 border-slate-300 text-slate-600" />
                  Hidden
                </label>
             </div>
           </div>
        </div>

        {/* Options/Variants Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800">Add-ons & Options</h2>
             <button type="button" onClick={addOption} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
               <PlusIcon className="h-4 w-4" /> Add Option
             </button>
           </div>
           
           <p className="text-xs text-slate-500 mb-4 pb-2 border-b border-slate-50">
             Useful for sizes (UK 41), storage (64GB), or food portions (2 Litres). Leave price blank if it doesn't add extra cost.
           </p>

           {options.length === 0 ? (
             <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No options added. Product has only one base form.
             </div>
           ) : (
             <div className="space-y-3">
               {options.map((opt) => (
                 <div key={opt.id} className="flex gap-2 items-start">
                   <div className="flex-1">
                     <input type="text" placeholder="Option Name (e.g. Size 45)" value={opt.name} onChange={(e) => updateOption(opt.id, 'name', e.target.value)} className="w-full text-sm rounded-lg border-slate-200 py-2" required />
                   </div>
                   <div className="w-1/3">
                     <input type="number" placeholder="Price (NGN)" value={opt.price} onChange={(e) => updateOption(opt.id, 'price', e.target.value)} className="w-full text-sm rounded-lg border-slate-200 py-2" />
                   </div>
                   <button type="button" onClick={() => removeOption(opt.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                     <TrashIcon className="h-5 w-5" />
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link href="/dashboard/products" className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : 'Publish Product'}
        </button>
      </div>

      {state.message && <p className="mt-2 text-sm text-red-500 font-bold text-center">{state.message}</p>}
    </form>
  );
}
