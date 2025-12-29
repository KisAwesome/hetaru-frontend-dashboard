'use client'

import { useState, useEffect } from 'react'
import { Zap, Lock, TrendingUp, ArrowRight, X, Heart, Sparkles, History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AIServiceTester } from './ai-service-tester'

interface Service {
  id: string
  name: string
  description: string
  creditCost: number
  category: string
  popularity: number
  icon: string
}

const SERVICES: Service[] = [
  {
    id: 'img-gen',
    name: 'Image Generation',
    description: 'Create AI-powered images from text descriptions',
    creditCost: 150,
    category: 'AI',
    popularity: 95,
    icon: '🎨',
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Analyze sentiment, extract entities, and more',
    creditCost: 25,
    category: 'NLP',
    popularity: 87,
    icon: '📝',
  },
  {
    id: 'recipe-gpt',
    name: 'Recipe GPT',
    description: 'Generate personalized recipes based on ingredients',
    creditCost: 50,
    category: 'Lifestyle',
    popularity: 72,
    icon: '👨‍🍳',
  },
  {
    id: 'calorie-counter',
    name: 'Calorie Counter',
    description: 'Analyze food and calculate nutritional information',
    creditCost: 40,
    category: 'Health',
    popularity: 81,
    icon: '🍎',
  },
  {
    id: 'meal-planner',
    name: 'Meal Planner',
    description: 'AI-powered meal planning and grocery lists',
    creditCost: 75,
    category: 'Lifestyle',
    popularity: 68,
    icon: '📅',
  },
  {
    id: 'code-gen',
    name: 'Code Generator',
    description: 'Generate code snippets and solutions',
    creditCost: 100,
    category: 'Development',
    popularity: 92,
    icon: '💻',
  },
  {
    id: 'summarizer',
    name: 'Text Summarizer',
    description: 'Summarize long documents into key points',
    creditCost: 30,
    category: 'NLP',
    popularity: 88,
    icon: '📋',
  },
  {
    id: 'translation',
    name: 'Multi-Language Translator',
    description: 'Translate text between 100+ languages',
    creditCost: 20,
    category: 'NLP',
    popularity: 85,
    icon: '🌐',
  },
  {
    id: 'music-gen',
    name: 'Music Generator',
    description: 'Generate royalty-free music compositions',
    creditCost: 200,
    category: 'Creative',
    popularity: 76,
    icon: '🎵',
  },
  {
    id: 'video-edit',
    name: 'Video Editor AI',
    description: 'Auto-edit and generate video content',
    creditCost: 250,
    category: 'Creative',
    popularity: 71,
    icon: '🎬',
  },
  {
    id: 'voice-clone',
    name: 'Voice Cloning',
    description: 'Clone and synthesize realistic voices',
    creditCost: 120,
    category: 'Audio',
    popularity: 83,
    icon: '🎤',
  },
  {
    id: 'fitness-coach',
    name: 'AI Fitness Coach',
    description: 'Get personalized workout and nutrition plans',
    creditCost: 60,
    category: 'Health',
    popularity: 78,
    icon: '💪',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Generate blog posts, articles, and copy',
    creditCost: 45,
    category: 'Writing',
    popularity: 89,
    icon: '✍️',
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    description: 'Optimize content for search engines',
    creditCost: 35,
    category: 'Marketing',
    popularity: 82,
    icon: '🔍',
  },
  {
    id: 'chatbot-builder',
    name: 'Chatbot Builder',
    description: 'Create intelligent chatbots for customer support',
    creditCost: 80,
    category: 'Development',
    popularity: 79,
    icon: '🤖',
  },
]

const getServiceOfDay = (): Service => {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SERVICES[seed % SERVICES.length]
}

