import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const TRIAL_DAYS = 7;

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    // Use neutral placeholders; vendor sets these manually during onboarding.
    const storeSlug = `store-${id.slice(0, 8)}`;
    const storeName = 'My Store';

    // Ensure subscription columns exist (older DBs)
    try {
      await sql.unsafe(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive'`,
      );
      await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL`);
      await sql.unsafe(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_last_payment_reference VARCHAR(255) DEFAULT NULL`,
      );
      await sql.unsafe(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`,
      );
    } catch (e) {
      console.error('Register ensure subscription columns error:', e);
    }

    await sql`
      INSERT INTO users (
        id,
        name,
        email,
        password,
        store_slug,
        store_name,
        subscription_status,
        subscription_expires_at,
        subscription_updated_at
      )
      VALUES (
        ${id},
        ${name},
        ${email},
        ${hashedPassword},
        ${storeSlug},
        ${storeName},
        'trial',
        (CURRENT_TIMESTAMP + (${TRIAL_DAYS} * INTERVAL '1 day')),
        CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    );
  }
}
