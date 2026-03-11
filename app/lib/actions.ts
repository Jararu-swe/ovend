'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
  price: z.coerce.number().gt(0, { message: 'Please enter a price greater than 0.' }),
  status: z.enum(['active', 'inactive'], {
    invalid_type_error: 'Please select a product status.',
  }),
  image_url: z.string().optional(),
});

const CreateProduct = FormSchema.omit({ id: true });
const UpdateProduct = FormSchema.omit({ id: true });

const ProfileSchema = z.object({
  store_name: z.string().min(2, { message: 'Store name must be at least 2 characters.' }),
  store_slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }).regex(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
  }),
  whatsapp_number: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
});

export type State = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    status?: string[];
    store_name?: string[];
    store_slug?: string[];
    whatsapp_number?: string[];
    customer_name?: string[];
    customer_phone?: string[];
    delivery_type?: string[];
  };
  message?: string | null;
};

export async function updateProfile(prevState: State | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = ProfileSchema.safeParse({
    store_name: formData.get('store_name'),
    store_slug: formData.get('store_slug'),
    whatsapp_number: formData.get('whatsapp_number'),
    bank_name: formData.get('bank_name'),
    account_number: formData.get('account_number'),
    account_name: formData.get('account_name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Profile.',
    };
  }

  const { store_name, store_slug, whatsapp_number, bank_name, account_number, account_name } = validatedFields.data;

  try {
    // Check if slug is already taken by another user
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE store_slug = ${store_slug} AND id != ${session.user.id}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return {
        errors: { store_slug: ['This slug is already in use. Please choose another one.'] },
        message: 'Slug taken.',
      };
    }

    await sql`
      UPDATE users
      SET store_name = ${store_name}, 
          store_slug = ${store_slug}, 
          whatsapp_number = ${whatsapp_number ?? null},
          bank_name = ${bank_name ?? null},
          account_number = ${account_number ?? null},
          account_name = ${account_name ?? null}
      WHERE id = ${session.user.id}
    `;
    
    revalidatePath('/dashboard/settings');
    return { message: 'Success! Profile updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Profile.' };
  }
}

