import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export interface DiscountCode {
  id: string;
  vendor_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export async function validateDiscountCode(
  vendorId: string,
  code: string,
  orderTotal: number
): Promise<{ valid: boolean; discount?: DiscountCode; error?: string }> {
  try {
    const [discount] = await sql<DiscountCode[]>`
      SELECT * FROM discount_codes
      WHERE vendor_id = ${vendorId}
        AND code = ${code}
        AND active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR uses_count < max_uses)
      LIMIT 1
    `;

    if (!discount) {
      return { valid: false, error: 'Invalid or expired discount code' };
    }

    if (orderTotal < discount.min_purchase) {
      return {
        valid: false,
        error: `Minimum purchase of ₦${discount.min_purchase / 100} required`,
      };
    }

    return { valid: true, discount };
  } catch (error) {
    console.error('Discount validation error:', error);
    return { valid: false, error: 'Error validating discount code' };
  }
}

export function calculateDiscount(
  orderTotal: number,
  discount: DiscountCode
): number {
  if (discount.discount_type === 'percentage') {
    return Math.floor((orderTotal * discount.discount_value) / 100);
  }
  return Math.min(discount.discount_value, orderTotal);
}

export async function incrementDiscountUse(discountId: string): Promise<void> {
  try {
    await sql`
      UPDATE discount_codes
      SET uses_count = uses_count + 1
      WHERE id = ${discountId}
    `;
  } catch (error) {
    console.error('Error incrementing discount use:', error);
  }
}

export async function createDiscountCode(
  vendorId: string,
  data: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase?: number;
    max_uses?: number;
    expires_at?: string;
  }
): Promise<DiscountCode> {
  const [discount] = await sql<DiscountCode[]>`
    INSERT INTO discount_codes (
      vendor_id,
      code,
      discount_type,
      discount_value,
      min_purchase,
      max_uses,
      expires_at
    ) VALUES (
      ${vendorId},
      ${data.code.toUpperCase()},
      ${data.discount_type},
      ${data.discount_value},
      ${data.min_purchase || 0},
      ${data.max_uses || null},
      ${data.expires_at || null}
    )
    RETURNING *
  `;

  return discount;
}

export async function fetchVendorDiscounts(vendorId: string): Promise<DiscountCode[]> {
  return await sql<DiscountCode[]>`
    SELECT * FROM discount_codes
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
}

export async function toggleDiscountStatus(discountId: string, active: boolean): Promise<void> {
  await sql`
    UPDATE discount_codes
    SET active = ${active}
    WHERE id = ${discountId}
  `;
}
