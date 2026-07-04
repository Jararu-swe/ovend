import React from 'react';
import Link from 'next/link';
import VendleLogo from '@/app/ui/vendle-logo';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Vendle',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <VendleLogo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate prose-emerald max-w-none space-y-6">
          <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Vendle, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Vendle provides a platform that allows merchants to create online storefronts, sell products and services, and process payments. We reserve the right to modify, suspend, or discontinue the service at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Account Registration</h2>
            <p>
              To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You may not sell illegal, counterfeit, or prohibited goods through your Vendle storefront. We reserve the right to terminate accounts that violate our acceptable use policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Payments and Fees</h2>
            <p>
              Vendle charges fees for certain services and transactions. All fees are clearly communicated before you incur them. You agree to pay all applicable fees in connection with your use of the service. We use third-party payment processors (e.g., Paystack) to handle transactions, and you agree to their respective terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Vendle shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@vendle.app.
            </p>
          </section>
        </div>
      </main>
      
      <footer className="border-t border-slate-200/60 bg-[#FDFBF7] py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Vendle. Built in Nigeria.
      </footer>
    </div>
  );
}
