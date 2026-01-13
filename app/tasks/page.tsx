'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Search, Plus, ChevronLeft, ChevronRight, Clock, Calendar, User } from 'lucide-react'

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
    const colors: Record<string, string> = {
      urgent: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20',
      medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
    }
    return colors[priority] || 'default'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
      on_hold: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
      todo: 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
    }
    return colors[status] || 'default'
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || !dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Task Management
          </CardTitle>
          <p className="text-muted-foreground text-lg mt-1">
            Track progress and manage your team's workload
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link href="/tasks/create">
            <Button size="lg" className="gap-2 shadow-lg">
              <Plus className="w-5 h-5" />
              New Task
            </Button>
          </Link>
        )}
      </div>

      <Separator />

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-0">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Status
            </label>
            <Select value={filters.status} onValueChange={(value) => {
              setFilters({ ...filters, status: value })
              setPagination({ ...pagination, page: 1 })
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Priority
            </label>
            <Select value={filters.priority} onValueChange={(value) => {
              setFilters({ ...filters, priority: value })
              setPagination({ ...pagination, page: 1 })
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Deadline
            </label>
            <Select value={filters.deadline} onValueChange={(value) => {
              setFilters({ ...filters, deadline: value })
              setPagination({ ...pagination, page: 1 })
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Deadlines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deadlines</SelectItem>
                <SelectItem value="today">Due Today</SelectItem>
                <SelectItem value="this_week">Due This Week</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
              Sort By
            </label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_date">Latest Created</SelectItem>
                <SelectItem value="deadline">By Deadline</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="border-dashed border-muted h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin rounded-full mx-auto" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </Card>
        ) : paginatedTasks.length === 0 ? (
          <Card className="border-dashed border-muted h-80 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {search ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {search 
                ? 'Try adjusting your search terms or filters' 
                : 'Get started by creating your first task'
              }
            </p>
            {(user?.role === 'admin' || user?.role === 'manager') && !search && (
              <Link href="/tasks/create">
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          paginatedTasks.map((task) => (
            <Link key={task._id} href={`/tasks/${task._id}`} className="block hover:no-underline">
              <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 border-border hover:border-border/50 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base leading-tight group-hover:text-primary truncate font-semibold">
                          {task.title}
                        </CardTitle>
                        {isOverdue(task.due_date, task.status) && (
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 leading-relaxed">
                        {task.description}
                      </CardDescription>
                    </div>
                    {task.due_date && (
                      <div className="flex-shrink-0 text-right ml-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    {task.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags && task.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.tags.length - 2} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between py-8 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}
              </span> to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(pagination.page * pagination.limit, filteredTasks.length)}
              </span> of{' '}
              <span className="font-semibold text-foreground">{filteredTasks.length}</span> tasks
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = pagination.page <= 3 
                  ? i + 1 
                  : totalPages - 4 + i + 1 > totalPages 
                  ? totalPages - 4 + i + 1 
                  : pagination.page - 2 + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.min(totalPages, pagination.page + 1) })}
                disabled={pagination.page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
