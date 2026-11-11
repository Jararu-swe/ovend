'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  BuildingLibraryIcon,
  IdentificationIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  InformationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import type { VendorKYCProfile, KYCTier } from '@/app/lib/kyc';
import { formatComplianceLog } from './log-formatter';

interface BankOption {
  id: number;
  name: string;
  code: string;
}

export default function KYCManager({ initialProfile }: { initialProfile: VendorKYCProfile }) {
  const [profile, setProfile] = useState<VendorKYCProfile>(initialProfile);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  // Starter Bank Form State
  const [bankCode, setBankCode] = useState(profile.bankCode || '');
  const [accountNumber, setAccountNumber] = useState(profile.accountNumber || '');
  const [isResolvingBank, setIsResolvingBank] = useState(false);
  const [bankResolveError, setBankResolveError] = useState<string | null>(null);
  const [bankSuccessMsg, setBankSuccessMsg] = useState<string | null>(null);

  // Pro Tier Modal / Form State
  const [proIdType, setProIdType] = useState<'bvn' | 'nin'>('bvn');
  const [proIdNumber, setProIdNumber] = useState('');
  const [proDob, setProDob] = useState('');
  const [isVerifyingPro, setIsVerifyingPro] = useState(false);
  const [proError, setProError] = useState<string | null>(null);
  const [proSuccess, setProSuccess] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);

  // Business Tier Modal / Form State
  const [cacNumber, setCacNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isVerifyingBusiness, setIsVerifyingBusiness] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [businessSuccess, setBusinessSuccess] = useState<string | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);



  // Fetch banks from API
  useEffect(() => {
    async function loadBanks() {
      setIsLoadingBanks(true);
      try {
        const res = await fetch('/api/banks');
        if (res.ok) {
          const data = await res.json();
          setBanks(data.banks || []);
        }
      } catch (err) {
        console.error('Failed to load banks:', err);
      } finally {
        setIsLoadingBanks(false);
      }
    }
    loadBanks();
  }, []);

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/kyc/status');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to refresh KYC profile:', err);
    }
  };

  const handleVerifyBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankResolveError(null);
    setBankSuccessMsg(null);

    const selectedBank = banks.find((b) => b.code === bankCode);
    if (!selectedBank) {
      setBankResolveError('Please select your bank from the list');
      return;
    }

    if (!accountNumber || accountNumber.trim().length !== 10) {
      setBankResolveError('Please enter a valid 10-digit Nigerian NUBAN account number');
      return;
    }

    setIsResolvingBank(true);
    try {
      const res = await fetch('/api/kyc/verify-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: accountNumber.trim(),
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBankResolveError(data.error || 'Bank account verification failed');
      } else {
        setBankSuccessMsg(`Verified: ${data.accountName} (${data.matchScore}% name match)`);
        await refreshProfile();
      }
    } catch (err: any) {
      setBankResolveError(err?.message || 'Network error verifying bank account');
    } finally {
      setIsResolvingBank(false);
    }
  };

  const handleVerifyPro = async (e: React.FormEvent) => {
    e.preventDefault();
    setProError(null);
    setProSuccess(null);

    if (proIdNumber.replace(/\D/g, '').length !== 11) {
      setProError(`${proIdType.toUpperCase()} must be exactly 11 digits`);
      return;
    }

    setIsVerifyingPro(true);
    try {
      const res = await fetch('/api/kyc/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idType: proIdType,
          idNumber: proIdNumber.trim(),
          dob: proDob || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProError(data.error || 'Pro verification failed');
      } else {
        setProSuccess(data.message);
        setShowProModal(false);
        await refreshProfile();
      }
    } catch (err: any) {
      setProError(err?.message || 'Network error verifying identity');
    } finally {
      setIsVerifyingPro(false);
    }
  };

  const handleVerifyBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusinessError(null);
    setBusinessSuccess(null);

    if (!cacNumber.trim() || !companyName.trim()) {
      setBusinessError('Please provide both CAC Number and Registered Company Name');
      return;
    }

    setIsVerifyingBusiness(true);
    try {
      const res = await fetch('/api/kyc/verify-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cacNumber: cacNumber.trim(),
          companyName: companyName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBusinessError(data.error || 'Business verification failed');
      } else {
        setBusinessSuccess(data.message);
        setShowBusinessModal(false);
        await refreshProfile();
      }
    } catch (err: any) {
      setBusinessError(err?.message || 'Network error verifying business');
    } finally {
      setIsVerifyingBusiness(false);
    }
  };

  const tier = profile.kycTier;
  const isStarter = tier === 'starter';
  const isPro = tier === 'pro';
  const isBusiness = tier === 'business';

  return (
    <div className="space-y-6">
      {/* ── Top Header & Current Tier Summary ────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 border border-sky-100">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Identity & Payout Verification</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${profile.tierConfig.badgeColor}`}
                >
                  {profile.tierConfig.name}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Verify your identity to increase single payout limits and accelerate settlement times.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5">
            <div>
              <p className="text-xs text-slate-400 font-medium">Single Payout Limit</p>
              <p className="text-base font-bold text-slate-900">
                ₦{profile.tierConfig.maxPayoutPerRequestNaira.toLocaleString()}
              </p>
            </div>
            <div className="h-7 w-[1px] bg-slate-200 mx-2" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Settlement Speed</p>
              <p className="text-base font-bold text-slate-900">
                {profile.tierConfig.settlementDays === 0
                  ? 'Instant (T+0)'
                  : `T+${profile.tierConfig.settlementDays} Days`}
              </p>
            </div>
          </div>
        </div>

        {/* Cooldown Alert Banner */}
        {profile.isBankInCooldown && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-900 flex items-start gap-3">
            <ClockIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">24-Hour Payout Protection Active</p>
              <p className="mt-0.5 text-xs text-amber-800">
                Your bank details were recently updated. To protect your store against unauthorized takeovers,
                payouts are temporarily frozen until{' '}
                <span className="font-medium underline">
                  {profile.cooldownEndsAt ? new Date(profile.cooldownEndsAt).toLocaleString() : 'tomorrow'}
                </span>
                .
              </p>
            </div>
          </div>
        )}

        {/* Monthly Limit Bar */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Monthly Payout Volume Used</span>
            <span className="font-semibold text-slate-800">
              ₦{profile.monthlyPayoutsNaira.toLocaleString()} of ₦
              {profile.tierConfig.maxMonthlyPayoutNaira.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (profile.monthlyPayoutsNaira / profile.tierConfig.maxMonthlyPayoutNaira) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Verification Level Progression Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Level 1: Bank Verified */}
        <div
          className={`rounded-2xl border p-5 transition-all ${
            isStarter
              ? 'border-emerald-300 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BuildingLibraryIcon className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">Bank Verified</h3>
            </div>
            {profile.bankVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">
                <CheckCircleIcon className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold">
                Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Basic vendor verification. Requires valid Nigerian NUBAN bank account with matching account holder name.
          </p>
          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Limit:</span>
              <span className="font-semibold text-slate-800">₦50,000 / request</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Cap:</span>
              <span className="font-semibold text-slate-800">₦200,000 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clearance:</span>
              <span className="font-semibold text-slate-800">T+3 Days</span>
            </div>
          </div>
        </div>

        {/* Level 2: ID Verified */}
        <div
          className={`rounded-2xl border p-5 transition-all ${
            isPro
              ? 'border-sky-300 bg-sky-50/20 shadow-sm ring-1 ring-sky-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IdentificationIcon className="h-5 w-5 text-sky-600" />
              <h3 className="font-bold text-slate-900">ID Verified</h3>
            </div>
            {isPro || isBusiness ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 px-2 py-0.5 text-xs font-semibold">
                <CheckCircleIcon className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowProModal(true)}
                className="rounded-full bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-0.5 text-xs font-semibold transition"
              >
                Verify ID (BVN/NIN)
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Verified Individual. Requires BVN or NIN verification with NDPA-compliant cryptographic hashing.
          </p>
          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Limit:</span>
              <span className="font-semibold text-slate-800">₦500,000 / request</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Cap:</span>
              <span className="font-semibold text-slate-800">₦2,000,000 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clearance:</span>
              <span className="font-semibold text-slate-800">T+1 Day</span>
            </div>
          </div>
        </div>

        {/* Level 3: Registered Business */}
        <div
          className={`rounded-2xl border p-5 transition-all ${
            isBusiness
              ? 'border-purple-300 bg-purple-50/20 shadow-sm ring-1 ring-purple-300'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BuildingOffice2Icon className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-slate-900">Registered Business</h3>
            </div>
            {isBusiness ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-semibold">
                <CheckCircleIcon className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowBusinessModal(true)}
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-0.5 text-xs font-semibold transition"
              >
                Register Business (CAC)
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Corporate KYB. Requires verified Corporate Affairs Commission (CAC) business number and corporate bank account.
          </p>
          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Limit:</span>
              <span className="font-semibold text-slate-800">₦10,000,000 / request</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly Cap:</span>
              <span className="font-semibold text-slate-800">₦50,000,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clearance:</span>
              <span className="font-semibold text-slate-800">Instant (T+0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Starter Tier Bank Verification Form ─────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <BuildingLibraryIcon className="h-5 w-5 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">Nigerian NUBAN Bank Account</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Account must be in your legal name ({profile.vendorName}). Payouts will only be routed to this verified account.
        </p>

        {bankSuccessMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{bankSuccessMsg}</span>
          </div>
        )}

        {bankResolveError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
            <span>{bankResolveError}</span>
          </div>
        )}

        {profile.bankVerified && profile.accountName && (
          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-slate-400">Current Linked Account</p>
                <p className="text-sm font-bold text-slate-900">
                  {profile.accountName} • {profile.bankName}
                </p>
                <p className="text-xs text-slate-500 font-mono tracking-wider">
                  •••• {profile.accountNumber ? profile.accountNumber.slice(-4) : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-semibold">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {profile.bankNameMatchScore ? `${profile.bankNameMatchScore}% Name Match` : 'Verified NUBAN'}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyBank} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                Select Bank
              </label>
              <select
                id="bankSelect"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                disabled={isLoadingBanks || isResolvingBank}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
              >
                <option value="">{isLoadingBanks ? 'Loading banks...' : '-- Choose your bank --'}</option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                10-Digit Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0123456789"
                disabled={isResolvingBank}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 font-mono outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <LockClosedIcon className="h-3.5 w-3.5" />
              <span>Resolved in real-time via Paystack & NIBSS</span>
            </div>

            <button
              type="submit"
              disabled={isResolvingBank || !bankCode || accountNumber.length !== 10}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-4 py-2 text-xs font-semibold transition"
            >
              {isResolvingBank ? 'Verifying with Paystack...' : 'Verify & Save Bank'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Verification History / Audit Trail ───────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Verification History & Audit Trail</h3>
        <p className="text-xs text-slate-500 mb-4">
          Record of submitted verifications, status, and compliance checkpoints.
        </p>

        {profile.verifications && profile.verifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium">Identifier</th>
                  <th className="pb-2 font-medium">Name Resolved</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.verifications.map((v) => (
                  <tr key={v.id} className="text-slate-700">
                    <td className="py-2.5 font-medium uppercase text-slate-900">{v.id_type}</td>
                    <td className="py-2.5 capitalize">{v.tier}</td>
                    <td className="py-2.5 font-mono text-slate-500">{v.id_number_masked || '—'}</td>
                    <td className="py-2.5">{v.resolved_name || '—'}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          v.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No verification logs yet.</p>
        )}
      </div>

      {/* ── Security & Compliance Alerts ─────────────────────── */}
      {profile.alerts && profile.alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Security & Compliance Log</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Automated alerts triggered by account activities, name matches, and regulatory rules.
          </p>

          <div className="space-y-3">
            {profile.alerts.map((alert) => {
              const formatted = formatComplianceLog(alert.event_type, alert.severity, alert.details);
              const badgeClasses =
                formatted.badge.variant === 'danger'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : formatted.badge.variant === 'warning'
                  ? 'bg-amber-100 text-amber-900 border-amber-200'
                  : formatted.badge.variant === 'success'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : formatted.badge.variant === 'info'
                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={alert.id}
                  className="rounded-xl border border-amber-200/60 bg-white p-3.5 text-xs shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {formatted.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${badgeClasses}`}
                      >
                        {formatted.badge.label}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0">
                      {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-700 leading-relaxed">
                    {formatted.summary}
                  </p>

                  {formatted.details && formatted.details.length > 0 && (
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-[11px]">
                      {formatted.details.map((item, idx) => (
                        <div key={idx}>
                          <span className="text-slate-400 block font-medium">{item.label}</span>
                          <span className="text-slate-800 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pro Tier BVN/NIN Modal ────────────────────────────── */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IdentificationIcon className="h-6 w-6 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Verify Identity (BVN / NIN)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter your 11-digit BVN or NIN. Increases your single payout limit to ₦500,000 and accelerates
              settlement to T+1 day.
            </p>

            {/* NDPA Security Box */}
            <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-[11px] text-sky-900 flex items-start gap-2">
              <InformationCircleIcon className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                <strong>NDPA Compliant:</strong> Your 11-digit number is never stored in plaintext. It is
                cryptographically hashed for identity matching in compliance with Nigeria Data Protection Act 2023.
              </span>
            </div>

            {proError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {proError}
              </div>
            )}

            <form onSubmit={handleVerifyPro} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProIdType('bvn')}
                    className={`rounded-xl py-2 text-xs font-semibold border transition ${
                      proIdType === 'bvn'
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    BVN (Bank Verification)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProIdType('nin')}
                    className={`rounded-xl py-2 text-xs font-semibold border transition ${
                      proIdType === 'nin'
                        ? 'border-sky-600 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    NIN (National Identity)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="proIdNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                  11-Digit {proIdType.toUpperCase()} Number
                </label>
                <input
                  id="proIdNumber"
                  type="text"
                  maxLength={11}
                  value={proIdNumber}
                  onChange={(e) => setProIdNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="22222222222"
                  disabled={isVerifyingPro}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 font-mono outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="proDob" className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth (as registered with {proIdType.toUpperCase()})
                </label>
                <input
                  id="proDob"
                  type="date"
                  value={proDob}
                  onChange={(e) => setProDob(e.target.value)}
                  disabled={isVerifyingPro}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPro || proIdNumber.length !== 11}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white px-4 py-2 text-xs font-semibold transition"
                >
                  {isVerifyingPro ? 'Verifying...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Business Tier CAC Modal ──────────────────────────── */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-6 w-6 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Register Business (CAC Review)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Verify your registered company with the Corporate Affairs Commission (CAC). Unlocks ₦10,000,000 single
              payout limits and instant T+0 settlement.
            </p>

            {businessError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {businessError}
              </div>
            )}

            <form onSubmit={handleVerifyBusiness} className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Business Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Adeola & Sons Enterprises LTD"
                  disabled={isVerifyingBusiness}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="cacNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                  CAC Number (RC or BN)
                </label>
                <input
                  id="cacNumber"
                  type="text"
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value.toUpperCase())}
                  placeholder="RC1234567 or BN9876543"
                  disabled={isVerifyingBusiness}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 font-mono outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBusinessModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingBusiness || !cacNumber.trim() || !companyName.trim()}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-4 py-2 text-xs font-semibold transition"
                >
                  {isVerifyingBusiness ? 'Verifying...' : 'Verify CAC Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
