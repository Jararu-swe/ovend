'use client';

import Script from 'next/script';

/**
 * Client component wrapper for Paystack script loading.
 * Loads the Paystack inline script with proper error handling.
 */
export default function PaystackScript() {
  return (
    <Script
      src="https://js.paystack.co/v1/inline.js"
      strategy="afterInteractive"
      id="paystack-inline-js"
      onLoad={() => {
        console.log('Paystack script loaded successfully');
      }}
      onError={(e) => {
        console.error('Failed to load Paystack script:', e);
      }}
    />
  );
}
