'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { GripVertical, Plus, Clock, User } from 'lucide-react'

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
  { value: 'todo', label: 'To Do', color: 'bg-gradient-to-r from-slate-500/10 to-slate-600/20', textColor: 'text-slate-100' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-gradient-to-r from-blue-500/10 to-blue-600/20', textColor: 'text-blue-100' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-gradient-to-r from-orange-500/10 to-orange-600/20', textColor: 'text-orange-100' },
  { value: 'completed', label: 'Completed', color: 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/20', textColor: 'text-emerald-100' },
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
      urgent: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-100 border-red-500/30',
      high: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-100 border-orange-500/30',
      medium: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-100 border-amber-500/30',
      low: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-100 border-emerald-500/30',
    }
    return colors[priority] || 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-300 border-slate-500/30'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900/50 to-slate-800/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-700/50 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-slate-400 font-medium">Loading Kanban Board...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900">
      {/* Enhanced Header */}
      <div className="px-6 lg:px-12 py-8 border-b border-slate-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-3">
              Kanban Board
            </h1>
            <p className="text-xl text-slate-400 font-medium">Visualize, organize, and track your tasks efficiently</p>
          </div>
          <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-100 border border-emerald-500/30 px-6 py-3 text-lg font-semibold h-auto">
            {tasks.length} tasks
          </Badge>
        </div>
      </div>

      <div className="px-6 lg:px-12 py-12">
        {/* Professional Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {STATUSES.map((status) => {
            const statusTasks = getTasksByStatus(status.value)

            return (
              <div key={status.value} className="flex flex-col bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1">
                {/* Enhanced Column Header */}
                <div className={`${status.color} p-6 rounded-t-2xl border-b border-slate-700/50`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-white/50 to-slate-300" />
                      <h2 className={`text-xl font-bold ${status.textColor} tracking-tight`}>{status.label}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 text-slate-300 px-3 py-1 font-mono text-sm">
                        {statusTasks.length}
                      </Badge>
                      <Plus className="w-5 h-5 text-slate-400 hover:text-white transition-colors cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Tasks Container */}
                <div className="flex-1 p-6 min-h-[400px] space-y-4 overflow-hidden">
                  {statusTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                        <GripVertical className="w-8 h-8 text-slate-500" />
                      </div>
                      <div className="text-slate-400 font-medium mb-1">No tasks yet</div>
                      <div className="text-slate-500 text-sm">Drag tasks here or create new ones</div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
                      {statusTasks.map((task) => (
                        <Link key={task._id} href={`/tasks/${task._id}`} className="block">
                          <Card className="group p-5 bg-gradient-to-b from-slate-800/80 to-slate-900/50 backdrop-blur-sm border border-slate-700/70 hover:border-slate-600/80 hover:bg-slate-800/90 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-grab active:cursor-grabbing">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center flex-shrink-0 w-10">
                                <GripVertical className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors mb-1" />
                                <div className={`w-2 h-8 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white text-base leading-tight group-hover:text-slate-200 mb-2 line-clamp-2">
                                  {task.title}
                                </h3>
                                
                                {task.description && (
                                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge className={`text-xs font-mono px-3 py-1 shadow-lg ${getPriorityColor(task.priority)} border`}>
                                    {task.priority.toUpperCase()}
                                  </Badge>
                                  
                                  {task.due_date && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-700/50 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-slate-700/50">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>
                                        {new Date(task.due_date).toLocaleDateString([], {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {task.assigned_to && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-700/50 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-slate-700/50">
                                      <User className="w-3 h-3" />
                                      <span className="truncate max-w-20">{task.assigned_to}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
