# Requirements Document: Vendor Pickup Location

## Introduction

The Vendor Pickup Location feature enables vendors to offer pickup as a delivery option by storing their physical pickup location. The system captures pickup location during vendor onboarding, allows updates through settings, displays the location to customers during checkout, and preserves the pickup location with each order for historical reference. This feature supports vendors who prefer or offer in-person pickup instead of delivery.

## Glossary

- **Vendor**: A registered user who sells products through the platform
- **Customer**: A user who purchases products from vendors
- **Pickup_Location**: Geographic coordinates (latitude, longitude) and address details where customers collect orders
- **Delivery_Type**: Order fulfillment method, either 'pickup' or 'delivery'
- **Onboarding_System**: Multi-step wizard that collects vendor information during initial setup
- **Settings_System**: Interface for vendors to update their profile and store configuration
- **Storefront**: Customer-facing interface where products are browsed and orders placed
- **Order_History**: System that displays past orders with their fulfillment details
- **Location_Picker**: UI component for selecting geographic coordinates on a map
- **Validation_System**: Component that verifies data meets required constraints

## Requirements

### Requirement 1: Vendor Pickup Location Storage

**User Story:** As a vendor, I want to store my pickup location in my profile, so that customers can see where to collect their orders when they choose pickup.

#### Acceptance Criteria

1. WHEN a vendor provides pickup location coordinates (latitude, longitude) THEN the Validation_System SHALL verify latitude is between -90 and 90
2. WHEN a vendor provides pickup location coordinates (latitude, longitude) THEN the Validation_System SHALL verify longitude is between -180 and 180
3. WHEN a vendor provides pickup address details THEN the Validation_System SHALL verify the text is 500 characters or less
4. WHEN a vendor saves a valid pickup location THEN the System SHALL store the latitude, longitude, and address details in the vendor's profile
5. WHEN a vendor retrieves their pickup location THEN the System SHALL return the exact coordinates and address details previously stored

### Requirement 2: Offers Pickup Toggle

**User Story:** As a vendor, I want to indicate whether I offer pickup as a delivery option, so that the system knows whether to show pickup options to my customers.

#### Acceptance Criteria

1. THE System SHALL provide an offers_pickup boolean field in the vendor profile
2. WHEN a vendor sets offers_pickup to true AND provides a valid pickup location THEN the System SHALL enable pickup as a delivery option for that vendor's store
3. WHEN a vendor sets offers_pickup to false THEN the System SHALL clear any stored pickup location from the vendor's profile
4. WHEN a vendor sets offers_pickup to false THEN the System SHALL prevent customers from selecting pickup as a delivery option for that vendor's products

### Requirement 3: Onboarding Pickup Location Capture

**User Story:** As a new vendor, I want to provide my pickup location during onboarding, so that I can enable pickup orders from the start.

#### Acceptance Criteria

1. WHEN the Onboarding_System displays the pickup location step THEN the System SHALL present a toggle for "I offer pickup for my orders"
2. WHEN a vendor enables the pickup toggle during onboarding THEN the Onboarding_System SHALL display the Location_Picker component
3. WHEN a vendor enables the pickup toggle AND does not select a location THEN the Validation_System SHALL prevent progression to the next step
4. WHEN a vendor disables the pickup toggle THEN the Onboarding_System SHALL allow progression without requiring a pickup location
5. WHEN a vendor completes onboarding with pickup enabled and a valid location THEN the System SHALL save the pickup location to the vendor's profile

### Requirement 4: Settings Pickup Location Management

**User Story:** As a vendor, I want to update my pickup location in settings, so that I can change where customers collect orders if I move or adjust my business location.

#### Acceptance Criteria

1. WHEN a vendor accesses the Settings_System THEN the System SHALL display the current offers_pickup status and pickup location (if set)
2. WHEN a vendor enables offers_pickup in settings THEN the Settings_System SHALL display the Location_Picker with the current location pre-populated (if one exists)
3. WHEN a vendor disables offers_pickup in settings THEN the System SHALL clear the pickup location from the vendor's profile upon save
4. WHEN a vendor updates their pickup location with valid coordinates THEN the System SHALL replace the old pickup location with the new one
5. WHEN a vendor attempts to enable offers_pickup without providing a location THEN the Validation_System SHALL prevent saving and display an error message

### Requirement 5: Checkout Pickup Location Display

**User Story:** As a customer, I want to see the vendor's pickup location during checkout when I select pickup, so that I know where to collect my order.

#### Acceptance Criteria

1. WHEN a customer selects delivery_type as 'pickup' during checkout THEN the Storefront SHALL retrieve the vendor's pickup location
2. WHEN the Storefront retrieves a vendor's pickup location THEN the System SHALL display a map with the pickup coordinates marked
3. WHEN the Storefront displays the pickup location THEN the System SHALL show the pickup address details below the map
4. WHEN a customer selects delivery_type as 'delivery' THEN the Storefront SHALL NOT display the vendor's pickup location
5. WHERE a vendor has offers_pickup set to false WHEN a customer attempts checkout THEN the Storefront SHALL NOT offer pickup as a delivery option

