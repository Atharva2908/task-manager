import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch('http://localhost:8000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch notifications')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch notifications' }, { status: 500 })
  }
}
