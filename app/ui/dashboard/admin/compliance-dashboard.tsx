'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldExclamationIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  EyeIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  FunnelIcon,
  BanknotesIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { formatComplianceLog } from '../kyc/log-formatter';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComplianceSummary {
  totalVendors: number;
  unverifiedVendors: number;
  pendingVerifications: number;
  starterTierCount: number;
  proTierCount: number;
  businessTierCount: number;
  fraudAlertsToday: number;
  fraudAlertsCritical: number;
  unresolvedAlerts: number;
  totalPayoutsThisMonth: number;
  blockedPayoutsThisMonth: number;
}

interface AdminVendorRow {
  id: string;
  name: string;
  email: string;
  storeName: string;
  kycTier: string;
  kycStatus: string;
  bankVerified: boolean;
  bankName: string | null;
  accountName: string | null;
  bankNameMatchScore: number | null;
  createdAt: string;
  monthlyPayouts: number;
  verificationsCount: number;
  pendingCAC?: {
    id: string;
    rcNumber: string;
    companyName: string;
    bankAccountName?: string;
    bankName?: string;
    isCorporateAccount?: boolean;
    nameMatchScore?: number;
    submittedAt: string;
    cacPortalUrl: string;
  } | null;
}

interface FraudLogEntry {
  id: string;
  vendorId: string | null;
  vendorName: string | null;
  vendorEmail: string | null;
  eventType: string;
  severity: string;
  details: any;
  ipAddress: string | null;
  resolved: boolean;
  createdAt: string;
}

interface VendorDetail {
  profile: any;
  verifications: any[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'fraud'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Overview
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);

