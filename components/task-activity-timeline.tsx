import { Card } from '@/components/ui/card'
import { ActivitySquare, MessageSquare, CheckCircle, Edit, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'comment' | 'status_change' | 'edited' | 'created'
  user: string
  action: string
  timestamp: string
  details?: string
}

interface TaskActivityTimelineProps {
  activities?: Activity[]
  loading?: boolean
}

export function TaskActivityTimeline({
  activities = [],
  loading = false,
}: TaskActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'edited':
        return <Edit className="w-4 h-4 text-orange-400" />
      case 'created':
        return <ActivitySquare className="w-4 h-4 text-purple-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      comment: 'from-blue-500/10 to-blue-500/5',
      status_change: 'from-green-500/10 to-green-500/5',
      edited: 'from-orange-500/10 to-orange-500/5',
      created: 'from-purple-500/10 to-purple-500/5',
    }
    return colors[type] || 'from-slate-500/10 to-slate-500/5'
  }

  if (loading) {
    return (
      <Card className="p-6 bg-slate-800 border-slate-700">
        <p className="text-slate-400 text-center">Loading activity...</p>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 bg-slate-800 border-slate-700">
        <p className="text-slate-400 text-center">No activity yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h3 className="text-lg font-bold text-white mb-6">Activity Timeline</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex gap-4 relative"
          >
            {/* Timeline Line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-700" />
            )}

            {/* Icon Circle */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getActivityColor(
              activity.type
            )} border border-slate-600 flex items-center justify-center flex-shrink-0`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{activity.action}</p>
                  <p className="text-sm text-slate-400">by {activity.user}</p>
                </div>
                <p className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                  {new Date(activity.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {activity.details && (
                <p className="text-sm text-slate-300 mt-2">{activity.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
