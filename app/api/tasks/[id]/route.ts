import { NextRequest, NextResponse } from 'next/server'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })


    if (!response.ok) {
      throw new Error('Task not found')
    }


    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch task' }, { status: 500 })
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const body = await request.json()


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`, {
      method: 'PUT',
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
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to update task' }, { status: 500 })
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })


    if (!response.ok) {
      throw new Error('Failed to delete task')
    }


    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to delete task' }, { status: 500 })
  }
}
