import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

interface TaskCardProps {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
}

export function TaskCard({
  _id,
  title,
  description,
  status,
  priority,
  due_date,
}: TaskCardProps) {
  const isOverdue =
    due_date && new Date(due_date) < new Date() && status !== 'completed'

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      urgent: { bg: 'bg-red-500/10', text: 'text-red-400' },
      high: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
      medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
      low: { bg: 'bg-green-500/10', text: 'text-green-400' },
    }
    return colors[priority] || { bg: 'bg-slate-500/10', text: 'text-slate-400' }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-green-500/10', text: 'text-green-400' },
      in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      on_hold: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
      todo: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-400' },
    }
    return colors[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400' }
  }

  const priorityColor = getPriorityColor(priority)
  const statusColor = getStatusColor(status)

  return (
    <Link href={`/tasks/${_id}`}>
      <Card className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50 transition cursor-pointer group">
        <div className="space-y-3">
          {/* Title */}
          <div className="flex items-start gap-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition line-clamp-2 flex-1">
              {title}
            </h3>
            {isOverdue && (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-slate-400 text-sm line-clamp-2">{description}</p>
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${priorityColor.bg} ${priorityColor.text} border-current/20`}>
              {priority}
            </Badge>
            <Badge className={`${statusColor.bg} ${statusColor.text} border-current/20`}>
              {status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Due Date */}
          {due_date && (
            <p className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(due_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