  // Vendors
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [vendorFilter, setVendorFilter] = useState<'all' | 'unverified' | 'flagged' | 'pending'>('all');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorTotal, setVendorTotal] = useState(0);

  // Fraud Logs
  const [fraudLogs, setFraudLogs] = useState<FraudLogEntry[]>([]);
  const [fraudSeverity, setFraudSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [fraudResolved, setFraudResolved] = useState<'all' | 'true' | 'false'>('false');
  const [fraudPage, setFraudPage] = useState(1);
  const [fraudTotal, setFraudTotal] = useState(0);

  // Vendor Detail Modal
  const [selectedVendor, setSelectedVendor] = useState<VendorDetail | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorModalLoading, setVendorModalLoading] = useState(false);

  // Action Modal
  const [actionModal, setActionModal] = useState<{
    type: 'set_tier' | 'suspend' | null;
    vendorId: string;
    vendorName: string;
  } | null>(null);
  const [actionTier, setActionTier] = useState<'starter' | 'pro' | 'business'>('starter');
  const [actionReason, setActionReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // CAC Compliance Review Modal (Zero API Fee Workflow via search.cac.gov.ng)
  const [cacReviewModal, setCacReviewModal] = useState<{
    vendorId: string;
    vendorName: string;
    verificationId: string;
    rcNumber: string;
    companyName: string;
    bankAccountName?: string;
    bankName?: string;
    nameMatchScore?: number;
    isCorporateAccount?: boolean;
    cacPortalUrl?: string;
  } | null>(null);
  const [cacApproveNotes, setCacApproveNotes] = useState('');
  const [cacRejectReason, setCacRejectReason] = useState('');
  const [isCacProcessing, setIsCacProcessing] = useState(false);
  const [cacActionMessage, setCacActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/compliance?section=summary');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load summary');
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const loadVendors = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        section: 'vendors',
        filter: vendorFilter,
        search: vendorSearch,
        page: String(vendorPage),
      });
      const res = await fetch(`/api/admin/compliance?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load vendors');
      }
      const data = await res.json();
      setVendors(data.vendors);
      setVendorTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    }
  }, [vendorFilter, vendorSearch, vendorPage]);

  const loadFraudLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        section: 'fraud',
        severity: fraudSeverity,
        page: String(fraudPage),
      });
      if (fraudResolved !== 'all') params.set('resolved', fraudResolved);
      const res = await fetch(`/api/admin/compliance?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load fraud logs');
      }
      const data = await res.json();
      setFraudLogs(data.logs);
      setFraudTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    }
  }, [fraudSeverity, fraudResolved, fraudPage]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([loadSummary()]).finally(() => setIsLoading(false));
  }, [loadSummary]);

  useEffect(() => {
    if (activeTab === 'vendors') loadVendors();
  }, [activeTab, loadVendors]);

  useEffect(() => {
    if (activeTab === 'fraud') loadFraudLogs();
  }, [activeTab, loadFraudLogs]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const openVendorDetail = async (vendorId: string) => {
    setVendorModalLoading(true);
    setShowVendorModal(true);
    try {
      const res = await fetch('/api/admin/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_vendor_detail', vendorId }),
      });
      const data = await res.json();
      setSelectedVendor(data);
    } catch (err: any) {
      console.error('Failed to load vendor detail:', err);
    } finally {
      setVendorModalLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setIsActioning(true);
    setActionMessage(null);

    try {
      const body: any = { action: actionModal.type, vendorId: actionModal.vendorId };
      if (actionModal.type === 'set_tier') {
        body.tier = actionTier;
        body.reason = actionReason;
      } else if (actionModal.type === 'suspend') {
        body.reason = actionReason;
      }

      const res = await fetch('/api/admin/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionMessage({ text: data.error || 'Action failed', type: 'error' });
      } else {
        setActionMessage({ text: data.message, type: 'success' });
        setTimeout(() => {
          setActionModal(null);
          setActionReason('');
          setActionMessage(null);
          loadVendors();
          loadSummary();
        }, 1500);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setIsActioning(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_alert', alertId }),
      });
      if (res.ok) {
        loadFraudLogs();
        loadSummary();
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleApproveCAC = async (verificationId: string) => {
    setIsCacProcessing(true);
    setCacActionMessage(null);
    try {
      const res = await fetch('/api/admin/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_cac',
          verificationId,
          notes: cacApproveNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve CAC');
      setCacActionMessage({ text: data.message || 'CAC approved! Vendor upgraded to Business Tier.', type: 'success' });
      setTimeout(() => {
        setCacReviewModal(null);
        setCacApproveNotes('');
        setCacActionMessage(null);
        loadVendors();
        loadSummary();
        if (selectedVendor) openVendorDetail(selectedVendor.profile.vendorId);
      }, 1200);
    } catch (err: any) {
      setCacActionMessage({ text: err.message, type: 'error' });
    } finally {
      setIsCacProcessing(false);
    }
  };

  const handleRejectCAC = async (verificationId: string) => {
    if (!cacRejectReason.trim()) {
      setCacActionMessage({ text: 'Please provide a rejection reason.', type: 'error' });
      return;
    }
    setIsCacProcessing(true);
    setCacActionMessage(null);
    try {
      const res = await fetch('/api/admin/compliance/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_cac',
          verificationId,
          reason: cacRejectReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject CAC');
      setCacActionMessage({ text: data.message || 'CAC verification rejected.', type: 'success' });
      setTimeout(() => {
        setCacReviewModal(null);
        setCacRejectReason('');
        setCacActionMessage(null);
        loadVendors();
        loadSummary();
        if (selectedVendor) openVendorDetail(selectedVendor.profile.vendorId);
      }, 1200);
    } catch (err: any) {
      setCacActionMessage({ text: err.message, type: 'error' });
    } finally {
      setIsCacProcessing(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────────

  const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      starter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pro: 'bg-sky-50 text-sky-700 border-sky-200',
      business: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return styles[tier] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      verified: 'bg-emerald-100 text-emerald-800',
      unverified: 'bg-amber-100 text-amber-800',
      pending: 'bg-sky-100 text-sky-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  const severityColor = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-amber-100 text-amber-800 border-amber-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return styles[severity] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const totalVendorPages = Math.ceil(vendorTotal / 20);
  const totalFraudPages = Math.ceil(fraudTotal / 25);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <ShieldExclamationIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-900 mb-1">Access Denied or Error</h2>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {(['overview', 'vendors', 'fraud'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'vendors' ? '👥 Vendor KYC' : '🚨 Fraud Alerts'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : summary ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<UserGroupIcon className="h-5 w-5" />}
                  label="Total Vendors"
                  value={summary.totalVendors}
                  iconColor="text-sky-600"
                  bgColor="bg-sky-50 border-sky-200"
                />
                <StatCard
                  icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                  label="Unverified"
                  value={summary.unverifiedVendors}
                  iconColor="text-amber-600"
                  bgColor="bg-amber-50 border-amber-200"
                  highlight={summary.unverifiedVendors > 0}
                />
                <StatCard
                  icon={<ShieldExclamationIcon className="h-5 w-5" />}
                  label="Critical Alerts"
                  value={summary.fraudAlertsCritical}
                  iconColor="text-red-600"
                  bgColor="bg-red-50 border-red-200"
                  highlight={summary.fraudAlertsCritical > 0}
                />
                <StatCard
                  icon={<BanknotesIcon className="h-5 w-5" />}
                  label="Monthly Payouts"
                  value={summary.totalPayoutsThisMonth}
                  iconColor="text-emerald-600"
                  bgColor="bg-emerald-50 border-emerald-200"
                />
              </div>

              {/* Tier Distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ChartBarIcon className="h-5 w-5 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">KYC Tier Distribution</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <TierCard
                    tier="Starter"
                    count={summary.starterTierCount}
                    total={summary.totalVendors}
                    color="emerald"
                  />
                  <TierCard
                    tier="Pro"
                    count={summary.proTierCount}
                    total={summary.totalVendors}
                    color="sky"
                  />
                  <TierCard
                    tier="Business"
                    count={summary.businessTierCount}
                    total={summary.totalVendors}
                    color="purple"
                  />
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-medium text-slate-500">Pending Verifications</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{summary.pendingVerifications}</p>
                  <p className="text-xs text-slate-400 mt-1">Awaiting admin review</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldExclamationIcon className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-medium text-slate-500">Unresolved Alerts</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{summary.unresolvedAlerts}</p>
                  <p className="text-xs text-slate-400 mt-1">{summary.fraudAlertsToday} new today</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircleIcon className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-medium text-slate-500">Blocked Payouts</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{summary.blockedPayoutsThisMonth}</p>
                  <p className="text-xs text-slate-400 mt-1">This month</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── Vendors Tab ───────────────────────────────────────── */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => {
                    setVendorSearch(e.target.value);
                    setVendorPage(1);
                  }}
                  placeholder="Search by name, email, or store..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-slate-400" />
                {(['all', 'unverified', 'flagged', 'pending'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setVendorFilter(f);
                      setVendorPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      vendorFilter === f
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-4 py-3 font-semibold text-slate-500">Vendor</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">KYC Tier</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Bank</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Name Match</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Monthly Vol.</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Joined</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                        No vendors found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{v.name}</p>
                          <p className="text-[11px] text-slate-400">{v.email}</p>
                          {v.storeName && (
                            <p className="text-[11px] text-slate-400 italic">{v.storeName}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${tierBadge(v.kycTier)}`}>
                            {v.kycTier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusBadge(v.kycStatus)}`}>
                              {v.kycStatus}
                            </span>
                            {v.pendingCAC && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[9px] font-bold">
                                <BuildingOffice2Icon className="h-3 w-3" /> CAC Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {v.bankVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span className="text-[11px]">{v.bankName || 'Verified'}</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 text-[11px]">Unverified</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {v.bankNameMatchScore !== null ? (
                            <span className={`text-[11px] font-bold ${v.bankNameMatchScore >= 75 ? 'text-emerald-700' : 'text-red-600'}`}>
                              {v.bankNameMatchScore}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          ₦{v.monthlyPayouts.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {v.pendingCAC && (
                              <button
                                onClick={() => setCacReviewModal({
                                  vendorId: v.id,
                                  vendorName: v.name,
                                  verificationId: v.pendingCAC!.id,
                                  rcNumber: v.pendingCAC!.rcNumber,
                                  companyName: v.pendingCAC!.companyName,
                                  bankAccountName: v.accountName || undefined,
                                  bankName: v.bankName || undefined,
                                  nameMatchScore: v.pendingCAC!.nameMatchScore,
                                  isCorporateAccount: v.pendingCAC!.isCorporateAccount,
                                })}
                                title="Review CAC Registration"
                                className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                              >
                                <BuildingOffice2Icon className="h-3.5 w-3.5" />
                                Verify CAC
                              </button>
                            )}
                            <button
                              onClick={() => openVendorDetail(v.id)}
                              title="View Detail"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setActionModal({ type: 'set_tier', vendorId: v.id, vendorName: v.name })}
                              title="Set Tier"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            >
                              <ShieldCheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setActionModal({ type: 'suspend', vendorId: v.id, vendorName: v.name })}
                              title="Suspend"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <NoSymbolIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalVendorPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Page {vendorPage} of {totalVendorPages} ({vendorTotal} vendors)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVendorPage((p) => Math.max(1, p - 1))}
                    disabled={vendorPage <= 1}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setVendorPage((p) => Math.min(totalVendorPages, p + 1))}
                    disabled={vendorPage >= totalVendorPages}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fraud Alerts Tab ──────────────────────────────────── */}
      {activeTab === 'fraud' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Severity:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFraudSeverity(s);
                    setFraudPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    fraudSeverity === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              {(['false', 'true', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setFraudResolved(r);
                    setFraudPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    fraudResolved === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'false' ? 'Open' : r === 'true' ? 'Resolved' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Fraud Log Cards */}
          <div className="space-y-3">
            {fraudLogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <CheckCircleIcon className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">No fraud alerts found.</p>
                <p className="text-xs text-slate-400 mt-1">All clear for the selected filters.</p>
              </div>
            ) : (
              fraudLogs.map((log) => {
                const formatted = formatComplianceLog(log.eventType, log.severity, log.details);
                return (
                  <div
                    key={log.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                      log.resolved ? 'opacity-60 border-slate-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatted.title}
                          </span>
                          {log.resolved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                              <CheckCircleIcon className="h-3 w-3" /> Resolved
                            </span>
                          )}
                        </div>

                        {log.vendorName && (
                          <p className="text-xs text-slate-600 mb-1">
                            Vendor: <span className="font-semibold text-slate-800">{log.vendorName}</span>
                            {log.vendorEmail && (
                              <span className="text-slate-400 ml-1">({log.vendorEmail})</span>
                            )}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                          {formatted.summary}
                        </p>

                        {formatted.details && formatted.details.length > 0 && (
                          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px]">
                            {formatted.details.map((item, idx) => (
                              <div key={idx}>
                                <span className="text-slate-400 block font-medium">{item.label}</span>
                                <span className="text-slate-800 font-semibold">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>

                      {!log.resolved && (
                        <button
                          onClick={() => resolveAlert(log.id)}
                          className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold transition"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalFraudPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Page {fraudPage} of {totalFraudPages} ({fraudTotal} alerts)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFraudPage((p) => Math.max(1, p - 1))}
                  disabled={fraudPage <= 1}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFraudPage((p) => Math.min(totalFraudPages, p + 1))}
                  disabled={fraudPage >= totalFraudPages}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Vendor Detail Modal ───────────────────────────────── */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Vendor KYC Detail</h3>
              <button
                onClick={() => {
                  setShowVendorModal(false);
                  setSelectedVendor(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {vendorModalLoading ? (
              <div className="flex items-center justify-center py-16">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : selectedVendor?.profile ? (
              <div className="space-y-5">
                {/* Profile Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Name</p>
                    <p className="text-slate-900 font-semibold">{selectedVendor.profile.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Email</p>
                    <p className="text-slate-900">{selectedVendor.profile.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Store</p>
                    <p className="text-slate-900">{selectedVendor.profile.storeName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">KYC Tier</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${tierBadge(selectedVendor.profile.kycTier)}`}>
                      {selectedVendor.profile.kycTier}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">KYC Status</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusBadge(selectedVendor.profile.kycStatus)}`}>
                      {selectedVendor.profile.kycStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Bank Verified</p>
                    <p className="text-slate-900">
                      {selectedVendor.profile.bankVerified ? (
                        <span className="text-emerald-700 font-semibold">✓ Yes</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗ No</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Bank Info */}
                {selectedVendor.profile.bankName && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <BuildingLibraryIcon className="h-4 w-4 text-slate-500" />
                      <p className="font-bold text-slate-900">Bank Account</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <p className="text-slate-400">Bank</p>
                        <p>{selectedVendor.profile.bankName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Account Name</p>
                        <p>{selectedVendor.profile.accountName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Account Number</p>
                        <p className="font-mono">
                          •••• {selectedVendor.profile.accountNumber?.slice(-4) || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Name Match</p>
                        <p className="font-bold">
                          {selectedVendor.profile.bankNameMatchScore != null
                            ? `${selectedVendor.profile.bankNameMatchScore}%`
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payout Limits */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs">
                  <p className="font-bold text-slate-900 mb-2">Payout Limits</p>
                  <div className="grid grid-cols-3 gap-2 text-slate-700">
                    <div>
                      <p className="text-slate-400">Per Request</p>
                      <p className="font-semibold">
                        ₦{selectedVendor.profile.tierConfig?.maxPayoutPerRequestNaira?.toLocaleString() || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Monthly</p>
                      <p className="font-semibold">
                        ₦{selectedVendor.profile.tierConfig?.maxMonthlyPayoutNaira?.toLocaleString() || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Used This Month</p>
                      <p className="font-semibold">₦{selectedVendor.profile.monthlyPayoutsNaira?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Pending CAC Review Callout Box */}
                {(() => {
                  const pendingCac = selectedVendor.verifications?.find(
                    (v: any) => v.idType === 'cac' && v.status === 'pending'
                  );
                  if (!pendingCac) return null;
                  const meta = pendingCac.metadata || {};
                  return (
                    <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BuildingOffice2Icon className="h-5 w-5 text-purple-600" />
                          <p className="font-bold text-purple-950">Pending CAC Corporate KYB Review</p>
                        </div>
                        <span className="rounded-full bg-purple-200/80 text-purple-900 px-2 py-0.5 text-[10px] font-bold">
                          Under Review
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 mb-3">
                        <div>
                          <p className="text-slate-400">CAC RC / BN Number</p>
                          <p className="font-mono font-bold text-slate-900">{pendingCac.idNumberMasked}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Company Name</p>
                          <p className="font-semibold text-slate-900">{pendingCac.resolvedName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Bank Account</p>
                          <p>{meta.bankName || selectedVendor.profile.bankName} — {meta.bankAccountName || selectedVendor.profile.accountName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Corporate Account Check</p>
                          <p className={meta.isCorporateAccount ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                            {meta.isCorporateAccount ? '✓ Corporate Account detected' : '⚠ Individual / Unverified naming'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-200/60">
                        <a
                          href="https://search.cac.gov.ng"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 transition"
                        >
                          <span>Verify on search.cac.gov.ng</span>
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setShowVendorModal(false);
                            setCacReviewModal({
                              vendorId: selectedVendor.profile.vendorId,
                              vendorName: selectedVendor.profile.vendorName,
                              verificationId: pendingCac.id,
                              rcNumber: pendingCac.idNumberMasked,
                              companyName: pendingCac.resolvedName,
                              bankAccountName: meta.bankAccountName || selectedVendor.profile.accountName,
                              bankName: meta.bankName || selectedVendor.profile.bankName,
                              nameMatchScore: pendingCac.nameMatchScore,
                              isCorporateAccount: meta.isCorporateAccount,
                            });
                          }}
                          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold transition"
                        >
                          Review & Approve / Reject
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Verification History */}
                {selectedVendor.verifications?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-900 mb-2">Verification History</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="pb-2 font-medium">Type</th>
                            <th className="pb-2 font-medium">Tier</th>
                            <th className="pb-2 font-medium">Identifier</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedVendor.verifications.map((v: any) => (
                            <tr key={v.id}>
                              <td className="py-2 font-medium uppercase text-slate-900">{v.idType}</td>
                              <td className="py-2 capitalize">{v.tier}</td>
                              <td className="py-2 font-mono text-slate-500">{v.idNumberMasked || '—'}</td>
                              <td className="py-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${v.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : v.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="py-2 text-slate-400">
                                {new Date(v.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400 py-10">Vendor data not available.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Action Modal (Set Tier / Suspend) ─────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {actionModal.type === 'set_tier' ? 'Override KYC Tier' : 'Suspend Vendor'}
              </h3>
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionReason('');
                  setActionMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Vendor: <span className="font-semibold text-slate-800">{actionModal.vendorName}</span>
            </p>

            {actionModal.type === 'set_tier' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'pro', 'business'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActionTier(t)}
                      className={`rounded-xl py-2 text-xs font-semibold border capitalize transition ${
                        actionTier === t
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  actionModal.type === 'suspend'
                    ? 'Reason for suspension (e.g. fraudulent activity detected)...'
                    : 'Reason for tier override (e.g. manual document review passed)...'
                }
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 resize-none"
              />
            </div>

            {actionMessage && (
              <div
                className={`mb-4 rounded-xl p-2.5 text-xs ${
                  actionMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionReason('');
                  setActionMessage(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={isActioning || !actionReason.trim()}
                className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition disabled:bg-slate-300 ${
                  actionModal.type === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isActioning
                  ? 'Processing...'
                  : actionModal.type === 'suspend'
                  ? 'Suspend Vendor'
                  : 'Update Tier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CAC Compliance Review Modal (Zero API Cost Workflow) ── */}
      {cacReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BuildingOffice2Icon className="h-6 w-6 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Verify CAC Business Registration</h3>
              </div>
              <button
                onClick={() => {
                  setCacReviewModal(null);
                  setCacActionMessage(null);
                  setCacRejectReason('');
                  setCacApproveNotes('');
                }}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Cross-check the submitted registration number on the official Corporate Affairs Commission public portal at{' '}
              <a
                href="https://search.cac.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 font-semibold underline inline-flex items-center gap-0.5"
              >
                search.cac.gov.ng <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </a>{' '}
              with zero API fees.
            </p>

            {cacActionMessage && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs font-medium ${
                  cacActionMessage.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {cacActionMessage.text}
              </div>
            )}

            {/* Submission Details Card */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Vendor:</span>
                <span className="font-semibold text-slate-900">{cacReviewModal.vendorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">CAC RC / BN Number:</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-sm">
                  {cacReviewModal.rcNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Registered Company:</span>
                <span className="font-bold text-slate-900">{cacReviewModal.companyName}</span>
              </div>
              {cacReviewModal.bankAccountName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Corporate Bank Account:</span>
                  <span className="font-medium text-slate-800">
                    {cacReviewModal.bankName ? `${cacReviewModal.bankName} - ` : ''}
                    {cacReviewModal.bankAccountName}
                  </span>
                </div>
              )}
              {cacReviewModal.nameMatchScore !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Name Similarity Score:</span>
                  <span className={`font-bold ${cacReviewModal.nameMatchScore >= 75 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {cacReviewModal.nameMatchScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Direct Verification Link Action */}
            <div className="mb-4 rounded-xl bg-purple-50/80 border border-purple-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-950">Official CAC Portal</p>
                <p className="text-[11px] text-purple-700">Search for &ldquo;{cacReviewModal.rcNumber}&rdquo; to verify active status</p>
              </div>
              <a
                href="https://search.cac.gov.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-purple-700 transition shadow-sm"
              >
                <span>Open CAC Portal</span>
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Notes / Reason */}
            <div className="space-y-3 mb-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Approval Notes (Optional):
                </label>
                <input
                  type="text"
                  value={cacApproveNotes}
                  onChange={(e) => setCacApproveNotes(e.target.value)}
                  placeholder="e.g. Verified active on CAC search portal"
                  disabled={isCacProcessing}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rejection Reason (Required only if rejecting):
                </label>
                <input
                  type="text"
                  value={cacRejectReason}
                  onChange={(e) => setCacRejectReason(e.target.value)}
                  placeholder="e.g. Company status shows inactive / RC number not found"
                  disabled={isCacProcessing}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleRejectCAC(cacReviewModal.verificationId)}
                disabled={isCacProcessing || !cacRejectReason.trim()}
                className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-40 px-3.5 py-2 text-xs font-semibold transition"
              >
                {isCacProcessing ? '...' : 'Reject Submission'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setCacReviewModal(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApproveCAC(cacReviewModal.verificationId)}
                  disabled={isCacProcessing}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-4 py-2 text-xs font-semibold transition shadow-sm"
                >
                  {isCacProcessing ? 'Processing...' : 'Approve & Upgrade to Business Tier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  iconColor,
  bgColor,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconColor: string;
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${bgColor}`}>
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-700' : 'text-slate-900'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function TierCard({
  tier,
  count,
  total,
  color,
}: {
  tier: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorMap: Record<string, { bar: string; text: string; bg: string }> = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-100' },
    sky: { bar: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-100' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-100' },
  };
  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="text-center">
      <p className={`text-xs font-semibold ${c.text} mb-1`}>{tier}</p>
      <p className="text-xl font-bold text-slate-900">{count}</p>
      <div className="h-1.5 w-full rounded-full bg-slate-100 mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{pct}%</p>
    </div>
  );
}
