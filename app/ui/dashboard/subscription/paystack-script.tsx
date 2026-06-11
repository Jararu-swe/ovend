'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

/**
 * Client component wrapper for Paystack script loading.
 * Loads the Paystack inline script once without causing re-renders.
 */
export default function PaystackScript() {
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = true;
  }, []);

  return (
    <Script
      src="https://js.paystack.co/v1/inline.js"
      strategy="lazyOnload"
      id="paystack-inline-js"
    />
  );
}
