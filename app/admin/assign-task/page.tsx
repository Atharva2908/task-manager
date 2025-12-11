'use client'


import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Clock, Users, Flag, Calendar } from 'lucide-react'


interface User {
  _id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
  department?: string
}


export default function AssignTaskPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
    tags: '',
    estimated_hours: '',
    requires_approval: false,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)


  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setCurrentUser(JSON.parse(userData))


    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const employees = data.filter((u: User) => u.role === 'employee' && u.username !== currentUser?.username)
          setUsers(employees)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')


    if (!formData.title.trim()) {
      setError('Task title is required')
      setLoading(false)
      return
    }


    if (!formData.assigned_to) {
      setError('Please select an employee to assign the task')
      setLoading(false)
      return
    }


    try {
      const token = localStorage.getItem('access_token')
      const taskPayload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
        requires_approval: formData.requires_approval,
        created_by: currentUser?._id,
      }


      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(taskPayload),
      })


      if (response.ok) {
        setSuccess('Task assigned successfully! Redirecting...')
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          assigned_to: '',
          tags: '',
          estimated_hours: '',
          requires_approval: false,
        })
        setTimeout(() => router.push('/admin/task-assignments'), 2000)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to assign task')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500/20 border-green-500/30 text-green-400' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' },
    { value: 'high', label: 'High', color: 'bg-orange-500/20 border-orange-500/30 text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 border-red-500/30 text-red-400' },
  ]


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Assign Task to Employee</h1>
          <p className="text-slate-400 mt-2">Create and assign a new task with workflow options</p>
        </div>
        <Link href="/admin/task-assignments">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            View Assignments
          </Button>
        </Link>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-8 bg-slate-800 border-slate-700 lg:col-span-2 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Task Title <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Create API endpoint for user authentication"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
              />
              <p className="text-slate-500 text-xs mt-1">Be specific about what needs to be done</p>
            </div>


            {/* Task Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed requirements, acceptance criteria, and any relevant context..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                rows={5}
              />
            </div>


            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Priority Level <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                      formData.priority === option.value
                        ? `${option.color} border-current`
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={formData.priority === option.value}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>


            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Due Date <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                />
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Estimated Hours
                </label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  placeholder="e.g. 8"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
                />
              </div>
            </div>


            {/* Assign To Employee */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Assign To Employee <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select an employee...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.first_name} {user.last_name} {user.department && `(${user.department})`}
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-yellow-400 text-xs mt-1">No employees available to assign</p>
              )}
            </div>


            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Tags (comma separated)
              </label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. backend, api, authentication"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>


            {/* Approval Workflow */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_approval}
                  onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="ml-3 text-sm font-semibold text-slate-200">
                  Require approval before task starts
                </span>
              </label>
              <p className="text-slate-400 text-sm mt-2">
                If enabled, the task will need manager approval before the employee can begin work
              </p>
            </div>


            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{success}</p>
              </div>
            )}


            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-slate-700">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Assigning Task...' : 'Assign Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>


        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4 text-blue-400" />
              Priority Levels
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-white">Low</p>
                  <p className="text-slate-400">Can wait, no immediate deadline</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-white">Medium</p>
                  <p className="text-slate-400">Important, should be completed soon</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-white">High</p>
                  <p className="text-slate-400">Urgent, completion needed quickly</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-white">Urgent</p>
                  <p className="text-slate-400">Critical, needs immediate attention</p>
                </div>
              </div>
            </div>
          </Card>


          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Be clear and specific in task description</li>
              <li>• Set realistic due dates</li>
              <li>• Use tags for better organization</li>
              <li>• Enable approval for important tasks</li>
              <li>• Estimate hours for better planning</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
