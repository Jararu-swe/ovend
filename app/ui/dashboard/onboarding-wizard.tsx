"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  GlobeAltIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { User } from "@/app/lib/definitions";
import VendleLogo from "@/app/ui/vendle-logo";
import { NIGERIAN_STATES, STORE_CATEGORIES } from "@/app/lib/utils";
import { TEMPLATES } from "@/app/lib/template-presets";
import {
  STORE_DAY_KEYS,
  type StoreHoursDayKey,
  type StoreHoursJson,
  parseHHMM,
} from "@/app/lib/store-availability";

interface OnboardingWizardProps {
  user: User;
  hasProducts: boolean;
  hasWhatsApp: boolean;
}

export default function OnboardingWizard({
  user,
  hasProducts,
  hasWhatsApp,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [storeName, setStoreName] = useState(user.store_name || "");
  const [storeSlug, setStoreSlug] = useState(user.store_slug || "");
  const [storeDescription, setStoreDescription] = useState(
    user.store_description || "",
  );
  const [whatsApp, setWhatsApp] = useState(user.whatsapp_number || "");
  const [locationState, setLocationState] = useState(user.location_state || "");
  const [category, setCategory] = useState(user.category || "");
  const [bankName, setBankName] = useState(user.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(user.account_number || "");
  const [accountName, setAccountName] = useState(user.account_name || "");
  const [templateId, setTemplateId] = useState("fresh-market");
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${storeSlug || user.store_slug}`;
  const totalSteps = 7;

  // Availability State
  const [timezone, setTimezone] = useState(
    user.store_timezone || "Africa/Lagos",
  );
  const [days, setDays] = useState<
    Record<StoreHoursDayKey, { enabled: boolean; open: string; close: string }>
  >(() => {
    const base = {} as Record<
      StoreHoursDayKey,
      { enabled: boolean; open: string; close: string }
    >;
    for (const k of STORE_DAY_KEYS) {
      // Default to 9-5 for weekdays, closed for weekends
      const isWeekend = k === "sat" || k === "sun";
      base[k] = { enabled: !isWeekend, open: "09:00", close: "17:00" };
    }
    return base;
  });
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  const DAY_LABELS: Record<StoreHoursDayKey, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };

  const canProceedFromStep1 = useMemo(() => {
    return (
      storeName.trim().length >= 2 &&
      storeSlug.trim().length >= 2 &&
      /^[a-z0-9-]+$/.test(storeSlug.trim())
    );
  }, [storeName, storeSlug]);

  const saveProfile = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const resp = await fetch("/api/vendor/onboarding-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName.trim(),
          store_slug: storeSlug.trim(),
          store_description: storeDescription.trim() || null,
          whatsapp_number: whatsApp.trim() || null,
          location_state: locationState || null,
          category: category || null,
          bank_name: bankName.trim() || null,
          account_number: accountNumber.trim() || null,
          account_name: accountName.trim() || null,
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setSaveError(body?.error || "Failed to save store details.");
        setIsSaving(false);
        return false;
      }

      setIsSaving(false);
      router.refresh();
      return true;
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save store details.");
      setIsSaving(false);
      return false;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveTheme = async () => {
    setThemeError(null);
    setIsSavingTheme(true);
    try {
      const resp = await fetch("/api/vendor/onboarding-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setThemeError(body?.error || "Failed to save theme.");
        setIsSavingTheme(false);
        return false;
      }

      setIsSavingTheme(false);
      router.refresh();
      return true;
    } catch (e: any) {
      setThemeError(e?.message || "Failed to save theme.");
      setIsSavingTheme(false);
      return false;
    }
  };

  const saveAvailability = async () => {
    setAvailabilityError(null);
    setIsSavingAvailability(true);

    const out: StoreHoursJson = {};
    for (const k of STORE_DAY_KEYS) {
      const row = days[k];
      if (!row.enabled) continue;
      const o = parseHHMM(row.open);
      const c = parseHHMM(row.close);
      if (o == null || c == null || c <= o) continue;
      out[k] = [
        {
          open: row.open.trim().slice(0, 5),
          close: row.close.trim().slice(0, 5),
        },
      ];
    }

    try {
      const resp = await fetch("/api/vendor/onboarding-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_timezone: timezone,
          store_hours: Object.keys(out).length ? out : null,
          accepting_orders: true,
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setAvailabilityError(body?.error || "Failed to save availability.");
        setIsSavingAvailability(false);
        return false;
      }

      setIsSavingAvailability(false);
      router.refresh();
      return true;
    } catch (e: any) {
      setAvailabilityError(e?.message || "Failed to save availability.");
      setIsSavingAvailability(false);
      return false;
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <VendleLogo />
        </Link>
      </div>

      {/* Free Trial Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-4 text-center shadow-lg">
        <p className="text-sm font-bold text-white">
          🎉 Your 7-day free trial has started!
        </p>
        <p className="mt-1 text-xs text-white/90">
          Enjoy full access to all features. No credit card required.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-600">
            Step {step} of {totalSteps}
          </span>
          <span className="text-xs text-slate-400">
            {Math.round((step / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Step 1: Welcome + Store Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-4 mb-4">
                <BuildingStorefrontIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Welcome to Vendle, {user.name.split(" ")[0]}! 🎉
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Let&apos;s get your store ready. Set your store name, link, and
                contact details here (you can change them later).
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-5">
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Store Name
                  </label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="My Store"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Store Link (slug)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono shrink-0">
                      /s/
                    </span>
                    <input
                      value={storeSlug}
                      onChange={(e) =>
                        setStoreSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                      placeholder="my-store"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-mono"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    placeholder="080..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Store Location (State)
                    </label>
                    <div className="relative">
                      <select
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      >
                        <option value="">Select a state</option>
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <MapPinIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Store Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      >
                        <option value="">Select a category</option>
                        {STORE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <TagIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {saveError}
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                if (!canProceedFromStep1) {
                  setSaveError(
                    "Please enter a valid store name and slug to continue.",
                  );
                  return;
                }
                const ok = await saveProfile();
                if (ok) setStep(2);
              }}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
            >
              {isSaving ? "Saving…" : "Next: Store Description"}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Store Description */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 p-4 mb-4">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Tell Your Story
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Add a short description to help customers discover your store.
                This is optional but recommended!
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Store Description{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) =>
                    setStoreDescription(e.target.value.slice(0, 200))
                  }
                  rows={4}
                  maxLength={200}
                  placeholder="e.g. Premium handcrafted jewelry and accessories. Each piece is uniquely designed with love in Lagos."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Appears on Explore page and when sharing your store
                  </p>
                  <p
                    className={`text-xs ${storeDescription.length > 200 ? "text-red-500" : "text-slate-400"}`}
                  >
                    {storeDescription.length}/200
                  </p>
                </div>
              </div>

              {saveError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  const ok = await saveProfile();
                  if (ok) setStep(3);
                }}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {isSaving
                  ? "Saving…"
                  : storeDescription.trim()
                    ? "Next: Store Hours"
                    : "Skip for now"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment Details
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Add your bank details so we can settle payments to you when
                customers buy from your store.
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Bank Name{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. GTBank, Access Bank, First Bank"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Account Number{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  placeholder="0123456789"
                  type="tel"
                  maxLength={10}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-400"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  10-digit account number
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Account Name{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name as it appears on your account"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-400"
                />
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs text-blue-700">
                  💡 <strong>Why we need this:</strong> When customers pay via
                  card or transfer, we&apos;ll settle the funds directly to this
                  account.
                </p>
              </div>

              {saveError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  const ok = await saveProfile();
                  if (ok) setStep(4);
                }}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {isSaving
                  ? "Saving…"
                  : bankName && accountNumber && accountName
                    ? "Next: Store Hours"
                    : "Skip for now"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Store Availability */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-amber-100 p-4 mb-4">
                <ClockIcon className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Store Hours</h2>
              <p className="mt-2 text-sm text-slate-500">
                Let customers know when you&apos;re open. Your store will show
                an &quot;Open&quot; or &quot;Closed&quot; badge automatically.
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  Your Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                >
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                  <option value="Africa/Johannesburg">
                    Africa/Johannesburg (GMT+2)
                  </option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">
                  Weekly Schedule
                </label>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {STORE_DAY_KEYS.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={days[key].enabled}
                          onChange={(e) =>
                            setDays((d) => ({
                              ...d,
                              [key]: { ...d[key], enabled: e.target.checked },
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {DAY_LABELS[key]}
                        </span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          disabled={!days[key].enabled}
                          value={days[key].open}
                          onChange={(e) =>
                            setDays((d) => ({
                              ...d,
                              [key]: { ...d[key], open: e.target.value },
                            }))
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-30 bg-slate-50"
                        />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          to
                        </span>
                        <input
                          type="time"
                          disabled={!days[key].enabled}
                          value={days[key].close}
                          onChange={(e) =>
                            setDays((d) => ({
                              ...d,
                              [key]: { ...d[key], close: e.target.value },
                            }))
                          }
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs disabled:opacity-30 bg-slate-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {availabilityError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {availabilityError}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  const ok = await saveAvailability();
                  if (ok) setStep(5);
                }}
                disabled={isSavingAvailability}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {isSavingAvailability ? "Saving…" : "Next: Choose Theme"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Choose Theme */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-sky-100 p-4 mb-4">
                <SparklesIcon className="h-8 w-8 text-sky-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Choose a Theme
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Pick a look for your storefront. You can customize this later.
              </p>
            </div>

            <div className="grid gap-3">
              {TEMPLATES.slice(0, 6).map((t) => {
                const selected = templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                      selected
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl leading-none">{t.emoji}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          {t.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.description}
                        </p>
                      </div>
                      {selected && (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {themeError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {themeError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  const ok = await saveTheme();
                  if (ok) setStep(6);
                }}
                disabled={isSavingTheme}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {isSavingTheme ? "Saving…" : "Next: Add Products"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Add Products */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-sky-100 p-4 mb-4">
                <SparklesIcon className="h-8 w-8 text-sky-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Add Your Products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your store needs products! Add your first item to start selling.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              {hasProducts ? (
                <div className="space-y-2">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
                  <p className="font-bold text-emerald-700">
                    Products added! ✓
                  </p>
                  <p className="text-xs text-slate-500">
                    Your store is stocked and ready.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    No products yet
                  </p>
                  <Link
                    href="/dashboard/products/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-400"
                  >
                    Add your first product
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(5)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(7)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
              >
                {hasProducts ? "Next" : "Skip for now"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Share Your Link */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 mb-4 text-2xl">
                🚀
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Share Your Store!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your store is live! Share this link on WhatsApp, Instagram,
                Twitter — anywhere your customers are.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="text"
                value={storeUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono text-slate-700 outline-none truncate"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  copied
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
              >
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/?text=Check out my store on Vendle! ${encodeURIComponent(storeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my store on Vendle!&url=${encodeURIComponent(storeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Twitter / X
              </a>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(6)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  // Trigger guide for onboarding completion
                  try {
                    await fetch("/api/vendor/guides/trigger", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        trigger_type: "onboarding-complete",
                      }),
                    });
                    await fetch("/api/vendor/guides/trigger", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        trigger_type: "category-specific",
                      }),
                    });
                  } catch (error) {
                    console.error("Error triggering guides:", error);
                  }
                  router.push("/dashboard");
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
              >
                Go to Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skip link */}
      <p className="mt-6 text-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Skip setup and go to dashboard →
        </button>
      </p>
    </div>
  );
}