export async function createProduct(prevState: State | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    status: formData.get('status'),
    image_url: formData.get('image_url') || '',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, status, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO products (vendor_id, name, description, price, status, image_url)
      VALUES (${session.user.id}, ${name}, ${description}, ${price}, ${status}, ${image_url || null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Create Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function updateProduct(
  id: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    status: formData.get('status'),
    image_url: formData.get('image_url') || '',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, description, price, status, image_url } = validatedFields.data;

  try {
    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price}, status = ${status}, image_url = ${image_url || null}
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  try {
    await sql`DELETE FROM products WHERE id = ${id} AND vendor_id = ${session.user.id}`;
    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function createOrder(
  vendorId: string,
  items: any[],
  totalAmount: number,
  formData: FormData,
  paymentMethod: 'cash' | 'card' | 'transfer' = 'cash',
  paymentReference?: string
) {
  const customer_name = formData.get('customer_name') as string;
  const customer_phone = formData.get('customer_phone') as string;
  const customer_address = formData.get('customer_address') as string;
  const delivery_type = formData.get('delivery_type') as string;

  if (!customer_name || !customer_phone || !delivery_type) {
    throw new Error('Missing required customer information.');
  }

  try {
    const paymentStatus = paymentMethod === 'card' && paymentReference ? 'paid' : 'pending';
    
    const result = await sql`
      INSERT INTO orders (
        vendor_id, 
        customer_name, 
        customer_phone, 
        customer_address, 
        delivery_type, 
        total_amount, 
        items, 
        status,
        payment_method,
        payment_reference,
        payment_status
      )
      VALUES (
        ${vendorId}, 
        ${customer_name}, 
        ${customer_phone}, 
        ${customer_address || null}, 
        ${delivery_type}, 
        ${totalAmount}, 
        ${JSON.stringify(items)}, 
        'new',
        ${paymentMethod},
        ${paymentReference || null},
        ${paymentStatus}
      )
      RETURNING id
    `;
    
    // Update analytics (non-blocking)
    sql`
      INSERT INTO store_analytics (vendor_id, date, orders_count, revenue)
      VALUES (${vendorId}, CURRENT_DATE, 1, ${totalAmount})
      ON CONFLICT (vendor_id, date)
      DO UPDATE SET 
        orders_count = store_analytics.orders_count + 1,
        revenue = store_analytics.revenue + ${totalAmount}
    `.catch(() => {});
    
    revalidatePath('/dashboard/orders');
    return { id: result[0].id, success: true };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create order.');
  }
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  try {
    await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;
    revalidatePath('/dashboard/orders');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update order status.');
  }
}


// Discount actions
const DiscountSchema = z.object({
  code: z.string().min(2, { message: 'Code must be at least 2 characters.' }).max(20),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().gt(0, { message: 'Discount value must be greater than 0.' }),
  min_purchase: z.coerce.number().optional(),
  max_uses: z.coerce.number().optional(),
  expires_at: z.string().optional(),
});

export async function createDiscountAction(
  vendorId: string,
  prevState: State | undefined,
  formData: FormData
) {
  const validatedFields = DiscountSchema.safeParse({
    code: formData.get('code'),
    discount_type: formData.get('discount_type'),
    discount_value: formData.get('discount_value'),
    min_purchase: formData.get('min_purchase') || 0,
    max_uses: formData.get('max_uses') || null,
    expires_at: formData.get('expires_at') || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create discount code.',
    };
  }

  const { code, discount_type, discount_value, min_purchase, max_uses, expires_at } = validatedFields.data;

  try {
    const valueInKobo = discount_type === 'fixed' ? Math.round(discount_value * 100) : discount_value;
    const minPurchaseInKobo = min_purchase ? Math.round(min_purchase * 100) : 0;

    await sql`
      INSERT INTO discount_codes (vendor_id, code, discount_type, discount_value, min_purchase, max_uses, expires_at)
      VALUES (${vendorId}, ${code.toUpperCase()}, ${discount_type}, ${valueInKobo}, ${minPurchaseInKobo}, ${max_uses || null}, ${expires_at || null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to create discount code.',
    };
  }

  revalidatePath('/dashboard/discounts');
  redirect('/dashboard/discounts');
}

export async function toggleDiscountAction(
  discountId: string,
  active: boolean,
  prevState: State | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  try {
    await sql`
      UPDATE discount_codes
      SET active = ${active}
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update discount status.',
    };
  }

  revalidatePath('/dashboard/discounts');
  return { message: null, errors: {} };
}


// Team management actions
export async function inviteTeamMemberAction(
  vendorId: string,
  prevState: State | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  const email = formData.get('email') as string;
  const role = formData.get('role') as 'admin' | 'assistant';
  const permissions = JSON.parse(formData.get('permissions') as string);

  if (!email || !role) {
    return { message: 'Email and role are required.' };
  }

  try {
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (!user) {
      return { message: 'User not found. They need to sign up first.' };
    }

    const [existing] = await sql`
      SELECT id FROM team_members 
      WHERE vendor_id = ${vendorId} AND user_id = ${user.id}
    `;

    if (existing) {
      return { message: 'This user is already on your team.' };
    }

    await sql`
      INSERT INTO team_members (vendor_id, user_id, role, permissions, invited_by, status)
      VALUES (${vendorId}, ${user.id}, ${role}, ${JSON.stringify(permissions)}, ${session.user.id}, 'active')
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to invite team member.' };
  }

  revalidatePath('/dashboard/team');
  redirect('/dashboard/team');
}

export async function removeTeamMemberAction(
  memberId: string,
  prevState: State | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }

  try {
    await sql`
      DELETE FROM team_members
      WHERE id = ${memberId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to remove team member.' };
  }

  revalidatePath('/dashboard/team');
  return { message: null, errors: {} };
}
