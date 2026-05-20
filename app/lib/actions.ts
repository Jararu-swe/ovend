'use server';

import { z } from 'zod';
import { sql } from './db';
import { revalidatePath } from 'next/cache';
import { getStoreAvailability } from './store-availability';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ensureLogoLayoutColumns } from '@/app/lib/theme';
import { ensureProductColumns, ensureStoreColumns, ensureVendorSubscriptionSchema, ensureDiscountSchema } from '@/app/lib/data';
import { validateDiscountCode, incrementDiscountUse } from '@/app/lib/discounts';
import { deleteCloudinaryImage, deleteCloudinaryImages } from './cloudinary';
import { signOut } from '@/auth';
import bcrypt from 'bcryptjs';

async function requireActiveVendorSubscription() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user?.id || role !== 'vendor') {
    throw new Error('Unauthorized.');
  }

  await ensureVendorSubscriptionSchema();
  const [row] = await sql<{ subscription_expires_at: string | null }[]>`
    SELECT subscription_expires_at
    FROM users
    WHERE id = ${session.user.id}
    LIMIT 1
  `;

  const expiresAt = row?.subscription_expires_at ? new Date(row.subscription_expires_at) : null;
  const active = !!expiresAt && expiresAt.getTime() > Date.now();
  if (!active) {
    throw new Error('Subscription required. Please pay ₦3,000 to continue.');
  }

  return { vendorId: session.user.id };
}

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
  price: z.coerce.number().gt(0, { message: 'Please enter a price greater than 0.' }),
  status: z.enum(['active', 'inactive'], {
    invalid_type_error: 'Please select a product status.',
  }),
  category: z.string().optional().nullable(),
  compare_at_price: z.coerce.number().optional().nullable(),
  stock_quantity: z.coerce.number().optional().nullable(),
  gallery_images: z.string().optional().default('[]'),
  options: z.string().optional().default('[]'),
  image_url: z.string().optional().nullable(),
});

const CreateProduct = FormSchema.omit({ id: true });
const UpdateProduct = FormSchema.omit({ id: true });

const ProfileSchema = z.object({
  store_name: z.string().min(2, { message: 'Store name must be at least 2 characters.' }),
  store_slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }).regex(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
  }),
  store_description: z.string().max(200, { message: 'Description must be 200 characters or less.' }).optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  location_state: z.string().optional().nullable(),
  store_timezone: z.string().optional().default('Africa/Lagos'),
  accepting_orders: z.preprocess((v) => v === 'on' || v === true, z.boolean()).optional().default(true),
  store_closed_note: z.string().max(280).optional().nullable(),
  store_hours_json: z.string().optional().nullable(),
});

