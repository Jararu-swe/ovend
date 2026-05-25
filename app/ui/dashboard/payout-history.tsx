"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface PayoutHistoryProps {
  payouts: Array<{
    id: number;
    requested_amount: number;
    net_amount: number;
    service_fee: number;
    status: "pending" | "processing" | "completed" | "failed";
    requested_at: string;
    processed_at?: string;
    bank_name: string;
    account_number: string;
  }>;
}

const statusColors = {
  pending: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: ClockIcon,
  },
  processing: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: ClockIcon,
  },
  completed: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: CheckCircleIcon,
  },
  failed: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: XCircleIcon,
  },
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PayoutHistory({ payouts }: PayoutHistoryProps) {
  if (payouts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-slate-500">No payout history yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Recent Payouts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Bank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payouts.map((payout) => {
              const colors = statusColors[payout.status];
              const StatusIcon = colors.icon;

              return (
                <tr key={payout.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(payout.requested_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        ₦
                        {payout.net_amount.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Fee: ₦
                        {payout.service_fee.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>
                      <p>{payout.bank_name}</p>
                      <p className="text-xs text-slate-500">
                        {payout.account_number}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} border ${colors.border} ${colors.text}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusLabels[payout.status]}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
