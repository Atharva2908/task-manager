import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const formData = await request.formData()


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    })


    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }


    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to upload attachments' }, { status: 500 })
  }
}


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/attachments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })


    if (!response.ok) {
      throw new Error('Failed to fetch attachments')
    }


    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch attachments' }, { status: 500 })
  }
}


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')


  if (!token) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }


  try {
    const { fileId } = await request.json()


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/attachments/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })


    if (!response.ok) {
      throw new Error('Failed to delete attachment')
    }


    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to delete attachment' }, { status: 500 })
  }
}
