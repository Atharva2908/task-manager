'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LeadDetailPage() {
  const { id } = useParams()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchLead() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setLead(data)
      } else {
        setLead(null)
      }
    } catch (error) {
      setLead(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLead()
  }, [id])

  if (loading) return <p>Loading lead details...</p>
  if (!lead) return <p>Lead not found.</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{lead.name}</h1>
      <p>Email: {lead.email}</p>
      <p>Phone: {lead.phone}</p>
      <p>Company: {lead.company}</p>
      <p>Status: {lead.status}</p>
      <p>Source: {lead.source}</p>
      <p>Notes: {lead.notes}</p>
      <div className="mt-6 space-x-4">
        <Link href={`/leads/${id}/edit`}>
          <Button>Edit Lead</Button>
        </Link>
        <Button variant={"destructive"} onClick={() => alert("Delete functionality not implemented")}>Delete Lead</Button>
      </div>
    </div>
  )
}
