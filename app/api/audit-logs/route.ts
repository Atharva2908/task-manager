import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await fetch('http://localhost:8000/api/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Failed to fetch audit logs')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
