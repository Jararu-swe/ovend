# Tasks

## Overview

This implementation plan updates the billing UI to display and manage the 3-tier subscription system. The implementation replaces the existing single-tier SubscriptionPayCard with comprehensive subscription management components.

## Tasks

- [x] 1. Create subscription utility functions
  - Create `app/lib/subscription-utils.ts` file with utility functions for date formatting, calculations, and subscription helpers
  - Implement `formatSubscriptionDate(dateString)` to format ISO dates to readable format
  - Implement `calculateDaysRemaining(expiryDate)` to calculate days until expiry
  - Implement `getStatusBadgeStyle(status)` to return Tailwind classes for status badges
  - Implement `getTierDisplayName(tier)` to return formatted tier names (Starter, Pro, Business)
  - Implement `formatPrice(kobo)` to convert kobo to naira with formatting (₦X,XXX)
  - Add TypeScript types for all function parameters and return values
  - Export all functions from the module
  - _Requirements: 22.1, 22.2, 22.3_

- [x] 2. Create subscription client actions
  - Create `app/lib/subscription-actions.ts` file with client-side action functions
  - Implement `upgradeSubscription(tier)` async function that calls POST /api/subscriptions/initialize
  - Implement `startTrial(tier)` async function that calls POST /api/subscriptions/trial
  - Implement `cancelSubscription()` async function that calls POST /api/subscriptions/cancel
  - Implement `verifyPayment(reference)` async function that calls POST /api/subscriptions/verify
  - Add error handling for network failures and API errors
  - Return consistent result objects with `{ok: boolean; error?: string}` structure
  - Add TypeScript types for all parameters and return values
  - _Requirements: 5.5, 5.6, 5.7, 5.8, 9.3, 11.6_


- [x] 3. Create subscription status badge component
  - Create `app/ui/dashboard/subscription/subscription-status-badge.tsx` file as reusable badge component
  - Define `SubscriptionStatusBadgeProps` interface with status and optional className
  - Implement component that renders status text with color-coded background
  - Map status values to Tailwind classes (active=green, trial=blue, past_due=red, cancelled/inactive=gray)
  - Add aria-label for accessibility ("Subscription status: Active")
  - Export component with TypeScript types
  - Add capitalize utility for status text display
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 20.6_

- [x] 4. Create feature list component
  - Create `app/ui/dashboard/subscription/feature-list.tsx` file to display feature availability
  - Define `FeatureListProps` interface with features object and current tier
  - Create feature items array with labels and availability by tier
  - Render each feature with checkmark (✓) or x-mark (×) based on availability
  - Add icons using Heroicons (CheckIcon, XMarkIcon)
  - Style enabled features with green text and disabled with gray text
  - Add aria-label for each feature ("Feature included" or "Feature not available")
  - Make component responsive for mobile layout
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 7.2, 7.3, 7.4, 20.3_

- [x] 5. Create current plan card component
  - Create `app/ui/dashboard/subscription/current-plan-card.tsx` file displaying current subscription
  - Define `CurrentPlanCardProps` interface with subscription and productUsage
  - Display tier name prominently with SubscriptionStatusBadge
  - Show next billing date or trial end date using formatSubscriptionDate
  - Display product usage with progress indicator ("8/10 products used")
  - Highlight product usage in warning color if >= 90%
  - Display transaction fee percentage for current tier
  - Add "Cancel Subscription" button for active paid subscriptions
  - Make component responsive for mobile devices
  - _Requirements: 2.1, 2.7, 2.8, 7.1, 7.5, 7.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 16.2_

