'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const leadSources = [
  "calling", "data_entry", "website", "referral", "social_media", "email_campaign", "event", "other",
]

const leadStatuses = [
  "new", "contacted", "qualified", "disqualified", "converted",
]

export default function EditLeadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'calling',
    status: 'new'
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function fetchLead() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const data = await res.json()
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        source: data.source || 'calling',
        status: data.status || 'new',
      })
    } catch (error) {
      console.error('Failed to load lead:', error)
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSourceChange(value: string) {
    setForm({ ...form, source: value })
  }

  function handleStatusChange(value: string) {
    setForm({ ...form, status: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push(`/leads/${id}`)
      } else {
        alert('Failed to update lead')
      }
    } catch (error) {
      alert('Failed to update lead')
    }
    setSubmitting(false)
  }

  useEffect(() => {
    fetchLead()
  }, [id])

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Lead</h1>
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

        <Select value={form.source} onValueChange={handleSourceChange}>
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

        <Select value={form.status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Lead Status" />
          </SelectTrigger>
          <SelectContent>
            {leadStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
