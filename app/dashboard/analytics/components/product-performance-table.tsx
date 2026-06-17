'use client';

import { useState } from 'react';
import type { ProductPerformanceItem } from '@/app/lib/business-analytics-types';

interface ProductPerformanceTableProps {
  products: ProductPerformanceItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: 'revenue' | 'units' | 'velocity' | 'name') => void;
  currentSort: 'revenue' | 'units' | 'velocity' | 'name';
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string | undefined) => void;
}

export default function ProductPerformanceTable({
  products,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSortChange,
  currentSort,
  categories = [],
  selectedCategory,
  onCategoryChange,
}: ProductPerformanceTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Product Performance</h3>
        
        {categories.length > 0 && onCategoryChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Category:</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value || undefined)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => onSortChange('name')}
              >
                Product {currentSort === 'name' && '↓'}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => onSortChange('units')}
              >
                Units Sold {currentSort === 'units' && '↓'}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => onSortChange('revenue')}
              >
                Revenue {currentSort === 'revenue' && '↓'}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => onSortChange('velocity')}
              >
                Velocity (days) {currentSort === 'velocity' && '↓'}
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Trend</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Discount</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.productId}
                className={`border-b border-slate-100 hover:bg-slate-50 ${
                  product.unitsSold === 0 ? 'bg-red-50' : ''
                }`}
              >
                <td className="py-4 px-4 text-sm font-medium text-slate-900">
                  {product.productName}
                  {product.category && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({product.category})
                    </span>
                  )}
                  {product.unitsSold === 0 && (
                    <span className="ml-2 text-xs text-red-600">
                      (No sales)
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  {product.unitsSold.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-sm text-right font-semibold text-slate-900">
                  {formatCurrency(product.totalRevenue)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  {product.inventoryVelocity === 999 ? 'N/A' : product.inventoryVelocity.toFixed(1)}
                </td>
                <td className={`py-4 px-4 text-sm text-center font-semibold ${getTrendColor(product.salesTrend)}`}>
                  {getTrendIcon(product.salesTrend)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  {product.discountPercentage !== null
                    ? `${product.discountPercentage}% off`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      pageNum === currentPage
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
