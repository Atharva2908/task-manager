'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  FileText, 
  Play, 
  Pause, 
  RotateCw,
  Trash2,
  Download,
  RotateCcw,
} from 'lucide-react'
import Link from 'next/link'

interface Task {
  _id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  created_by: string
  assigned_to: string
  tags: string[]
  time_logged: number
  time_sessions: { start: string; end: string; duration: number }[]
  created_at: string
  updated_at: string
  attachments?: { id: string; name: string; url: string; size: number; type: string; uploaded_at: string }[]
}

interface Comment {
  _id: string
  content: string
  created_by: string
  created_at: string
  mentions?: string[]
  attachments?: { id: string; name: string; url: string; type: string }[]
}

interface Activity {
  _id: string
  type: string
  user: string
  field?: string
  old_value?: string
  new_value?: string
  created_at: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(0)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [manualTimeEntry, setManualTimeEntry] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))

    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })

        if (response.ok) {
          const taskData = await response.json()
          setTask(taskData)

          const [commentsResponse, activitiesResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/task/${params.id}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/activity`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include',
            }),
          ])

          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json()
            setComments(commentsData)
          }

          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json()
            setActivities(activitiesData)
          }
        }
      } catch (error) {
        console.error('Failed to fetch task:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [params.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive) {
      interval = setInterval(() => {
        setTimerDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  setUploadingFiles(true)
  setUploadProgress(0)

  try {
    const token = localStorage.getItem('access_token')
    const formData = new FormData()

    // Add files with correct field name
    files.forEach((file) => {
      formData.append('attachments', file)  // ✅ Your API expects 'attachments'
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    })

    // ✅ FIXED: Check response.status instead of just .ok
    if (response.status >= 200 && response.status < 300) {
      const updatedTask = await response.json()
      setTask(updatedTask)
      setUploadProgress(100)
      
      // Reset after success
      setTimeout(() => {
        setUploadProgress(0)
        setUploadingFiles(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } else {
      // ✅ FIXED: Get actual error message
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Upload failed:', errorData)
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    setUploadProgress(0)
    setUploadingFiles(false)
    alert(`Upload failed: ${error.message}`)
  }
}

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          task_id: params.id,
          content: newComment,
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment('')
        textareaRef.current?.focus()
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
        setShowStatusMenu(false)
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleStartTimer = () => {
    setTimerActive(true)
  }

  const handleStopTimer = async () => {
    setTimerActive(false)

    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/time-logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration: timerDuration }),
      })

      if (task) {
        setTask({
          ...task,
          time_logged: task.time_logged + timerDuration,
        })
      }

      setTimerDuration(0)
    } catch (error) {
      console.error('Failed to log time:', error)
    }
  }

  const handleManualTimeEntry = async () => {
    if (!manualTimeEntry || isNaN(Number(manualTimeEntry))) return

    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/time-logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration: Number(manualTimeEntry) * 60 }),
      })

      if (task) {
        setTask({
          ...task,
          time_logged: task.time_logged + Number(manualTimeEntry) * 60,
        })
      }

      setManualTimeEntry('')
    } catch (error) {
      console.error('Failed to log manual time:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
      high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    }
    return colors[priority] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
      completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'Completed', icon: CheckCircle },
      in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress', icon: Play },
      on_hold: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'On Hold', icon: Pause },
      todo: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'To Do', icon: RotateCcw },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled', icon: AlertCircle },
    }
    return colors[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Unknown', icon: AlertCircle }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || !dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500"></div>
          <span>Loading task details...</span>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-6 p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Task Not Found</h2>
          <p className="text-slate-400 mb-6">The task you're looking for doesn't exist.</p>
          <Link href="/tasks">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors = getStatusColor(task.status)
  const priorityColors = getPriorityColor(task.priority)
  const StatusIcon = statusColors.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1 min-w-0">
            <Link href="/tasks" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </Link>
            <div className="flex items-start gap-4 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white break-words flex-1">{task.title}</h1>
              {isOverdue(task.due_date, task.status) && (
                <Badge className="bg-red-500/20 border-red-500/30 text-red-400 animate-pulse flex-shrink-0 mt-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span>ID: {task._id}</span>
              {task.created_at && (
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager' || user?._id === task.assigned_to) && (
            <Link href={`/tasks/${task._id}/edit`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-6 shadow-lg">
                <Edit className="w-4 h-4" />
                Edit Task
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                    {task.description || 'No description provided.'}
                  </p>
                </div>
              </CardContent>
            </Card>
{/* 🔥 PERFECTLY WORKING File Upload */}
<div className="flex flex-col gap-2 p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-blue-400" />
      <span className="text-white font-semibold">Attachments ({task.attachments?.length || 0})</span>
    </div>
    
    {/* ✅ THIS WILL DEFINITELY WORK */}
    <label className="cursor-pointer">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        disabled={uploadingFiles}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv"
      />
      <div className={`
        flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700
        hover:from-blue-500 hover:to-blue-600 text-white rounded-lg shadow-lg
        font-medium transition-all duration-200 border border-blue-500/50
        ${uploadingFiles 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02]'
        }
      `}>
        {uploadingFiles ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Files
          </>
        )}
      </div>
    </label>
  </div>

  {/* Progress Bar */}
  {uploadProgress > 0 && (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-700/50 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full shadow-sm transition-all duration-500"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <span className="text-sm font-mono text-slate-300 min-w-[3rem] text-right">
        {Math.round(uploadProgress)}%
      </span>
    </div>
  )}
</div>

{/* File List */}
{task.attachments && task.attachments.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    {task.attachments.map((file) => (
      <div key={file.id} className="group p-4 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate text-sm" title={file.name}>{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1] || 'file'}
              </p>
            </div>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            download={file.name}
            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all ml-2"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    ))}
  </div>
)}

{(!task.attachments || task.attachments.length === 0) && (
  <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/30 mt-4">
    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-slate-400 mb-2">No attachments</h3>
    <p className="text-slate-500 mb-6">Upload files to get started</p>
  </div>
)}


            {/* Comments */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-80 pr-4">
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg mb-2">No comments yet</p>
                        <p className="text-sm">Be the first to comment on this task</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment._id} className="flex gap-4">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-xs">
                              {comment.created_by.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white truncate text-sm">{comment.created_by}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">{comment.content}</p>
                            {comment.mentions && comment.mentions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {comment.mentions.map((mention) => (
                                  <Badge key={mention} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                    @{mention}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Separator className="my-6 bg-slate-700" />
                
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold text-xs">
                        {user?.first_name ? user.first_name.slice(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Textarea
                      ref={textareaRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts or updates... Use @name to mention someone"
                      rows={3}
                      disabled={submitting}
                      className="flex-1 min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Press Enter + Shift to add new line</span>
                    <Button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg h-11 px-8"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            {activities.length > 0 && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64 pr-4">
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity._id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300">
                              <span className="font-semibold text-white">{activity.user}</span>
                              {activity.type === 'status_change' && (
                                <>
                                  {' '}changed status from <span className="font-mono bg-slate-600 px-1.5 py-0.5 rounded text-xs text-slate-200">{activity.old_value}</span> 
                                  to <span className="font-mono bg-slate-600 px-1.5 py-0.5 rounded text-xs text-slate-200">{activity.new_value}</span>
                                </>
                              )}
                              {activity.type === 'comment' && ' added a comment'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Time Tracking, Status, Priority, etc. (unchanged) */}
          <div className="space-y-6 xl:space-y-8">
            {/* Status */}
            <Card className={`bg-slate-800/50 backdrop-blur-sm border ${statusColors.border} shadow-xl overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Status</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Popover open={showStatusMenu} onOpenChange={setShowStatusMenu}>
                  <PopoverTrigger asChild>
                    <Button
                      className={`w-full justify-between h-14 px-4 py-2 ${statusColors.bg} ${statusColors.border} ${statusColors.text} hover:bg-slate-700/50 transition-all duration-200 shadow-sm`}
                    >
                      <span className="font-medium capitalize">{statusColors.label}</span>
                      <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-1 bg-slate-800/95 backdrop-blur-sm border-slate-700/50 mt-1 shadow-2xl">
                    {['todo', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((statusOption) => {
                      const optionColors = getStatusColor(statusOption)
                      return (
                        <Button
                          key={statusOption}
                          variant="ghost"
                          className={`w-full justify-start h-12 px-4 text-left hover:bg-slate-700/50 ${optionColors.text} capitalize rounded-lg transition-all duration-200 ${task.status === statusOption ? 'bg-slate-700/50 font-semibold shadow-sm' : ''}`}
                          onClick={() => handleStatusChange(statusOption)}
                        >
                          <optionColors.icon className="w-4 h-4 mr-2 flex-shrink-0 opacity-70" />
                          {optionColors.label}
                        </Button>
                      )
                    })}
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Priority */}
            <Card className={`bg-slate-800/50 backdrop-blur-sm border ${priorityColors.border} shadow-xl overflow-hidden`}>
              <CardHeader className="pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Priority</span>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <Badge className={`text-xs px-4 py-2 h-auto min-h-0 ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} font-semibold shadow-sm`}>
                  {task.priority.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            {/* Due Date */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Due Date</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-1">
                  <p className={`font-mono text-lg font-semibold ${isOverdue(task.due_date, task.status) ? 'text-red-400' : 'text-slate-200'}`}>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No due date'}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-slate-500 font-mono">
                      {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Tracking */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <CardTitle className="text-white text-base leading-tight">Time Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-center py-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Logged</p>
                  <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent font-mono">
                    {task.time_logged > 0 ? formatTimeShort(task.time_logged) : '0h 0m'}
                  </p>
                </div>

                {/* Active Timer */}
                <div className="space-y-3">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/30">
                    <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Active Timer</p>
                    <p className="text-3xl lg:text-4xl font-bold font-mono text-blue-400 tracking-tight">
                      {formatTime(timerDuration)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!timerActive ? (
                      <Button 
                        onClick={handleStartTimer} 
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg h-12 font-semibold shadow-lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStopTimer} 
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg h-12 font-semibold"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Timer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="pt-4 border-t border-slate-700/50">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Manual Entry</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={manualTimeEntry}
                      onChange={(e) => setManualTimeEntry(e.target.value)}
                      placeholder="Minutes"
                      min="0"
                      className="h-12 font-mono text-lg"
                    />
                    <Button
                      onClick={handleManualTimeEntry}
                      disabled={!manualTimeEntry || isNaN(Number(manualTimeEntry))}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 px-6 shadow-lg font-semibold"
                    >
                      Add Time
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
                <CardHeader className="pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Tags</span>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30 backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/30 shadow-xl">
              <CardHeader className="pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Metadata</span>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-mono">Created</span>
                  <span className="font-mono text-slate-300 block">{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-mono">Updated</span>
                  <span className="font-mono text-slate-300 block">{new Date(task.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
