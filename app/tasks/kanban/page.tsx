'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { GripVertical } from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
}

const STATUSES = [
  { value: 'todo', label: 'To Do', color: 'bg-slate-500/10' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500/10' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-orange-500/10' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500/10' },
]

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setTasks(data)
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/20 text-red-300',
      high: 'bg-orange-500/20 text-orange-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      low: 'bg-green-500/20 text-green-300',
    }
    return colors[priority] || 'bg-slate-500/20 text-slate-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading kanban board...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Kanban Board</h1>
        <p className="text-slate-400">Organize and track tasks by status</p>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
        {STATUSES.map((status) => {
          const statusTasks = getTasksByStatus(status.value)

          return (
            <div key={status.value} className="flex flex-col">
              {/* Column Header */}
              <div className={`p-4 rounded-t-lg ${status.color} border border-slate-700/50 mb-2`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white">{status.label}</h2>
                  <Badge className="bg-slate-700/50 text-slate-300">{statusTasks.length}</Badge>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 space-y-3 min-h-96 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition">
                {statusTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    No tasks
                  </div>
                ) : (
                  statusTasks.map((task) => (
                    <Link key={task._id} href={`/tasks/${task._id}`}>
                      <Card className="p-3 bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-lg transition cursor-pointer">
                        <div className="flex gap-2">
                          <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate mb-2">
                              {task.title}
                            </h3>
                            <div className="flex gap-1 flex-wrap">
                              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              {task.due_date && (
                                <span className="text-xs text-slate-400">
                                  {new Date(task.due_date).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
