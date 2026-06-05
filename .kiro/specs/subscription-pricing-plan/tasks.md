# Implementation Plan: Subscription Pricing System

## Overview

This implementation plan breaks down the subscription pricing system into discrete, testable tasks. The system implements three subscription tiers (Starter, Pro, Business) with differentiated features, transaction fees, Paystack payment integration, feature gating, and team member management for Business tier vendors.

The implementation follows a bottom-up approach: database schema → core services → API endpoints → UI components → webhooks → background jobs.

## Tasks

- [x] 1. Set up database schema and seed subscription plans
  - Create subscription_plans table with tier, pricing, and feature configuration
  - Create subscription_invoices table for billing history
  - Create subscription_events table for audit logging
  - Create team_members table for Business tier collaboration
  - Add subscription_tier column to users table
  - Enhance vendor_subscription_payments table with tier and billing period columns
  - Add database constraints for valid tiers and statuses
  - Create database indexes for performance optimization
  - Seed three subscription plans (Starter, Pro, Business) with features and pricing
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 13.1, 19.1, 20.1_

- [x] 2. Implement core subscription service module
  - [x] 2.1 Create TypeScript type definitions for subscription system
    - Add SubscriptionTier, SubscriptionStatus, SubscriptionPlan types to definitions.ts
    - Add SubscriptionFeatures, SubscriptionPayment, VendorSubscriptionInfo types
    - Add TeamMember, TeamMemberPermissions types
    - Add SubscriptionInvoice and SubscriptionEvent types
    - _Requirements: 1.1, 3.1, 13.1, 20.2_

  - [x] 2.2 Implement subscription data access functions
    - Write ensureSubscriptionSchema() to create tables and seed plans
    - Write getSubscriptionPlans() to fetch all available plans
    - Write getSubscriptionPlan(tier) to fetch specific plan details
    - Write getVendorSubscription(vendorId) to retrieve current subscription with grace/trial calculations
    - _Requirements: 1.2, 12.1, 12.2, 12.3, 12.4_

  - [x] 2.3 Implement feature access control functions
    - Write hasFeatureAccess(vendorId, feature) with grace period support
    - Write getProductLimit(vendorId) to return tier-specific product limits
    - Write getTransactionFeePercentage(vendorId) to return tier-specific fees
    - Write canCreateProduct(vendorId) with limit enforcement
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

  - [x] 2.4 Implement subscription lifecycle management functions
    - Write updateSubscriptionTier(vendorId, newTier, immediate) with event logging
    - Write recordSubscriptionPayment(vendorId, tier, amount, reference) with billing period calculation
    - Write handlePaymentFailure(vendorId) to set past_due status
    - Write startTrial(vendorId, tier, trialDays) with trial expiry calculation
    - Write cancelSubscription(vendorId) to schedule downgrade at period end
    - _Requirements: 2.3, 2.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 9.1, 9.2, 9.3, 10.2, 10.3, 11.2, 11.6_

  - [x]* 2.5 Write unit tests for subscription service
    - Test getVendorSubscription() grace period calculation
    - Test getVendorSubscription() trial days remaining calculation
    - Test hasFeatureAccess() for each tier and feature combination
    - Test hasFeatureAccess() grace period access maintenance
    - Test canCreateProduct() limit enforcement
    - Test subscription status transitions
    - _Requirements: 3.1, 4.1, 8.2, 8.3, 11.2, 11.3, 12.3, 12.4_

- [x] 3. Implement transaction fee calculator module
  - [x] 3.1 Create transaction fee calculation functions
    - Write calculateTransactionFee(vendorId, orderAmount) returning fee, percentage, netAmount
    - Write calculatePayoutAmount(vendorId, orderAmount) for payout processing
    - Write getTransactionFeeBreakdown(vendorId, orderIds) for payout reports
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x]* 3.2 Write unit tests for transaction fee calculator
    - Test 5% fee calculation for Starter tier
    - Test 3% fee calculation for Pro tier
    - Test 2% fee calculation for Business tier
    - Test fee rounding for fractional amounts
    - Test breakdown aggregation for multiple orders
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Implement feature gate middleware
  - [x] 4.1 Create feature gating utility functions
    - Write requireFeature(feature) that throws error if access denied
    - Write withFeatureGate(feature, handler) wrapper function
    - Write featureGatedAction(feature, handler) returning FeatureGateResult
    - Define FEATURE_GATE_ERRORS constant with user-friendly messages
    - _Requirements: 3.1, 3.2, 14.1, 15.1, 16.1_

  - [x]* 4.2 Write unit tests for feature gate
    - Test analytics blocked for Starter tier
    - Test analytics allowed for Pro and Business tiers
    - Test team_members blocked for Starter and Pro tiers
    - Test team_members allowed for Business tier
    - Test access maintained during grace period
    - Test access blocked after grace period expires
    - Test custom_domain access control
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.3, 13.1, 16.1_

