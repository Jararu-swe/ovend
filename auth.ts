import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { z as zod } from 'zod';
import GoogleProvider from 'next-auth/providers/google';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

console.log('--- NEXTAUTH DEBUG ---');
console.log('Google Client ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('----------------------');

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const intendedRole = cookieStore.get('vendle_intended_role')?.value || 'customer';

        try {
          await sql.unsafe(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive'`,
          );
          await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL`);

          const userEmail = user.email || '';
          const userName = user.name || 'User';

          const [existingUser] = await sql`
            SELECT id FROM users WHERE email = ${userEmail} LIMIT 1
          `;

          if (!existingUser) {
            const passwordStr = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(passwordStr, 10);

            // 7 day trial for new vendors
            const subscriptionStatus = intendedRole === 'vendor' ? 'trial' : 'inactive';
            const trialDays = 7;

            await sql`
              INSERT INTO users (name, email, password, role, subscription_status, subscription_expires_at)
              VALUES (
                ${userName}, 
                ${userEmail}, 
                ${hashedPassword}, 
                ${intendedRole},
                ${subscriptionStatus},
                ${intendedRole === 'vendor' ? sql`(CURRENT_TIMESTAMP + (${trialDays} * INTERVAL '1 day'))` : null}
              )
            `;
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error);
          return false;
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          try {
            const userEmail = user.email || '';
            const [dbUser] = await sql`
              SELECT id, role, subscription_expires_at, subscription_status 
              FROM users 
              WHERE email = ${userEmail} LIMIT 1
            `;
            if (dbUser) {
              token.id = dbUser.id;
              token.role = dbUser.role || 'customer';
              token.subscription_expires_at = dbUser.subscription_expires_at ?? null;
              token.subscription_status = dbUser.subscription_status ?? null;
            }
          } catch (error) {
            console.error('Error fetching Google user for JWT:', error);
          }
        } else {
          token.id = user.id;
          token.role = (user as any).role || 'vendor';
          token.subscription_expires_at = (user as any).subscription_expires_at ?? null;
          token.subscription_status = (user as any).subscription_status ?? null;
        }
        return token;
      }

      // Keep subscription info fresh so middleware gating updates immediately after payment.
      // We only do this for vendors to avoid extra DB load for customers.
      const role = (token as any).role as string | undefined;
      const id = token.id as string | undefined;
      if (role === 'vendor' && id) {
        try {
          // Ensure subscription columns exist (older DBs)
          await sql.unsafe(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive'`,
          );
          await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL`);

          const [row] = await sql<{ subscription_status: string; subscription_expires_at: string | null }[]>`
            SELECT subscription_status, subscription_expires_at
            FROM users
            WHERE id = ${id}
            LIMIT 1
          `;
          if (row) {
            (token as any).subscription_status = row.subscription_status ?? null;
            (token as any).subscription_expires_at = row.subscription_expires_at ?? null;
          }
        } catch (e) {
          console.error('JWT subscription refresh error:', e);
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).subscription_expires_at = (token as any).subscription_expires_at ?? null;
        (session.user as any).subscription_status = (token as any).subscription_status ?? null;
      }
      return session;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsedCredentials = zod
          .object({ email: zod.string().email(), password: zod.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // Ensure subscription columns exist (avoids query failures on older DBs)
          try {
            await sql.unsafe(
              `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive'`,
            );
            await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL`);
          } catch (e) {
            console.error('Auth ensure subscription columns error:', e);
          }

          const [user] = await sql<
            {
              id: string;
              name: string;
              email: string;
              password: string;
              role: string;
              subscription_status: string | null;
              subscription_expires_at: string | null;
            }[]
          >`
            SELECT id, name, email, password, role, subscription_status, subscription_expires_at
            FROM users
            WHERE email = ${email}
            LIMIT 1
          `;

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              subscription_status: user.subscription_status,
              subscription_expires_at: user.subscription_expires_at,
            };
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});

