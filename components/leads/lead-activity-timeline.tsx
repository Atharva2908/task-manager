import React from 'react'

interface Activity {
  id: string
  activity_type: string
  description: string
  performed_by: string
  created_at: string
}

interface LeadActivityTimelineProps {
  activities: Activity[]
}

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  return (
    <div>
      {activities.map((a) => (
        <div key={a.id} className="mb-2 border-l-2 border-gray-300 pl-4">
          <p className="text-sm font-semibold">{a.activity_type}</p>
          <p className="text-xs text-gray-600">{a.description}</p>
          <p className="text-xs text-gray-400">
            By {a.performed_by} at {new Date(a.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
