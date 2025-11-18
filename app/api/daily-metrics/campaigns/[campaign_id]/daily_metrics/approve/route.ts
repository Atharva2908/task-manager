import { NextResponse } from 'next/server'

export async function PUT(req: Request, { params }: { params: { campaign_id: string } }) {
  try {
    const res = await fetch(`http://localhost:8000/api/daily-metrics/campaigns/${params.campaign_id}/daily_metrics/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': req.headers.get('authorization') ?? '',
      },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to approve daily metrics' }, { status: 500 })
  }
}
