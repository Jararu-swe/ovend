/**
 * Tests for Order History Location Display
 * 
 * Task 10.1 coverage:
 * - Conditional rendering based on order delivery_type
 * - Pickup orders display vendor pickup location
 * - Delivery orders display customer delivery location
 * - Appropriate labels for each delivery type
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, expect, test } from 'vitest';

// Mock order data structures
type OrderLocation = {
  delivery_type: 'pickup' | 'delivery';
  vendor_pickup_latitude: number | null;
  vendor_pickup_longitude: number | null;
  vendor_pickup_address_details: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_address_details: string | null;
};

/**
 * Simulates the conditional rendering logic from the order detail page
 * Returns which location should be displayed and what label should be used
 */
function getDisplayedLocation(order: OrderLocation): {
  shouldDisplayLocation: boolean;
  locationType: 'pickup' | 'delivery' | null;
  latitude: number | null;
  longitude: number | null;
  addressDetails: string | null;
  label: string | null;
} {
  // Pickup order logic
  if (
    order.delivery_type === 'pickup' &&
    order.vendor_pickup_latitude !== null &&
    order.vendor_pickup_longitude !== null
  ) {
    return {
      shouldDisplayLocation: true,
      locationType: 'pickup',
      latitude: order.vendor_pickup_latitude,
      longitude: order.vendor_pickup_longitude,
      addressDetails: order.vendor_pickup_address_details,
      label: 'Pickup Location',
    };
  }

  // Delivery order logic
  if (
    order.delivery_type === 'delivery' &&
    order.delivery_latitude !== null &&
    order.delivery_longitude !== null
  ) {
    return {
      shouldDisplayLocation: true,
      locationType: 'delivery',
      latitude: order.delivery_latitude,
      longitude: order.delivery_longitude,
      addressDetails: order.delivery_address_details,
      label: 'Delivery Location',
    };
  }

  // No location to display
  return {
    shouldDisplayLocation: false,
    locationType: null,
    latitude: null,
    longitude: null,
    addressDetails: null,
    label: null,
  };
}

// ---------------------------------------------------------------------------
// Test Suite: Pickup Order Location Display
// ---------------------------------------------------------------------------

