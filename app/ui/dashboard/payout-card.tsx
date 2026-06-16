"use client";

import { useState } from "react";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface PayoutCardProps {
  user: any;
  balance: number;
  transactionFeePercentage: number;
}

export default function PayoutCard({ user, balance, transactionFeePercentage }: PayoutCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [amount, setAmount] = useState("");
  
  const numericAmount = parseFloat(amount) || 0;
  const estimatedFee = numericAmount * (transactionFeePercentage / 100);
  const estimatedNetAmount = numericAmount - estimatedFee;

  const minimumPayout = 5000;
  const canRequest = balance >= minimumPayout;
  const hasCompleteDetails =
    user?.bank_name && user?.account_number && user?.account_name;

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Please enter a valid amount", type: "error" });
      return;
    }

    if (parseFloat(amount) > balance) {
      setMessage({
        text: "Payout amount cannot exceed your balance",
        type: "error",
      });
      return;
    }

    if (parseFloat(amount) < minimumPayout) {
      setMessage({
        text: `Minimum payout is ₦${minimumPayout.toLocaleString()}`,
        type: "error",
      });
      return;
    }

    if (!hasCompleteDetails) {
      setMessage({
        text: "Please complete your bank account details in Settings first",
        type: "error",
      });
      return;
    }

    setIsRequesting(true);
    try {
      // Generate idempotency key to protect against duplicate submissions
      const generateUuid = () =>
        typeof crypto !== "undefined" && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                const r = (Math.random() * 16) | 0,
                  v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              },
            );

      const idempotencyKey = generateUuid();

      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), idempotencyKey }),
      });

      const data = await response.json();

      if (response.ok) {
        const infoText = data.idempotent
          ? "Payout request already submitted. We won't duplicate the transfer."
          : "Payout request submitted successfully! You will receive the funds in 24-48 hours.";

        setMessage({ text: infoText, type: "success" });
        setAmount("");
      } else {
        setMessage({
          text: data.error || "Failed to request payout",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BanknotesIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Earnings & Payouts
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Manage your earnings and request payouts to your bank account
        </p>
      </div>

      {/* Balance Card */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700 mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 0 })}
            </p>
          </div>
          {balance >= minimumPayout && (
            <div className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <CheckCircleIcon className="h-4 w-4" />
              Ready to Payout
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-emerald-700">
          Minimum payout: ₦{minimumPayout.toLocaleString()} | You can withdraw
          up to ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 0 })}
        </p>
      </div>

      {/* Bank Account Info */}
      {hasCompleteDetails ? (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Bank Account on File
          </p>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              <span className="font-medium">Bank:</span> {user.bank_name}
            </p>
            <p>
              <span className="font-medium">Account Name:</span>{" "}
              {user.account_name}
            </p>
            <p>
              <span className="font-medium">Account Number:</span>{" "}
              {user.account_number}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              Complete Your Bank Details
            </p>
            <p className="text-amber-800 mt-1">
              You need to add your bank account details in Settings before you
              can request a payout.
            </p>
            <a
              href="/dashboard/settings"
              className="inline-block mt-2 text-amber-700 font-semibold hover:text-amber-800 underline"
            >
              Go to Settings →
            </a>
          </div>
        </div>
      )}

      {/* Payout Form */}
      {hasCompleteDetails && (
        <form onSubmit={handleRequestPayout} className="space-y-4">
          <div>
            <label
              htmlFor="payout_amount"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Payout Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500 font-medium">
                ₦
              </span>
              <input
                id="payout_amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setMessage(null);
                }}
                placeholder={`Enter amount (min: ₦${minimumPayout.toLocaleString()})`}
                max={balance}
                min={minimumPayout}
                step="100"
                disabled={!canRequest}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {!canRequest &&
                `You need ₦${minimumPayout.toLocaleString()} minimum to request a payout`}
            </p>
            
            {/* Fee Estimate */}
            {numericAmount > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Estimated Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Amount:</span>
                    <span className="font-medium text-slate-900">
                      ₦{numericAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Transaction Fee ({transactionFeePercentage}%):
                    </span>
                    <span className="font-medium text-slate-900">
                      ₦{estimatedFee.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <span className="font-semibold text-slate-900">Net to Receive:</span>
                    <span className="font-bold text-emerald-600">
                      ₦{estimatedNetAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canRequest || !hasCompleteDetails || isRequesting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isRequesting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Request Payout"
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Payouts are processed within 24-48 hours. A service fee of {transactionFeePercentage}%
            applies to all withdrawals.
          </p>
        </form>
      )}

      {/* Info Section */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <h3 className="font-semibold text-sm text-slate-900">
          How Payouts Work
        </h3>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>Minimum payout is ₦5,000</li>
          <li>A {transactionFeePercentage}% service fee is deducted from your payout</li>
          <li>Payouts are processed Monday-Friday</li>
          <li>Funds arrive in 24-48 hours to your bank account</li>
          <li>You can request multiple payouts</li>
        </ul>
      </div>
    </div>
  );
}
