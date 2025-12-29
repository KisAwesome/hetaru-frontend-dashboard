'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Service {
  id?: string
  name: string
  category: string
  creditCost: number
  description: string
  active: boolean
  usage?: number
}

interface ServiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (service: Service) => void
  initialData?: Service
}

export function ServiceFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState<Service>({
    name: '',
    category: '',
    creditCost: 50,
    description: '',
    active: true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: '',
        category: '',
        creditCost: 50,
        description: '',
        active: true,
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Service' : 'Add New Service'}</CardTitle>
          <CardDescription>
            {initialData
              ? 'Update service details and pricing'
              : 'Create a new AI microservice'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input
                placeholder="e.g., Image Generation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                required
              >
                <option value="">Select category</option>
                <option value="AI">AI</option>
                <option value="NLP">NLP</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Health">Health</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Credit Cost Per Call</label>
              <Input
                type="number"
                placeholder="50"
                value={formData.creditCost}
                onChange={(e) => setFormData({ ...formData, creditCost: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Describe what this service does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm"
                rows={3}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Service is active
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Create'} Service
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
