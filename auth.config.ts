import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        return isLoggedIn; // Redirect unauthenticated users to login
      }
      
      // Allow all other routes through - don't interfere with auth page navigation
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
