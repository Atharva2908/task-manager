'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const campaignTypes = [
  'calling',
  'data_entry',
  'mixed',
  'email',
  'social_media',
]

interface CampaignFormProps {
  initialData?: any
  onSubmit: (data: any) => void
}

export function CampaignForm({ initialData, onSubmit }: CampaignFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    campaign_type: initialData?.campaign_type || 'calling',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    budget: initialData?.budget || '',
  })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleTypeChange(value: string) {
    setForm({ ...form, campaign_type: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-lg mx-auto p-8 border rounded-lg shadow-sm bg-white dark:bg-gray-900"
    >
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {initialData ? 'Edit Campaign' : 'Create Campaign'}
      </h2>

      <div>
        <label
          htmlFor="name"
          className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
        >
          Campaign Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Campaign Name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <Input
          id="description"
          name="description"
          type="text"
          placeholder="Short description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="campaign_type"
          className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
        >
          Campaign Type
        </label>
        <Select
          value={form.campaign_type}
          onValueChange={handleTypeChange}
          name="campaign_type"
          aria-label="Select Campaign Type"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Campaign Type" />
          </SelectTrigger>
          <SelectContent>
            {campaignTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="start_date"
            className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
          >
            Start Date <span className="text-red-500">*</span>
          </label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            htmlFor="end_date"
            className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
          >
            End Date
          </label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="budget"
          className="block mb-1 font-medium text-gray-700 dark:text-gray-300"
        >
          Budget
        </label>
        <Input
          id="budget"
          name="budget"
          type="number"
          min={0}
          placeholder="Campaign budget"
          value={form.budget}
          onChange={handleChange}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-3 font-semibold"
      >
        {submitting ? 'Saving…' : 'Save Campaign'}
      </Button>
    </form>
  )
}
