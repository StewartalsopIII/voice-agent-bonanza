import { NextResponse } from 'next/server';
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    if (!verifyPassword(password)) {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));

      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSessionToken();

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
