import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { sql } from '@/app/lib/db';
import { ensureStoreColumns, ensureVendorSubscriptionSchema } from '@/app/lib/data';

const OnboardingProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name must be at least 2 characters'),
  store_slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  store_description: z.string().max(200, 'Description must be 200 characters or less').optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  location_state: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user?.id || role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = OnboardingProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { store_name, store_slug, store_description, whatsapp_number, category, location_state } = parsed.data;

    await ensureStoreColumns();
    await ensureVendorSubscriptionSchema();

    const existingUser = await sql`
      SELECT id FROM users
      WHERE store_slug = ${store_slug} AND id != ${session.user.id}
      LIMIT 1
    `;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'This slug is already in use. Please choose another one.' }, { status: 409 });
    }

    await sql`
      UPDATE users
      SET
        store_name = ${store_name},
        store_slug = ${store_slug},
        store_description = ${store_description ?? null},
        whatsapp_number = ${whatsapp_number ?? null},
        category = ${category ?? null},
        location_state = ${location_state ?? null}
      WHERE id = ${session.user.id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Onboarding profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

