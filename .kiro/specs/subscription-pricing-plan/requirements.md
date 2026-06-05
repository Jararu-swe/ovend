# Requirements Document

## Introduction

This document specifies the requirements for implementing a tiered subscription pricing system for the Vendle MVP application. The system enables vendors to select and manage subscription plans (Starter, Pro, Business) with feature gating, payment integration via Paystack, and transaction fee differentiation based on tier.

## Glossary

- **Vendor**: A user who creates and manages an online store on the Vendle platform
- **Subscription_System**: The component responsible for managing subscription plans, billing cycles, and feature access
- **Payment_Gateway**: The Paystack integration responsible for processing recurring payments
- **Feature_Gate**: A mechanism that restricts access to features based on subscription tier
- **Transaction_Fee**: A percentage fee charged on each order based on the vendor's subscription tier
- **Grace_Period**: A time period after payment failure during which the vendor retains access to paid features
- **Starter_Tier**: The free subscription tier with basic features and higher transaction fees
- **Pro_Tier**: The ₦1,500/month subscription tier with enhanced features and reduced transaction fees
- **Business_Tier**: The ₦3,500/month subscription tier with premium features and lowest transaction fees
- **Subscription_Status**: The current state of a vendor's subscription (active, trial, past_due, inactive, cancelled)
- **Branding_Watermark**: A "Powered by Vendle" badge or logo displayed on free tier storefronts
- **Product_Limit**: The maximum number of active products a vendor can create based on their tier
- **Analytics_Dashboard**: A feature providing store performance metrics and insights
- **Custom_Domain**: A feature allowing Business tier vendors to use their own domain name
- **Team_Member**: A user with delegated access to manage a vendor's store

## Requirements

### Requirement 1: Subscription Plan Selection

**User Story:** As a vendor, I want to select a subscription plan, so that I can access features appropriate for my business needs

#### Acceptance Criteria

1. WHEN a vendor completes onboarding, THE Subscription_System SHALL default the vendor to Starter_Tier
2. THE Subscription_System SHALL display all three tiers with their features, pricing, and transaction fees
3. WHEN a vendor selects Pro_Tier or Business_Tier, THE Subscription_System SHALL redirect to Payment_Gateway for payment processing
4. WHEN a vendor selects Starter_Tier from a paid tier, THE Subscription_System SHALL confirm downgrade and apply changes at the end of the current billing cycle
5. THE Subscription_System SHALL record Subscription_Status as 'active' for Starter_Tier without payment

### Requirement 2: Payment Processing for Paid Tiers

**User Story:** As a vendor, I want to pay for my subscription via Paystack, so that I can access premium features

#### Acceptance Criteria

1. WHEN a vendor initiates payment for Pro_Tier or Business_Tier, THE Payment_Gateway SHALL initialize a Paystack transaction with the correct amount
2. THE Payment_Gateway SHALL support recurring billing with monthly frequency
3. WHEN payment succeeds, THE Subscription_System SHALL update Subscription_Status to 'active' and set subscription_expires_at to 30 days from payment date
4. WHEN payment succeeds, THE Subscription_System SHALL store the payment reference in subscription_last_payment_reference
5. WHEN payment fails, THE Subscription_System SHALL notify the vendor and retain current subscription status
6. THE Payment_Gateway SHALL verify payment authenticity using Paystack webhook signatures

### Requirement 3: Feature Gating by Subscription Tier

**User Story:** As a vendor, I want feature access determined by my subscription tier, so that I receive the features I'm paying for

#### Acceptance Criteria

1. WHEN a vendor with Starter_Tier attempts to access Pro_Tier or Business_Tier features, THE Feature_Gate SHALL block access and display upgrade prompt
2. WHEN a vendor with Pro_Tier attempts to access Business_Tier features, THE Feature_Gate SHALL block access and display upgrade prompt
3. THE Feature_Gate SHALL allow access to Analytics_Dashboard only for Pro_Tier and Business_Tier vendors
4. THE Feature_Gate SHALL allow advanced analytics (conversion tracking, customer insights) only for Business_Tier vendors
5. THE Feature_Gate SHALL allow Custom_Domain configuration only for Business_Tier vendors
6. THE Feature_Gate SHALL allow Team_Member management only for Business_Tier vendors
7. THE Feature_Gate SHALL restrict theme selection for Starter_Tier to basic themes only
8. THE Feature_Gate SHALL allow Pro_Tier vendors access to premium theme presets
9. THE Feature_Gate SHALL allow Business_Tier vendors access to exclusive premium theme presets

