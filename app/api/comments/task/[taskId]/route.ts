import { NextRequest, NextResponse } from 'next/server'


export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/task/${params.taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }
    )


    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }


    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch comments' }, { status: 500 })
  }
}