### Requirement 6: Order Pickup Location Persistence

**User Story:** As a system operator, I want to save the vendor's pickup location with each pickup order, so that the location remains accurate in order history even if the vendor later changes their pickup location.

#### Acceptance Criteria

1. WHEN a customer creates an order with delivery_type 'pickup' THEN the System SHALL copy the vendor's current pickup_latitude to the order record as vendor_pickup_latitude
2. WHEN a customer creates an order with delivery_type 'pickup' THEN the System SHALL copy the vendor's current pickup_longitude to the order record as vendor_pickup_longitude
3. WHEN a customer creates an order with delivery_type 'pickup' THEN the System SHALL copy the vendor's current pickup_address_details to the order record as vendor_pickup_address_details
4. WHEN a customer creates an order with delivery_type 'delivery' THEN the System SHALL NOT store vendor pickup location fields in the order record
5. WHEN a vendor updates their pickup location THEN the System SHALL NOT modify pickup locations stored in existing orders

### Requirement 7: Order History Pickup Location Display

**User Story:** As a customer, I want to see the pickup location in my order history for pickup orders, so that I can remember or confirm where I collected (or will collect) my order.

#### Acceptance Criteria

1. WHEN the Order_History displays an order with delivery_type 'pickup' THEN the System SHALL show the vendor_pickup_latitude and vendor_pickup_longitude on a map
2. WHEN the Order_History displays an order with delivery_type 'pickup' THEN the System SHALL display the vendor_pickup_address_details below the map
3. WHEN the Order_History displays an order with delivery_type 'pickup' THEN the System SHALL label the location as "Pickup Location"
4. WHEN the Order_History displays an order with delivery_type 'delivery' THEN the System SHALL show the customer's delivery location instead
5. WHEN the Order_History displays an order with delivery_type 'delivery' THEN the System SHALL label the location as "Delivery Location"

### Requirement 8: Pickup Location Validation

**User Story:** As a system operator, I want to validate all pickup location data before storage, so that the system maintains data integrity and prevents invalid geographic coordinates.

#### Acceptance Criteria

1. WHEN the Validation_System receives a null location for a vendor with offers_pickup enabled THEN the System SHALL reject the data with error "Location is required"
2. WHEN the Validation_System receives a latitude outside the range [-90, 90] THEN the System SHALL reject the data with error "Invalid latitude"
3. WHEN the Validation_System receives a longitude outside the range [-180, 180] THEN the System SHALL reject the data with error "Invalid longitude"
4. WHEN the Validation_System receives address details exceeding 500 characters THEN the System SHALL reject the data with error "Address details too long"
5. WHEN the Validation_System receives a location meeting all validation criteria THEN the System SHALL return validation success

### Requirement 9: Database Schema Support

**User Story:** As a system operator, I want the database to store pickup location data efficiently, so that the system can retrieve and query pickup information quickly.

#### Acceptance Criteria

1. THE System SHALL provide pickup_latitude column in the users table with DECIMAL(10, 8) precision
2. THE System SHALL provide pickup_longitude column in the users table with DECIMAL(11, 8) precision
3. THE System SHALL provide pickup_address_details column in the users table as TEXT type
4. THE System SHALL provide offers_pickup column in the users table as BOOLEAN type with default FALSE
5. THE System SHALL provide vendor_pickup_latitude column in the orders table with DECIMAL(10, 8) precision
6. THE System SHALL provide vendor_pickup_longitude column in the orders table with DECIMAL(11, 8) precision
7. THE System SHALL provide vendor_pickup_address_details column in the orders table as TEXT type
8. THE System SHALL create an index on users(offers_pickup) for vendors where offers_pickup is TRUE
9. THE System SHALL create an index on orders(delivery_type) for orders where delivery_type is 'pickup'

### Requirement 10: Component Integration

**User Story:** As a developer, I want existing components to integrate pickup location functionality seamlessly, so that the feature works consistently across the application.

#### Acceptance Criteria

1. WHEN the OnboardingWizard component renders THEN the System SHALL include a "Pickup Location" step between "Store Location" and "Theme Selection"
2. WHEN the SettingsForm component renders THEN the System SHALL include a "Delivery Options" section displaying offers_pickup toggle and Location_Picker
3. WHEN the Storefront component renders checkout with delivery_type 'pickup' THEN the System SHALL hide the customer delivery Location_Picker
4. WHEN the updateProfile server action executes THEN the System SHALL accept and process pickup_latitude, pickup_longitude, pickup_address_details, and offers_pickup fields
5. WHEN the createOrder server action executes with delivery_type 'pickup' THEN the System SHALL retrieve and store the vendor's pickup location in the order record
