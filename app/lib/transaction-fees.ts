/**
 * Transaction Fee Calculator Module
 * 
 * This module provides functions for calculating transaction fees based on
 * vendor subscription tiers. Fees are applied to fulfilled orders and deducted
 * from vendor payout amounts.
 * 
 * Fee Structure:
 * - Starter Tier: 5% transaction fee
 * - Pro Tier: 3% transaction fee
 * - Business Tier: 2% transaction fee
 */

import { sql } from './db';
import { getTransactionFeePercentage } from './subscriptions';

/**
 * Calculates the transaction fee for a given order amount based on vendor's subscription tier.
 * 
 * @param vendorId - The vendor's user ID
 * @param orderAmount - The order total amount in kobo (smallest currency unit)
 * @returns Object containing fee amount, fee percentage, and net amount after fee deduction
 * 
 * @example
 * const result = await calculateTransactionFee('vendor-123', 10000);
 * // For Starter tier: { fee: 500, feePercentage: 5.0, netAmount: 9500 }
 * // For Pro tier: { fee: 300, feePercentage: 3.0, netAmount: 9700 }
 * // For Business tier: { fee: 200, feePercentage: 2.0, netAmount: 9800 }
 */
export async function calculateTransactionFee(
  vendorId: string,
  orderAmount: number
): Promise<{ fee: number; feePercentage: number; netAmount: number }> {
  const feePercentage = await getTransactionFeePercentage(vendorId);
  const fee = Math.round(orderAmount * (feePercentage / 100));
  const netAmount = orderAmount - fee;
  
  return {
    fee,
    feePercentage,
    netAmount
  };
}

/**
 * Calculates the payout amount (net amount after fee deduction) for an order.
 * This is a convenience function for payout processing.
 * 
 * @param vendorId - The vendor's user ID
 * @param orderAmount - The order total amount in kobo
 * @returns Net amount to be paid out to vendor after fee deduction
 * 
 * @example
 * const payout = await calculatePayoutAmount('vendor-123', 10000);
 * // For Starter tier: 9500 (10000 - 5% fee)
 * // For Pro tier: 9700 (10000 - 3% fee)
 * // For Business tier: 9800 (10000 - 2% fee)
 */
export async function calculatePayoutAmount(
  vendorId: string,
  orderAmount: number
): Promise<number> {
  const { netAmount } = await calculateTransactionFee(vendorId, orderAmount);
  return netAmount;
}

/**
 * Generates a detailed transaction fee breakdown for multiple orders.
 * Used in payout reports to show itemized fee calculations.
 * 
 * @param vendorId - The vendor's user ID
 * @param orderIds - Array of order IDs to include in the breakdown
 * @returns Object containing fee percentage, per-order breakdown, and totals
 * 
 * @example
 * const breakdown = await getTransactionFeeBreakdown('vendor-123', ['order-1', 'order-2']);
 * // Returns:
 * // {
 * //   feePercentage: 5.0,
 * //   breakdown: [
 * //     { orderId: 'order-1', orderAmount: 10000, fee: 500, netAmount: 9500 },
 * //     { orderId: 'order-2', orderAmount: 20000, fee: 1000, netAmount: 19000 }
 * //   ],
 * //   totals: {
 * //     orderAmount: 30000,
 * //     fee: 1500,
 * //     netAmount: 28500
 * //   }
 * // }
 */
export async function getTransactionFeeBreakdown(
  vendorId: string,
  orderIds: string[]
): Promise<{
  feePercentage: number;
  breakdown: Array<{
    orderId: string;
    orderAmount: number;
    fee: number;
    netAmount: number;
  }>;
  totals: {
    orderAmount: number;
    fee: number;
    netAmount: number;
  };
}> {
  const feePercentage = await getTransactionFeePercentage(vendorId);
  
  const orders = await sql`
    SELECT id, total_amount FROM orders 
    WHERE id = ANY(${orderIds}) AND vendor_id = ${vendorId} AND status = 'fulfilled'
  `;
  
  const breakdown = orders.map((order: any) => {
    const fee = Math.round(order.total_amount * (feePercentage / 100));
    return {
      orderId: order.id,
      orderAmount: order.total_amount,
      fee,
      netAmount: order.total_amount - fee
    };
  });
  
  const totalOrderAmount = breakdown.reduce((sum, item) => sum + item.orderAmount, 0);
  const totalFee = breakdown.reduce((sum, item) => sum + item.fee, 0);
  const totalNetAmount = breakdown.reduce((sum, item) => sum + item.netAmount, 0);
  
  return {
    feePercentage,
    breakdown,
    totals: {
      orderAmount: totalOrderAmount,
      fee: totalFee,
      netAmount: totalNetAmount
    }
  };
}
