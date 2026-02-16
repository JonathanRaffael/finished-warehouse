import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = 'admin@htm.com';
const ADMIN_PASSWORD = 'ADMINHTMF';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create response with session cookie
      const response = NextResponse.json(
        { message: 'Login successful' },
        { status: 200 }
      );

      // Set secure session cookie
      response.cookies.set('session', 'admin-authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
