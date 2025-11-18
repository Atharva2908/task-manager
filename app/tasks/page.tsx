'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  created_at: string
  tags?: string[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    deadline: 'all',
    sortBy: 'created_date',
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
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

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks

    // Role-based filtering
    if (user?.role === 'employee') {
      filtered = filtered.filter((task) => task.assigned_to === user._id)
    }

    // Search
    if (search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase()) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Deadline filter
    if (filters.deadline !== 'all') {
      const now = new Date()
      filtered = filtered.filter((task) => {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        switch (filters.deadline) {
          case 'today':
            return dueDate.toDateString() === now.toDateString()
          case 'this_week':
            const weekFromNow = new Date()
            weekFromNow.setDate(weekFromNow.getDate() + 7)
            return dueDate <= weekFromNow && dueDate >= now
          case 'overdue':
            return dueDate < now && task.status !== 'completed'
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'deadline':
          return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime()
        case 'priority':
          const priorityOrder: Record<string, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          }
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        case 'created_date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }

  const filteredTasks = getFilteredAndSortedTasks()
  const totalPages = Math.ceil(filteredTasks.length / pagination.limit)
  const paginatedTasks = filteredTasks.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

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

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || !dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all tasks</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link href="/tasks/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300 gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value })
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => {
              setFilters({ ...filters, priority: e.target.value })
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.deadline}
            onChange={(e) => {
              setFilters({ ...filters, deadline: e.target.value })
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded"
          >
            <option value="all">All Deadlines</option>
            <option value="today">Due Today</option>
            <option value="this_week">Due This Week</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded"
          >
            <option value="created_date">Latest Created</option>
            <option value="deadline">By Deadline</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400">Loading tasks...</p>
        </Card>
      ) : paginatedTasks.length === 0 ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400 mb-4">
            {search ? 'No tasks match your search' : 'No tasks found'}
          </p>
          {(user?.role === 'admin' || user?.role === 'manager') && !search && (
            <Link href="/tasks/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Your First Task
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedTasks.map((task) => (
              <Link key={task._id} href={`/tasks/${task._id}`}>
                <Card className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50 transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
                        {isOverdue(task.due_date, task.status) && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs flex-shrink-0">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${getPriorityColor(task.priority).bg} ${getPriorityColor(task.priority).text} border-current/20 text-xs`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status).bg} ${getStatusColor(task.status).text} border-current/20 text-xs`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.tags?.map((tag) => (
                          <Badge key={tag} className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {task.due_date && (
                      <div className="flex-shrink-0 text-right">
                        <p className="text-slate-400 text-sm">
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-slate-400 text-sm">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, filteredTasks.length)} of{' '}
                {filteredTasks.length} tasks
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="border-slate-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={pagination.page === page ? 'default' : 'outline'}
                      onClick={() => setPagination({ ...pagination, page })}
                      className={pagination.page === page ? 'bg-blue-600' : 'border-slate-600'}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: Math.min(totalPages, pagination.page + 1) })}
                  disabled={pagination.page === totalPages}
                  className="border-slate-600 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
