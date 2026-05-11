import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { z as zod } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'vendor';
        token.subscription_expires_at = (user as any).subscription_expires_at ?? null;
        token.subscription_status = (user as any).subscription_status ?? null;
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

