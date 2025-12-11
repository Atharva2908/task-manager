import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const body = await request.json()


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })


    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }


    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to create comment' }, { status: 500 })
  }
}
