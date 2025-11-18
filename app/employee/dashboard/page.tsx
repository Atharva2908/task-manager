'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Task {
  _id: string
  title: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
}

interface EmployeeStats {
  total_assigned: number
  in_progress: number
  completed: number
  overdue: number
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeStats>({
    total_assigned: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const allTasks = await response.json()
          const myTasks = allTasks.filter((t: Task) => t.assigned_to === JSON.parse(userData || '{}')._id)
          setTasks(myTasks.slice(0, 5)) // Show recent 5 tasks

          const now = new Date()
          setStats({
            total_assigned: myTasks.length,
            in_progress: myTasks.filter((t: Task) => t.status === 'in_progress').length,
            completed: myTasks.filter((t: Task) => t.status === 'completed').length,
            overdue: myTasks.filter((t: Task) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </Card>
  )

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-400 bg-red-900/20',
      high: 'text-orange-400 bg-orange-900/20',
      medium: 'text-yellow-400 bg-yellow-900/20',
      low: 'text-green-400 bg-green-900/20',
    }
    return colors[priority] || 'text-slate-400 bg-slate-900/20'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-400 bg-green-900/20',
      in_progress: 'text-blue-400 bg-blue-900/20',
      on_hold: 'text-orange-400 bg-orange-900/20',
      todo: 'text-slate-400 bg-slate-900/20',
    }
    return colors[status] || 'text-slate-400 bg-slate-900/20'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/design-mode/TriMarkity-removebg-preview.png"
          alt="TriMarkity"
          width={60}
          height={60}
        />
        <div>
          <h1 className="text-4xl font-bold text-white">Welcome, {user?.first_name}!</h1>
          <p className="text-slate-400">Your task dashboard and progress</p>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Assigned" value={stats.total_assigned} icon="📋" color="text-blue-400" />
          <StatCard title="In Progress" value={stats.in_progress} icon="🚀" color="text-yellow-400" />
          <StatCard title="Completed" value={stats.completed} icon="✅" color="text-green-400" />
          <StatCard title="Overdue" value={stats.overdue} icon="⚠️" color="text-red-400" />
        </div>
      )}

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                <Link href="/tasks">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-slate-700">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No tasks assigned yet</div>
              ) : (
                tasks.map((task) => (
                  <Link key={task._id} href={`/tasks/${task._id}`}>
                    <div className="p-6 hover:bg-slate-700/50 transition cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        {task.due_date && (
                          <div className="text-right text-sm text-slate-400">
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-slate-800 border-slate-700 h-fit">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/tasks" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                📋 View All Tasks
              </Button>
            </Link>
            <Link href="/profile" className="block">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start">
                ⚙️ Profile
              </Button>
            </Link>
            <Link href="/notifications" className="block">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start">
                🔔 Notifications
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Completion Progress */}
      {stats.total_assigned > 0 && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Productivity Overview</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Completion Rate</span>
                <span className="text-blue-400 font-semibold">
                  {Math.round((stats.completed / stats.total_assigned) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.completed / stats.total_assigned) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
