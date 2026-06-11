'use client';

import { SubscriptionPayment } from '@/app/lib/definitions';
import { formatPrice, formatSubscriptionDate, getTierDisplayName } from '@/app/lib/subscription-utils';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PaymentHistorySectionProps {
  payments: SubscriptionPayment[];
}

export default function PaymentHistorySection({
  payments,
}: PaymentHistorySectionProps) {
  // Don't render if no payments
  if (!payments || payments.length === 0) {
    return null;
  }

  // Sort payments by date (most recent first)
  const sortedPayments = [...payments].sort((a, b) => {
    const aTime = a.paid_at ? new Date(a.paid_at).getTime() : 0;
    const bTime = b.paid_at ? new Date(b.paid_at).getTime() : 0;
    return bTime - aTime;
  });

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      // TODO: Implement invoice download
      // This will call an API endpoint that generates/retrieves the invoice PDF
      console.log('Downloading invoice for payment:', paymentId);
      
      // Placeholder implementation
      alert('Invoice download feature will be implemented soon.');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  return (
    <section className="mt-8" aria-labelledby="payment-history-heading">
      <h2
        id="payment-history-heading"
        className="text-xl font-bold text-slate-900 mb-4"
      >
        Payment History
      </h2>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Billing Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatSubscriptionDate(payment.paid_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {getTierDisplayName(payment.tier)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span>
                        {formatSubscriptionDate(payment.billing_period_start)}
                      </span>
                      <span className="text-xs text-slate-500">
                        to {formatSubscriptionDate(payment.billing_period_end)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {formatPrice(payment.amount_kobo)}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    {payment.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(payment.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                      aria-label={`Download invoice for payment on ${formatSubscriptionDate(payment.paid_at)}`}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-200">
          {sortedPayments.map((payment) => (
            <div key={payment.id} className="p-4 space-y-3">
              {/* Date and Amount */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatSubscriptionDate(payment.paid_at)}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {getTierDisplayName(payment.tier)}
                    </span>
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {formatPrice(payment.amount_kobo)}
                </p>
              </div>

              {/* Billing Period */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Billing Period
                </p>
                <p className="text-xs text-slate-600">
                  {formatSubscriptionDate(payment.billing_period_start)} to{' '}
                  {formatSubscriptionDate(payment.billing_period_end)}
                </p>
              </div>

              {/* Reference */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Reference
                </p>
                <p className="text-xs font-mono text-slate-600">
                  {payment.reference}
                </p>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={() => handleDownloadInvoice(payment.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                aria-label={`Download invoice for payment on ${formatSubscriptionDate(payment.paid_at)}`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download Invoice
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
