'use client';

import { useState } from 'react';
import { updateCustomerSettings } from '@/app/lib/customer-actions';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/app/ui/store/location-picker'), { ssr: false });

export default function SettingsForm({ customer, customerId }: { customer: any, customerId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Map state
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number, lng: number } | null>(
    customer.delivery_latitude && customer.delivery_longitude 
      ? { lat: customer.delivery_latitude, lng: customer.delivery_longitude }
      : null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    if (deliveryLocation) {
      formData.append('delivery_latitude', deliveryLocation.lat.toString());
      formData.append('delivery_longitude', deliveryLocation.lng.toString());
    }

    const result = await updateCustomerSettings(formData, customerId);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }
    
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={customer.name}
            required
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            defaultValue={customer.email}
            disabled
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="whatsapp_number">WhatsApp Number</label>
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            defaultValue={customer.whatsapp_number || ''}
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="delivery_address">General Address</label>
          <input
            id="delivery_address"
            name="delivery_address"
            type="text"
            defaultValue={customer.delivery_address || ''}
            placeholder="E.g., 123 Main St, Lagos"
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Default Delivery Location (Map)</h3>
        <p className="text-sm text-slate-500 mb-4">Pinpoint your exact location to make deliveries faster and more accurate.</p>
        <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 mb-4">
          <LocationPicker 
            onLocationSelect={setDeliveryLocation} 
            initialLocation={deliveryLocation || undefined} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="delivery_address_details">Specific Instructions</label>
          <textarea
            id="delivery_address_details"
            name="delivery_address_details"
            rows={3}
            defaultValue={customer.delivery_address_details || ''}
            placeholder="E.g., Second gate on the right, call when you arrive."
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70 transition"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
