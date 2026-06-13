import { describe, expect, test, beforeEach, vi } from 'vitest';
import { fetchVendorAvailableBalance } from './payouts';
import { getTransactionFeePercentage } from './subscriptions';

// Mock the database module sql
const { sql: mockSql } = vi.hoisted(() => {
  const fn = vi.fn();
  return {
    sql: Object.assign(fn, {
      unsafe: vi.fn().mockResolvedValue([])
    })
  };
});

vi.mock('./db', () => ({ sql: mockSql }));

vi.mock('./subscriptions', () => ({
  getTransactionFeePercentage: vi.fn()
}));

describe('fetchVendorAvailableBalance', () => {
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should return 0 when there are no fulfilled orders and no payouts', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(5.0); // Starter fee
    mockSql
      .mockResolvedValueOnce([]) // orders query
      .mockResolvedValueOnce([{ total_payouts: '0' }]); // payouts query

    const balance = await fetchVendorAvailableBalance('vendor-123');

    expect(balance).toBe(0);
    expect(getTransactionFeePercentage).toHaveBeenCalledWith('vendor-123');
    expect(mockSql).toHaveBeenCalledTimes(2);
  });

  test('should calculate available balance correctly for Starter tier (5% fee) and deduct non-failed payouts', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(5.0); // 5% fee
    
    // Mock orders in Kobo: ₦10,000 (1000000 kobo) and ₦5,000 (500000 kobo)
    // Total gross: ₦15,000. Total net (95%): ₦14,250
    const mockOrders = [
      { total_amount: 1000000 },
      { total_amount: 500000 }
    ];

    // Mock payouts in Naira: one pending (₦3,000) and one completed (₦4,000)
    // Total non-failed payouts: ₦7,000
    const mockPayouts = [{ total_payouts: '7000.00' }];

    mockSql
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPayouts);

    const balance = await fetchVendorAvailableBalance('vendor-123');

    // Expected: ₦14,250 net revenue - ₦7,000 payouts = ₦7,250 available balance
    expect(balance).toBe(7250);
  });

  test('should calculate available balance correctly for Pro tier (3% fee) and deduct non-failed payouts', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(3.0); // 3% fee
    
    // Mock orders in Kobo: ₦20,000 (2000000 kobo)
    // Total gross: ₦20,000. Total net (97%): ₦19,400
    const mockOrders = [
      { total_amount: 2000000 }
    ];

    // Mock payouts: ₦5,000 completed
    const mockPayouts = [{ total_payouts: '5000.00' }];

    mockSql
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPayouts);

    const balance = await fetchVendorAvailableBalance('vendor-456');

    // Expected: ₦19,400 net revenue - ₦5,000 payouts = ₦14,400 available balance
    expect(balance).toBe(14400);
  });

  test('should calculate available balance correctly for Business tier (2% fee) and deduct non-failed payouts', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(2.0); // 2% fee
    
    // Mock orders in Kobo: ₦50,000 (5000000 kobo)
    // Total gross: ₦50,000. Total net (98%): ₦49,000
    const mockOrders = [
      { total_amount: 5000000 }
    ];

    // Mock payouts: ₦10,000 completed
    const mockPayouts = [{ total_payouts: '10000.00' }];

    mockSql
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPayouts);

    const balance = await fetchVendorAvailableBalance('vendor-789');

    // Expected: ₦49,000 net revenue - ₦10,000 payouts = ₦39,000 available balance
    expect(balance).toBe(39000);
  });

  test('should ignore failed payouts when calculating total payouts', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(5.0); // 5% fee
    
    // Mock orders: ₦10,000 (1000000 kobo)
    // Net: ₦9,500
    const mockOrders = [
      { total_amount: 1000000 }
    ];

    // Payout query in code only selects payouts where status != 'failed'.
    // If database returned ₦0 for non-failed payouts (meaning the failed payouts were successfully ignored by SQL query)
    const mockPayouts = [{ total_payouts: '0.00' }];

    mockSql
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPayouts);

    const balance = await fetchVendorAvailableBalance('vendor-123');

    // The SQL query checks status != 'failed'. So it returns only non-failed payouts.
    const queryStrings = mockSql.mock.calls[1][0];
    const fullQuery = queryStrings.join(' ');
    expect(fullQuery).toContain("status != 'failed'");

    expect(balance).toBe(9500);
  });

  test('should clamp balance to 0 when total payouts exceed total net revenue', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(5.0); // 5% fee
    
    // Mock orders: ₦10,000 (1000000 kobo) -> Net: ₦9,500
    const mockOrders = [
      { total_amount: 1000000 }
    ];

    // Mock payouts: ₦12,000 (exceeds net revenue)
    const mockPayouts = [{ total_payouts: '12000.00' }];

    mockSql
      .mockResolvedValueOnce(mockOrders)
      .mockResolvedValueOnce(mockPayouts);

    const balance = await fetchVendorAvailableBalance('vendor-123');

    // Expected: 0 (clamped, not negative)
    expect(balance).toBe(0);
  });

  test('should return 0 and log error if database query fails', async () => {
    vi.mocked(getTransactionFeePercentage).mockResolvedValueOnce(5.0);
    mockSql.mockRejectedValueOnce(new Error('DB Connection Timeout'));

    const balance = await fetchVendorAvailableBalance('vendor-123');

    expect(balance).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('Error calculating vendor available balance:');
  });
});
