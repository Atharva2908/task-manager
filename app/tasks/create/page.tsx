'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Plus, X, Clock, Tag, Calendar } from 'lucide-react'

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const priorityOptions = [
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'high', label: 'High', icon: '🟠' },
    { value: 'urgent', label: 'Urgent', icon: '🔴' },
  ]

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-primary/10 p-4 rounded-2xl mb-6">
            <Plus className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight leading-tight">
                Create New Task
              </CardTitle>
              <CardDescription className="text-lg">
                Define task details and assign to your team
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, descriptive task title"
                  className="h-14 text-lg placeholder:text-muted-foreground/70"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about what needs to be accomplished
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about this task, requirements, context, and success criteria..."
                  className="min-h-[120px] text-base placeholder:text-muted-foreground/70"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Include acceptance criteria and any relevant details
                </p>
              </div>

              <Separator />

              {/* Priority & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Priority */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Priority
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {priorityOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.priority === option.value ? "default" : "outline"}
                        className={`h-14 justify-start gap-3 capitalize ${formData.priority === option.value ? 'shadow-lg shadow-primary/20' : ''}`}
                        onClick={() => setFormData({ ...formData, priority: option.value })}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Initial Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="h-14">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date & Tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Due Date */}
                <div className="space-y-3">
                  <Label htmlFor="due_date" className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="due_date"
                      name="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={handleChange}
                      className="h-14 text-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Optional. Tasks without due dates won't appear in deadline views
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Tags
                  </Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Press Enter to add tag"
                        className="flex-1 h-12"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addTag}
                        className="h-12 aspect-square p-0"
                        disabled={!tagInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="group relative px-3 py-1.5 text-xs font-medium"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-primary animate-spin rounded-full mr-2" />
                      Creating Task...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 px-8 text-base"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
