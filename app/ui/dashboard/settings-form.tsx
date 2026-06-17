"use client";

import { User } from "@/app/lib/definitions";
import { updateProfile, State } from "@/app/lib/actions";
import { useActionState, useState, useEffect, useCallback, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { NIGERIAN_STATES, STORE_CATEGORIES } from "@/app/lib/utils";
import {
  STORE_DAY_KEYS,
  StoreHoursDayKey,
  StoreHoursSlot,
  StoreHoursJson,
} from "@/app/lib/store-availability";

const LocationPicker = dynamic(() => import("@/app/ui/store/location-picker"), {
  ssr: false,
});

function SubmitButton() {
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
        "Save all settings"
      )}
    </button>
  );
}

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

export default function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(
    updateProfile as any,
    initialState,
  );

  // Track whether we've already processed this success message
  const processedSuccessRef = useRef<string | null>(null);

  // Banks state
  const [banks, setBanks] = useState<{ id: number; name: string; code: string }[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  // Fetch banks on component mount
  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/banks");
        if (res.ok) {
          const data = await res.json();
          setBanks(data.banks || []);
        }
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        setIsLoadingBanks(false);
      }
    }
    fetchBanks();
  }, []);
  
  // Make sound functionality optional - no longer requires SoundProvider
  const playSound = useCallback((soundType: string) => {
    // Sound disabled for now - can be re-enabled when SoundProvider is added back
    console.log(`Sound would play: ${soundType}`);
  }, []);
  
  const preferences = { soundEnabled: false, volume: 50 };
  const updatePreferences = (prefs?: any) => {
    // Placeholder for when SoundProvider is re-enabled
    console.log('Preferences would update:', prefs);
  };

  // ── Store Profile state ──────────────────────────────────
  const [storeName, setStoreName] = useState(user.store_name || "");
  const [storeDescription, setStoreDescription] = useState(
    user.store_description || "",
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    user.whatsapp_number || "",
  );
  const [category, setCategory] = useState(user.category || "");
  const [locationState, setLocationState] = useState(user.location_state || "");
  const [storeSlug, setStoreSlug] = useState(user.store_slug || "");
  const [bankName, setBankName] = useState(user.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(user.account_number || "");
  const [accountName, setAccountName] = useState(user.account_name || "");
  const [descriptionLength, setDescriptionLength] = useState(
    user.store_description?.length || 0,
  );

  // ── Sound/Notification state ─────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(
    user.sound_enabled !== false,
  );
  const [soundVolume, setSoundVolume] = useState(
    user.sound_volume ?? 50,
  );
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // ── Availability state ────────────────────────────────────
  const [acceptingOrders, setAcceptingOrders] = useState(
    user.accepting_orders !== false,
  );
  const [storeClosedNote, setStoreClosedNote] = useState(
    user.store_closed_note || "",
  );
  const [storeHours, setStoreHours] = useState<StoreHoursJson>(() =>
    parseStoreHours(user.store_hours),
  );

  // ── Pickup Location state ─────────────────────────────────
  const [offersPickup, setOffersPickup] = useState(
    !!user.offers_pickup,
  );
  const [pickupAddress, setPickupAddress] = useState(
    user.pickup_address || "",
  );
  const [pickupLatitude, setPickupLatitude] = useState<number | null>(
    user.pickup_latitude || null,
  );
  const [pickupLongitude, setPickupLongitude] = useState<number | null>(
    user.pickup_longitude || null,
  );
  const [pickupAddressDetails, setPickupAddressDetails] = useState(
    user.pickup_address_details || "",
  );

  // ── Sync form state when user data changes (only if values actually differ) ────────────────
  useEffect(() => {
    if (storeName !== (user.store_name || "")) setStoreName(user.store_name || "");
    if (storeDescription !== (user.store_description || "")) setStoreDescription(user.store_description || "");
    if (whatsappNumber !== (user.whatsapp_number || "")) setWhatsappNumber(user.whatsapp_number || "");
    if (category !== (user.category || "")) setCategory(user.category || "");
    if (locationState !== (user.location_state || "")) setLocationState(user.location_state || "");
    if (storeSlug !== (user.store_slug || "")) setStoreSlug(user.store_slug || "");
    if (bankName !== (user.bank_name || "")) setBankName(user.bank_name || "");
    if (accountNumber !== (user.account_number || "")) setAccountNumber(user.account_number || "");
    if (accountName !== (user.account_name || "")) setAccountName(user.account_name || "");
    if (descriptionLength !== (user.store_description?.length || 0)) setDescriptionLength(user.store_description?.length || 0);
    if (soundEnabled !== (user.sound_enabled !== false)) setSoundEnabled(user.sound_enabled !== false);
    if (soundVolume !== (user.sound_volume ?? 50)) setSoundVolume(user.sound_volume ?? 50);
    if (acceptingOrders !== (user.accepting_orders !== false)) setAcceptingOrders(user.accepting_orders !== false);
    if (storeClosedNote !== (user.store_closed_note || "")) setStoreClosedNote(user.store_closed_note || "");
    if (JSON.stringify(storeHours) !== JSON.stringify(parseStoreHours(user.store_hours))) setStoreHours(parseStoreHours(user.store_hours));
    if (offersPickup !== !!user.offers_pickup) setOffersPickup(!!user.offers_pickup);
    if (pickupAddress !== (user.pickup_address || "")) setPickupAddress(user.pickup_address || "");
    if (pickupLatitude !== (user.pickup_latitude || null)) setPickupLatitude(user.pickup_latitude || null);
    if (pickupLongitude !== (user.pickup_longitude || null)) setPickupLongitude(user.pickup_longitude || null);
    if (pickupAddressDetails !== (user.pickup_address_details || "")) setPickupAddressDetails(user.pickup_address_details || "");
  }, [user]);

  // ── Success feedback + refresh ───────────────────────────
  useEffect(() => {
    if (state.message?.includes("Success")) {
      if (processedSuccessRef.current !== state.message) {
        processedSuccessRef.current = state.message;
        playSound("success");
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    } else {
      processedSuccessRef.current = null; // Reset when message changes
    }
  }, [state.message, playSound, router]);

  // ── Helpers for field-level error display ────────────────
  const fieldError = (field: string): string | undefined =>
    state.errors?.[field]?.[0];
  const hasError = (field: string): boolean => !!fieldError(field);
  const inputCls = (field: string, extra = "") =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition-all resize-none ${extra} ${
      hasError(field)
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
    }`;
  const selectCls = (field: string) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 outline-none transition-all bg-white ${
      hasError(field)
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
    }`;

  // ── Auto-scroll to first error field ─────────────────────
  useEffect(() => {
    if (!state.errors || Object.keys(state.errors).length === 0) return;
    // Find the first element with a name attribute matching an error key
    const firstErrorField = Object.keys(state.errors).find(
      (key) => state.errors?.[key]?.[0],
    );
    if (firstErrorField) {
      const el = document.querySelector<HTMLElement>(
        `[name="${firstErrorField}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.focus(), 400);
      }
    }
  }, [state.errors]);

  // ── Store hours helpers ────────────────────────────────────
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
        const { [day]: _, ...rest } = prev;
        return rest;
      } else {
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
    <form action={formAction} className="space-y-6">          {/* Success/Error Message */}
          {state.message && (
            <div
              className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                state.message.includes("Success")
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {state.message.includes("Success") ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              )}
              <div>
                <span className="font-medium">{state.message}</span>
                {!state.message.includes("Success") &&
                  state.errors &&
                  Object.keys(state.errors).length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-xs text-red-600 space-y-1">
                      {Object.entries(state.errors).map(([field, msgs]) =>
                        msgs?.[0] ? (
                          <li key={field}>
                            <span className="capitalize">
                              {field.replace(/_/g, " ")}
                            </span>
                            : {msgs[0]}
                          </li>
                        ) : null,
                      )}
                    </ul>
                  )}
              </div>
            </div>
          )}

      {/* ── Store Profile Section ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">
          Store Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="store_name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Store Name
            </label>
            <input
              id="store_name"
              name="store_name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Amaka Threads"
              className={inputCls("store_name")}
            />
            {hasError("store_name") && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {fieldError("store_name")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="store_description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Store Description{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="store_description"
              name="store_description"
              rows={3}
              maxLength={200}
              value={storeDescription}
              onChange={(e) => {
                setStoreDescription(e.target.value);
                setDescriptionLength(e.target.value.length);
              }}
              placeholder="Tell customers what makes your store special..."
              className={inputCls("store_description")}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                This appears on the Explore page and when sharing your store
                link
              </p>
              <p
                className={`text-xs ${
                  descriptionLength > 200 ? "text-red-500" : "text-slate-400"
                }`}
              >
                {descriptionLength}/200
              </p>
            </div>
            {hasError("store_description") && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {fieldError("store_description")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="whatsapp_number"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              WhatsApp Number
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+234 801 234 5678"
              className={inputCls("whatsapp_number")}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Store Category / Niche
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectCls("category")}
            >
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="location_state"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Store Location (State)
            </label>
            <select
              id="location_state"
              name="location_state"
              value={locationState}
              onChange={(e) => setLocationState(e.target.value)}
              className={selectCls("location_state")}
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store_slug"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Store URL Slug
            </label>
            <div
              className={`flex overflow-hidden rounded-xl border transition-all ${
                hasError("store_slug")
                  ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20"
                  : "border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20"
              }`}
            >
              <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500 border-r border-slate-200">
                vendle.app/s/
              </span>
              <input
                id="store_slug"
                name="store_slug"
                type="text"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="your-store"
                className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            {hasError("store_slug") && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {fieldError("store_slug")}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Your public store link:{" "}
              <span className="font-medium text-emerald-600">
                vendle.app/s/{storeSlug || user.store_slug}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Store Availability Section ───────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-slate-400" />
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
              maxLength={280}
              value={storeClosedNote}
              onChange={(e) => setStoreClosedNote(e.target.value)}
              placeholder="Tell customers why you're closed and when you'll be back"
              className={inputCls("store_closed_note")}
            />
            {hasError("store_closed_note") && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {fieldError("store_closed_note")}
              </p>
            )}
          </div>
        )}

        {/* Store Hours */}
        {acceptingOrders && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Store Hours (Optional)
            </h3>

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

        {/* Hidden store_hours_json */}
        <input
          type="hidden"
          name="store_hours_json"
          value={JSON.stringify(storeHours)}
        />
      </div>

      {/* ── Pickup Location Section ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-slate-400" />
          Pickup Location
        </h2>

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
                placeholder="e.g. 123 Market Street, Ikeja, Lagos"              className={inputCls("pickup_address")}
            />
            </div>

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
                className={inputCls("pickup_address_details")}
              />
              {hasError("pickup_address_details") && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
                  {fieldError("pickup_address_details")}
                </p>
              )}
            </div>

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

      {/* ── Notifications & Audio Section ───────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-800">
              Notifications & Audio
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              const newEnabled = !soundEnabled;
              setSoundEnabled(newEnabled);
              updatePreferences({ enabled: newEnabled });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              soundEnabled ? "bg-emerald-500" : "bg-slate-200"
            }`}
            aria-label="Toggle sound notifications"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                soundEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Enable audio feedback for important actions
            </p>
            {isReducedMotion && (
              <span className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                Reduced Motion Active
              </span>
            )}
          </div>

          {soundEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="sound-volume"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  {soundVolume === 0 ? (
                    <SpeakerXMarkIcon className="h-4 w-4 text-slate-400" />
                  ) : (
                    <SpeakerWaveIcon className="h-4 w-4 text-slate-400" />
                  )}
                  Notification Volume
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {soundVolume}%
                </span>
              </div>
              <input
                id="sound-volume"
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => {
                  const vol = parseInt(e.target.value);
                  setSoundVolume(vol);
                  updatePreferences({ volume: vol });
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-500"
              />
              <div className="flex justify-between px-1">
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                  Mute
                </span>
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                  Max
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden fields for sound preferences */}
        <input
          type="hidden"
          name="sound_enabled"
          value={soundEnabled ? "on" : "off"}
        />
        <input
          type="hidden"
          name="sound_volume"
          value={soundVolume}
        />
      </div>

      {/* ── Bank Account Details Section ────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-slate-800">
          Bank Account Details
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          For cash/transfer payments, customers will see these details to make
          payment
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="bank_name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Bank Name
            </label>
            {isLoadingBanks ? (
              <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                Loading banks...
              </div>
            ) : (
              <select
                id="bank_name"
                name="bank_name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={selectCls("bank_name")}
              >
                <option value="">Select your bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label
              htmlFor="account_number"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Account Number
            </label>
            <input
              id="account_number"
              name="account_number"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => {
                // Only allow digits, max 10
                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                setAccountNumber(cleaned);
              }}
              placeholder="0123456789"                className={inputCls("account_number")}
            />
            {accountNumber.length > 0 && accountNumber.length < 10 && (
              <p className="mt-1 text-xs text-amber-600">
                Account number should be 10 digits
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="account_name"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Account Name
            </label>
            <input
              id="account_name"
              name="account_name"
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Name as it appears on your account"
              className={inputCls("account_name")}
            />
          </div>
        </div>
      </div>

      {/* ── Save Button ─────────────────────────────────────────── */}
      <div className="mt-8 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
