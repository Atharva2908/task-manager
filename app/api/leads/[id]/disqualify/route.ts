import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Mark lead as disqualified with reason and optional notes
}
