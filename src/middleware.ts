import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/check',
];

// Routes that require authentication
const protectedPrefixes = [
  '/admin',
  '/api/agents',
  '/api/calls',
];

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Check if route needs protection
  const needsAuth = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  if (!needsAuth) {
    return NextResponse.next();
  }

  // Get session token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_PASSWORD;

  if (!token || !secret) {
    // Redirect to login for page requests, return 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const isValid = await verifyToken(token, secret);
  if (!isValid) {
    // Clear invalid cookie and redirect/401
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.set(COOKIE_NAME, '', { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match admin routes
    '/admin/:path*',
    // Match protected API routes
    '/api/agents/:path*',
    '/api/calls/:path*',
  ],
};
