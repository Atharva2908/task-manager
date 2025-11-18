'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function DailyMetricsSubmitPage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [metrics, setMetrics] = useState<any>(null)
  const [achievedCalling, setAchievedCalling] = useState(0)
  const [achievedData, setAchievedData] = useState(0)
  const [qualifiedCalling, setQualifiedCalling] = useState(0)
  const [qualifiedData, setQualifiedData] = useState(0)
  const [disqualifiedCalling, setDisqualifiedCalling] = useState(0)
  const [disqualifiedData, setDisqualifiedData] = useState(0)
  const [disqualificationReasons, setDisqualificationReasons] = useState<{ [key: string]: number }>({})
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

  useEffect(() => {
    if (!selectedCampaign) return
    async function fetchMetrics() {
      const res = await fetch(`/api/daily-metrics/campaigns/${selectedCampaign}/daily_metrics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
        setAchievedCalling(data.achieved_calling_count || 0)
        setAchievedData(data.achieved_data_count || 0)
        setQualifiedCalling(data.qualified_calling || 0)
        setQualifiedData(data.qualified_data || 0)
        setDisqualifiedCalling(data.disqualified_calling || 0)
        setDisqualifiedData(data.disqualified_data || 0)
        setDisqualificationReasons(data.disqualification_reasons || {})
      }
    }
    fetchMetrics()
  }, [selectedCampaign])

  function handleReasonChange(reason: string, value: number) {
    setDisqualificationReasons((prev) => ({ ...prev, [reason]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCampaign) return alert('Select a campaign')
    setSubmitting(true)
    const body = {
      achieved_calling_count: achievedCalling,
      achieved_data_count: achievedData,
      qualified_calling: qualifiedCalling,
      qualified_data: qualifiedData,
      disqualified_calling: disqualifiedCalling,
      disqualified_data: disqualifiedData,
      disqualification_reasons: disqualificationReasons,
      date: metrics?.date,
    }
    try {
      const res = await fetch(`/api/daily-metrics/campaigns/${selectedCampaign}/daily_metrics/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        alert('Metrics submitted successfully')
        router.push('/daily-metrics/approve')
      } else {
        alert('Failed to submit metrics')
      }
    } catch {
      alert('Failed to submit metrics')
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Submit Daily Achieved Counts & Lead Outcomes</h1>

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
        min={0}
        value={achievedCalling}
        onChange={(e) => setAchievedCalling(parseInt(e.target.value))}
        placeholder="Achieved Calling Count"
        required
      />
      <Input
        type="number"
        min={0}
        value={achievedData}
        onChange={(e) => setAchievedData(parseInt(e.target.value))}
        placeholder="Achieved Data Count"
        required
      />
      <Input
        type="number"
        min={0}
        value={qualifiedCalling}
        onChange={(e) => setQualifiedCalling(parseInt(e.target.value))}
        placeholder="Qualified Leads (Calling)"
        required
      />
      <Input
        type="number"
        min={0}
        value={qualifiedData}
        onChange={(e) => setQualifiedData(parseInt(e.target.value))}
        placeholder="Qualified Leads (Data)"
        required
      />
      <Input
        type="number"
        min={0}
        value={disqualifiedCalling}
        onChange={(e) => setDisqualifiedCalling(parseInt(e.target.value))}
        placeholder="Disqualified Leads (Calling)"
        required
      />
      <Input
        type="number"
        min={0}
        value={disqualifiedData}
        onChange={(e) => setDisqualifiedData(parseInt(e.target.value))}
        placeholder="Disqualified Leads (Data)"
        required
      />

      {/* Disqualification Reasons input as key-value pairs */}
      {/* For simplicity, using JSON input */}
      <textarea
        rows={4}
        placeholder='Enter disqualification reasons as JSON, e.g. {"no_answer":5, "invalid_contact":2}'
        value={JSON.stringify(disqualificationReasons)}
        onChange={(e) => {
          try {
            const val = JSON.parse(e.target.value)
            setDisqualificationReasons(val)
          } catch {}
        }}
        className="w-full p-2 border rounded"
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Metrics'}
      </Button>
    </form>
  )
}
