'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { updateProduct, State } from '@/app/lib/actions';
import { ProductForm } from '@/app/lib/definitions';
import ImageUpload from './image-upload';

export default function EditProductForm({ product }: { product: ProductForm }) {
  const initialState: State = { message: null, errors: {} };
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction] = useActionState(updateProductWithId, initialState);
  const [imageUrl, setImageUrl] = useState(product.image_url || '');

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Product Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Image
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              onRemove={() => setImageUrl('')}
            />
            <input type="hidden" name="image_url" value={imageUrl} />
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Product Name
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={product.name}
                placeholder="e.g. Ankara Two-Piece Set"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                aria-describedby="name-error"
              />
              <TagIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
            {state.errors?.name && (
              <div id="name-error" aria-live="polite" className="mt-2 text-sm text-red-500">
                {state.errors.name.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Product Price */}
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">
              Price (NGN)
            </label>
            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product.price}
                placeholder="0.00"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                aria-describedby="price-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
            {state.errors?.price && (
              <div id="price-error" aria-live="polite" className="mt-2 text-sm text-red-500">
                {state.errors.price.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={product.description}
                placeholder="Describe your product for customers..."
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                aria-describedby="description-error"
              ></textarea>
              <DocumentTextIcon className="pointer-events-none absolute left-3 top-7 h-5 w-5 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
            {state.errors?.description && (
              <div id="description-error" aria-live="polite" className="mt-2 text-sm text-red-500">
                {state.errors.description.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">
              Set the product status
            </legend>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="active"
                  name="status"
                  type="radio"
                  value="active"
                  defaultChecked={product.status === 'active'}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="active"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  Active <CheckIcon className="h-3 w-3" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="inactive"
                  name="status"
                  type="radio"
                  value="inactive"
                  defaultChecked={product.status === 'inactive'}
                  className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <label
                  htmlFor="inactive"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                >
                  Inactive
                </label>
              </div>
            </div>
            {state.errors?.status && (
              <div id="status-error" aria-live="polite" className="mt-2 text-sm text-red-500">
                {state.errors.status.map((error: string) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </fieldset>


        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/products"
          className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
        >
          Update Product
        </button>
      </div>

      {state.message && (
        <p className="mt-2 text-sm text-red-500 font-medium text-center">{state.message}</p>
      )}
    </form>
  );
}
