import '@/app/ui/global.css';
import 'leaflet/dist/leaflet.css';
import {inter} from '@/app/ui/fonts'
import Script from 'next/script';
import { Metadata } from 'next';
import { ClientProviders } from '@/app/client-providers';

export const metadata: Metadata = {
  title: {
    template: '%s | Vendle',
    default: 'Vendle',
  },
  description: 'Sell online with a beautiful storefront.',
  openGraph: {
    title: 'Vendle - Turn Your Social Media Into a Storefront',
    description: 'Empowering African Craft & Commerce. Create beautiful online stores, process secure payments, and manage orders from a single mobile dashboard.',
    url: 'https://vendle.com.ng',
    siteName: 'Vendle',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vendle - African Commerce Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vendle - Sell online with a beautiful storefront.',
    description: 'Empowering African Craft & Commerce. Setup takes less than 3 minutes.',
    images: ['/og-image.png'],
    creator: '@vendle',
  },
  icons: {
    icon: '/icon.svg',
  },
  metadataBase: new URL('https://vendle.store'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Safe error suppression — only filters non-critical external script noise.
              // Critical errors (React hydration, Next.js router, etc.) are NEVER suppressed.
              (function() {
                // Lightly filter console.error for Paystack noise only
                const _origErr = console.error.bind(console);
                console.error = function(...args) {
                  try {
                    const firstArg = args[0];
                    if (firstArg) {
                      const str = typeof firstArg === 'string' 
                        ? firstArg 
                        : (firstArg instanceof Error ? firstArg.message : String(firstArg));
                      if (str.includes('Paystack') || str.includes('paystack')) {
                        console.warn('[Paystack noise suppressed]');
                        return;
                      }
                    }
                  } catch (e) {}
                  _origErr.apply(console, args);
                };

                // Capture errors on the window — suppress only Paystack/extension noise
                // but ALWAYS let Next.js / React errors propagate normally.
                window.addEventListener('error', function(e) {
                  try {
                    const msg = e.message || '';
                    const filename = e.filename || '';
                    const isPaystack = msg.includes('Paystack') || msg.includes('paystack');
                    const isExtension = filename.includes('chrome-extension') || filename.includes('moz-extension');
                    
                    if (isPaystack || isExtension) {
                      e.preventDefault();
                      e.stopPropagation();
                      console.warn('External script error suppressed:', filename || msg);
                      return false;
                    }
                  } catch (err) {}
                }, true);

                // Suppress unhandled promise rejections from external scripts only
                window.addEventListener('unhandledrejection', function(e) {
                  try {
                    const msg = e.reason?.message || '';
                    if (msg.includes('Paystack') || msg.includes('paystack')) {
                      e.preventDefault();
                      console.warn('Paystack promise rejection suppressed');
                      return false;
                    }
                  } catch (err) {}
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
