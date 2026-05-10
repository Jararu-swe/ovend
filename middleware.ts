import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isProfileRoute = req.nextUrl.pathname.startsWith('/profile');

  if (!isLoggedIn && (isDashboardRoute || isProfileRoute)) {
    const loginUrl = isProfileRoute ? new URL('/customer/login', req.url) : new URL('/login', req.url);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn) {
    if (isDashboardRoute && role === 'customer') {
      return Response.redirect(new URL('/profile', req.url));
    }
    if (isProfileRoute && role === 'vendor') {
      return Response.redirect(new URL('/dashboard', req.url));
    }
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};

