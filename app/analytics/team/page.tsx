'use client'


import { useState, useEffect } from 'react'


export default function TeamPerformancePage() {
  const [performance, setPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  async function fetchPerformance() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/team/performance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
      })
      const data = await res.json()
      setPerformance(data.team_performance || [])
    } catch (error) {
      console.error('Failed to fetch team performance:', error)
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchPerformance()
  }, [])


  if (loading) return <p>Loading team performance...</p>
  if (performance.length === 0) return <p>No performance data available.</p>


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Team Performance Metrics</h1>


      <table className="w-full border-collapse border border-slate-200">
        <thead>
          <tr>
            <th className="border border-slate-300 px-4 py-2">Team Member</th>
            <th className="border border-slate-300 px-4 py-2">Total Leads</th>
            <th className="border border-slate-300 px-4 py-2">Qualified</th>
            <th className="border border-slate-300 px-4 py-2">Disqualified</th>
            <th className="border border-slate-300 px-4 py-2">Conversion Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((p) => (
            <tr key={p._id}>
              <td className="border border-slate-300 px-4 py-2">{p.user_name || 'Unknown'}</td>
              <td className="border border-slate-300 px-4 py-2">{p.total_leads}</td>
              <td className="border border-slate-300 px-4 py-2">{p.qualified}</td>
              <td className="border border-slate-300 px-4 py-2">{p.disqualified}</td>
              <td className="border border-slate-300 px-4 py-2">{p.conversion_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
