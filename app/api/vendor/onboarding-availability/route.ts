import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { sql } from '@/app/lib/db';
import { ensureStoreColumns } from '@/app/lib/data';

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

const OnboardingAvailabilitySchema = z.object({
  store_timezone: z.string().default('Africa/Lagos'),
  store_hours: StoreHoursSchema,
  accepting_orders: z.boolean().default(true),
  store_closed_note: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user?.id || role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = OnboardingAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { store_timezone, store_hours, accepting_orders, store_closed_note } = parsed.data;

    await ensureStoreColumns();

    if (store_hours === null) {
      await sql`
        UPDATE users
        SET
          store_timezone = ${store_timezone},
          store_hours = NULL,
          accepting_orders = ${accepting_orders},
          store_closed_note = ${store_closed_note ?? null}
        WHERE id = ${session.user.id}
      `;
    } else {
      await sql`
        UPDATE users
        SET
          store_timezone = ${store_timezone},
          store_hours = ${sql.json(store_hours)},
          accepting_orders = ${accepting_orders},
          store_closed_note = ${store_closed_note ?? null}
        WHERE id = ${session.user.id}
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Onboarding availability update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
