'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Task {
  _id: string
  title: string
  description: string
  assigned_to: {
    _id: string
    first_name: string
    last_name: string
    email: string
  }
  created_by: {
    _id: string
    first_name: string
    last_name: string
  }
  priority: string
  due_date: string
  created_at: string
  status: string
  approval_status?: 'pending' | 'approved' | 'rejected'
  approval_notes?: string
}

export default function TaskApprovalsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/tasks?requires_approval=true', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        setFilteredTasks(data.filter((t: Task) => t.approval_status === 'pending'))
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: 'pending' | 'approved' | 'rejected') => {
    setFilter(newFilter)
    setFilteredTasks(tasks.filter((t) => t.approval_status === newFilter))
  }

  const handleApprove = async (taskId: string) => {
    setProcessingId(taskId)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_status: 'approved',
          approval_notes: approvalNotes,
        }),
      })

      if (response.ok) {
        await fetchTasks()
        setSelectedTask(null)
        setApprovalNotes('')
      }
    } catch (error) {
      console.error('Failed to approve task:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (taskId: string) => {
    if (!approvalNotes.trim()) {
      alert('Please provide rejection reason')
      return
    }
    
    setProcessingId(taskId)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_status: 'rejected',
          approval_notes: approvalNotes,
        }),
      })

      if (response.ok) {
        await fetchTasks()
        setSelectedTask(null)
        setApprovalNotes('')
      }
    } catch (error) {
      console.error('Failed to reject task:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    }
    return colors[priority] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const getApprovalStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Task Approvals</h1>
        <p className="text-slate-400 mt-2">Review and approve tasks before employees start working</p>
      </div>

      {/* Filter Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: 'pending', count: tasks.filter(t => t.approval_status === 'pending').length },
          { label: 'Approved', value: 'approved', count: tasks.filter(t => t.approval_status === 'approved').length },
          { label: 'Rejected', value: 'rejected', count: tasks.filter(t => t.approval_status === 'rejected').length },
        ].map(stat => (
          <button
            key={stat.value}
            onClick={() => handleFilterChange(stat.value as 'pending' | 'approved' | 'rejected')}
            className={`p-4 rounded-lg border-2 transition ${
              filter === stat.value
                ? 'bg-blue-900/20 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="font-bold text-lg">{stat.count}</div>
            <div className="text-sm">{stat.label}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading approval tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400 mb-4">No {filter} approval tasks</p>
          {filter === 'pending' && (
            <p className="text-slate-500 text-sm">All tasks are reviewed and processed!</p>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card
              key={task._id}
              className={`p-6 border transition cursor-pointer hover:border-slate-600 ${
                selectedTask?._id === task._id
                  ? 'bg-slate-700 border-blue-500'
                  : 'bg-slate-800 border-slate-700'
              }`}
              onClick={() => setSelectedTask(selectedTask?._id === task._id ? null : task)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-2 break-words">{task.title}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getApprovalStatusColor(task.approval_status)}>
                      {task.approval_status || 'pending'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-300 font-semibold">
                    {task.assigned_to.first_name} {task.assigned_to.last_name}
                  </p>
                  <p className="text-slate-400 text-sm">{task.assigned_to.email}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Approval Panel */}
              {selectedTask?._id === task._id && (
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Approval Notes
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add comments or feedback for the employee..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                    />
                  </div>

                  {task.approval_status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(task._id)}
                        disabled={processingId === task._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(task._id)}
                        disabled={processingId === task._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
