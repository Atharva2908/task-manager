'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const leadSources = [
  "calling", "data_entry", "website", "referral", "social_media", "email_campaign", "event", "other",
]

export default function CreateLeadPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'calling',
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSourceChange(value: string) {
    setForm({ ...form, source: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/leads')
      } else {
        alert('Failed to create lead')
      }
    } catch (error) {
      alert('Failed to create lead')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Lead</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="name"
          placeholder="Lead Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <Input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <Input type="text" name="company" placeholder="Company" value={form.company} onChange={handleChange} />
        <Select onValueChange={handleSourceChange} value={form.source}>
          <SelectTrigger>
            <SelectValue placeholder="Select Lead Source" />
          </SelectTrigger>
          <SelectContent>
            {leadSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Create Lead'}
        </Button>
      </form>
    </div>
  )
}
