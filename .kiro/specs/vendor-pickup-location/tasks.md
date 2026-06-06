# Implementation Plan: Vendor Pickup Location

## Overview

This implementation plan breaks down the Vendor Pickup Location feature into discrete coding tasks. The feature enables vendors to store their pickup location during onboarding or in settings, displays the location to customers during checkout when pickup is selected, and preserves the pickup location with each order for historical reference.

The implementation follows a layered approach: database schema first, then data layer functions, followed by UI components, and finally integration and testing.

## Tasks

- [x] 1. Set up database schema for pickup location storage
  - Run migration scripts to add pickup location columns to users and orders tables
  - Create indexes for performance optimization
  - Verify schema changes with test queries
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 2. Implement core data layer functions
  - [x] 2.1 Implement validatePickupLocation() function
    - Create validation function with latitude, longitude, and address details checks
    - Return structured validation results with specific error messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x]* 2.2 Write property test for validatePickupLocation()
    - **Property 1: Coordinate Validation**
    - **Property 2: Address Details Validation**
    - **Property 21: Null Location Validation**
    - **Property 22: Complete Location Validation**
    - **Validates: Requirements 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4, 8.5**
  
  - [x] 2.3 Implement saveVendorPickupLocation() function
    - Create async function to update vendor pickup location in database
    - Include parameter validation and error handling
    - Return success/error response structure
    - _Requirements: 1.4_
  
  - [x]* 2.4 Write property test for saveVendorPickupLocation()
    - **Property 3: Pickup Location Round-Trip**
    - **Validates: Requirements 1.4, 1.5**
  
  - [x] 2.5 Implement fetchVendorPickupLocation() function
    - Create async function to retrieve vendor pickup location from database
    - Return Location object or null based on offers_pickup status
    - _Requirements: 1.5_
  
  - [x] 2.6 Implement clearVendorPickupLocation() helper function
    - Create function to set pickup location fields to null in vendor profile
    - _Requirements: 2.3, 4.3_

- [x] 3. Checkpoint - Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update server actions for pickup location management
  - [x] 4.1 Update updateProfile() action in app/lib/actions.ts
    - Add pickup_latitude, pickup_longitude, pickup_address_details, offers_pickup form data extraction
    - Add validation logic for offers_pickup with required location check
    - Update SQL query to include pickup location fields
    - Return appropriate error messages for validation failures
    - _Requirements: 10.4, 2.2, 4.4, 4.5_
  
  - [x]* 4.2 Write unit tests for updateProfile() pickup logic
    - Test successful pickup location save
    - Test validation error when offers_pickup enabled without location
    - Test clearing pickup location when offers_pickup disabled
    - _Requirements: 2.2, 2.3, 4.3, 4.5_
  
  - [x] 4.3 Update createOrder() action in app/lib/actions.ts
    - Fetch vendor data and extract pickup location fields
    - Conditionally copy vendor pickup location to order when delivery_type is 'pickup'
    - Update SQL INSERT to include vendor_pickup_latitude, vendor_pickup_longitude, vendor_pickup_address_details
    - _Requirements: 10.5, 6.1, 6.2, 6.3, 6.4_
  
  - [x]* 4.4 Write property test for createOrder() pickup persistence
    - **Property 15: Pickup Order Preserves Vendor Location**
    - **Property 16: Delivery Orders Exclude Pickup Location**
    - **Property 17: Order Location Immutability**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 10.5**

- [x] 5. Checkpoint - Ensure server action tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement onboarding pickup location step
  - [x] 6.1 Create OnboardingPickupStep component
    - Add toggle for "I offer pickup for my orders"
    - Conditionally render LocationPicker when toggle enabled
    - Add address details textarea with 500 character limit
    - Handle state management for pickup location data
    - _Requirements: 10.1, 3.1, 3.2_
  
  - [x] 6.2 Integrate OnboardingPickupStep into OnboardingWizard
    - Insert pickup location step between "Store Location" and "Theme Selection"
    - Pass pickup location state to parent form
    - Implement validation preventing progression without location when toggle enabled
    - _Requirements: 10.1, 3.3, 3.4, 3.5_
  
  - [x]* 6.3 Write property test for onboarding pickup capture
    - **Property 4: Pickup Enablement with Valid Location**
    - **Property 7: Onboarding Saves Pickup Location**
    - **Validates: Requirements 2.2, 3.5**

