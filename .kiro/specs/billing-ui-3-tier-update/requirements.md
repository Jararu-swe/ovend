# Requirements Document

## Introduction

This document specifies the requirements for updating the billing UI to integrate with the new 3-tier subscription pricing system. The existing billing page currently displays a simple single-tier subscription card that charges ₦3,000/month. The updated UI must display all three subscription tiers (Starter, Pro, Business), show current subscription status, enable plan upgrades and downgrades, and integrate with the subscription API endpoints implemented in the backend.

## Glossary

- **Billing_UI**: The user interface components in the vendor dashboard for managing subscriptions and viewing billing information
- **Subscription_Card**: The component that displays subscription tier, status, features, and payment options
- **Tier_Comparison**: A visual display showing features and pricing for all three subscription tiers
- **Upgrade_Flow**: The user interaction sequence for upgrading from a lower tier to a higher tier
- **Downgrade_Flow**: The user interaction sequence for downgrading from a higher tier to a lower tier
- **Trial_Banner**: A UI element displaying trial status and days remaining
- **Grace_Period_Warning**: A UI notification alerting vendors of past_due status and days remaining
- **Plan_Selector**: An interactive component allowing vendors to choose between Starter, Pro, and Business tiers
- **Feature_Badge**: A visual indicator showing which features are available for each tier
- **Current_Plan_Display**: A section showing the vendor's active subscription tier and status
- **Billing_History_Section**: A UI component displaying past payments and invoices
- **Subscription_API**: The backend API endpoints for managing subscriptions (/api/subscriptions/*)
- **Payment_Modal**: A modal dialog for initiating Paystack payment for tier upgrades
- **Cancellation_Dialog**: A confirmation dialog for subscription cancellation
- **Expiry_Display**: A UI element showing when the current subscription period ends

## Requirements

### Requirement 1: Display All Three Subscription Tiers

**User Story:** As a vendor, I want to see all three subscription tiers with their features and pricing, so that I can compare plans and choose the best option for my business

#### Acceptance Criteria

1. THE Billing_UI SHALL display three subscription tiers: Starter (Free), Pro (₦1,500/month), and Business (₦3,500/month)
2. THE Tier_Comparison SHALL display product limits for each tier: Starter (10 products), Pro (100 products), Business (1,000 products)
3. THE Tier_Comparison SHALL display transaction fee percentages for each tier: Starter (5%), Pro (3%), Business (2%)
4. THE Tier_Comparison SHALL display feature availability using Feature_Badge indicators
5. THE Tier_Comparison SHALL highlight analytics availability (Pro and Business only)
6. THE Tier_Comparison SHALL highlight advanced analytics availability (Business only)
7. THE Tier_Comparison SHALL highlight team member access (Business only)
8. THE Tier_Comparison SHALL highlight custom domain capability (Business only)
9. THE Tier_Comparison SHALL highlight priority support (Pro and Business only)
10. THE Tier_Comparison SHALL use visual hierarchy to distinguish between tiers (card styling, spacing, badges)

### Requirement 2: Display Current Subscription Status

**User Story:** As a vendor, I want to see my current subscription tier and status, so that I understand what plan I'm on and when it expires

#### Acceptance Criteria

1. THE Current_Plan_Display SHALL show the vendor's current tier name (Starter, Pro, or Business)
2. WHEN subscription_status is 'active', THE Current_Plan_Display SHALL display "Active" status with green indicator
3. WHEN subscription_status is 'trial', THE Current_Plan_Display SHALL display "Trial" status with blue indicator
4. WHEN subscription_status is 'past_due', THE Current_Plan_Display SHALL display "Past Due" status with red indicator
5. WHEN subscription_status is 'cancelled', THE Current_Plan_Display SHALL display "Cancelled" status with gray indicator
6. WHEN subscription_status is 'inactive', THE Current_Plan_Display SHALL display "Inactive" status with gray indicator
7. WHEN vendor has paid subscription (Pro or Business), THE Expiry_Display SHALL show the next billing date from subscription_expires_at
8. THE Current_Plan_Display SHALL be prominently positioned at the top of the billing page

### Requirement 3: Display Trial Status and Days Remaining

**User Story:** As a vendor on a trial, I want to see how many days remain in my trial, so that I know when I need to provide payment

#### Acceptance Criteria

1. WHEN subscription_status is 'trial', THE Trial_Banner SHALL be displayed at the top of the Billing_UI
2. THE Trial_Banner SHALL display the number of days remaining until trial expiration
3. THE Trial_Banner SHALL calculate days remaining from subscription_expires_at
4. WHEN trial has 3 or fewer days remaining, THE Trial_Banner SHALL display urgent styling (orange or red background)
5. THE Trial_Banner SHALL include a call-to-action button to add payment method
6. WHEN trial has expired, THE Trial_Banner SHALL not be displayed

### Requirement 4: Display Grace Period Warning for Past Due Subscriptions

**User Story:** As a vendor with a past due subscription, I want to see a clear warning about my grace period, so that I know when my access will be downgraded

#### Acceptance Criteria

1. WHEN subscription_status is 'past_due', THE Grace_Period_Warning SHALL be displayed prominently on the Billing_UI
2. THE Grace_Period_Warning SHALL display the number of days remaining in the 7-day grace period
3. THE Grace_Period_Warning SHALL calculate days remaining from subscription_expires_at plus 7 days
4. THE Grace_Period_Warning SHALL use urgent styling (red background, warning icon)
5. THE Grace_Period_Warning SHALL explain that paid features will be lost when grace period expires
6. THE Grace_Period_Warning SHALL include a call-to-action button to update payment method
7. WHEN grace period has expired, THE Grace_Period_Warning SHALL not be displayed

### Requirement 5: Enable Subscription Upgrade

**User Story:** As a vendor, I want to upgrade my subscription tier, so that I can access more features and lower transaction fees

#### Acceptance Criteria

1. WHEN vendor is on Starter tier, THE Plan_Selector SHALL display "Upgrade" buttons for Pro and Business tiers
2. WHEN vendor is on Pro tier, THE Plan_Selector SHALL display "Upgrade" button for Business tier
3. WHEN vendor is on Business tier, THE Plan_Selector SHALL not display any upgrade buttons
4. WHEN vendor clicks upgrade button, THE Billing_UI SHALL display tier features and pricing for confirmation
5. WHEN vendor confirms upgrade, THE Billing_UI SHALL call POST /api/subscriptions/initialize with selected tier
6. WHEN /api/subscriptions/initialize succeeds, THE Payment_Modal SHALL open with Paystack payment interface
7. WHEN payment succeeds, THE Billing_UI SHALL call POST /api/subscriptions/verify with payment reference
8. WHEN verification succeeds, THE Billing_UI SHALL refresh to display updated subscription status
9. WHEN upgrade from Starter includes trial option, THE Billing_UI SHALL offer 14-day trial before payment

### Requirement 6: Enable Subscription Downgrade

**User Story:** As a vendor, I want to downgrade my subscription tier, so that I can reduce costs if I no longer need premium features

#### Acceptance Criteria

1. WHEN vendor is on Pro tier, THE Plan_Selector SHALL display "Downgrade" button for Starter tier
2. WHEN vendor is on Business tier, THE Plan_Selector SHALL display "Downgrade" buttons for Pro and Starter tiers
3. WHEN vendor clicks downgrade button, THE Billing_UI SHALL display a Cancellation_Dialog with downgrade details
4. THE Cancellation_Dialog SHALL explain that downgrade will take effect at the end of current billing cycle
5. THE Cancellation_Dialog SHALL display the current billing cycle end date from subscription_expires_at
6. THE Cancellation_Dialog SHALL list features that will be lost upon downgrade
7. WHEN vendor confirms downgrade, THE Billing_UI SHALL call POST /api/subscriptions/cancel or appropriate downgrade endpoint
8. WHEN downgrade is scheduled, THE Billing_UI SHALL display a notice showing scheduled downgrade date
9. WHEN current billing cycle ends, THE Billing_UI SHALL display the new downgraded tier

### Requirement 7: Display Feature Access Indicators

**User Story:** As a vendor, I want to see which features are available on my current plan, so that I understand what I can access

#### Acceptance Criteria

1. THE Billing_UI SHALL display a feature list for the vendor's current tier
2. THE feature list SHALL include: product limits, transaction fees, analytics, team members, custom domain, priority support
3. WHEN feature is available on current tier, THE Feature_Badge SHALL display with checkmark and enabled styling
4. WHEN feature is not available on current tier, THE Feature_Badge SHALL display with lock icon and disabled styling
5. THE Billing_UI SHALL display product usage count (e.g., "8/10 products used" for Starter tier)
6. WHEN vendor is near product limit (90% or more), THE Billing_UI SHALL highlight product usage with warning styling

### Requirement 8: Integrate with Subscription API Endpoints

**User Story:** As the system, I want the Billing_UI to communicate with subscription APIs, so that tier changes and payments are processed correctly

#### Acceptance Criteria

1. THE Billing_UI SHALL call GET /api/subscriptions/current to fetch vendor's current subscription status on page load
2. THE Billing_UI SHALL call GET /api/subscriptions/plans to fetch available subscription plans with features and pricing
3. WHEN vendor initiates upgrade, THE Billing_UI SHALL call POST /api/subscriptions/initialize with tier parameter
4. WHEN vendor starts trial, THE Billing_UI SHALL call POST /api/subscriptions/trial with tier parameter
5. WHEN payment completes, THE Billing_UI SHALL call POST /api/subscriptions/verify with payment reference
6. WHEN vendor cancels subscription, THE Billing_UI SHALL call POST /api/subscriptions/cancel
7. THE Billing_UI SHALL handle API errors gracefully and display user-friendly error messages
8. WHEN API call fails, THE Billing_UI SHALL display specific error message from API response
9. THE Billing_UI SHALL use loading states during API calls to provide visual feedback

### Requirement 9: Handle Trial Activation Flow

**User Story:** As a new vendor, I want to start a trial for Pro or Business tier, so that I can evaluate premium features before paying

#### Acceptance Criteria

1. WHEN vendor has never had a paid subscription, THE Plan_Selector SHALL display "Start 14-Day Trial" button for Pro and Business tiers
2. WHEN vendor has previously had a paid subscription, THE Plan_Selector SHALL display "Upgrade" button without trial option
3. WHEN vendor clicks trial button, THE Billing_UI SHALL call POST /api/subscriptions/trial with selected tier
4. WHEN trial activation succeeds, THE Billing_UI SHALL display Trial_Banner with trial end date
5. WHEN trial activation succeeds, THE Billing_UI SHALL refresh to show new tier access
6. THE Billing_UI SHALL display trial terms (14 days, no payment required, can cancel anytime)

### Requirement 10: Display Payment History and Invoices

**User Story:** As a vendor with a paid subscription, I want to view my payment history and download invoices, so that I can track my subscription expenses

#### Acceptance Criteria

1. WHEN vendor has made at least one subscription payment, THE Billing_History_Section SHALL be displayed
2. THE Billing_History_Section SHALL display a list of all subscription payments with date, amount, and tier
3. THE Billing_History_Section SHALL sort payments by date in descending order (most recent first)
4. THE Billing_History_Section SHALL display payment reference for each transaction
5. THE Billing_History_Section SHALL provide a "Download Invoice" button for each payment
6. WHEN vendor clicks "Download Invoice", THE Billing_UI SHALL fetch invoice PDF from backend
7. THE Billing_History_Section SHALL display the billing period for each payment (start and end dates)
8. WHEN vendor has no payment history, THE Billing_History_Section SHALL not be displayed

### Requirement 11: Handle Subscription Cancellation

**User Story:** As a vendor, I want to cancel my subscription, so that I stop being charged when I no longer need paid features

#### Acceptance Criteria

1. WHEN vendor has active paid subscription (Pro or Business), THE Billing_UI SHALL display "Cancel Subscription" button
2. WHEN vendor clicks cancel button, THE Cancellation_Dialog SHALL display with cancellation details
3. THE Cancellation_Dialog SHALL explain that access continues until subscription_expires_at
4. THE Cancellation_Dialog SHALL display the date when access will end
5. THE Cancellation_Dialog SHALL list features that will be lost after cancellation
6. WHEN vendor confirms cancellation, THE Billing_UI SHALL call POST /api/subscriptions/cancel
7. WHEN cancellation succeeds, THE Current_Plan_Display SHALL update status to "Cancelled"
8. WHEN cancellation succeeds, THE Billing_UI SHALL display notice with access end date
9. WHEN subscription_expires_at is reached, THE Billing_UI SHALL display Starter tier as current plan

### Requirement 12: Display Next Billing Date

**User Story:** As a vendor with a paid subscription, I want to see when my next billing date is, so that I can anticipate upcoming charges

#### Acceptance Criteria

1. WHEN vendor has active paid subscription, THE Expiry_Display SHALL show next billing date
2. THE Expiry_Display SHALL calculate next billing date from subscription_expires_at
3. THE Expiry_Display SHALL display the billing amount (₦1,500 for Pro, ₦3,500 for Business)
4. THE Expiry_Display SHALL display "Renews on [date]" label
5. WHEN subscription is cancelled, THE Expiry_Display SHALL display "Access ends on [date]" instead
6. THE Expiry_Display SHALL use clear date formatting (e.g., "January 15, 2024")

### Requirement 13: Provide Plan Comparison View

**User Story:** As a vendor evaluating subscription options, I want to compare all tiers side-by-side, so that I can make an informed decision

#### Acceptance Criteria

1. THE Billing_UI SHALL display Tier_Comparison in a three-column grid layout
2. THE Tier_Comparison SHALL align features vertically for easy comparison
3. THE Tier_Comparison SHALL highlight the vendor's current tier with visual distinction (border, badge, or background color)
4. THE Tier_Comparison SHALL display pricing prominently at the top of each column
5. THE Tier_Comparison SHALL use checkmarks (✓) for included features and x marks (×) for excluded features
6. THE Tier_Comparison SHALL include a "Current Plan" badge on the active tier
7. WHEN viewing on mobile, THE Tier_Comparison SHALL stack tiers vertically
8. THE Tier_Comparison SHALL include action buttons at the bottom of each tier card (Upgrade, Downgrade, Current Plan)

### Requirement 14: Handle Payment Processing with Paystack

**User Story:** As a vendor upgrading to a paid tier, I want to complete payment via Paystack, so that my subscription is activated immediately

#### Acceptance Criteria

1. WHEN vendor initiates paid upgrade, THE Billing_UI SHALL load Paystack inline script from https://js.paystack.co/v1/inline.js
2. THE Payment_Modal SHALL initialize Paystack with vendor email, tier amount, and payment reference
3. THE Payment_Modal SHALL pass vendor metadata (vendorId, tier, type: 'subscription') to Paystack
4. WHEN payment is successful, THE Payment_Modal SHALL call verification endpoint with payment reference
5. WHEN payment is cancelled, THE Payment_Modal SHALL close and return vendor to plan selection
6. WHEN payment fails, THE Billing_UI SHALL display error message with retry option
7. THE Billing_UI SHALL use NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY environment variable for Paystack initialization
8. WHEN Paystack script fails to load, THE Billing_UI SHALL display error message suggesting page refresh

### Requirement 15: Display Transaction Fee Information

**User Story:** As a vendor, I want to see how transaction fees differ between tiers, so that I can understand the cost savings of upgrading

#### Acceptance Criteria

1. THE Tier_Comparison SHALL display transaction fee percentage for each tier (5%, 3%, 2%)
2. THE Billing_UI SHALL display a transaction fee calculator showing estimated savings when upgrading
3. THE transaction fee calculator SHALL accept order volume input (average monthly sales)
4. THE transaction fee calculator SHALL compute fee amounts for each tier based on input volume
5. THE transaction fee calculator SHALL display savings amount when comparing current tier to higher tiers
6. THE Billing_UI SHALL include an explainer tooltip for transaction fees
7. THE explainer tooltip SHALL state "Transaction fees are deducted from your payouts for each fulfilled order"

### Requirement 16: Responsive Design for Mobile Devices

**User Story:** As a vendor using a mobile device, I want the billing UI to be fully functional on small screens, so that I can manage my subscription from anywhere

#### Acceptance Criteria

1. WHEN viewport width is less than 768px, THE Tier_Comparison SHALL switch from grid layout to vertical stack
2. WHEN on mobile, THE Current_Plan_Display SHALL remain prominently visible at the top
3. WHEN on mobile, THE Trial_Banner and Grace_Period_Warning SHALL span full width
4. WHEN on mobile, THE Plan_Selector buttons SHALL be full width for easier tapping
5. WHEN on mobile, THE Billing_History_Section SHALL use condensed card layout
6. THE Billing_UI SHALL use responsive typography scaling for all text elements
7. THE Billing_UI SHALL ensure all interactive elements have minimum 44x44px touch targets on mobile

### Requirement 17: Loading and Error States

**User Story:** As a vendor, I want clear feedback when actions are processing or when errors occur, so that I understand the system status

#### Acceptance Criteria

1. WHEN fetching subscription data, THE Billing_UI SHALL display skeleton loading placeholders
2. WHEN processing payment, THE Payment_Modal SHALL display loading spinner and disable all buttons
3. WHEN API call fails, THE Billing_UI SHALL display error message banner at top of page
4. THE error message banner SHALL include specific error text from API response
5. THE error message banner SHALL include a "Retry" button for failed actions
6. THE error message banner SHALL use red background and error icon for visibility
7. WHEN page data loads successfully, THE Billing_UI SHALL remove loading placeholders smoothly
8. WHEN action succeeds (upgrade, downgrade, cancel), THE Billing_UI SHALL display success message toast

### Requirement 18: Update Existing Subscription Pay Card Component

**User Story:** As the system, I want to replace the single-tier subscription card with the new 3-tier UI, so that the billing page reflects the current subscription model

#### Acceptance Criteria

1. THE Billing_UI SHALL remove the existing SubscriptionPayCard component that displays single ₦3,000/month subscription
2. THE Billing_UI SHALL replace SubscriptionPayCard with new Tier_Comparison and Current_Plan_Display components
3. THE Billing_UI SHALL maintain the Paystack script loading in page.tsx
4. THE Billing_UI SHALL preserve existing PayoutCard and PayoutHistory components on the billing page
5. THE Billing_UI SHALL maintain the billing page metadata (title: "Billing")
6. WHEN subscription is inactive or past_due, THE Billing_UI SHALL prioritize subscription components over payout components
7. THE Billing_UI SHALL use consistent styling and spacing with existing dashboard components

### Requirement 19: Persist Subscription State Across Page Refreshes

**User Story:** As a vendor, I want my subscription status to persist when I refresh the page, so that I don't lose context during my session

#### Acceptance Criteria

1. WHEN page loads, THE Billing_UI SHALL call GET /api/subscriptions/current to fetch latest subscription state
2. THE Billing_UI SHALL not use client-side state that persists across refreshes without server verification
3. WHEN vendor completes upgrade, THE Billing_UI SHALL use router.refresh() to reload server-side data
4. WHEN trial activation completes, THE Billing_UI SHALL use router.refresh() to reload server-side data
5. WHEN cancellation completes, THE Billing_UI SHALL use router.refresh() to reload server-side data
6. THE Billing_UI SHALL handle stale data by always fetching fresh subscription state on page load

### Requirement 20: Accessibility Compliance

**User Story:** As a vendor using assistive technology, I want the billing UI to be accessible, so that I can manage my subscription independently

#### Acceptance Criteria

1. THE Billing_UI SHALL use semantic HTML elements (buttons, headings, sections, articles)
2. THE Tier_Comparison SHALL use proper heading hierarchy (h1 for page title, h2 for section titles, h3 for tier names)
3. THE Feature_Badge indicators SHALL include aria-label text (e.g., "Feature included" or "Feature not available")
4. THE Plan_Selector buttons SHALL include descriptive aria-labels (e.g., "Upgrade to Pro tier for ₦1,500 per month")
5. THE Payment_Modal SHALL trap focus within the modal when open
6. THE Trial_Banner and Grace_Period_Warning SHALL use role="alert" for screen reader announcements
7. THE Billing_UI SHALL maintain sufficient color contrast ratios (WCAG AA standard: 4.5:1 for normal text)
8. THE interactive elements SHALL have visible focus indicators for keyboard navigation

## Parser and Serializer Requirements

### Requirement 21: API Response Parser

**User Story:** As the system, I want to parse subscription API responses consistently, so that the UI displays correct data

#### Acceptance Criteria

1. WHEN GET /api/subscriptions/current returns data, THE Response_Parser SHALL parse the response into a Subscription object
2. THE Response_Parser SHALL extract tier, status, expires_at, grace_days_remaining, is_trial, and trial_days_remaining fields
3. THE Response_Parser SHALL validate that tier is one of: 'starter', 'pro', 'business'
4. THE Response_Parser SHALL validate that status is one of: 'active', 'trial', 'past_due', 'inactive', 'cancelled'
5. IF response is malformed or missing required fields, THEN THE Response_Parser SHALL return descriptive error
6. WHEN GET /api/subscriptions/plans returns data, THE Response_Parser SHALL parse into SubscriptionPlan array
7. THE Response_Parser SHALL extract plan fields: tier, name, price_kobo, transaction_fee_percentage, product_limit, features

### Requirement 22: Date Formatter for Subscription Dates

**User Story:** As the system, I want to format subscription dates consistently, so that dates are displayed in user-friendly format

#### Acceptance Criteria

1. THE Date_Formatter SHALL parse ISO 8601 date strings from subscription_expires_at
2. THE Date_Formatter SHALL format dates to locale-appropriate format (e.g., "January 15, 2024" for en-US)
3. THE Date_Formatter SHALL handle null or undefined date values without throwing errors
4. THE Date_Formatter SHALL calculate days remaining from current date to expiry date
5. FOR ALL valid date strings, parsing then formatting then parsing SHALL produce equivalent date (round-trip property)
6. THE Date_Formatter SHALL use consistent timezone handling (UTC or user's local timezone)
