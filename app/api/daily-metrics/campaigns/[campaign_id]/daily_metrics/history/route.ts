import { NextResponse } from 'next/server'


export async function GET(req: Request, { params }: { params: { campaign_id: string } }) {
  try {
    const query = new URL(req.url).searchParams
    const date = query.get('date') || ''
    const url = date ?
      `${process.env.NEXT_PUBLIC_API_URL}/api/daily-metrics/campaigns/${params.campaign_id}/daily_metrics?date=${date}` :
      `${process.env.NEXT_PUBLIC_API_URL}/api/daily-metrics/campaigns/${params.campaign_id}/daily_metrics`
    const res = await fetch(url, {
      headers: {
        'Authorization': req.headers.get('authorization') ?? '',
      },
      credentials: 'include',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch daily metrics history' }, { status: 500 })
  }
}
