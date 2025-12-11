'use client'


import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'


export default function CampaignLeadsPage() {
  const { id } = useParams()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  async function fetchLeads() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${id}/leads`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setLeads(data)
      } else {
        setLeads([])
      }
    } catch (error) {
      setLeads([])
    }
    setLoading(false)
  }


  useEffect(() => {
    fetchLeads()
  }, [id])


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leads for Campaign</h1>


      {loading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <p>No leads found for this campaign.</p>
      ) : (
        <table className="w-full border-collapse border border-slate-200">
          <thead>
            <tr>
              <th className="border border-slate-300 px-4 py-2">Name</th>
              <th className="border border-slate-300 px-4 py-2">Email</th>
              <th className="border border-slate-300 px-4 py-2">Phone</th>
              <th className="border border-slate-300 px-4 py-2">Status</th>
              <th className="border border-slate-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="border border-slate-300 px-4 py-2">{lead.name}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.email}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.phone}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.status}</td>
                <td className="border border-slate-300 px-4 py-2">
                  <Link href={`/leads/${lead.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
