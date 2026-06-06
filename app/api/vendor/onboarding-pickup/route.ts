import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { sql } from '@/app/lib/db';

const OnboardingPickupSchema = z.object({
  offers_pickup: z.boolean(),
  pickup_latitude: z.number().min(-90).max(90).nullable(),
  pickup_longitude: z.number().min(-180).max(180).nullable(),
  pickup_address_details: z.string().max(500).nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user?.id || role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = OnboardingPickupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { offers_pickup, pickup_latitude, pickup_longitude, pickup_address_details } = parsed.data;

    // Validation: if offers_pickup is true, location must be provided
    if (offers_pickup && (!pickup_latitude || !pickup_longitude)) {
      return NextResponse.json(
        { error: 'Pickup location is required when offering pickup' },
        { status: 400 }
      );
    }

    // If offers_pickup is false, clear all pickup fields
    if (!offers_pickup) {
      await sql`
        UPDATE users
        SET
          offers_pickup = false,
          pickup_latitude = NULL,
          pickup_longitude = NULL,
          pickup_address_details = NULL
        WHERE id = ${session.user.id}
      `;
    } else {
      // Save pickup location data
      await sql`
        UPDATE users
        SET
          offers_pickup = ${offers_pickup},
          pickup_latitude = ${pickup_latitude},
          pickup_longitude = ${pickup_longitude},
          pickup_address_details = ${pickup_address_details}
        WHERE id = ${session.user.id}
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Onboarding pickup update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