- [x] 5. Implement Paystack payment integration service
  - [x] 5.1 Create Paystack subscription payment functions
    - Write initializeSubscriptionPayment(request) to create Paystack transaction
    - Write verifySubscriptionPayment(reference) to validate payment and extract metadata
    - Include tier and vendorId in payment metadata
    - Generate unique payment reference with SUB- prefix
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 19.4, 19.5_

  - [x]* 5.2 Write integration tests for Paystack service
    - Mock Paystack API responses for payment initialization
    - Test payment reference generation uniqueness
    - Test metadata extraction from payment verification
    - Test error handling for failed payment initialization
    - Test subscription type validation in verification
    - _Requirements: 2.1, 2.3, 2.5, 19.1, 19.2, 19.3_

- [x] 6. Implement team member management service
  - [x] 6.1 Create team member data access functions
    - Write canManageTeam(vendorId) using feature access check
    - Write getTeamMembers(vendorId) to fetch all team members
    - Write getTeamMemberCount(vendorId) for limit enforcement
    - Write inviteTeamMember(vendorId, email, role, permissions, invitedBy) with validation
    - Write acceptTeamInvitation(invitationId, userId) to activate membership
    - Write removeTeamMember(vendorId, memberId) to delete member
    - Write updateTeamMemberPermissions(vendorId, memberId, permissions) to modify access
    - Write deactivateAllTeamMembers(vendorId) for tier downgrades
    - Write hasTeamPermission(userId, vendorId, permission) for authorization
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x]* 6.2 Write unit tests for team member management
    - Test team invitation blocked for Starter and Pro tiers
    - Test team invitation allowed for Business tier
    - Test 5-member limit enforcement
    - Test duplicate email prevention
    - Test permission validation
    - Test team member deactivation on downgrade
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 7. Checkpoint - Verify core services
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create subscription management API endpoints
  - [x] 8.1 Implement GET /api/subscriptions/plans endpoint
    - Fetch all subscription plans from database
    - Return plans ordered by price
    - _Requirements: 1.2_

  - [x] 8.2 Implement GET /api/subscriptions/current endpoint
    - Get current user session
    - Fetch vendor subscription info with grace/trial status
    - Return subscription tier, status, expires_at, plan details
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 8.3 Implement POST /api/subscriptions/initialize endpoint
    - Validate tier parameter (pro or business)
    - Get user session and email
    - Initialize Paystack payment with subscription metadata
    - Return authorization_url and reference
    - _Requirements: 1.3, 2.1, 2.2_

  - [x] 8.4 Implement POST /api/subscriptions/verify endpoint
    - Verify payment reference with Paystack
    - Extract vendorId and tier from metadata
    - Record subscription payment in database
    - Update user subscription status to active
    - Return updated subscription info
    - _Requirements: 2.3, 2.4, 7.1_

  - [x] 8.5 Implement POST /api/subscriptions/trial endpoint
    - Validate tier parameter (pro or business)
    - Get user session
    - Call startTrial with 14-day duration
    - Return trial status and expiry date
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 8.6 Implement POST /api/subscriptions/cancel endpoint
    - Get user session
    - Call cancelSubscription function
    - Return cancellation confirmation with access_until date
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [x]* 8.7 Write integration tests for subscription API endpoints
    - Test plans endpoint returns all three tiers
    - Test current endpoint requires authentication
    - Test initialize endpoint creates Paystack transaction
    - Test verify endpoint updates subscription status
    - Test trial endpoint sets trial expiry correctly
    - Test cancel endpoint maintains access until period end
    - _Requirements: 1.2, 2.3, 7.1, 10.3, 11.2, 12.1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Database schema must be created first before any service layer implementation
- Core services (subscription, transaction fee, feature gate) are independent and can be developed in parallel
- API endpoints depend on core services being completed
- Test tasks are marked optional but highly recommended for production quality
- Checkpoint task 7 ensures core services are working before moving to API layer

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["2.4", "2.5", "3.2", "4.2", "5.2", "6.2"] },
    { "id": 3, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 4, "tasks": ["8.7"] }
  ]
}
```

