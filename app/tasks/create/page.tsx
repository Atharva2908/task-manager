'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, X } from 'lucide-react'


export default function CreateTaskPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }


  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }


    setLoading(true)


    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        }),
      })


      if (response.ok) {
        router.push('/tasks')
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to create task')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }


  const priorityColors = {
    low: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
    medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    high: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
    urgent: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  }


  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create New Task</h1>
        <p className="text-slate-400">Define a new task and assign it to your team</p>
      </div>


      <Card className="p-8 bg-slate-800 border-slate-700 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}


          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Task Title <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a clear, descriptive task title"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 text-base"
              required
            />
            <p className="text-slate-500 text-xs mt-1">Be specific and concise</p>
          </div>


          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about this task, requirements, and any relevant context..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 placeholder-slate-500 resize-none"
            />
          </div>


          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Priority Level
              </label>
              <div className="space-y-2">
                {Object.entries(priorityColors).map(([level, colors]) => (
                  <label
                    key={level}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                      formData.priority === level
                        ? `${colors.bg} ${colors.border} border-current`
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={formData.priority === level}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className={`ml-3 capitalize font-medium ${formData.priority === level ? colors.text : 'text-slate-300'}`}>
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>


          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Due Date
            </label>
            <Input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
            />
            <p className="text-slate-500 text-xs mt-1">Optional. Set a deadline for this task</p>
          </div>


          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter"
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30 pl-3 pr-2 py-1 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>


          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-slate-700">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? 'Creating Task...' : 'Create Task'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-6"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
