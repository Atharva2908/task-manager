'use client'


import { useState, useEffect } from 'react'


export default function LeadAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)


  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/leads/overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
      })
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch lead analytics:', error)
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchAnalytics()
  }, [])


  if (loading) return <p>Loading analytics...</p>
  if (!data) return <p>No analytics data available.</p>


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lead Analytics Overview</h1>


      <section className="mb-6">
        <h2 className="font-semibold mb-2">Total Leads</h2>
        <p className="text-lg">{data.total_leads}</p>
      </section>


      <section className="mb-6">
        <h2 className="font-semibold mb-2">Status Breakdown</h2>
        <ul>
          {data.status_breakdown.map((item: any) => (
            <li key={item._id}>
              {item._id}: {item.count}
            </li>
          ))}
        </ul>
      </section>


      <section className="mb-6">
        <h2 className="font-semibold mb-2">Lead Sources</h2>
        <ul>
          {data.source_breakdown.map((item: any) => (
            <li key={item._id}>
              {item._id}: {item.count}
            </li>
          ))}
        </ul>
      </section>


      <section className="mb-6">
        <h2 className="font-semibold mb-2">Disqualification Reasons</h2>
        <ul>
          {data.disqualification_reasons.map((item: any) => (
            <li key={item._id}>
              {item._id}: {item.count}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
