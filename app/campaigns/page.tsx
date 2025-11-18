'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      const data = await res.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/campaigns/create" passHref>
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading campaigns...</p>
      ) : (
        <div className="space-y-6">
          {campaigns.length === 0 && <p>No campaigns found.</p>}
          {campaigns.map((campaign) => {
            const today = new Date().toISOString().split('T')[0]
            const todayTarget = campaign.daily_targets?.find((t: any) => t.date === today)

            const dataProgress = todayTarget
              ? (todayTarget.data_achieved / todayTarget.data_target) * 100 || 0
              : 0
            const callingProgress = todayTarget
              ? (todayTarget.calling_achieved / todayTarget.calling_target) * 100 || 0
              : 0

            return (
              <div
                key={campaign.id}
                className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{campaign.name}</h2>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>

                <div className="text-sm mb-2">{campaign.description}</div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Data Entry</span>
                      <span>
                        {todayTarget?.data_achieved || 0} / {todayTarget?.data_target || 0}
                      </span>
                    </div>
                    <Progress value={dataProgress} className="h-2 rounded" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Calling</span>
                      <span>
                        {todayTarget?.calling_achieved || 0} / {todayTarget?.calling_target || 0}
                      </span>
                    </div>
                    <Progress value={callingProgress} className="h-2 rounded" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
