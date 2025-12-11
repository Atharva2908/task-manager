'use client'


import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


const campaignTypes = [
  "calling",
  "data_entry",
  "mixed",
  "email",
  "social_media"
]


export default function CreateCampaignPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    campaign_type: 'calling',
    start_date: '',
    end_date: '',
    budget: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  function handleTypeChange(value: string) {
    setForm({ ...form, campaign_type: value })
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          start_date: new Date(form.start_date).toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        })
      })
      if (res.ok) {
        router.push('/campaigns')
      } else {
        alert('Failed to create campaign')
      }
    } catch (error) {
      alert('Failed to create campaign')
    }


    setSubmitting(false)
  }


  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="name"
          placeholder="Campaign Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <Select onValueChange={handleTypeChange} value={form.campaign_type}>
          <SelectTrigger>
            <SelectValue placeholder="Select Campaign Type" />
          </SelectTrigger>
          <SelectContent>
            {campaignTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
        />
        <Input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="budget"
          placeholder="Budget"
          value={form.budget}
          onChange={handleChange}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Create Campaign'}
        </Button>
      </form>
    </div>
  )
}
