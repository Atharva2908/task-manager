import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description?: string
    campaign_type: string
    status: string
  }
}

const STATUS_COLORS: { [key: string]: string } = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-800',
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const statusClass = STATUS_COLORS[campaign.status.toLowerCase()] || 'bg-gray-100 text-gray-600'

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-lg transition duration-300 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
          {campaign.status}
        </span>
      </div>

      {campaign.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{campaign.description}</p>
      )}

      <div className="flex justify-between items-center">
        <span className="italic text-sm text-gray-500 dark:text-gray-400 capitalize">
          Type: {campaign.campaign_type.replace('_', ' ')}
        </span>
        <Link href={`/campaigns/${campaign.id}`}>
          <Button size="sm" variant="outline" className="hover:shadow-md transition">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
