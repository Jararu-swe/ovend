'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SubscriptionPlan,
  SubscriptionTier,
  SubscriptionStatus,
  VendorSubscriptionInfo,
} from '@/app/lib/definitions';
import TierCard from './tier-card';
import CancellationDialog from './cancellation-dialog';
import PaymentModal from './payment-modal';
import DowngradeDialog from './downgrade-dialog';
import { startTrial } from '@/app/lib/subscription-actions';

interface TierComparisonProps {
  plans: SubscriptionPlan[];
  currentTier: SubscriptionTier;
  currentStatus: SubscriptionStatus;
  canStartTrial: boolean;
  subscription?: VendorSubscriptionInfo;
}

export default function TierComparison({
  plans,
  currentTier,
  currentStatus,
  canStartTrial,
  subscription,
}: TierComparisonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [downgradeTarget, setDowngradeTarget] = useState<SubscriptionTier>('starter');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // Sort plans by tier rank (starter -> pro -> business)
  const sortedPlans = [...plans].sort((a, b) => {
    const tierRank = { starter: 0, pro: 1, business: 2 };
    return tierRank[a.tier] - tierRank[b.tier];
  });

  /**
   * Handle subscription upgrade flow
   * Opens payment modal for paid tiers (to be implemented in task 10)
   */
  const handleUpgrade = async (tier: SubscriptionTier) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the plan details
      const plan = plans.find((p) => p.tier === tier);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // For free tier, this shouldn't happen, but handle it gracefully
      if (plan.price_kobo === 0) {
        setError('Cannot upgrade to free tier');
        setIsLoading(false);
        return;
      }

      setSelectedTier(tier);
      setSelectedAmount(plan.price_kobo);
      setShowPaymentModal(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error preparing upgrade:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setIsLoading(false);
    }
  };

  /**
   * Handle trial activation flow
   */
  const handleStartTrial = async (tier: SubscriptionTier) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await startTrial(tier);

      if (!result.ok) {
        setError(result.error || 'Failed to start trial');
        setIsLoading(false);
        return;
      }

      // Refresh the page to show updated subscription
      router.refresh();
    } catch (err) {
      console.error('Error starting trial:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setIsLoading(false);
    }
  };

  /**
   * Handle downgrade flow
   * Opens downgrade dialog
   */
  const handleDowngrade = (tier: SubscriptionTier) => {
    setDowngradeTarget(tier);
    setShowDowngradeDialog(true);
  };

  /**
   * Close downgrade dialog
   */
  const handleCloseDowngradeDialog = () => {
    setShowDowngradeDialog(false);
  };

  /**
   * Close cancellation dialog
   */
  const handleCloseCancellationDialog = () => {
    setShowCancellationDialog(false);
  };

  return (
    <section className="w-full" aria-labelledby="tier-comparison-heading">
      <h2 id="tier-comparison-heading" className="sr-only">
        Subscription Plans Comparison
      </h2>

      {/* Error Message Banner */}
      {error && (
        <div
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-slate-900 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => (
          <TierCard
            key={plan.tier}
            plan={plan}
            isCurrent={plan.tier === currentTier}
            currentTier={currentTier}
            canStartTrial={canStartTrial}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
            onStartTrial={handleStartTrial}
          />
        ))}
      </div>

      {/* Cancellation Dialog */}
      {subscription && (
        <CancellationDialog
          subscription={subscription}
          isOpen={showCancellationDialog}
          onClose={handleCloseCancellationDialog}
        />
      )}

      {/* Downgrade Dialog */}
      <DowngradeDialog
        targetTier={downgradeTarget}
        isOpen={showDowngradeDialog}
        onClose={handleCloseDowngradeDialog}
      />

      {/* Payment Modal */}
      <PaymentModal
        tier={selectedTier}
        amount={selectedAmount}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </section>
  );
}
