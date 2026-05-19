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
  description: 'Empowering African Craft & Commerce.',
  icons: {
    icon: '/icon.svg',
  },
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
              // Comprehensive error suppression for external scripts
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args.join(' ');
                  // Suppress Paystack errors
                  if (msg.includes('Paystack') || msg.includes('paystack') || msg.includes('inline.js')) {
                    console.warn('[Suppressed Paystack error]:', msg);
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
              
              // Prevent external script errors from crashing the app
              window.addEventListener('error', function(e) {
                // Suppress Paystack initialization errors
                if (e.message && (e.message.includes('Paystack') || e.message.includes('paystack'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.warn('Paystack error suppressed:', e.message);
                  return false;
                }
                
                // Suppress browser extension errors
                if (e.filename && (e.filename.includes('webextension') || e.filename.includes('chrome-extension') || e.filename.includes('moz-extension'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.warn('Browser extension error suppressed:', e.message);
                  return false;
                }
                
                // Suppress errors from external scripts (paystack, inline.js)
                if (e.filename && (e.filename.includes('paystack') || e.filename.includes('inline.js'))) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.warn('External script error suppressed:', e.filename);
                  return false;
                }
              }, true);
              
              // Suppress unhandled promise rejections from external scripts
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.includes('Paystack') || e.reason.message.includes('paystack'))) {
                  e.preventDefault();
                  console.warn('Paystack promise rejection suppressed');
                  return false;
                }
              });
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