- [x] 6. Create tier card component
  - Create `app/ui/dashboard/subscription/tier-card.tsx` file as client component for individual tier display
  - Define `TierCardProps` interface with plan, isCurrent, currentTier, onUpgrade, onDowngrade, onStartTrial
  - Display tier name and pricing (Free, ₦1,500/month, ₦3,500/month)
  - Show product limit and transaction fee percentage
  - Render FeatureList component with tier features
  - Determine action button: "Current Plan" (disabled), "Upgrade", "Start 14-Day Trial", or "Downgrade"
  - Highlight current tier with border and "Current Plan" badge
  - Add hover effects for non-current tiers
  - Implement onClick handlers for action buttons
  - _Requirements: 1.1, 1.2, 1.3, 1.10, 5.1, 5.2, 5.3, 6.1, 6.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [x] 7. Create tier comparison grid component
  - Create `app/ui/dashboard/subscription/tier-comparison.tsx` file as client component
  - Define `TierComparisonProps` interface with plans, currentTier, currentStatus, canStartTrial
  - Implement three-column grid layout (lg:grid-cols-3) that stacks on mobile
  - Map over plans array and render TierCard for each tier
  - Pass appropriate props to each TierCard including isCurrent flag
  - Implement onUpgrade handler that opens payment modal
  - Implement onDowngrade handler that opens cancellation dialog
  - Implement onStartTrial handler that calls trial activation API
  - Add loading states during API calls and error messages from API failures
  - Use router.refresh() after successful tier changes
  - _Requirements: 1.1-1.10, 5.1-5.9, 6.1-6.9, 13.1-13.8, 16.1, 17.1_

- [x] 8. Create trial banner component
  - Create `app/ui/dashboard/subscription/trial-banner.tsx` file to display trial status
  - Define `TrialBannerProps` interface with subscription data
  - Calculate days remaining using calculateDaysRemaining utility
  - Display "X days remaining in your trial" message
  - Apply urgent styling (orange/red) when <= 3 days remaining
  - Add "Add Payment Method" call-to-action button
  - Add role="alert" for screen reader accessibility
  - Style with blue background for normal trial, orange/red for urgent
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 20.6_

- [x] 9. Create grace period warning component
  - Create `app/ui/dashboard/subscription/grace-period-warning.tsx` file for past_due warnings
  - Define `GracePeriodWarningProps` interface with subscription data
  - Calculate grace period days remaining (7 days from expiry)
  - Display urgent warning message about feature loss
  - Show days remaining in grace period
  - Add "Update Payment Method" call-to-action button
  - Style with red background and warning icon
  - Add role="alert" for screen reader accessibility
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 20.6_

- [x] 10. Create payment modal component
  - Create `app/ui/dashboard/subscription/payment-modal.tsx` file as client component
  - Define `PaymentModalProps` interface with tier, amount, isOpen, onClose
  - Add state for isProcessing and error messages
  - Implement handlePayment function that: calls POST /api/subscriptions/initialize, retrieves payment reference, initializes Paystack popup, handles callbacks, calls verifyPayment on success, refreshes page
  - Display loading spinner during payment processing and error messages from failures
  - Trap focus within modal when open
  - Support Escape key to close modal
  - Add overlay backdrop with click-to-close
  - _Requirements: 5.5, 5.6, 5.7, 5.8, 14.1-14.8, 17.2, 17.6, 20.5_

- [x] 11. Create cancellation dialog component
  - Create `app/ui/dashboard/subscription/cancellation-dialog.tsx` file as client component
  - Define `CancellationDialogProps` interface with subscription, isOpen, onClose, onConfirm
  - Display current tier name and subscription expiry date
  - Explain that access continues until expiry date
  - List features that will be lost after cancellation
  - Show "Cancel Subscription" (destructive) and "Keep Subscription" buttons
  - Implement onConfirm handler that calls cancelSubscription API with loading state
  - Show error messages if cancellation fails
  - Close dialog and refresh page after successful cancellation
  - Trap focus within dialog when open
  - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 11.1-11.9, 17.2, 20.5_

- [x] 12. Create payment history section component
  - Create `app/ui/dashboard/subscription/payment-history-section.tsx` file
  - Define `PaymentHistorySectionProps` interface with payments array
  - Render "No payment history" message if payments array is empty
  - Display payment list with date, amount, tier, and reference
  - Sort payments by date in descending order (most recent first)
  - Add "Download Invoice" button for each payment
  - Display billing period for each payment (start and end dates)
  - Use condensed card layout on mobile devices
  - Add loading state while fetching payment history and handle invoice download errors
  - _Requirements: 10.1-10.8_

