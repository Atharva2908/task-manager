'use client'

import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

interface FunnelChartProps {
  data: { stage: string; count: number; percentage: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A']

export function LeadFunnelChart({ data }: FunnelChartProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lead Conversion Funnel</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="stage"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  )
}