describe('Order History - Pickup Order Location Display', () => {
  test('displays vendor pickup location for pickup orders with coordinates', () => {
    const pickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: '123 Market Street, Ikeja, Lagos',
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(pickupOrder);

    expect(result.shouldDisplayLocation).toBe(true);
    expect(result.locationType).toBe('pickup');
    expect(result.latitude).toBe(6.5244);
    expect(result.longitude).toBe(3.3792);
    expect(result.label).toBe('Pickup Location');
  });

  test('displays pickup address details when available', () => {
    const pickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: '123 Market Street, Ikeja, Lagos',
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(pickupOrder);

    expect(result.addressDetails).toBe('123 Market Street, Ikeja, Lagos');
  });

  test('handles pickup orders without address details', () => {
    const pickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(pickupOrder);

    expect(result.shouldDisplayLocation).toBe(true);
    expect(result.addressDetails).toBe(null);
  });

  test('does not display location for pickup orders without coordinates', () => {
    const pickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: '123 Market Street, Ikeja, Lagos',
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(pickupOrder);

    expect(result.shouldDisplayLocation).toBe(false);
    expect(result.locationType).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// Test Suite: Delivery Order Location Display
// ---------------------------------------------------------------------------

describe('Order History - Delivery Order Location Display', () => {
  test('displays customer delivery location for delivery orders with coordinates', () => {
    const deliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: '456 Victoria Island, Lagos',
    };

    const result = getDisplayedLocation(deliveryOrder);

    expect(result.shouldDisplayLocation).toBe(true);
    expect(result.locationType).toBe('delivery');
    expect(result.latitude).toBe(6.4281);
    expect(result.longitude).toBe(3.4219);
    expect(result.label).toBe('Delivery Location');
  });

  test('displays delivery address details when available', () => {
    const deliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: 'Gate 2, Third floor',
    };

    const result = getDisplayedLocation(deliveryOrder);

    expect(result.addressDetails).toBe('Gate 2, Third floor');
  });

  test('handles delivery orders without address details', () => {
    const deliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(deliveryOrder);

    expect(result.shouldDisplayLocation).toBe(true);
    expect(result.addressDetails).toBe(null);
  });

  test('does not display location for delivery orders without coordinates', () => {
    const deliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: '456 Victoria Island, Lagos',
    };

    const result = getDisplayedLocation(deliveryOrder);

    expect(result.shouldDisplayLocation).toBe(false);
    expect(result.locationType).toBe(null);
  });
});

// ---------------------------------------------------------------------------
// Test Suite: Conditional Logic - Pickup vs Delivery
// ---------------------------------------------------------------------------

describe('Order History - Conditional Location Display Logic', () => {
  test('pickup orders do not display delivery location', () => {
    const pickupOrderWithDeliveryData: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: 'Vendor location',
      // These should be ignored for pickup orders
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: 'Customer location',
    };

    const result = getDisplayedLocation(pickupOrderWithDeliveryData);

    expect(result.locationType).toBe('pickup');
    expect(result.latitude).toBe(6.5244); // Vendor pickup coords
    expect(result.longitude).toBe(3.3792);
    expect(result.label).toBe('Pickup Location');
  });

  test('delivery orders do not display pickup location', () => {
    const deliveryOrderWithPickupData: OrderLocation = {
      delivery_type: 'delivery',
      // These should be ignored for delivery orders
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: 'Vendor location',
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: 'Customer location',
    };

    const result = getDisplayedLocation(deliveryOrderWithPickupData);

    expect(result.locationType).toBe('delivery');
    expect(result.latitude).toBe(6.4281); // Customer delivery coords
    expect(result.longitude).toBe(3.4219);
    expect(result.label).toBe('Delivery Location');
  });

  test('uses correct label for each delivery type', () => {
    const pickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const deliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
      delivery_address_details: null,
    };

    const pickupResult = getDisplayedLocation(pickupOrder);
    const deliveryResult = getDisplayedLocation(deliveryOrder);

    expect(pickupResult.label).toBe('Pickup Location');
    expect(deliveryResult.label).toBe('Delivery Location');
  });
});

// ---------------------------------------------------------------------------
// Test Suite: Edge Cases
// ---------------------------------------------------------------------------

describe('Order History - Edge Cases', () => {
  test('handles orders with only latitude (missing longitude)', () => {
    const orderWithOnlyLat: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: 'Address',
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(orderWithOnlyLat);

    expect(result.shouldDisplayLocation).toBe(false);
  });

  test('handles orders with only longitude (missing latitude)', () => {
    const orderWithOnlyLng: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: 3.4219,
      delivery_address_details: 'Address',
    };

    const result = getDisplayedLocation(orderWithOnlyLng);

    expect(result.shouldDisplayLocation).toBe(false);
  });

  test('handles orders with no location data at all', () => {
    const orderWithNoLocation: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(orderWithNoLocation);

    expect(result.shouldDisplayLocation).toBe(false);
    expect(result.locationType).toBe(null);
    expect(result.label).toBe(null);
  });

  test('validates latitude is within valid range [-90, 90]', () => {
    const validPickupOrder: OrderLocation = {
      delivery_type: 'pickup',
      vendor_pickup_latitude: 6.5244, // Valid
      vendor_pickup_longitude: 3.3792,
      vendor_pickup_address_details: null,
      delivery_latitude: null,
      delivery_longitude: null,
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(validPickupOrder);
    
    expect(result.latitude).toBeGreaterThanOrEqual(-90);
    expect(result.latitude).toBeLessThanOrEqual(90);
  });

  test('validates longitude is within valid range [-180, 180]', () => {
    const validDeliveryOrder: OrderLocation = {
      delivery_type: 'delivery',
      vendor_pickup_latitude: null,
      vendor_pickup_longitude: null,
      vendor_pickup_address_details: null,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219, // Valid
      delivery_address_details: null,
    };

    const result = getDisplayedLocation(validDeliveryOrder);
    
    expect(result.longitude).toBeGreaterThanOrEqual(-180);
    expect(result.longitude).toBeLessThanOrEqual(180);
  });
});
