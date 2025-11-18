import React from 'react'

interface StatusBadgeProps {
  status: string
}

export function LeadStatusBadge({ status }: StatusBadgeProps) {
  const color = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-green-500',
    disqualified: 'bg-red-500',
    converted: 'bg-purple-500',
  }[status] || 'bg-gray-500'

  return <span className={`px-2 py-1 rounded ${color} text-white`}>{status.toUpperCase()}</span>
}