const ThemeSchema = z.object({
  template_id: z.string().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  background_color: z.string(),
  text_color: z.string(),
  accent_color: z.string(),
  surface_color: z.string().optional(),
  heading_color: z.string().optional(),
  border_color: z.string().optional(),
  layout_style: z.enum(['grid', 'list', 'masonry']),
  card_style: z.enum(['modern', 'classic', 'minimal', 'bold']),
  border_radius: z.enum(['sharp', 'rounded', 'pill']),
  card_shadow: z.enum(['none', 'soft', 'elevated', 'hard']).optional(),
  button_style: z.enum(['solid', 'outline', 'soft', 'glass']).optional(),
  button_radius: z.enum(['sharp', 'rounded', 'pill']).optional(),
  animation_style: z.enum(['none', 'fade', 'slide', 'zoom', 'bounce']).optional(),
  font_family: z.string(),
  heading_font: z.string(),
  font_size: z.enum(['small', 'medium', 'large']),
  header_style: z.enum(['sticky', 'static', 'transparent']),
  show_product_images: z.coerce.boolean(),
  show_product_description: z.coerce.boolean(),
  image_aspect_ratio: z.enum(['square', 'portrait', 'landscape']),
  spacing: z.enum(['compact', 'comfortable', 'spacious']),
  custom_css: z.string().optional().nullable(),
  primary_gradient: z.string().optional().nullable(),
  glass_effect: z.coerce.boolean().optional().default(false),
  layout_width: z.enum(['standard', 'wide', 'full']).optional().default('wide'),
  show_mobile_checkout_bar: z.coerce.boolean().optional().default(false),
  show_logo: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  logo_position: z.enum(['left', 'center', 'right']),
  logo_frame: z.enum(['plain', 'none', 'profile', 'rounded', 'minimal']),
  logo_url: z.preprocess(
    (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s === '' ? null : s;
    },
    z.union([
      z.null(),
      z.string().url(),
      z.string().regex(/^\/uploads\//, 'Must be an uploaded file path or https URL'),
    ]),
  ),
  icon_library: z.enum(['heroicons', 'lucide']).optional().default('heroicons'),
  icon_fill: z.enum(['solid', 'outline']).optional().default('outline'),
  icon_weight: z.enum(['light', 'regular', 'bold']).optional().default('regular'),
  cart_icon: z.enum(['shopping-bag', 'shopping-cart', 'basket', 'tote']).optional().default('shopping-bag'),
  user_icon: z.enum(['user', 'face', 'smile']).optional().default('user'),
  share_icon: z.enum(['dots', 'paper-plane', 'arrow-curve', 'arrow-square', 'nodes']).optional().default('arrow-square'),
  add_icon: z.enum(['plus', 'bag', 'cart', 'arrow']).optional().default('plus'),
  sections: z.string().optional(),        // JSON string
  section_content: z.string().optional(),  // JSON string
  is_publish: z.preprocess((v) => v === 'true' || v === true, z.boolean()).optional().default(true),
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
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};

export type OrderState = State;
export type DiscountState = State;

// Exported types and schemas
export type { State, OrderState, DiscountState };

const StoreHoursDayKeyZ = z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
const StoreHoursSchema = z
  .record(
    StoreHoursDayKeyZ,
    z
      .array(
        z.object({
          open: z.string().regex(/^\d{2}:\d{2}$/),
          close: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      )
      .max(3),
  )
  .nullable();

function isValidIanaTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export async function updateProfile(prevState: State | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = ProfileSchema.safeParse({
    store_name: formData.get('store_name'),
    store_slug: formData.get('store_slug'),
    store_description: formData.get('store_description'),
    whatsapp_number: formData.get('whatsapp_number'),
    bank_name: formData.get('bank_name'),
    account_number: formData.get('account_number'),
    account_name: formData.get('account_name'),
    category: formData.get('category'),
    location_state: formData.get('location_state'),
    store_timezone: formData.get('store_timezone'),
    accepting_orders: formData.get('accepting_orders'),
    store_closed_note: formData.get('store_closed_note'),
    store_hours_json: formData.get('store_hours_json'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Profile.',
    };
  }

  const { 
    store_name, store_slug, store_description, whatsapp_number, 
    bank_name, account_number, account_name, category, location_state,
    store_timezone, accepting_orders, store_closed_note, store_hours_json
  } = validatedFields.data;

  // Validate timezone
  if (store_timezone && !isValidIanaTimeZone(store_timezone)) {
    return { message: 'Invalid timezone.', errors: { store_timezone: ['Invalid timezone.'] } };
  }

  // Parse hours
  let store_hours: any = null;
  if (store_hours_json) {
    try {
      const parsed = JSON.parse(store_hours_json);
      const hoursCheck = StoreHoursSchema.safeParse(parsed);
      if (hoursCheck.success) {
        store_hours = hoursCheck.data;
      }
    } catch (e) {
      console.error('Failed to parse store_hours_json', e);
    }
  }

  try {
    await ensureStoreColumns();
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
          store_description = ${store_description ?? null},
          whatsapp_number = ${whatsapp_number ?? null},
          bank_name = ${bank_name ?? null},
          account_number = ${account_number ?? null},
          account_name = ${account_name ?? null},
          category = ${category ?? null},
          location_state = ${location_state ?? null},
          store_timezone = ${store_timezone},
          accepting_orders = ${accepting_orders},
          store_closed_note = ${store_closed_note ?? null},
          store_hours = ${store_hours ? sql.json(store_hours) : null}
      WHERE id = ${session.user.id}
    `;
    
    revalidatePath('/dashboard/settings');
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath(`/s/${store_slug}`);

    return { message: 'Success! Settings updated.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Settings.' };
  }
}

export async function createProduct(prevState: State | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }

  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    compare_at_price: formData.get('compare_at_price') || null,
    status: formData.get('status'),
    category: formData.get('category') || null,
    stock_quantity: formData.get('stock_quantity') || null,
    image_url: formData.get('image_url') || '',
    gallery_images: formData.get('gallery_images') || '[]',
    options: formData.get('options') || '[]',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, compare_at_price, status, category, stock_quantity, image_url, gallery_images, options } = validatedFields.data;
  
  // Convert prices to Kobo (multiply by 100)
  const priceKobo = Math.round(price * 100);
  const compareAtPriceKobo = compare_at_price ? Math.round(compare_at_price * 100) : null;
  
  // Convert option prices to Kobo
  let finalOptions = options;
  try {
    const parsedOptions = JSON.parse(options);
    const koboOptions = parsedOptions.map((opt: any) => ({
      ...opt,
      price: opt.price ? Math.round(Number(opt.price) * 100).toString() : ""
    }));
    finalOptions = JSON.stringify(koboOptions);
  } catch (e) {
    console.error('Error processing options prices:', e);
  }

  console.log('Creating product with price (Kobo):', priceKobo);

  try {
    await ensureProductColumns();
    await sql`
      INSERT INTO products (vendor_id, name, description, price, compare_at_price, status, category, stock_quantity, image_url, gallery_images, options)
      VALUES (${session.user.id}, ${name}, ${description}, ${priceKobo}, ${compareAtPriceKobo}, ${status}, ${category ?? null}, ${stock_quantity ?? null}, ${image_url || null}, ${gallery_images}, ${finalOptions})
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
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }

  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    compare_at_price: formData.get('compare_at_price') || null,
    status: formData.get('status'),
    category: formData.get('category') || null,
    stock_quantity: formData.get('stock_quantity') || null,
    image_url: formData.get('image_url') || '',
    gallery_images: formData.get('gallery_images') || '[]',
    options: formData.get('options') || '[]',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, description, price, compare_at_price, status, category, stock_quantity, image_url, gallery_images, options } = validatedFields.data;
  
  // Convert prices to Kobo (multiply by 100)
  const priceKobo = Math.round(price * 100);
  const compareAtPriceKobo = compare_at_price ? Math.round(compare_at_price * 100) : null;
  
  // Convert option prices to Kobo
  let finalOptions = options;
  try {
    const parsedOptions = JSON.parse(options);
    const koboOptions = parsedOptions.map((opt: any) => ({
      ...opt,
      price: opt.price ? Math.round(Number(opt.price) * 100).toString() : ""
    }));
    finalOptions = JSON.stringify(koboOptions);
  } catch (e) {
    console.error('Error processing options prices:', e);
  }

  try {
    await ensureProductColumns();
    
    // Fetch old images to check for changes
    const [oldProduct] = await sql`
      SELECT image_url, gallery_images FROM products 
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;

    if (oldProduct) {
      // If main image changed, delete old one
      if (oldProduct.image_url && oldProduct.image_url !== image_url) {
        await deleteCloudinaryImage(oldProduct.image_url);
      }

      // If gallery images changed, delete those no longer present
      const oldGallery: string[] = JSON.parse(oldProduct.gallery_images || '[]');
      const newGallery: string[] = JSON.parse(gallery_images);
      const toDelete = oldGallery.filter(url => !newGallery.includes(url));
      if (toDelete.length > 0) {
        await deleteCloudinaryImages(toDelete);
      }
    }

    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${priceKobo}, compare_at_price = ${compareAtPriceKobo}, status = ${status}, 
          category = ${category ?? null}, stock_quantity = ${stock_quantity ?? null}, image_url = ${image_url || null}, gallery_images = ${gallery_images}, options = ${finalOptions}
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
  await requireActiveVendorSubscription();

  try {
    // Fetch product to get image URLs before deleting
    const [product] = await sql`
      SELECT image_url, gallery_images FROM products 
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;

    if (product) {
      // Delete main image
      if (product.image_url) {
        await deleteCloudinaryImage(product.image_url);
      }
      // Delete gallery images
      const gallery: string[] = JSON.parse(product.gallery_images || '[]');
      if (gallery.length > 0) {
        await deleteCloudinaryImages(gallery);
      }
    }

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
  paymentReference?: string,
  discountCode?: string,
  discountAmount?: number
) {
  await ensureDiscountSchema();

  // Check store availability before allowing order
  const [vendor] = await sql`
    SELECT accepting_orders, store_hours, store_timezone, store_closed_note 
    FROM users WHERE id = ${vendorId} LIMIT 1
  `;
  
  if (vendor) {
    const availability = getStoreAvailability({
      accepting_orders: vendor.accepting_orders,
      store_hours: vendor.store_hours,
      timeZone: vendor.store_timezone,
      store_closed_note: vendor.store_closed_note
    });

    if (availability.state === 'closed') {
      throw new Error(availability.label || 'This store is currently closed and not accepting orders.');
    }
  }

  const customer_name = formData.get('customer_name') as string;
  const customer_phone = formData.get('customer_phone') as string;
  const customer_address = formData.get('customer_address') as string;
  const delivery_type = formData.get('delivery_type') as string;
  const delivery_latitude = formData.get('delivery_latitude') ? parseFloat(formData.get('delivery_latitude') as string) : null;
  const delivery_longitude = formData.get('delivery_longitude') ? parseFloat(formData.get('delivery_longitude') as string) : null;
  const delivery_address_details = formData.get('delivery_address_details') as string;

  const session = await auth();
  const customer_account_id = session?.user?.id && (session.user as any).role === 'customer' ? session.user.id : null;

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
        payment_status,
        discount_code,
        discount_amount,
        delivery_latitude,
        delivery_longitude,
        delivery_address_details,
        customer_account_id
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
        ${paymentStatus},
        ${discountCode || null},
        ${discountAmount || 0},
        ${delivery_latitude},
        ${delivery_longitude},
        ${delivery_address_details || null},
        ${customer_account_id}
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
    
    // Auto-decrement Stock
    for (const item of items) {
      if (item.productId && item.quantity) {
        sql`
          UPDATE products
          SET stock_quantity = stock_quantity - ${item.quantity}
          WHERE id = ${item.productId} AND stock_quantity IS NOT NULL
        `.catch((err) => console.error("Error decrementing stock:", err));
      }
    }

    // Identify and increment discount use
    if (discountCode) {
      try {
        const [discount] = await sql`
          SELECT id FROM discount_codes WHERE vendor_id = ${vendorId} AND UPPER(code) = UPPER(${discountCode}) LIMIT 1
        `;
        if (discount) {
          await incrementDiscountUse(discount.id);
        }
      } catch (err) {
        console.error("Error tracking discount:", err);
      }
    }
    
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
  await requireActiveVendorSubscription();

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
): Promise<State> {
  await ensureDiscountSchema();
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }
  const rawCode = formData.get('code') as string;
  const rawDiscountType = formData.get('discount_type') as string;
  const rawDiscountValue = formData.get('discount_value') as string;
  const rawMinPurchase = formData.get('min_purchase') as string;
  const rawMaxUses = formData.get('max_uses') as string;
  const rawExpiresAt = formData.get('expires_at') as string;

  const validatedFields = DiscountSchema.safeParse({
    code: rawCode ? rawCode.trim() : undefined,
    discount_type: rawDiscountType || undefined,
    discount_value: rawDiscountValue || undefined,
    min_purchase: rawMinPurchase ? parseFloat(rawMinPurchase) : undefined,
    max_uses: rawMaxUses ? parseInt(rawMaxUses, 10) : undefined,
    expires_at: rawExpiresAt || undefined,
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
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }

  try {
    await ensureDiscountSchema();
    await sql`
      UPDATE discount_codes
      SET active = ${!active}
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update discount status.',
    };
  }

  revalidatePath('/dashboard/discounts');
  redirect('/dashboard/discounts');
}

export async function deleteDiscountAction(discountId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    throw new Error(e?.message || 'Subscription required.');
  }

  try {
    await ensureDiscountSchema();
    await sql`
      DELETE FROM discount_codes
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
    revalidatePath('/dashboard/discounts');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete discount code.');
  }
}

export async function updateDiscountAction(
  discountId: string,
  prevState: State | undefined,
  formData: FormData
): Promise<State> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }

  const rawCode = formData.get('code') as string;
  const rawDiscountType = formData.get('discount_type') as string;
  const rawDiscountValue = formData.get('discount_value') as string;
  const rawMinPurchase = formData.get('min_purchase') as string;
  const rawMaxUses = formData.get('max_uses') as string;
  const rawExpiresAt = formData.get('expires_at') as string;

  const validatedFields = DiscountSchema.safeParse({
    code: rawCode ? rawCode.trim() : undefined,
    discount_type: rawDiscountType || undefined,
    discount_value: rawDiscountValue || undefined,
    min_purchase: rawMinPurchase ? parseFloat(rawMinPurchase) : undefined,
    max_uses: rawMaxUses ? parseInt(rawMaxUses, 10) : undefined,
    expires_at: rawExpiresAt || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update discount code.',
    };
  }

  const { code, discount_type, discount_value, min_purchase, max_uses, expires_at } = validatedFields.data;

  try {
    await ensureDiscountSchema();
    const valueInKobo = discount_type === 'fixed' ? Math.round(discount_value * 100) : discount_value;
    const minPurchaseInKobo = min_purchase ? Math.round(min_purchase * 100) : 0;

    await sql`
      UPDATE discount_codes
      SET code = ${code.toUpperCase()},
          discount_type = ${discount_type},
          discount_value = ${valueInKobo},
          min_purchase = ${minPurchaseInKobo},
          max_uses = ${max_uses || null},
          expires_at = ${expires_at || null}
      WHERE id = ${discountId} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to update discount code.',
    };
  }

  revalidatePath('/dashboard/discounts');
  redirect('/dashboard/discounts');
}

export async function validateDiscountAction(vendorId: string, code: string, orderTotal: number) {
  await ensureDiscountSchema();
  try {
    return await validateDiscountCode(vendorId, code, orderTotal);
  } catch (err) {
    return { valid: false, error: 'Failed to validate code' };
  }
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
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
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
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
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


// Theme customization action
export async function updateThemeAction(
  prevState: State | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized' };
  }
  try {
    await requireActiveVendorSubscription();
  } catch (e: any) {
    return { message: e?.message || 'Subscription required.' };
  }

  try {
    await ensureLogoLayoutColumns();
    const getV = (key: string) => {
      const v = formData.get(key);
      if (v === null || v === '') return undefined;
      return v as string;
    };

    const getBool = (key: string) => {
      const v = formData.get(key);
      return v === 'true';
    };

    const parsed = ThemeSchema.safeParse({
      template_id: getV('template_id'),
      primary_color: getV('primary_color'),
      secondary_color: getV('secondary_color'),
      background_color: getV('background_color'),
      text_color: getV('text_color'),
      accent_color: getV('accent_color'),
      surface_color: getV('surface_color'),
      heading_color: getV('heading_color'),
      border_color: getV('border_color'),
      layout_style: getV('layout_style'),
      card_style: getV('card_style'),
      border_radius: getV('border_radius'),
      card_shadow: getV('card_shadow'),
      font_family: getV('font_family'),
      heading_font: getV('heading_font'),
      font_size: getV('font_size'),
      button_style: getV('button_style'),
      button_radius: getV('button_radius'),
      animation_style: getV('animation_style'),
      header_style: getV('header_style'),
      show_product_images: getBool('show_product_images'),
      show_product_description: getBool('show_product_description'),
      image_aspect_ratio: getV('image_aspect_ratio'),
      spacing: getV('spacing'),
      primary_gradient: getV('primary_gradient'),
      glass_effect: getBool('glass_effect'),
      layout_width: getV('layout_width'),
      show_mobile_checkout_bar: getBool('show_mobile_checkout_bar'),
      show_logo: formData.get('show_logo'),
      logo_position: getV('logo_position'),
      logo_frame: getV('logo_frame'),
      logo_url: getV('logo_url'),
      icon_library: getV('icon_library'),
      icon_fill: getV('icon_fill'),
      icon_weight: getV('icon_weight'),
      cart_icon: getV('cart_icon'),
      user_icon: getV('user_icon'),
      share_icon: getV('share_icon'),
      add_icon: getV('add_icon'),
      custom_css: getV('custom_css'),
      sections: getV('sections'),
      section_content: getV('section_content'),
      is_publish: getBool('is_publish'),
    });

    if (!parsed.success) {
      console.error('Theme validation error:', JSON.stringify(parsed.error.flatten(), null, 2));
      return { message: 'Invalid customization values submitted.', errors: {} };
    }

    const { is_publish, ...themeData } = parsed.data;

    if (is_publish) {
      // PUBLISH: Update all columns and clear draft_config
      await sql`
        UPDATE store_theme
        SET 
          template_id = ${themeData.template_id ?? 'fresh-market'},
          primary_color = ${themeData.primary_color},
          secondary_color = ${themeData.secondary_color},
          background_color = ${themeData.background_color},
          text_color = ${themeData.text_color},
          accent_color = ${themeData.accent_color},
          surface_color = ${themeData.surface_color ?? '#ffffff'},
          heading_color = ${themeData.heading_color ?? '#0f172a'},
          border_color = ${themeData.border_color ?? '#e2e8f0'},
          layout_style = ${themeData.layout_style},
          card_style = ${themeData.card_style},
          border_radius = ${themeData.border_radius},
          card_shadow = ${themeData.card_shadow ?? 'soft'},
          button_style = ${themeData.button_style ?? 'solid'},
          button_radius = ${themeData.button_radius ?? 'rounded'},
          animation_style = ${themeData.animation_style ?? 'fade'},
          font_family = ${themeData.font_family},
          heading_font = ${themeData.heading_font},
          font_size = ${themeData.font_size},
          header_style = ${themeData.header_style},
          show_product_images = ${themeData.show_product_images},
          show_product_description = ${themeData.show_product_description},
          image_aspect_ratio = ${themeData.image_aspect_ratio},
          spacing = ${themeData.spacing},
          show_logo = ${themeData.show_logo},
          logo_position = ${themeData.logo_position},
          logo_frame = ${themeData.logo_frame},
          logo_url = ${themeData.logo_url},
          icon_library = ${themeData.icon_library},
          icon_fill = ${themeData.icon_fill},
          icon_weight = ${themeData.icon_weight},
          cart_icon = ${themeData.cart_icon},
          user_icon = ${themeData.user_icon},
          share_icon = ${themeData.share_icon},
          add_icon = ${themeData.add_icon},
          custom_css = ${themeData.custom_css ?? null},
          primary_gradient = ${themeData.primary_gradient ?? null},
          glass_effect = ${themeData.glass_effect ?? false},
          layout_width = ${themeData.layout_width ?? 'wide'},
          show_mobile_checkout_bar = ${themeData.show_mobile_checkout_bar ?? false},
          sections = ${themeData.sections ?? '[]'},
          section_content = ${themeData.section_content ?? '{}'},
          draft_config = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = ${session.user.id}
      `;
    } else {
      // SAVE DRAFT: Only update draft_config
      const draftConfig = JSON.stringify(themeData);
      await sql`
        UPDATE store_theme
        SET 
          draft_config = ${draftConfig},
          updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = ${session.user.id}
      `;
    }

    revalidatePath('/dashboard/customize');
    const [slugRow] = await sql<{ store_slug: string }[]>`
      SELECT store_slug FROM users WHERE id = ${session.user.id} LIMIT 1
    `;
    if (slugRow?.store_slug) {
      revalidatePath(`/s/${slugRow.store_slug}`);
    }

    return { message: is_publish ? 'Theme published successfully!' : 'Draft saved successfully!', errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to update theme.' };
  }
}

export async function deleteStore() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  const vendorId = session.user.id;

  try {
    // 1. Fetch all products to delete images from Cloudinary
    const products = await sql`SELECT image_url, gallery_images FROM products WHERE vendor_id = ${vendorId}`;
    for (const product of products) {
      try {
        if (product.image_url) {
          await deleteCloudinaryImage(product.image_url);
        }
        const gallery: string[] = JSON.parse(product.gallery_images || '[]');
        if (gallery.length > 0) {
          await deleteCloudinaryImages(gallery);
        }
      } catch (e) {
        // Best-effort cleanup: a Cloudinary failure should not block deleting the store.
        console.error('Cloudinary cleanup error (product):', e);
      }
    }

    // 2. Fetch theme to delete logo
    const [theme] = await sql`SELECT logo_url FROM store_theme WHERE vendor_id = ${vendorId}`;
    if (theme?.logo_url) {
      try {
        await deleteCloudinaryImage(theme.logo_url);
      } catch (e) {
        console.error('Cloudinary cleanup error (logo):', e);
      }
    }

    // 3. Delete everything associated with the vendor
    // Note: We use a transaction to ensure all or nothing
    await sql.begin(async (sql) => {
      // Optional tables (may not exist in older DBs) - delete best-effort.
      try {
        await sql`DELETE FROM vendor_subscription_payments WHERE vendor_id = ${vendorId}`;
      } catch (e) {
        console.error('Delete vendor_subscription_payments error:', e);
      }

      try {
        await sql`DELETE FROM team_members WHERE vendor_id = ${vendorId} OR user_id = ${vendorId}`;
      } catch (e) {
        console.error('Delete team_members error:', e);
      }

      await sql`DELETE FROM products WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM orders WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM store_theme WHERE vendor_id = ${vendorId}`;
      await sql`DELETE FROM store_analytics WHERE vendor_id = ${vendorId}`;
      try {
        await sql`DELETE FROM discount_codes WHERE vendor_id = ${vendorId}`;
      } catch (e) {
        console.error('Delete discount_codes error:', e);
      }
      await sql`DELETE FROM users WHERE id = ${vendorId}`;
    });

  } catch (error: any) {
    console.error('Database Error during store deletion:', error);
    throw new Error(`Failed to delete store: ${error?.message || String(error)}`);
  }

  // 4. Sign out
  await signOut({ redirectTo: '/' });
}
