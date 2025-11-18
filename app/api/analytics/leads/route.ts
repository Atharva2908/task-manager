import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const res = await fetch('http://localhost:8000/api/analytics/leads/overview', {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead analytics' }, { status: 500 })
  }
}
