'use server';

import { z } from 'zod';
import { sql } from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ensureLogoLayoutColumns } from '@/app/lib/theme';
import { ensureProductColumns } from '@/app/lib/data';
import { validateDiscountCode, incrementDiscountUse } from '@/app/lib/discounts';

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
  whatsapp_number: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
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
  layout_width: z.enum(['standard', 'wide', 'full']).optional().default('standard'),
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

  try {
    await ensureProductColumns();
    await sql`
      INSERT INTO products (vendor_id, name, description, price, compare_at_price, status, category, stock_quantity, image_url, gallery_images, options)
      VALUES (${session.user.id}, ${name}, ${description}, ${price}, ${compare_at_price ?? null}, ${status}, ${category ?? null}, ${stock_quantity ?? null}, ${image_url || null}, ${gallery_images}, ${options})
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

  try {
    await ensureProductColumns();
    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price}, compare_at_price = ${compare_at_price ?? null}, status = ${status}, 
          category = ${category ?? null}, stock_quantity = ${stock_quantity ?? null}, image_url = ${image_url || null}, gallery_images = ${gallery_images}, options = ${options}
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
  paymentReference?: string,
  discountCode?: string,
  discountAmount?: number
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
        payment_status,
        discount_code,
        discount_amount
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
        ${discountAmount || 0}
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
          SELECT id FROM discount_codes WHERE vendor_id = ${vendorId} AND code = ${discountCode} LIMIT 1
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

export async function validateDiscountAction(vendorId: string, code: string, orderTotal: number) {
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
    await ensureLogoLayoutColumns();
    const parsed = ThemeSchema.safeParse({
      template_id: formData.get('template_id') as string,
      primary_color: formData.get('primary_color') as string,
      secondary_color: formData.get('secondary_color') as string,
      background_color: formData.get('background_color') as string,
      text_color: formData.get('text_color') as string,
      accent_color: formData.get('accent_color') as string,
      surface_color: formData.get('surface_color') as string,
      heading_color: formData.get('heading_color') as string,
      border_color: formData.get('border_color') as string,
      layout_style: formData.get('layout_style') as string,
      card_style: formData.get('card_style') as string,
      border_radius: formData.get('border_radius') as string,
      card_shadow: formData.get('card_shadow') as string,
      font_family: formData.get('font_family') as string,
      heading_font: formData.get('heading_font') as string,
      font_size: formData.get('font_size') as string,
      button_style: formData.get('button_style') as string,
      button_radius: formData.get('button_radius') as string,
      animation_style: formData.get('animation_style') as string,
      header_style: formData.get('header_style') as string,
      show_product_images: formData.get('show_product_images') === 'true',
      show_product_description: formData.get('show_product_description') === 'true',
      image_aspect_ratio: formData.get('image_aspect_ratio') as string,
      spacing: formData.get('spacing') as string,
      primary_gradient: formData.get('primary_gradient') as string,
      glass_effect: formData.get('glass_effect') === 'true',
      layout_width: formData.get('layout_width') as string,
      show_mobile_checkout_bar: formData.get('show_mobile_checkout_bar') === 'true',
      show_logo: formData.get('show_logo'),
      logo_position: formData.get('logo_position'),
      logo_frame: formData.get('logo_frame'),
      logo_url: formData.get('logo_url'),
      icon_library: formData.get('icon_library') || 'heroicons',
      icon_fill: formData.get('icon_fill') || 'outline',
      icon_weight: formData.get('icon_weight') || 'regular',
      cart_icon: formData.get('cart_icon') || 'shopping-bag',
      user_icon: formData.get('user_icon') || 'user',
      share_icon: formData.get('share_icon') || 'arrow-square',
      add_icon: formData.get('add_icon') || 'plus',
      custom_css: formData.get('custom_css') as string,
      sections: formData.get('sections') as string,
      section_content: formData.get('section_content') as string,
    });

    if (!parsed.success) {
      console.error('Theme validation error:', parsed.error.flatten());
      return { message: 'Invalid customization values submitted.', errors: {} };
    }

    const themeData = parsed.data;

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
        layout_width = ${themeData.layout_width ?? 'standard'},
        show_mobile_checkout_bar = ${themeData.show_mobile_checkout_bar ?? false},
        sections = ${themeData.sections ?? '[]'},
        section_content = ${themeData.section_content ?? '{}'},
        updated_at = CURRENT_TIMESTAMP
      WHERE vendor_id = ${session.user.id}
    `;

    revalidatePath('/dashboard/customize');
    const [slugRow] = await sql<{ store_slug: string }[]>`
      SELECT store_slug FROM users WHERE id = ${session.user.id} LIMIT 1
    `;
    if (slugRow?.store_slug) {
      revalidatePath(`/s/${slugRow.store_slug}`);
    }

    return { message: 'Theme updated successfully!', errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to update theme.' };
  }
}
