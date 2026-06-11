'use client';

import { SubscriptionPlan, SubscriptionTier } from '@/app/lib/definitions';
import FeatureList from './feature-list';
import { formatPrice } from '@/app/lib/subscription-utils';

interface TierCardProps {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  currentTier: SubscriptionTier;
  canStartTrial: boolean;
  onUpgrade: (tier: SubscriptionTier) => void;
  onStartTrial: (tier: SubscriptionTier) => void;
}

export default function TierCard({
  plan,
  isCurrent,
  currentTier,
  canStartTrial,
  onUpgrade,
  onStartTrial,
}: TierCardProps) {
  const tierRank = {
    starter: 0,
    pro: 1,
    business: 2,
  };

  const isHigherTier = tierRank[plan.tier] > tierRank[currentTier];

  const getPricingDisplay = () => {
    if (plan.price_kobo === 0) {
      return 'Free';
    }
    return `${formatPrice(plan.price_kobo)}/month`;
  };

  const getActionButton = () => {
    if (isCurrent) {
      return (
        <button
          type="button"
          disabled
          className="w-full py-3 px-4 bg-slate-100 text-slate-500 font-medium rounded-xl cursor-not-allowed"
          aria-label="Current plan"
        >
          Current Plan
        </button>
      );
    }

    if (isHigherTier) {
      // Show trial button only for paid tiers when trial is available
      if (canStartTrial && plan.price_kobo > 0) {
        return (
          <button
            type="button"
            onClick={() => onStartTrial(plan.tier)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            aria-label={`Start 14-day trial for ${plan.name} tier`}
          >
            Start 14-Day Trial
          </button>
        );
      }

      return (
        <button
          type="button"
          onClick={() => onUpgrade(plan.tier)}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl shadow-sm transition-colors"
          aria-label={`Upgrade to ${plan.name} tier for ${getPricingDisplay()}`}
        >
          Upgrade
        </button>
      );
    }

    // No downgrade option - users can only upgrade
    return null;
  };

  return (
    <article
      className={`
        relative rounded-xl p-6 flex flex-col
        ${
          isCurrent
            ? 'border-2 border-emerald-500 shadow-lg'
            : 'border border-slate-200 hover:border-emerald-300 transition-colors'
        }
        bg-white
      `}
    >
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
            Current Plan
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>

      {/* Pricing */}
      <div className="mb-6">
        <p className="text-3xl font-bold text-slate-900">
          {getPricingDisplay()}
        </p>
      </div>

      {/* Product Limit */}
      <div className="mb-4 pb-4 border-b border-slate-200">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {plan.product_limit === 1000 ? '1,000' : plan.product_limit}
          </span>{' '}
          products
        </p>
        <p className="text-sm text-slate-600 mt-1">
          <span className="font-semibold text-slate-900">
            {plan.transaction_fee_percentage}%
          </span>{' '}
          transaction fee
        </p>
      </div>

      {/* Feature List */}
      <div className="flex-grow mb-6">
        <FeatureList plan={plan} currentTier={currentTier} />
      </div>

      {/* Action Button */}
      <div className="mt-auto">{getActionButton()}</div>
    </article>
  );
}