### Requirement 4: Product Limits Enforcement

**User Story:** As a vendor, I want product limits based on my subscription tier, so that the system scales with my plan

#### Acceptance Criteria

1. THE Subscription_System SHALL enforce a product limit of 10 active products for Starter_Tier vendors
2. THE Subscription_System SHALL enforce a product limit of 100 active products for Pro_Tier vendors
3. THE Subscription_System SHALL enforce a product limit of 1000 active products for Business_Tier vendors
4. WHEN a vendor attempts to create a product exceeding their tier limit, THE Subscription_System SHALL prevent creation and display upgrade prompt
5. WHEN a vendor downgrades to a tier with lower product limit, THE Subscription_System SHALL allow existing products to remain but prevent new product creation until count is below limit

### Requirement 5: Transaction Fee Calculation

**User Story:** As a vendor, I want transaction fees calculated based on my subscription tier, so that I benefit from lower fees with higher tiers

#### Acceptance Criteria

1. WHEN an order is fulfilled for a Starter_Tier vendor, THE Subscription_System SHALL calculate Transaction_Fee as 5% of order total
2. WHEN an order is fulfilled for a Pro_Tier vendor, THE Subscription_System SHALL calculate Transaction_Fee as 3% of order total
3. WHEN an order is fulfilled for a Business_Tier vendor, THE Subscription_System SHALL calculate Transaction_Fee as 2% of order total
4. THE Subscription_System SHALL deduct Transaction_Fee from vendor payout amounts
5. THE Subscription_System SHALL display Transaction_Fee breakdown in payout reports

### Requirement 6: Branding Enforcement for Free Tier

**User Story:** As the platform, I want free tier stores to display Vendle branding, so that we gain visibility while offering free access

#### Acceptance Criteria

1. WHEN a Starter_Tier vendor's storefront is displayed, THE Subscription_System SHALL render a Branding_Watermark
2. THE Branding_Watermark SHALL include text "Powered by Vendle" and optional logo
3. THE Branding_Watermark SHALL be positioned at the footer of the storefront
4. WHEN a vendor upgrades to Pro_Tier or Business_Tier, THE Subscription_System SHALL remove Branding_Watermark from storefront
5. THE Subscription_System SHALL prevent Starter_Tier vendors from removing or hiding the Branding_Watermark

### Requirement 7: Subscription Upgrade and Downgrade

**User Story:** As a vendor, I want to upgrade or downgrade my subscription, so that I can adjust my plan based on business changes

#### Acceptance Criteria

1. WHEN a vendor upgrades from Starter_Tier to Pro_Tier or Business_Tier, THE Subscription_System SHALL apply changes immediately after payment
2. WHEN a vendor upgrades from Pro_Tier to Business_Tier, THE Subscription_System SHALL process prorated payment and apply changes immediately
3. WHEN a vendor downgrades from Pro_Tier or Business_Tier to a lower tier, THE Subscription_System SHALL schedule downgrade for end of current billing cycle
4. WHEN a scheduled downgrade takes effect, THE Subscription_System SHALL update Subscription_Status and apply new feature restrictions
5. THE Subscription_System SHALL notify vendor 7 days before scheduled downgrade takes effect

### Requirement 8: Payment Failure and Grace Period Handling

**User Story:** As a vendor, I want a grace period if my payment fails, so that I have time to resolve payment issues without immediate service disruption

#### Acceptance Criteria

1. WHEN a recurring payment fails, THE Subscription_System SHALL update Subscription_Status to 'past_due'
2. WHEN Subscription_Status is 'past_due', THE Subscription_System SHALL provide a Grace_Period of 7 days
3. WHILE Grace_Period is active, THE Subscription_System SHALL maintain access to paid tier features
4. WHILE Grace_Period is active, THE Subscription_System SHALL display payment failure notification on vendor dashboard
5. WHEN Grace_Period expires without successful payment, THE Subscription_System SHALL downgrade vendor to Starter_Tier
6. THE Subscription_System SHALL send payment failure notifications via email at 1 day, 3 days, and 7 days after failure

### Requirement 9: Recurring Billing Management

**User Story:** As a vendor, I want automatic monthly billing, so that my subscription continues without manual payment each month

