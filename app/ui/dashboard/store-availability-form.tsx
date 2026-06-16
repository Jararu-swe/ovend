"use client";

import { User } from "@/app/lib/definitions";
import { updateProfile, State } from "@/app/lib/actions";
import { useActionState, useState, useEffect, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import {
  STORE_DAY_KEYS,
  StoreHoursDayKey,
  StoreHoursSlot,
  StoreHoursJson,
} from "@/app/lib/store-availability";

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Saving...
        </>
      ) : (
        text
      )}
    </button>
  );
}

const LocationPicker = dynamic(() => import("@/app/ui/store/location-picker"), {
  ssr: false,
});

function parseStoreHours(store_hours: unknown): StoreHoursJson {
  if (!store_hours) return {};
  try {
    const parsed =
      typeof store_hours === "string" ? JSON.parse(store_hours) : store_hours;
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as StoreHoursJson;
    }
  } catch {
    // ignore
  }
  return {};
}

function ensureArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

const DEFAULT_SLOT = { open: "09:00", close: "18:00" };

const DAY_LABELS: Record<StoreHoursDayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export default function StoreAvailabilityForm({ user }: { user: User }) {
  const router = useRouter();
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(
    updateProfile as any,
    initialState,
  );
  
  // Make sound functionality optional - no longer requires SoundProvider
  const playSound = useCallback((soundType: string) => {
    // Sound disabled for now - can be re-enabled when SoundProvider is added back
    console.log(`Sound would play: ${soundType}`);
  }, []);

  // Initialize state
  const [acceptingOrders, setAcceptingOrders] = useState(
    user.accepting_orders !== false,
  );
  const [storeClosedNote, setStoreClosedNote] = useState(
    user.store_closed_note || "",
  );
  const [storeHours, setStoreHours] = useState<StoreHoursJson>(() =>
    parseStoreHours(user.store_hours),
  );

  // Pickup location state (from user.delivery_* fields)
  const [offersPickup, setOffersPickup] = useState(
    !!(user.delivery_latitude && user.delivery_longitude),
  );
  const [pickupLatitude, setPickupLatitude] = useState<number | null>(
    user.delivery_latitude || null,
  );
  const [pickupLongitude, setPickupLongitude] = useState<number | null>(
    user.delivery_longitude || null,
  );
  const [pickupAddressDetails, setPickupAddressDetails] = useState(
    user.delivery_address_details || "",
  );
  const [pickupAddress, setPickupAddress] = useState(
    user.delivery_address || "",
  );

  // Play success sound on save
  useEffect(() => {
    if (state.message?.includes("Success")) {
      playSound("success");
      // Refresh page data after successful save
      setTimeout(() => {
        router.refresh();
      }, 500);
    }
  }, [state.message, playSound, router]);

  // Sync form state when user data changes (e.g., when returning to page)
  useEffect(() => {
    setAcceptingOrders(user.accepting_orders !== false);
    setStoreClosedNote(user.store_closed_note || "");
    setStoreHours(parseStoreHours(user.store_hours));
    setOffersPickup(!!(user.delivery_latitude && user.delivery_longitude));
    setPickupLatitude(user.delivery_latitude || null);
    setPickupLongitude(user.delivery_longitude || null);
    setPickupAddressDetails(user.delivery_address_details || "");
    setPickupAddress(user.delivery_address || "");
  }, [user]);

  // Helper functions for store hours
  const addSlot = (day: StoreHoursDayKey) => {
    setStoreHours((prev) => ({
      ...prev,
      [day]: [...ensureArray(prev[day]), { ...DEFAULT_SLOT }],
    }));
  };

  const removeSlot = (day: StoreHoursDayKey, index: number) => {
    setStoreHours((prev) => {
      const currentSlots = ensureArray(prev[day]);
      const newSlots = currentSlots.filter((_, i) => i !== index);
      return { ...prev, [day]: newSlots.length > 0 ? newSlots : undefined };
    });
  };

  const updateSlot = (
    day: StoreHoursDayKey,
    index: number,
    field: keyof StoreHoursSlot,
    value: string,
  ) => {
    setStoreHours((prev) => {
      const currentSlots = ensureArray(prev[day]);
      const newSlots = [...currentSlots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, [day]: newSlots };
    });
  };

  const toggleDay = (day: StoreHoursDayKey) => {
    setStoreHours((prev) => {
      if (prev[day]) {
        // Remove the day
        const { [day]: _, ...rest } = prev;
        return rest;
      } else {
        // Add the day with a default slot
        return { ...prev, [day]: [DEFAULT_SLOT] };
      }
    });
  };

  const handlePickupToggle = (enabled: boolean) => {
    setOffersPickup(enabled);
    if (!enabled) {
      setPickupLatitude(null);
      setPickupLongitude(null);
      setPickupAddressDetails("");
      setPickupAddress("");
    }
  };

  const handleLocationSelect = (lat: number, lng: number, details?: string) => {
    setPickupLatitude(lat);
    setPickupLongitude(lng);
    if (details && !pickupAddressDetails) {
      setPickupAddressDetails(details);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      {/* Success/Error Message */}
      {state.message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${state.message.includes("Success") ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}
        >
          {state.message.includes("Success") ? (
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">{state.message}</span>
        </div>
      )}

      {/* Hidden fields for ProfileSchema */}
      <input type="hidden" name="store_name" value={user.store_name} />
      <input type="hidden" name="store_slug" value={user.store_slug} />
      <input
        type="hidden"
        name="store_description"
        value={user.store_description || ""}
      />
      <input
        type="hidden"
        name="whatsapp_number"
        value={user.whatsapp_number || ""}
      />
      <input type="hidden" name="bank_name" value={user.bank_name || ""} />
      <input
        type="hidden"
        name="account_number"
        value={user.account_number || ""}
      />
      <input
        type="hidden"
        name="account_name"
        value={user.account_name || ""}
      />
      <input type="hidden" name="category" value={user.category || ""} />
      <input
        type="hidden"
        name="location_state"
        value={user.location_state || ""}
      />
      <input
        type="hidden"
        name="store_timezone"
        value={user.store_timezone || "Africa/Lagos"}
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Store Availability
        </h2>

        {/* Accepting Orders Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-sm font-bold text-slate-700 cursor-pointer">
              Accepting orders
            </label>
            <p className="text-xs text-slate-500 mt-1">
              {acceptingOrders
                ? "Your store is open for business"
                : "Your store is temporarily closed"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="accepting_orders"
              checked={acceptingOrders}
              onChange={(e) => setAcceptingOrders(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Store Closed Note */}
        {!acceptingOrders && (
          <div className="mb-6">
            <label
              htmlFor="store_closed_note"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Closed note (Optional)
            </label>
            <textarea
              id="store_closed_note"
              name="store_closed_note"
              rows={2}
              maxLength={200}
              value={storeClosedNote}
              onChange={(e) => setStoreClosedNote(e.target.value)}
              placeholder="Tell customers why you're closed and when you'll be back"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
            />
          </div>
        )}

        {/* Store Hours */}
        {acceptingOrders && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-800">
                Store Hours (Optional)
              </h3>
            </div>

            <div className="space-y-3">
              {STORE_DAY_KEYS.map((day) => (
                <div
                  key={day}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      storeHours[day]
                        ? "bg-emerald-50 border-b border-emerald-100"
                        : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => toggleDay(day)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!storeHours[day]}
                        readOnly
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {DAY_LABELS[day]}
                      </span>
                    </div>
                    {storeHours[day] && (
                      <span className="text-xs font-medium text-emerald-700">
                        {storeHours[day].length} slot
                        {storeHours[day].length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {storeHours[day] && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                      {ensureArray(storeHours[day]).map((slot, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="time"
                            name={`hours[${day}][${index}][open]`}
                            value={slot.open}
                            onChange={(e) =>
                              updateSlot(day, index, "open", e.target.value)
                            }
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <span className="text-slate-400 text-sm">to</span>
                          <input
                            type="time"
                            name={`hours[${day}][${index}][close]`}
                            value={slot.close}
                            onChange={(e) =>
                              updateSlot(day, index, "close", e.target.value)
                            }
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlot(day, index)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSlot(day)}
                        className="w-full py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add time slot
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pickup Location Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">
              Pickup Location
            </h3>
          </div>

          {/* Offers Pickup Toggle */}
          <div className="mb-4 flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-700 cursor-pointer">
                I offer pickup for my orders
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Customers can collect orders from your location
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="offers_pickup"
                checked={offersPickup}
                onChange={(e) => handlePickupToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {offersPickup && (
            <div className="space-y-4">
              {/* Pickup Address */}
              <div>
                <label
                  htmlFor="pickup_address"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Pickup Address
                </label>
                <input
                  id="pickup_address"
                  name="pickup_address"
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. 123 Market Street, Ikeja, Lagos"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              {/* Location Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-slate-400" />
                  Pin your location on the map
                </label>
                <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={pickupLatitude || undefined}
                    initialLng={pickupLongitude || undefined}
                  />
                </div>
              </div>

              {/* Address Details */}
              <div>
                <label
                  htmlFor="pickup_address_details"
                  className="block text-xs font-bold text-slate-600 mb-1"
                >
                  Address Details (Optional)
                </label>
                <textarea
                  id="pickup_address_details"
                  name="pickup_address_details"
                  value={pickupAddressDetails}
                  onChange={(e) =>
                    setPickupAddressDetails(e.target.value.slice(0, 500))
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Look for the blue building next to the bank."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
                />
              </div>

              {/* Hidden fields for lat/lng */}
              <input
                type="hidden"
                name="pickup_latitude"
                value={pickupLatitude || ""}
              />
              <input
                type="hidden"
                name="pickup_longitude"
                value={pickupLongitude || ""}
              />
            </div>
          )}

          {!offersPickup && (
            <div className="rounded-xl bg-slate-100 border border-slate-200 p-4">
              <p className="text-xs text-slate-600">
                💡 <strong>Tip:</strong> Offering pickup can reduce delivery
                costs and attract nearby customers.
              </p>
            </div>
          )}
        </div>

        {/* Hidden field for store hours */}
        <input
          type="hidden"
          name="store_hours_json"
          value={JSON.stringify(storeHours)}
        />

        <div className="flex justify-end">
          <SubmitButton text="Save availability" />
        </div>
      </div>
    </form>
  );
}
