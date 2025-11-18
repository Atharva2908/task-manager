import React from 'react'
import { Progress } from '@/components/ui/progress'

interface TargetProgressProps {
  dataAchieved: number
  dataTarget: number
  callingAchieved: number
  callingTarget: number
}

export function TargetProgress({ dataAchieved, dataTarget, callingAchieved, callingTarget }: TargetProgressProps) {
  const dataPercent = dataTarget > 0 ? (dataAchieved / dataTarget) * 100 : 0
  const callingPercent = callingTarget > 0 ? (callingAchieved / callingTarget) * 100 : 0

  return (
    <div className="space-y-4 max-w-md mx-auto p-4 border rounded-md">
      <div>
        <p className="mb-1">Data Entry: {dataAchieved} / {dataTarget}</p>
        <Progress value={dataPercent} />
      </div>
      <div>
        <p className="mb-1">Calling: {callingAchieved} / {callingTarget}</p>
        <Progress value={callingPercent} />
      </div>
    </div>
  )
}
