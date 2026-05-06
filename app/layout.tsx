import '@/app/ui/global.css';
import {inter} from '@/app/ui/fonts'
import Script from 'next/script';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Vendle',
    default: 'Vendle',
  },
  description: 'Empowering African Craft & Commerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
