'use server';

import { cookies } from 'next/headers';

export async function setGoogleIntendedRole(role: 'vendor' | 'customer') {
  const cookieStore = await cookies();
  cookieStore.set('vendle_intended_role', role, {
    maxAge: 60 * 5, // 5 minutes
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
