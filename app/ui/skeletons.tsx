// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="rounded-xl bg-gray-100 p-4">
        <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceSkeleton() {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
      <div className="flex items-center">
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
        <div className="min-w-0">
          <div className="h-5 w-40 rounded-md bg-gray-200" />
          <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
        </div>
      </div>
      <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
    </div>
  );
}

export function LatestInvoicesSkeleton() {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
        <div className="bg-white px-6">
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      {/* Customer Name and Image */}
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </div>
      </td>
      {/* Email */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-32 rounded bg-gray-100"></div>
      </td>
      {/* Amount */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Date */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Status */}
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </td>
      {/* Actions */}
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

export function InvoicesMobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th
                  scope="col"
                  className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                >
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm`}>
      <div className="aspect-[4/3] w-full bg-slate-100" />
      <div className="flex flex-col p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-5 w-20 rounded bg-slate-200" />
        </div>
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="mt-1 h-4 w-3/4 rounded bg-slate-100" />
        <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
          <div className="h-8 w-8 rounded-lg bg-slate-100" />
          <div className="h-8 w-8 rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden border-b border-slate-100 px-6 py-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <div>
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-1 h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="h-5 w-20 rounded bg-slate-200 mb-1" />
            <div className="h-4 w-16 rounded-full bg-slate-100" />
          </div>
          <div className="h-5 w-5 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function OrdersListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <OrderRowSkeleton />
      <OrderRowSkeleton />
      <OrderRowSkeleton />
      <OrderRowSkeleton />
      <OrderRowSkeleton />
    </div>
  );
}

export function DiscountCardSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="h-8 w-24 rounded-lg bg-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
        <div className="pt-3 border-t border-slate-100">
          <div className="h-10 w-full rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function DiscountListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2n />
      <DiscountCardSkeleton />
      <DiscountCardSkeleton />
    </div>
  );
}
 lg:grid-cols-3">
      <DiscountCardSkeleto

export function DiscountCardSkeleton() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="h-8 w-24 rounded-lg bg-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
        <div className="pt-3 border-t border-slate-100">
          <div className="h-10 w-full rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function DiscountListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DiscountCardSkeleton />
      <DiscountCardSkeleton />
      <DiscountCardSkeleton />
    </div>
  );
}

export function TeamMemberRowSkeleton() {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`${shimmer} relative overflow-hidden flex items-center`}>
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200" />
          <div className="ml-4 space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-40 rounded bg-slate-100" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`${shimmer} relative overflow-hidden h-4 w-20 rounded bg-slate-200`} />
      </td>
      <td className="px-6 py-4">
        <div className={`${shimmer} relative overflow-hidden flex gap-1`}>
          <div className="h-5 w-16 rounded bg-slate-200" />
          <div className="h-5 w-16 rounded bg-slate-200" />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`${shimmer} relative overflow-hidden h-5 w-16 rounded-full bg-slate-200`} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className={`${shimmer} relative overflow-hidden h-5 w-5 rounded bg-slate-200 ml-auto`} />
      </td>
    </tr>
  );
}

export function TeamListSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            <TeamMemberRowSkeleton />
            <TeamMemberRowSkeleton />
            <TeamMemberRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  );
}