#### Acceptance Criteria

1. THE Payment_Gateway SHALL initiate recurring charge 30 days after last successful payment
2. WHEN recurring charge succeeds, THE Subscription_System SHALL extend subscription_expires_at by 30 days
3. WHEN recurring charge succeeds, THE Subscription_System SHALL update subscription_last_payment_reference with new payment reference
4. THE Subscription_System SHALL send payment receipt via email after successful recurring charge
5. THE Payment_Gateway SHALL use Paystack's recurring charge functionality with stored authorization
6. WHEN a vendor cancels subscription, THE Payment_Gateway SHALL not initiate future recurring charges

### Requirement 10: Subscription Cancellation

**User Story:** As a vendor, I want to cancel my subscription, so that I can stop being charged when I no longer need paid features

#### Acceptance Criteria

1. WHEN a vendor requests subscription cancellation, THE Subscription_System SHALL confirm cancellation intent
2. WHEN cancellation is confirmed, THE Subscription_System SHALL update Subscription_Status to 'cancelled'
3. WHEN Subscription_Status is 'cancelled', THE Subscription_System SHALL maintain access to paid features until subscription_expires_at
4. WHEN subscription_expires_at is reached for cancelled subscription, THE Subscription_System SHALL downgrade vendor to Starter_Tier
5. THE Subscription_System SHALL send cancellation confirmation email with access end date

### Requirement 11: Trial Period Handling

**User Story:** As a new vendor, I want a trial period for Pro or Business tier, so that I can evaluate premium features before committing to payment

#### Acceptance Criteria

1. WHEN a new vendor selects Pro_Tier or Business_Tier during onboarding, THE Subscription_System SHALL offer a 14-day trial
2. WHEN a vendor accepts trial, THE Subscription_System SHALL set Subscription_Status to 'trial' and subscription_expires_at to 14 days from activation
3. WHILE Subscription_Status is 'trial', THE Subscription_System SHALL grant full access to selected tier features
4. THE Subscription_System SHALL notify vendor at 7 days and 1 day before trial expiration
5. WHEN trial expires without payment, THE Subscription_System SHALL downgrade vendor to Starter_Tier
6. WHEN vendor provides payment during trial, THE Subscription_System SHALL convert trial to paid subscription starting from trial end date

### Requirement 12: Subscription Status Display

**User Story:** As a vendor, I want to see my current subscription status, so that I understand my plan, billing date, and available features

#### Acceptance Criteria

1. THE Subscription_System SHALL display current tier name (Starter, Pro, or Business) on vendor dashboard
2. WHEN vendor has paid subscription, THE Subscription_System SHALL display next billing date calculated from subscription_expires_at
3. WHEN Subscription_Status is 'past_due', THE Subscription_System SHALL display days remaining in Grace_Period
4. WHEN Subscription_Status is 'trial', THE Subscription_System SHALL display trial expiration date
5. THE Subscription_System SHALL display a feature comparison table showing available features for current tier
6. THE Subscription_System SHALL provide a link to view billing history and invoices

### Requirement 13: Team Member Access Control

**User Story:** As a Business tier vendor, I want to add team members to my store, so that I can delegate management tasks

#### Acceptance Criteria

1. WHERE vendor has Business_Tier, THE Subscription_System SHALL allow creation of Team_Member accounts
2. THE Subscription_System SHALL enforce a limit of 5 Team_Member accounts per Business_Tier vendor
3. WHEN a Team_Member account is created, THE Subscription_System SHALL send invitation email with access link
4. THE Subscription_System SHALL allow Business_Tier vendor to assign permissions (products, orders, settings) to each Team_Member
5. WHEN a vendor downgrades from Business_Tier, THE Subscription_System SHALL deactivate all Team_Member accounts

### Requirement 14: Analytics Access Control

**User Story:** As a Pro or Business tier vendor, I want access to analytics dashboard, so that I can track store performance

#### Acceptance Criteria

1. WHERE vendor has Pro_Tier or Business_Tier, THE Subscription_System SHALL enable Analytics_Dashboard access
2. THE Analytics_Dashboard SHALL display basic metrics (visits, orders, revenue) for Pro_Tier vendors
3. WHERE vendor has Business_Tier, THE Analytics_Dashboard SHALL display advanced metrics including conversion rate, customer lifetime value, and product performance
4. THE Analytics_Dashboard SHALL allow data export only for Business_Tier vendors
5. WHEN a vendor downgrades to Starter_Tier, THE Subscription_System SHALL remove Analytics_Dashboard access

