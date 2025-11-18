'use client'

import React from 'react'

interface Metric {
  date: string
  daily_calling_target: number
  daily_data_target: number
  achieved_calling_count: number
  achieved_data_count: number
  qualified_calling: number
  qualified_data: number
  disqualified_calling: number
  disqualified_data: number
}

interface Props {
  metrics: Metric[]
}

export function DailyMetricsHistory({ metrics }: Props) {
  if (!metrics.length) {
    return <p className="p-4">No historical data available.</p>
  }
  return (
    <table className="w-full border-collapse border border-slate-200">
      <thead>
        <tr>
          <th className="border border-slate-300 px-2 py-1">Date</th>
          <th className="border border-slate-300 px-2 py-1">Calling Target</th>
          <th className="border border-slate-300 px-2 py-1">Data Target</th>
          <th className="border border-slate-300 px-2 py-1">Calling Achieved</th>
          <th className="border border-slate-300 px-2 py-1">Data Achieved</th>
          <th className="border border-slate-300 px-2 py-1">Qualified Calling</th>
          <th className="border border-slate-300 px-2 py-1">Qualified Data</th>
          <th className="border border-slate-300 px-2 py-1">Disqualified Calling</th>
          <th className="border border-slate-300 px-2 py-1">Disqualified Data</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((m) => (
          <tr key={m.date}>
            <td className="border border-slate-300 px-2 py-1">{m.date}</td>
            <td className="border border-slate-300 px-2 py-1">{m.daily_calling_target}</td>
            <td className="border border-slate-300 px-2 py-1">{m.daily_data_target}</td>
            <td className="border border-slate-300 px-2 py-1">{m.achieved_calling_count}</td>
            <td className="border border-slate-300 px-2 py-1">{m.achieved_data_count}</td>
            <td className="border border-slate-300 px-2 py-1">{m.qualified_calling}</td>
            <td className="border border-slate-300 px-2 py-1">{m.qualified_data}</td>
            <td className="border border-slate-300 px-2 py-1">{m.disqualified_calling}</td>
            <td className="border border-slate-300 px-2 py-1">{m.disqualified_data}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
