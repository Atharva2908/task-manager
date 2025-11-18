'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append('search', search)
      }
      const res = await fetch(`/api/leads?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const data = await res.json()
      setLeads(data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [search])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Link href="/leads/create" passHref>
          <Button>Add Lead</Button>
        </Link>
      </div>

      <Input
        placeholder="Search leads by name, email, phone, or company"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-md"
      />

      {loading ? (
        <p>Loading leads...</p>
      ) : (
        <table className="w-full border-collapse border border-slate-200">
          <thead>
            <tr>
              <th className="border border-slate-300 px-4 py-2">Name</th>
              <th className="border border-slate-300 px-4 py-2">Email</th>
              <th className="border border-slate-300 px-4 py-2">Phone</th>
              <th className="border border-slate-300 px-4 py-2">Company</th>
              <th className="border border-slate-300 px-4 py-2">Status</th>
              <th className="border border-slate-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No leads found.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="border border-slate-300 px-4 py-2">{lead.name}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.email}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.phone}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.company}</td>
                <td className="border border-slate-300 px-4 py-2">{lead.status}</td>
                <td className="border border-slate-300 px-4 py-2">
                  <Link href={`/leads/${lead.id}`}>
                    <a className="text-blue-600 hover:underline">View</a>
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
