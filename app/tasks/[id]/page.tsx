'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Edit, MessageSquare, Clock, AlertCircle, CheckCircle, Upload, FileText, X, MoreVertical, Play, Pause, RotateCcw } from 'lucide-react'


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
  const [commentMentions, setCommentMentions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [timerDuration, setTimerDuration] = useState(0)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [manualTimeEntry, setManualTimeEntry] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState(false)


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
        console.error('[v0] Failed to fetch task:', error)
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
          mentions: commentMentions,
        }),
      })


      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment('')
        setCommentMentions([])
      }
    } catch (error) {
      console.error('[v0] Failed to add comment:', error)
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
      console.error('[v0] Failed to update task status:', error)
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
      console.error('[v0] Failed to log time:', error)
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
      console.error('[v0] Failed to log manual time:', error)
    }
  }


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return


    setUploadingFiles(true)


    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()


      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${params.id}/attachments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      })


      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
      }
    } catch (error) {
      console.error('[v0] Failed to upload files:', error)
    } finally {
      setUploadingFiles(false)
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
    const colors: Record<string, { bg: string; text: string; border: string; label: string }> = {
      completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', label: 'Completed' },
      in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress' },
      on_hold: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'On Hold' },
      todo: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'To Do' },
      cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
    }
    return colors[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Unknown' }
  }


  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || !dueDate) return false
    return new Date(dueDate) < new Date()
  }


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }


  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading task details...</div>
      </div>
    )
  }


  if (!task) {
    return (
      <div className="space-y-6">
        <p className="text-red-400">Task not found</p>
        <Link href="/tasks">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>
    )
  }


  const statusColors = getStatusColor(task.status)
  const priorityColors = getPriorityColor(task.priority)


  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link href="/tasks">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-300 mb-4 gap-2 px-0">
              <ArrowLeft className="w-4 h-4" />
              Back to Tasks
            </Button>
          </Link>
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white break-words">{task.title}</h1>
            {isOverdue(task.due_date, task.status) && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex-shrink-0 mt-2">
                Overdue
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm">ID: {task._id}</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager' || user?._id === task.assigned_to) && (
          <Link href={`/tasks/${task._id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        )}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No description provided'}
            </p>
          </Card>


          {/* File Attachments */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Attachments
              </h2>
              <label className="cursor-pointer">
                <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={uploadingFiles} />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    {uploadingFiles ? 'Uploading...' : 'Upload'}
                  </span>
                </Button>
              </label>
            </div>


            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6">No attachments yet</p>
            )}
          </Card>


          {/* Comments */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Comments ({comments.length})</h2>
            </div>


            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border-l-2 border-blue-500/30 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-white">{comment.created_by}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(comment.created_at).toLocaleDateString()} at{' '}
                        {new Date(comment.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
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
                ))
              )}
            </div>


            <form onSubmit={handleAddComment} className="pt-6 border-t border-slate-700">
              <label className="block text-sm font-semibold text-slate-200 mb-3">Add a Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or updates... Use @name to mention someone"
                rows={3}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 placeholder-slate-500 resize-none mb-3"
              />
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Post Comment
              </Button>
            </form>
          </Card>


          {/* Activity Timeline */}
          {activities.length > 0 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Activity</h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity._id} className="text-sm text-slate-300 pl-4 border-l-2 border-slate-700">
                    <p>
                      <span className="font-semibold text-white">{activity.user}</span>
                      {activity.type === 'status_change' && (
                        <span>
                          {' '}
                          changed status from <span className="text-slate-200">{activity.old_value}</span> to{' '}
                          <span className="text-slate-200">{activity.new_value}</span>
                        </span>
                      )}
                      {activity.type === 'comment' && <span> added a comment</span>}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(activity.created_at).toLocaleDateString()} at{' '}
                      {new Date(activity.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>


        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className={`p-4 border ${statusColors.bg} ${statusColors.border} relative`}>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Status</label>
            <div className="relative">
              <Button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`w-full justify-between ${statusColors.text} bg-slate-700 hover:bg-slate-600 border border-slate-600`}
              >
                <span className="capitalize">{statusColors.label}</span>
                <MoreVertical className="w-4 h-4" />
              </Button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
                  {['todo', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg capitalize text-sm"
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>


          {/* Priority */}
          <Card className={`p-4 border ${priorityColors.bg} ${priorityColors.border}`}>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">Priority</label>
            <Badge className={`${priorityColors.bg} ${priorityColors.text} ${priorityColors.border} border capitalize`}>
              {task.priority}
            </Badge>
          </Card>


          {/* Due Date */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-semibold text-slate-300 uppercase">Due Date</label>
            </div>
            <p className="text-slate-300 font-semibold">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No due date'}
            </p>
            {task.due_date && (
              <p className="text-slate-400 text-xs mt-1">
                {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </Card>


          {/* Time Tracking */}
          <Card className="p-4 bg-slate-800 border-slate-700 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <label className="text-xs font-semibold text-slate-300 uppercase">Time Logged</label>
              </div>
              <p className="text-slate-300 font-semibold">
                {task.time_logged > 0 ? formatTimeShort(task.time_logged) : 'No time logged'}
              </p>
            </div>


            {/* Timer */}
            <div className="pt-3 border-t border-slate-700">
              <div className="text-center mb-3">
                <p className="text-slate-400 text-xs mb-2">ACTIVE TIMER</p>
                <p className="text-2xl font-bold text-blue-400 font-mono">{formatTime(timerDuration)}</p>
              </div>
              <div className="flex gap-2">
                {!timerActive ? (
                  <Button onClick={handleStartTimer} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                ) : (
                  <Button onClick={handleStopTimer} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Pause className="w-4 h-4" />
                    Stop
                  </Button>
                )}
              </div>
            </div>


            {/* Manual Time Entry */}
            <div className="pt-3 border-t border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-2">ADD TIME (minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualTimeEntry}
                  onChange={(e) => setManualTimeEntry(e.target.value)}
                  placeholder="Minutes"
                  min="0"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
                <Button
                  onClick={handleManualTimeEntry}
                  disabled={!manualTimeEntry}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>


          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Card className="p-4 bg-slate-800 border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase">Tags</label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}


          {/* Metadata */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase">Info</label>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Created: {new Date(task.created_at).toLocaleDateString()}</p>
              <p>Updated: {new Date(task.updated_at).toLocaleDateString()}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
