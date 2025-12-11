'use client'


import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'


export default function CampaignSettingsPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    budget: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()


  async function fetchCampaign() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setCampaign(data)
        setForm({
          name: data.name,
          description: data.description || '',
          budget: data.budget ? data.budget.toString() : ''
        })
      } else {
        setCampaign(null)
      }
    } catch (error) {
      setCampaign(null)
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchCampaign()
  }, [id])


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          budget: parseFloat(form.budget)
        })
      })
      if (res.ok) {
        router.push(`/campaigns/${id}`)
      } else {
        alert('Failed to update campaign')
      }
    } catch (error) {
      alert('Failed to update campaign')
    }
    setSubmitting(false)
  }


  if (loading) return <p>Loading...</p>
  if (!campaign) return <p>Campaign not found.</p>


  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Campaign Settings</h1>
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
        <Input
          type="number"
          name="budget"
          placeholder="Budget"
          value={form.budget}
          onChange={handleChange}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