- [x] 7. Update settings page with pickup location management
  - [x] 7.1 Add delivery options section to SettingsForm component
    - Create "Delivery Options" section in settings UI
    - Add offers_pickup toggle control
    - Conditionally render LocationPicker when toggle enabled
    - Pre-populate LocationPicker with current pickup location if exists
    - Add address details textarea pre-populated with current data
    - _Requirements: 10.2, 4.1, 4.2_
  
  - [x]* 7.2 Write property tests for settings pickup management
    - **Property 5: Disabling Offers Pickup Clears Location**
    - **Property 8: Settings Displays Current Pickup Data**
    - **Property 9: Settings Pre-Populates Location**
    - **Property 10: Settings Updates Location**
    - **Validates: Requirements 2.3, 4.1, 4.2, 4.3, 4.4**

- [x] 8. Checkpoint - Ensure onboarding and settings components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update storefront checkout for pickup location display
  - [x] 9.1 Implement pickup location display in Storefront component
    - Fetch vendor pickup location when deliveryType is 'pickup'
    - Render map with vendor pickup coordinates marked
    - Display pickup address details below map
    - Add "Pickup Location" heading and styling
    - Hide customer delivery LocationPicker when pickup selected
    - _Requirements: 10.3, 5.1, 5.2, 5.3, 5.4_
  
  - [x]* 9.2 Write property tests for checkout pickup display
    - **Property 6: Pickup Option Availability**
    - **Property 11: Checkout Retrieves Pickup Location**
    - **Property 12: Checkout Displays Pickup Map**
    - **Property 13: Checkout Displays Address Details**
    - **Property 14: Delivery Hides Pickup Location**
    - **Property 23: Storefront Hides Customer Location Picker for Pickup**
    - **Validates: Requirements 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 10.3**

- [x] 10. Update order history for pickup location display
  - [x] 10.1 Implement conditional location display in Order History component
    - Add conditional rendering based on order delivery_type
    - For pickup orders: display vendor_pickup_latitude, vendor_pickup_longitude with "Pickup Location" label
    - For delivery orders: display customer delivery_latitude, delivery_longitude with "Delivery Location" label
    - Render map with appropriate coordinates
    - Display address details below map
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x]* 10.2 Write property tests for order history pickup display
    - **Property 18: Order History Displays Pickup Map**
    - **Property 19: Order History Displays Pickup Address**
    - **Property 20: Order History Shows Delivery Location for Delivery Orders**
    - **Validates: Requirements 7.1, 7.2, 7.4**

- [x] 11. Checkpoint - Ensure storefront and order history components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update TypeScript definitions
  - [x] 12.1 Update User interface in app/lib/definitions.ts
    - Add pickup_latitude: number | null
    - Add pickup_longitude: number | null
    - Add pickup_address_details: string | null
    - Add offers_pickup: boolean | null
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 12.2 Update Order interface in app/lib/definitions.ts
    - Add vendor_pickup_latitude: number | null
    - Add vendor_pickup_longitude: number | null
    - Add vendor_pickup_address_details: string | null
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [x] 12.3 Create Location interface in app/lib/definitions.ts
    - Define Location type with lat, lng, and optional details
    - Export for use across components

- [x] 13. Integration testing and final validation
  - [x]* 13.1 Write integration tests for complete pickup flow
    - Test end-to-end onboarding with pickup enabled
    - Test settings update flow for pickup location
    - Test checkout display for pickup orders
    - Test order creation with vendor pickup location persistence
    - Test order history display for pickup vs delivery orders
    - _Requirements: All requirements 1-10_
  
  - [x]* 13.2 Write property test for updateProfile pickup field processing
    - **Property 24: UpdateProfile Processes Pickup Fields**
    - **Validates: Requirements 10.4**

- [x] 14. Final checkpoint - Complete feature validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The database schema must be updated before any code implementation
- Data layer functions should be completed and tested before UI components
- LocationPicker component is assumed to exist and be reusable from existing storefront code
- MapDisplay component is assumed to exist for displaying maps with coordinates
- Checkpoints ensure incremental validation at logical boundaries
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify complete workflows across multiple components

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "12.1", "12.2", "12.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.6"] },
    { "id": 3, "tasks": ["2.4", "2.5"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3"] },
    { "id": 6, "tasks": ["4.4", "6.1"] },
    { "id": 7, "tasks": ["6.2", "7.1"] },
    { "id": 8, "tasks": ["6.3", "7.2"] },
    { "id": 9, "tasks": ["9.1", "10.1"] },
    { "id": 10, "tasks": ["9.2", "10.2"] },
    { "id": 11, "tasks": ["13.1", "13.2"] }
  ]
}
```
