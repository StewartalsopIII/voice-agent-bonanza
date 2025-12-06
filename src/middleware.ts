import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

// Simple in-memory rate limiting (per instance)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/check',
  '/api/webhooks/vapi',
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

  // 1. Rate Limit Webhooks
  if (pathname === '/api/webhooks/vapi') {
    // Get IP from headers (Vercel provides this)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                request.headers.get('x-real-ip') ||
                'unknown';
    // Limit to 100 requests per minute per IP
    if (!checkRateLimit(ip, 100, 60000)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
  }

  // 2. Allow public routes
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // 3. Check if route needs protection
  const needsAuth = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  if (!needsAuth) {
    return NextResponse.next();
  }

  // 4. Verify Authentication
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_PASSWORD;

  if (!token || !secret) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isValid = await verifyToken(token, secret);
  if (!isValid) {
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    // Clear invalid cookie
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/agents/:path*',
    '/api/calls/:path*',
    '/api/webhooks/vapi',
  ],
};
