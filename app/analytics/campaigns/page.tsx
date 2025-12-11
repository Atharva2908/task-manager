'use client'


import { useState, useEffect } from 'react'


export default function CampaignAnalyticsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  async function fetchCampaigns() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/campaigns/overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Failed to fetch campaign analytics:', error)
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchCampaigns()
  }, [])


  if (loading) return <p>Loading campaign analytics...</p>
  if (campaigns.length === 0) return <p>No campaigns found.</p>


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Campaign Analytics Overview</h1>


      <table className="w-full border-collapse border border-slate-200">
        <thead>
          <tr>
            <th className="border border-slate-300 px-4 py-2">Name</th>
            <th className="border border-slate-300 px-4 py-2">Type</th>
            <th className="border border-slate-300 px-4 py-2">Status</th>
            <th className="border border-slate-300 px-4 py-2">Total Leads</th>
            <th className="border border-slate-300 px-4 py-2">Qualified Leads</th>
            <th className="border border-slate-300 px-4 py-2">Conversion Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.campaign_id}>
              <td className="border border-slate-300 px-4 py-2">{c.campaign_name}</td>
              <td className="border border-slate-300 px-4 py-2">{c.campaign_type}</td>
              <td className="border border-slate-300 px-4 py-2">{c.status}</td>
              <td className="border border-slate-300 px-4 py-2">{c.total_leads}</td>
              <td className="border border-slate-300 px-4 py-2">{c.qualified_leads}</td>
              <td className="border border-slate-300 px-4 py-2">{c.conversion_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
