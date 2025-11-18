import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { LeadCreateSchema } from '@/types'

interface LeadFormProps {
  defaultValues?: Partial<LeadCreateSchema>
  onSubmit: (data: LeadCreateSchema) => void
}

export function LeadForm({ defaultValues, onSubmit }: LeadFormProps) {
  const { register, handleSubmit } = useForm<LeadCreateSchema>({
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('name')} placeholder="Name" required />
      <Input type="email" {...register('email')} placeholder="Email" />
      <Input {...register('phone')} placeholder="Phone" />
      <Input {...register('company')} placeholder="Company" />
      <Select {...register('source')}>
        <SelectTrigger>
          <SelectValue placeholder="Select Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="calling">Calling</SelectItem>
          <SelectItem value="data_entry">Data Entry</SelectItem>
          <SelectItem value="website">Website</SelectItem>
          <SelectItem value="referral">Referral</SelectItem>
          <SelectItem value="social_media">Social Media</SelectItem>
          <SelectItem value="email_campaign">Email Campaign</SelectItem>
          <SelectItem value="event">Event</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Submit</Button>
    </form>
  )
}
