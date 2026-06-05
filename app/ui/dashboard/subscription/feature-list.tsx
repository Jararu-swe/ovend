import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier, SubscriptionPlan } from '@/app/lib/definitions';

interface FeatureListProps {
  plan: SubscriptionPlan;
  currentTier?: SubscriptionTier;
}

interface FeatureItem {
  label: string;
  getValue: (plan: SubscriptionPlan) => boolean | string | number;
  formatDisplay?: (value: boolean | string | number, plan: SubscriptionPlan) => string;
}

const features: FeatureItem[] = [
  {
    label: 'Products',
    getValue: (plan) => plan.product_limit,
    formatDisplay: (value) => `Up to ${value} products`,
  },
  {
    label: 'Transaction Fee',
    getValue: (plan) => plan.transaction_fee_percentage,
    formatDisplay: (value) => `${value}% per transaction`,
  },
  {
    label: 'Analytics',
    getValue: (plan) => plan.features.analytics,
  },
  {
    label: 'Advanced Analytics',
    getValue: (plan) => plan.features.advanced_analytics ?? false,
  },
  {
    label: 'Team Members',
    getValue: (plan) => plan.features.team_members,
  },
  {
    label: 'Custom Domain',
    getValue: (plan) => plan.features.custom_domain,
  },
  {
    label: 'Priority Support',
    getValue: (plan) => plan.features.priority_support,
  },
];

export default function FeatureList({ plan }: FeatureListProps) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => {
        const value = feature.getValue(plan);
        const isAvailable = typeof value === 'boolean' ? value : true;
        const displayText = feature.formatDisplay
          ? feature.formatDisplay(value, plan)
          : feature.label;

        return (
          <li
            key={feature.label}
            className="flex items-start gap-2 text-sm"
            aria-label={
              isAvailable ? 'Feature included' : 'Feature not available'
            }
          >
            {isAvailable ? (
              <CheckIcon
                className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ) : (
              <XMarkIcon
                className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
            <span
              className={
                isAvailable
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-400 line-through'
              }
            >
              {displayText}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
