'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'


export default function DailyMetricsApprovePage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [metrics, setMetrics] = useState<any>(null)
  const [approving, setApproving] = useState(false)
  const router = useRouter()


  useEffect(() => {
    async function fetchCampaigns() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
      })
      const data = await res.json()
      setCampaigns(data)
    }
    fetchCampaigns()
  }, [])


  useEffect(() => {
    if (!selectedCampaign) return
    async function fetchMetrics() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/daily-metrics/campaigns/${selectedCampaign}/daily_metrics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    }
    fetchMetrics()
  }, [selectedCampaign])


  async function handleApprove() {
    if (!selectedCampaign) return alert('Select a campaign')
    setApproving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/daily-metrics/campaigns/${selectedCampaign}/daily_metrics/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
      })
      if (res.ok) {
        alert('Metrics approved')
        router.push('/daily-metrics/history')
      } else {
        alert('Approval failed')
      }
    } catch {
      alert('Approval failed')
    }
    setApproving(false)
  }


  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Approve Daily Campaign Metrics</h1>


      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
        <SelectTrigger>
          <SelectValue placeholder="Select Campaign" />
        </SelectTrigger>
        <SelectContent>
          {campaigns.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>


      {metrics && (
        <div className="space-y-2 mt-4">
          <p>Calling Target: {metrics.daily_calling_target}</p>
          <p>Data Target: {metrics.daily_data_target}</p>
          <p>Calling Achieved: {metrics.achieved_calling_count || 0}</p>
          <p>Data Achieved: {metrics.achieved_data_count || 0}</p>
          <p>Qualified Calling: {metrics.qualified_calling || 0}</p>
          <p>Qualified Data: {metrics.qualified_data || 0}</p>
          <p>Disqualified Calling: {metrics.disqualified_calling || 0}</p>
          <p>Disqualified Data: {metrics.disqualified_data || 0}</p>
          <p>Disqualification Reasons: {JSON.stringify(metrics.disqualification_reasons)}</p>
          {/* Optional: Disable inputs after approval if implementing locking */}
        </div>
      )}


      <Button onClick={handleApprove} disabled={approving || !metrics}>
        {approving ? 'Approving…' : 'Approve Metrics'}
      </Button>
    </div>
  )
}
