'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchCampaign() {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setCampaign(data)
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

  if (loading) return <p>Loading campaign details...</p>
  if (!campaign) return <p>Campaign not found.</p>

  const today = new Date().toISOString().split('T')[0]
  const todayTarget = campaign.daily_targets?.find((t: any) => t.date === today)

  const dataProgress = todayTarget
    ? (todayTarget.data_achieved / todayTarget.data_target) * 100 || 0
    : 0
  const callingProgress = todayTarget
    ? (todayTarget.calling_achieved / todayTarget.calling_target) * 100 || 0
    : 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
      <p className="mb-2">{campaign.description}</p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Data Entry Target</h3>
          <p>
            {todayTarget?.data_achieved || 0} / {todayTarget?.data_target || 0}
          </p>
          <Progress value={dataProgress} className="h-2 rounded" />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Calling Target</h3>
          <p>
            {todayTarget?.calling_achieved || 0} / {todayTarget?.calling_target || 0}
          </p>
          <Progress value={callingProgress} className="h-2 rounded" />
        </div>
      </div>

      <Link href={`/campaigns/${id}/leads`}>
        <Button>View Leads</Button>
      </Link>
    </div>
  )
}
