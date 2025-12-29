'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, BarChart3, Users, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ServiceFormModal } from './service-form-modal'
import { AdminAnalytics } from './admin-analytics'

interface Service {
  id: string
  name: string
  category: string
  creditCost: number
  description: string
  active: boolean
  usage: number
}

const initialServices: Service[] = [
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    category: 'NLP',
    creditCost: 25,
    description: 'Sentiment analysis and entity extraction',
    active: true,
    usage: 1250,
  },
  {
    id: 'img-gen',
    name: 'Image Generation',
    category: 'AI',
    creditCost: 150,
    description: 'Create AI-powered images from text',
    active: true,
    usage: 856,
  },
  {
    id: 'recipe-gpt',
    name: 'Recipe GPT',
    category: 'Lifestyle',
    creditCost: 50,
    description: 'Generate personalized recipes',
    active: true,
    usage: 432,
  },
]

export function AdminDashboard() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [activeTab, setActiveTab] = useState<'services' | 'analytics'>('services')

  const handleAddService = (newService: Omit<Service, 'id' | 'usage'>) => {
    const service: Service = {
      ...newService,
      id: newService.name.toLowerCase().replace(/\s+/g, '-'),
      usage: 0,
    }
    setServices([...services, service])
    setShowModal(false)
  }

  const handleUpdateService = (updatedService: Service) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
    setEditingService(null)
    setShowModal(false)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id))
  }

  const totalActiveServices = services.filter(s => s.active).length
  const totalUsageAllTime = services.reduce((sum, s) => sum + s.usage, 0)
  const avgCreditCost = Math.round(services.reduce((sum, s) => sum + s.creditCost, 0) / services.length)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'services'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="inline w-4 h-4 mr-2" />
          Services
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'analytics'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="inline w-4 h-4 mr-2" />
          Analytics
        </button>
      </div>

      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalActiveServices}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of {services.length} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Credit Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgCreditCost}</div>
                <p className="text-xs text-muted-foreground mt-1">Per service call</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalUsageAllTime.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All-time API calls</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Management</CardTitle>
                  <CardDescription>Manage pricing and status of AI services</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingService(null)
                    setShowModal(true)
                  }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Service Name</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-center py-3 px-4 font-medium">Credit Cost</th>
                      <th className="text-center py-3 px-4 font-medium">Usage</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-3 px-4">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-secondary rounded text-xs">
                            {service.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-primary">{service.creditCost}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-muted-foreground">{service.usage.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              service.active
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {service.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingService(service)
                                setShowModal(true)
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && <AdminAnalytics services={services} />}

      {/* Service Form Modal */}
      <ServiceFormModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={editingService ? handleUpdateService : handleAddService}
        initialData={editingService || undefined}
      />
    </div>
  )
}
