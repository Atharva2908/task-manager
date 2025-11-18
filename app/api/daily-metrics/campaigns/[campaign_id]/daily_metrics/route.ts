import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: { campaign_id: string } }) {
  try {
    const body = await req.json()
    const res = await fetch(`http://localhost:8000/api/daily-metrics/campaigns/${params.campaign_id}/daily_metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') ?? '',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create daily targets' }, { status: 500 })
  }
}