export function ServiceCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentServices, setRecentServices] = useState<string[]>([])
  const [serviceOfDay] = useState<Service>(getServiceOfDay())
  
  const userId = 'user@example.com'

  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites_${userId}`)
    const savedRecent = localStorage.getItem(`recent_${userId}`)
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedRecent) setRecentServices(JSON.parse(savedRecent))
  }, [])

  const toggleFavorite = (serviceId: string) => {
    const updated = favorites.includes(serviceId)
      ? favorites.filter(id => id !== serviceId)
      : [...favorites, serviceId]
    
    setFavorites(updated)
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(updated))
  }

  const addToRecent = (serviceId: string) => {
    const filtered = recentServices.filter(id => id !== serviceId)
    const updated = [serviceId, ...filtered].slice(0, 5)
    
    setRecentServices(updated)
    localStorage.setItem(`recent_${userId}`, JSON.stringify(updated))
  }

  const categories = ['All', ...new Set(SERVICES.map(s => s.category))]

  const filteredServices = SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const favoriteServices = SERVICES.filter(s => favorites.includes(s.id))
  const recentServicesData = SERVICES.filter(s => recentServices.includes(s.id))

  if (selectedService) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedService(null)}
          className="mb-4"
        >
          <X className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
        <AIServiceTesterWithTracking
          userId={userId}
          serviceName={selectedService.name}
          creditCost={selectedService.creditCost}
          serviceId={selectedService.id}
          onUseService={() => addToRecent(selectedService.id)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Service of the Day</CardTitle>
                <CardDescription>Save 20% on featured service</CardDescription>
              </div>
            </div>
            <span className="text-3xl">{serviceOfDay.icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{serviceOfDay.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{serviceOfDay.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary flex items-center gap-1">
                <Zap className="w-5 h-5" />
                {Math.floor(serviceOfDay.creditCost * 0.8)}
              </div>
              <p className="text-xs text-muted-foreground line-through">{serviceOfDay.creditCost}</p>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedService(serviceOfDay)
                  addToRecent(serviceOfDay.id)
                }}
                className="mt-2"
              >
                Try Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {recentServicesData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Recently Used</h3>
            <span className="text-xs text-muted-foreground">({recentServicesData.length})</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-2">
            {recentServicesData.map(service => (
              <Card
                key={service.id}
                className="cursor-pointer hover:border-primary/50 transition"
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <p className="text-xs font-medium line-clamp-2">{service.name}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> {service.creditCost}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {favoriteServices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive fill-current" />
            <h3 className="text-sm font-semibold">Your Favorites</h3>
            <span className="text-xs text-muted-foreground">({favoriteServices.length})</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isFavorite={true}
                onToggleFavorite={() => toggleFavorite(service.id)}
                onClick={() => setSelectedService(service)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            isFavorite={favorites.includes(service.id)}
            onToggleFavorite={() => toggleFavorite(service.id)}
            onClick={() => setSelectedService(service)}
          />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No services found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  )
}

interface ServiceCardProps {
  service: Service
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick: () => void
}

function ServiceCard({ service, isFavorite, onToggleFavorite, onClick }: ServiceCardProps) {
  return (
    <Card className="hover:border-primary/50 transition flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="text-3xl">{service.icon}</div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="p-1.5 hover:bg-secondary rounded-lg transition"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Cost per call</span>
            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3" />
              {service.popularity}%
            </div>
          </div>
          <span className="text-lg font-bold flex items-center gap-1">
            <Zap className="w-4 h-4 text-primary" />
            {service.creditCost}
          </span>
        </div>
        <Button className="w-full group" onClick={onClick}>
          Try Service
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
        </Button>
      </CardContent>
    </Card>
  )
}

interface AIServiceTesterWithTrackingProps {
  userId: string
  serviceName: string
  creditCost: number
  serviceId: string
  onUseService: () => void
}

function AIServiceTesterWithTracking({
  userId,
  serviceName,
  creditCost,
  serviceId,
  onUseService,
}: AIServiceTesterWithTrackingProps) {
  return (
    <AIServiceTester
      userId={userId}
      serviceName={serviceName}
      creditCost={creditCost}
      serviceId={serviceId}
      onServiceUsed={onUseService}
    />
  )
}
