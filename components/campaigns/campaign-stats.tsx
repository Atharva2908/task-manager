import React from 'react'

interface StatItem {
  label: string
  value: number | string
}

interface CampaignStatsProps {
  stats: StatItem[]
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-4 border rounded-md">
      {stats.map(({ label, value }) => (
        <div key={label} className="border p-2 rounded shadow-sm">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-lg">{value}</p>
        </div>
      ))}
    </div>
  )
}
