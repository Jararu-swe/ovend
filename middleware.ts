import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth) {
    const url = new URL('/login', req.url);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/dashboard/:path*'],
};

