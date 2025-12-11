import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })


    if (!response.ok) throw new Error('Failed to fetch settings')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch settings' }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const body = await request.json()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })


    if (!response.ok) throw new Error('Failed to update settings')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to update settings' }, { status: 500 })
  }
}
