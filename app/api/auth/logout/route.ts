import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Create response and clear the access_token cookie
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })

  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
