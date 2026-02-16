import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow auth API
  if (pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  const session = request.cookies.get('session');

  // Redirect unauthenticated users
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent logged-in user opening login
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
