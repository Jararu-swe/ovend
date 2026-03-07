import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (gen_random_uuid(), ${name}, ${email}, ${hashedPassword})
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