- [x] 13. Update billing page to use new components
  - Open `app/dashboard/billing/page.tsx` and add server-side data fetching
  - Fetch current subscription from GET /api/subscriptions/current
  - Fetch available plans from GET /api/subscriptions/plans
  - Fetch product count from database and calculate product usage percentage
  - Remove SubscriptionPayCard component import
  - Import new subscription UI components (TrialBanner, GracePeriodWarning, CurrentPlanCard, TierComparison, PaymentHistorySection)
  - Add conditional rendering for TrialBanner (if status === 'trial')
  - Add conditional rendering for GracePeriodWarning (if status === 'past_due')
  - Always render CurrentPlanCard and TierComparison
  - Conditionally render PaymentHistorySection if payment history exists
  - Keep existing PayoutCard, PayoutHistory components, and Paystack Script
  - _Requirements: 8.1, 8.2, 18.1-18.7, 19.1, 19.3_

- [x] 14. Add loading and error states to billing page
  - Add Suspense boundary around subscription components
  - Create skeleton placeholder components for loading state
  - Implement error boundary for API fetch failures
  - Display user-friendly error messages when data fetch fails
  - Add "Retry" button for failed data fetches
  - Show fallback UI if subscription data is unavailable
  - Add loading spinners for client-side actions
  - Implement error toast notifications for action failures
  - _Requirements: 17.1-17.8_

- [x] 15. Implement responsive design for mobile
  - Update TierComparison to stack vertically on mobile (grid-cols-1)
  - Ensure CurrentPlanCard is readable on small screens
  - Make trial banner and grace period warning full-width on mobile
  - Ensure action buttons are full-width with 44px minimum height on mobile
  - Test payment modal and cancellation dialog on mobile devices
  - Ensure payment history cards are readable on small screens
  - Test all interactive elements with touch events
  - Verify responsive typography scales properly
  - _Requirements: 16.1-16.7_

- [x] 16. Implement accessibility features
  - Add semantic HTML to all components (article, section, button)
  - Implement proper heading hierarchy (h1 → h2 → h3)
  - Add aria-label attributes to status badges and action buttons
  - Implement focus trap in payment modal and cancellation dialog
  - Add role="alert" to trial banner and grace period warning
  - Ensure all interactive elements have visible focus indicators
  - Test color contrast ratios with accessibility tools
  - Test keyboard navigation through all components
  - Add skip links for keyboard users and ensure form inputs have associated labels
  - _Requirements: 20.1-20.8_

- [x] 17. Add TypeScript types for all components
  - Define all component prop interfaces in respective files
  - Add return type annotations to all functions
  - Fix any TypeScript errors or warnings
  - Add JSDoc comments for complex types
  - Export types that may be reused
  - Ensure API response types match backend types
  - Add validation for user inputs where applicable
  - _Requirements: 21.1-21.7_

- [~] 18. Test payment integration end-to-end
  - Test upgrade flow from Starter to Pro in development
  - Test upgrade flow from Pro to Business
  - Verify Paystack popup opens correctly and test payment success callback
  - Verify subscription updates after successful payment
  - Test payment failure scenarios and error messages
  - Test trial activation flow
  - Verify router.refresh() updates UI correctly
  - Test with actual Paystack test cards
  - _Requirements: 5.5-5.9, 9.3-9.6, 14.1-14.8_

- [~] 19. Test cancellation flow
  - Test cancellation dialog opens correctly with correct expiry date and features
  - Verify dialog shows correct information
  - Test cancellation API call succeeds and subscription status updates to 'cancelled'
  - Verify UI updates after cancellation
  - Test "Keep Subscription" button closes dialog without changes
  - Verify cancelled subscriptions show correct UI state
  - Test that cancelled subscriptions maintain access until expiry
  - _Requirements: 11.1-11.9_

- [x] 20. Remove deprecated SubscriptionPayCard component
  - Verify new components are fully functional in production
  - Remove `app/ui/dashboard/subscription-pay-card.tsx` file
  - Remove any remaining imports of SubscriptionPayCard
  - Search codebase for any other references to old component
  - Update any documentation referencing the old component
  - _Requirements: 18.1, 18.2_


