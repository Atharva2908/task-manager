'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function DailyMetricsCreatePage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [callingTarget, setCallingTarget] = useState(0)
  const [dataTarget, setDataTarget] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchCampaigns() {
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
      const data = await res.json()
      setCampaigns(data)
    }
    fetchCampaigns()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCampaign) return alert('Select a campaign')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/daily-metrics/campaigns/${selectedCampaign}/daily_metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          daily_calling_target: callingTarget,
          daily_data_target: dataTarget,
        }),
      })
      if (res.ok) {
        alert('Daily targets created')
        router.push('/daily-metrics/submit')
      } else {
        alert('Failed to create targets')
      }
    } catch (err) {
      alert('Failed to create targets')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Create Daily Campaign Metrics</h1>

      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
        <SelectTrigger>
          <SelectValue placeholder="Select Campaign" />
        </SelectTrigger>
        <SelectContent>
          {campaigns.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        value={callingTarget}
        onChange={(e) => setCallingTarget(parseInt(e.target.value))}
        placeholder="Daily Calling Target"
        min={0}
        required
      />
      <Input
        type="number"
        value={dataTarget}
        onChange={(e) => setDataTarget(parseInt(e.target.value))}
        placeholder="Daily Data Target"
        min={0}
        required
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Targets'}
      </Button>
    </form>
  )
}
