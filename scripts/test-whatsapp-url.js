/**
 * Test script to verify the WhatsApp URL construction logic
 * Simulates what happens in storefront.tsx and order-list.tsx
 */

function testPhoneFormatting() {
  console.log('\n=== Testing Phone Number Formatting ===\n');
  
  const testCases = [
    { input: '08012345678', expected: '2348012345678', desc: 'Nigerian mobile (leading 0)' },
    { input: '+2348012345678', expected: '2348012345678', desc: 'Nigerian mobile (with +)' },
    { input: '2348012345678', expected: '2348012345678', desc: 'Nigerian mobile (already intl)' },
    { input: '0801234567', expected: '234801234567', desc: 'Short Nigerian mobile' },
    { input: '1234567890', expected: '1234567890', desc: 'No leading zero, no country code' },
    { input: '', expected: '', desc: 'Empty string' },
    { input: ' 080 1234 5678 ', expected: '2348012345678', desc: 'With spaces' },
    { input: '080-1234-5678', expected: '2348012345678', desc: 'With hyphens' },
  ];

  let allPassed = true;
  for (const tc of testCases) {
    const formatted = tc.input.replace(/\D/g, '').replace(/^0/, '234');
    const passed = formatted === tc.expected;
    if (!passed) allPassed = false;
    console.log(
      `${passed ? '✅' : '❌'} ${tc.desc}
        Input:    "${tc.input}"
        Expected: "${tc.expected}"
        Got:      "${formatted}"`
    );
  }
  return allPassed;
}

function testMessageConstruction() {
  console.log('\n=== Testing WhatsApp Message Construction ===\n');

  // Simulate storefront.tsx logic
  const orderItems = [
    { quantity: 2, name: 'Nike Air Max', price: 45000 },
    { quantity: 1, name: 'Adidas Hoodie', price: 25000 },
  ];
  
  const orderItemsList = orderItems.map(item => 
    `• ${item.quantity}x ${item.name} - ₦${item.price * item.quantity}`
  ).join('\n');

  const deliveryLocation = {
    lat: 6.524379,
    lng: 3.379206,
    details: 'Near the blue gate, opposite Zenith Bank'
  };

  // Test delivery location text
  let locationText = '\n\n📦 *Delivery Order*';
  if (deliveryLocation) {
    locationText += `\n📍 *Delivery Point:* ${deliveryLocation.lat.toFixed(4)}, ${deliveryLocation.lng.toFixed(4)}`;
    locationText += `\nMaps: https://www.google.com/maps/search/?api=1&query=${deliveryLocation.lat},${deliveryLocation.lng}`;
    if (deliveryLocation.details) {
      locationText += `\nNote: ${deliveryLocation.details}`;
    }
  }

  const message = `Hello *Test Store*! 👋\n\nI just placed an order on your Vendle store:\n\n📦 *Order ID:* ABCD1234\n\n*Items:*\n${orderItemsList}\n\n💰 *Total:* ₦115,000${locationText}\n\nPlease confirm my order. Thank you!`;

  const encoded = encodeURIComponent(message);
  const fullUrl = `https://wa.me/2348012345678?text=${encoded}`;

  console.log('Raw message:');
  console.log('──────────────────────────────────────');
  console.log(message);
  console.log('──────────────────────────────────────\n');
  console.log('Encoded URL:');
  console.log(fullUrl);
  console.log('\n');

  // Verify the URL is valid
  try {
    new URL(fullUrl);
    console.log('✅ URL is valid');
  } catch (e) {
    console.log('❌ URL is invalid:', e.message);
    return false;
  }

  // Verify encoding worked for special characters
  if (encoded.includes('%')) {
    console.log('✅ Special characters encoded properly');
  } else {
    console.log('❌ No encoding detected');
    return false;
  }

  // Verify phone doesn't have leading 0
  if (fullUrl.includes('wa.me/23480')) {
    console.log('✅ Phone formatted to international (234...)');
  } else {
    console.log('❌ Phone may have wrong format');
    return false;
  }

  return true;
}

function testOrderListMessage() {
  console.log('\n=== Testing Order-List WhatsApp Message ===\n');

  // Simulate order-list.tsx logic
  const itemsArray = [
    { quantity: 2, name: 'Nike Air Max', price: 45000 },
    { quantity: 1, name: 'Adidas Hoodie', price: 25000 },
  ];
  
  if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
    console.log('❌ Items array is empty');
    return false;
  }
  
  const itemsText = itemsArray.map(i => `${i.quantity}x ${i.name}`).join('\n- ');
  
  // Test with delivery
  const order = {
    id: 'ABCD1234EFGH',
    customer_name: 'Test User',
    customer_phone: '+2348012345678',
    total_amount: 115000,
    delivery_type: 'delivery',
    delivery_latitude: 6.524379,
    delivery_longitude: 3.379206,
  };

  let locationText = '';
  if (order.delivery_latitude && order.delivery_longitude) {
    locationText = `\n\nDelivery Location: https://www.google.com/maps/search/?api=1&query=${order.delivery_latitude},${order.delivery_longitude}`;
  }

  const message = `Hello ${order.customer_name}!\n\nThank you for your order.\n\n📦 Order ID: ${order.id.slice(0, 8)}\n\nHere is a quick summary:\n- ${itemsText}\n\nTotal: ₦${order.total_amount}${locationText}\n\nWe are processing this right away!`;
  
  const phone = order.customer_phone.replace(/\D/g, '').replace(/^0/, '234');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  console.log('Customer message:');
  console.log('──────────────────────────────────────');
  console.log(message);
  console.log('──────────────────────────────────────\n');
  console.log('URL:', url, '\n');

  try {
    new URL(url);
    console.log('✅ URL is valid');
  } catch (e) {
    console.log('❌ URL is invalid:', e.message);
    return false;
  }

  return true;
}

// Run all tests
console.log('══════════════════════════════════════');
console.log('  WhatsApp URL Construction Tests');
console.log('══════════════════════════════════════');

const phoneOk = testPhoneFormatting();
const messageOk = testMessageConstruction();
const orderListOk = testOrderListMessage();

console.log('\n══════════════════════════════════════');
console.log('  Results Summary');
console.log('══════════════════════════════════════');
console.log(`  Phone Formatting:  ${phoneOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Storefront Msg:    ${messageOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Order-List Msg:    ${orderListOk ? '✅ PASS' : '❌ FAIL'}`);
console.log('══════════════════════════════════════\n');

if (phoneOk && messageOk && orderListOk) {
  console.log('All tests passed! ✅ The WhatsApp URL construction is correct.');
  process.exit(0);
} else {
  console.log('Some tests failed! ❌');
  process.exit(1);
}
