'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, AtSign, Paperclip } from 'lucide-react'

interface CommentEditorProps {
  taskId: string
  onCommentSubmit?: (comment: any) => void
  collaborators?: string[]
}

export default function CommentEditor({ taskId, onCommentSubmit, collaborators = [] }: CommentEditorProps) {
  const [content, setContent] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)

    if (text.includes('@')) {
      setShowMentions(true)
    }
  }

  const addMention = (name: string) => {
    if (!mentions.includes(name)) {
      setMentions([...mentions, name])
      setContent(content + `@${name} `)
    }
    setShowMentions(false)
  }

  const removeMention = (name: string) => {
    setMentions(mentions.filter((m) => m !== name))
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      setAttachedFiles(Array.from(files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      formData.append('task_id', taskId)
      formData.append('content', content)
      formData.append('mentions', JSON.stringify(mentions))

      attachedFiles.forEach((file) => {
        formData.append('attachments', file)
      })

      const response = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const comment = await response.json()
        if (onCommentSubmit) {
          onCommentSubmit(comment)
        }
        setContent('')
        setMentions([])
        setAttachedFiles([])
      }
    } catch (error) {
      console.error('[v0] Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-4 bg-slate-800 border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Add a comment... Use @name to mention someone"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
          />

          {showMentions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {collaborators.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addMention(name)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-slate-600 flex items-center gap-2 text-sm"
                >
                  <AtSign className="w-4 h-4 text-slate-400" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {mentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mentions.map((mention) => (
              <Badge
                key={mention}
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-2 cursor-pointer"
                onClick={() => removeMention(mention)}
              >
                @{mention}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-slate-400 hover:text-slate-300">
            <input type="file" multiple onChange={handleFileAdd} className="hidden" />
            <Paperclip className="w-4 h-4" />
          </label>

          <Button
            type="submit"
            disabled={submitting || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </div>

        {attachedFiles.length > 0 && (
          <div className="text-xs text-slate-400 space-y-1">
            {attachedFiles.map((file) => (
              <p key={file.name}>{file.name}</p>
            ))}
          </div>
        )}
      </form>
    </Card>
  )
}
