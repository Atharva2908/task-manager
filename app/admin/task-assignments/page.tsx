'use client'


import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'


interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  created_at: string
}


interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
}


export default function TaskAssignmentsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token')


        // Fetch tasks
        const tasksRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData)
        }


        // Fetch users
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          const usersMap: Record<string, User> = {}
          usersData.forEach((user: User) => {
            usersMap[user._id] = user
          })
          setUsers(usersMap)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }


    fetchData()
  }, [])


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-400 bg-green-900/20',
      in_progress: 'text-blue-400 bg-blue-900/20',
      on_hold: 'text-orange-400 bg-orange-900/20',
      todo: 'text-slate-400 bg-slate-900/20',
      cancelled: 'text-red-400 bg-red-900/20',
    }
    return colors[status] || 'text-slate-400 bg-slate-900/20'
  }


  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-400 bg-red-900/20',
      high: 'text-orange-400 bg-orange-900/20',
      medium: 'text-yellow-400 bg-yellow-900/20',
      low: 'text-green-400 bg-green-900/20',
    }
    return colors[priority] || 'text-slate-400 bg-slate-900/20'
  }


  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Task Assignments</h1>
          <p className="text-slate-400 mt-1">Manage and track employee tasks</p>
        </div>
        <Link href="/admin/assign-task">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            + Assign New Task
          </Button>
        </Link>
      </div>


      {/* Filter Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'All', value: 'all', count: tasks.length },
          { label: 'Todo', value: 'todo', count: tasks.filter(t => t.status === 'todo').length },
          { label: 'In Progress', value: 'in_progress', count: tasks.filter(t => t.status === 'in_progress').length },
          { label: 'Completed', value: 'completed', count: tasks.filter(t => t.status === 'completed').length },
          { label: 'On Hold', value: 'on_hold', count: tasks.filter(t => t.status === 'on_hold').length },
        ].map(stat => (
          <button
            key={stat.value}
            onClick={() => setFilter(stat.value)}
            className={`p-4 rounded-lg border-2 transition ${
              filter === stat.value
                ? 'bg-blue-900/20 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="font-medium text-lg">{stat.count}</div>
            <div className="text-sm">{stat.label}</div>
          </button>
        ))}
      </div>


      {/* Tasks Table */}
      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400 mb-4">No tasks found</p>
          <Link href="/admin/assign-task">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Assign First Task</Button>
          </Link>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-slate-200">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Assigned To</th>
                  <th className="px-6 py-3 text-left font-semibold">Priority</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const assignedUser = users[task.assigned_to]
                  return (
                    <tr key={task._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{task.title}</div>
                        <div className="text-sm text-slate-400">{task.description.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Unknown'}
                        </div>
                        <div className="text-sm text-slate-400">{assignedUser?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/tasks/${task._id}`}>
                          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
