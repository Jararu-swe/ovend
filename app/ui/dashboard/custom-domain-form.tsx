"use client";

import { useState, useEffect, useCallback } from "react";
import { validateDomain } from "@/app/lib/domain-validation";
import {
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

type DomainStatus = "pending" | "verifying" | "verified" | "failed" | "removed" | null;
type SSLStatus = "pending" | "provisioning" | "active" | "failed" | null;

interface DomainInfo {
  id: string;
  domain: string;
  status: DomainStatus;
  ssl_status: SSLStatus;
  verified_at: string | null;
  created_at: string;
}

interface DNSInstructions {
  txtRecord: { name: string; value: string } | null;
  cnameRecord: { name: string; value: string } | null;
  instructions: string[];
}

export default function CustomDomainForm() {
  const [domain, setDomain] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [dnsInstructions, setDnsInstructions] = useState<DNSInstructions | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Load current domain status on mount
  useEffect(() => {
    fetchDomainStatus();
  }, []);

  async function fetchDomainStatus() {
    try {
      const response = await fetch("/api/vendor/domain/status");
      if (response.ok) {
        const data = await response.json();
        if (data.domain) {
          setDomainInfo(data.domain);
          setDomain(data.domain.domain);

          // If pending/verifying, show instructions
          if (data.domain.status === "pending" || data.domain.status === "verifying") {
            setShowInstructions(true);
          }
        }
      }
    } catch {
      // Silently fail - component will show connect form
    }
  }

  const validateClientSide = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return "Enter a domain to connect.";
    }
    const result = validateDomain(value);
    return result.valid ? null : result.error || null;
  }, []);

  const handleDomainChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomain(value);
    // Only show validation errors if the field has been touched
    if (touched) {
      setValidationError(validateClientSide(value));
    }
  }, [touched, validateClientSide]);

  const handleDomainBlur = useCallback(() => {
    setTouched(true);
    setValidationError(validateClientSide(domain));
  }, [domain, validateClientSide]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Run client-side validation before submitting
    const clientError = validateClientSide(domain);
    if (clientError) {
      setValidationError(clientError);
      setTouched(true);
      return;
    }
    setValidationError(null);

    setIsConnecting(true);

    try {
      const response = await fetch("/api/vendor/domain/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to connect domain.");
        return;
      }

      setDomainInfo(data.domain);
      setDnsInstructions(data.dnsInstructions);
      setShowInstructions(true);
      setSuccess("Domain added! Configure your DNS settings below.");
    } catch (err: any) {
      setError(err.message || "Failed to connect domain.");
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleVerify() {
    setError(null);
    setSuccess(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/vendor/domain/verify", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify domain.");
        return;
      }

      if (data.success) {
        setDomainInfo((prev) =>
          prev ? { ...prev, status: "verified", ssl_status: "provisioning" } : prev
        );
        setSuccess("Domain verified successfully! Your store is now live on your custom domain.");
        setShowInstructions(false);
      } else {
        setError(data.message || "Domain not yet verified. DNS may still be propagating.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify domain.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect this domain? Your store will no longer be accessible via this custom URL.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDisconnecting(true);

    try {
      const response = await fetch("/api/vendor/domain/disconnect", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to disconnect domain.");
        return;
      }

      setDomainInfo(null);
      setDomain("");
      setDnsInstructions(null);
      setShowInstructions(false);
      setTouched(false);
      setValidationError(null);
      setSuccess("Domain disconnected successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to disconnect domain.");
    } finally {
      setIsDisconnecting(false);
    }
  }

  const statusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Verified
          </span>
        );
      case "verifying":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <ClockIcon className="h-3.5 w-3.5" />
            Verifying
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <ArrowPathIcon className="h-3.5 w-3.5" />
            Pending DNS Setup
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
            <XCircleIcon className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const sslBadge = (sslStatus: string | null) => {
    switch (sslStatus) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            SSL Active
          </span>
        );
      case "provisioning":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            <ClockIcon className="h-3.5 w-3.5" />
            SSL Provisioning...
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <XCircleIcon className="h-3.5 w-3.5" />
            SSL Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Custom Domain</h2>
          <p className="text-xs text-slate-500">Connect your own domain to your storefront</p>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Connected domain info */}
      {domainInfo?.status === "verified" ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-900">{domainInfo.domain}</span>
              </div>
              {statusBadge(domainInfo.status)}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              {sslBadge(domainInfo.ssl_status)}
              {domainInfo.verified_at && (
                <span>Verified {new Date(domainInfo.verified_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <a
            href={`https://${domainInfo.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Visit your store →
          </a>

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect domain"}
          </button>
        </div>
      ) : domainInfo ? (
        /* Domain pending/verifying - show DNS instructions */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{domainInfo.domain}</span>
              {statusBadge(domainInfo.status)}
            </div>
          </div>

          {showInstructions && dnsInstructions && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  DNS Configuration Instructions
                </h3>
                <a
                  href="https://vercel.com/docs/projects/domains/add-a-domain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center gap-1.5"
                  title="Open Vercel DNS setup guide"
                >
                  <BookOpenIcon className="h-3.5 w-3.5" />
                  DNS Guide
                </a>
              </div>
              <p className="text-xs text-slate-600">
                Add the following records to your domain&apos;s DNS settings at your domain provider
                (e.g. Namecheap, GoDaddy, Porkbun).
              </p>

              <div className="space-y-2">
                {dnsInstructions.cnameRecord && (
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">CNAME Record</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Name:</span>
                        <code className="block mt-0.5 bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                          {dnsInstructions.cnameRecord.name}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">Value:</span>
                        <code className="block mt-0.5 bg-slate-100 px-2 py-1 rounded text-xs font-mono break-all">
                          {dnsInstructions.cnameRecord.value}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                {dnsInstructions.txtRecord && (
                  <div className="rounded-lg bg-white border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-1">TXT Record (Verification)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Name:</span>
                        <code className="block mt-0.5 bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                          {dnsInstructions.txtRecord.name}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">Value:</span>
                        <code className="block mt-0.5 bg-slate-100 px-2 py-1 rounded text-xs font-mono break-all">
                          {dnsInstructions.txtRecord.value}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <ol className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                {dnsInstructions.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify Domain"
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {isDisconnecting ? "Disconnecting..." : "Cancel & disconnect"}
          </button>
        </div>
      ) : (
        /* No domain connected - show connect form */
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="custom-domain" className="block text-sm font-medium text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                Your Domain
                <span className="group relative">
                  <QuestionMarkCircleIcon className="h-4 w-4 text-slate-400 cursor-help transition-colors hover:text-slate-600" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Enter the domain you own (e.g. mybrand.com). You&apos;ll need to add DNS records at your domain provider to connect it.
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </span>
                </span>
              </span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  id="custom-domain"
                  type="text"
                  value={domain}
                  onChange={handleDomainChange}
                  onBlur={handleDomainBlur}
                  placeholder="mybrand.com"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition-colors ${
                    validationError && touched
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  }`}
                />
                {/* Valid domain indicator */}
                {domain.trim() && touched && !validationError && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                )}
                {/* Inline validation error */}
                {validationError && touched && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
                    <ExclamationCircleIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!domain || isConnecting || (touched && !!validationError)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Enter the domain you own (e.g. mybrand.com or shop.mybrand.com). We&apos;ll guide you through the DNS setup.
            </p>
            <a
              href="https://vercel.com/docs/projects/domains/add-a-domain"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              <BookOpenIcon className="h-3.5 w-3.5" />
              How to configure DNS for your domain
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
