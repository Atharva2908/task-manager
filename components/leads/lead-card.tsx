import React from 'react'
import { LeadResponseSchema } from '@/types'

interface LeadCardProps {
  lead: LeadResponseSchema
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="p-4 border rounded shadow-sm hover:shadow-md">
      <h3 className="text-lg font-semibold">{lead.name}</h3>
      <p>{lead.company}</p>
      <p>{lead.email}</p>
      <p>Status: {lead.status}</p>
    </div>
  )
}