### Requirement 15: Priority Support Access

**User Story:** As a Pro or Business tier vendor, I want priority support, so that I receive faster assistance with issues

#### Acceptance Criteria

1. WHERE vendor has Pro_Tier or Business_Tier, THE Subscription_System SHALL flag support tickets as priority
2. THE Subscription_System SHALL display priority support badge on vendor dashboard for Pro_Tier and Business_Tier vendors
3. THE Subscription_System SHALL provide direct support contact information (email, WhatsApp) only for Pro_Tier and Business_Tier vendors
4. THE Subscription_System SHALL route priority support tickets to dedicated support queue with 24-hour response time commitment

### Requirement 16: Custom Domain Configuration

**User Story:** As a Business tier vendor, I want to use my own domain name, so that my store has a professional branded URL

#### Acceptance Criteria

1. WHERE vendor has Business_Tier, THE Subscription_System SHALL enable Custom_Domain configuration interface
2. THE Subscription_System SHALL validate Custom_Domain DNS settings before activation
3. WHEN Custom_Domain is validated, THE Subscription_System SHALL configure SSL certificate for the domain
4. THE Subscription_System SHALL continue to serve storefront on default Vendle subdomain (vendor-slug.vendle.com) alongside Custom_Domain
5. WHEN vendor downgrades from Business_Tier, THE Subscription_System SHALL deactivate Custom_Domain and serve storefront only on default subdomain

### Requirement 17: Billing History and Invoices

**User Story:** As a vendor with paid subscription, I want to view billing history and download invoices, so that I can track subscription expenses

#### Acceptance Criteria

1. WHEN a vendor accesses billing history, THE Subscription_System SHALL display all successful payments with date, amount, and payment reference
2. THE Subscription_System SHALL generate downloadable invoice PDF for each successful payment
3. THE invoice SHALL include vendor details, payment date, amount, tier purchased, and billing period
4. THE Subscription_System SHALL store invoices for minimum of 12 months
5. THE Subscription_System SHALL send invoice via email immediately after successful payment

### Requirement 18: Subscription Metrics for Platform Admin

**User Story:** As a platform administrator, I want to view subscription metrics, so that I can monitor business performance

#### Acceptance Criteria

1. THE Subscription_System SHALL track total number of vendors by tier (Starter, Pro, Business)
2. THE Subscription_System SHALL track monthly recurring revenue (MRR) by tier
3. THE Subscription_System SHALL track subscription churn rate (cancellations per month)
4. THE Subscription_System SHALL track trial conversion rate (trials converted to paid)
5. THE Subscription_System SHALL track average subscription lifetime for each tier
6. THE Subscription_System SHALL provide exportable reports for all subscription metrics

## Parser and Serializer Requirements

### Requirement 19: Webhook Payload Parser

**User Story:** As the system, I want to parse Paystack webhook payloads, so that I can process payment events reliably

#### Acceptance Criteria

1. WHEN a Paystack webhook is received, THE Webhook_Parser SHALL parse the payload into a Webhook_Event object
2. THE Webhook_Parser SHALL validate webhook signature against Paystack secret key
3. IF webhook signature is invalid, THEN THE Webhook_Parser SHALL reject the payload and return error
4. THE Webhook_Parser SHALL extract event type (charge.success, subscription.create, subscription.disable)
5. THE Webhook_Parser SHALL extract payment reference, amount, customer email, and metadata from payload
6. IF payload is malformed or missing required fields, THEN THE Webhook_Parser SHALL return descriptive error message

### Requirement 20: Subscription Configuration Serializer

**User Story:** As the system, I want to serialize subscription configuration, so that I can store and retrieve tier settings consistently

#### Acceptance Criteria

1. THE Configuration_Serializer SHALL serialize tier configuration (features, limits, pricing) to JSON format
2. THE Configuration_Serializer SHALL parse stored JSON configuration into Tier_Config objects
3. FOR ALL valid Tier_Config objects, serializing then parsing SHALL produce an equivalent object (round-trip property)
4. THE Configuration_Serializer SHALL validate tier configuration against schema before serialization
5. IF configuration is invalid, THEN THE Configuration_Serializer SHALL return descriptive validation error

