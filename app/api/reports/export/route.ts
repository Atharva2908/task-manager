import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  const format = request.nextUrl.searchParams.get('format') || 'csv'


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })


    if (!response.ok) throw new Error('Failed to export report')


    const blob = await response.arrayBuffer()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
        'Content-Disposition': `attachment; filename="report.${format === 'excel' ? 'xlsx' : format}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to export report' }, { status: 500 })
  }
}
