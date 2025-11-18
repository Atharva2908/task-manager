import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // fetch lead detail by id
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // update lead details by id
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // soft delete lead by id
}
