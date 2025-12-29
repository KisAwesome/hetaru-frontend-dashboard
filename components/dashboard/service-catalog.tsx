'use client'

import { useState, useEffect } from 'react'
import { Zap, Lock, TrendingUp, ArrowRight, X, Heart, Sparkles, History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AIServiceTester } from './ai-service-tester'
import { useAuth } from '@/components/firebase-auth-provider'

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
  { id: 'img-gen', name: 'Image Generation', description: 'Create AI-powered images from text descriptions', creditCost: 150, category: 'AI', popularity: 95, icon: '🎨' },
  { id: 'text-analysis', name: 'Text Analysis', description: 'Analyze sentiment, extract entities, and more', creditCost: 25, category: 'NLP', popularity: 87, icon: '📝' },
  { id: 'recipe-gpt', name: 'Recipe GPT', description: 'Generate personalized recipes based on ingredients', creditCost: 50, category: 'Lifestyle', popularity: 72, icon: '👨‍🍳' },
  { id: 'calorie-counter', name: 'Calorie Counter', description: 'Analyze food and calculate nutritional information', creditCost: 40, category: 'Health', popularity: 81, icon: '🍎' },
  { id: 'meal-planner', name: 'Meal Planner', description: 'AI-powered meal planning and grocery lists', creditCost: 75, category: 'Lifestyle', popularity: 68, icon: '📅' },
  { id: 'code-gen', name: 'Code Generator', description: 'Generate code snippets and solutions', creditCost: 100, category: 'Development', popularity: 92, icon: '💻' },
  { id: 'summarizer', name: 'Text Summarizer', description: 'Summarize long documents into key points', creditCost: 30, category: 'NLP', popularity: 88, icon: '📋' },
  { id: 'translation', name: 'Multi-Language Translator', description: 'Translate text between 100+ languages', creditCost: 20, category: 'NLP', popularity: 85, icon: '🌐' },
  { id: 'music-gen', name: 'Music Generator', description: 'Generate royalty-free music compositions', creditCost: 200, category: 'Creative', popularity: 76, icon: '🎵' },
  { id: 'video-edit', name: 'Video Editor AI', description: 'Auto-edit and generate video content', creditCost: 250, category: 'Creative', popularity: 71, icon: '🎬' },
  { id: 'voice-clone', name: 'Voice Cloning', description: 'Clone and synthesize realistic voices', creditCost: 120, category: 'Audio', popularity: 83, icon: '🎤' },
  { id: 'fitness-coach', name: 'AI Fitness Coach', description: 'Get personalized workout and nutrition plans', creditCost: 60, category: 'Health', popularity: 78, icon: '💪' },
  { id: 'content-writer', name: 'Content Writer', description: 'Generate blog posts, articles, and copy', creditCost: 45, category: 'Writing', popularity: 89, icon: '✍️' },
  { id: 'seo-optimizer', name: 'SEO Optimizer', description: 'Optimize content for search engines', creditCost: 35, category: 'Marketing', popularity: 82, icon: '🔍' },
  { id: 'chatbot-builder', name: 'Chatbot Builder', description: 'Create intelligent chatbots for customer support', creditCost: 80, category: 'Development', popularity: 79, icon: '🤖' },
]

const getServiceOfDay = (): Service => {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SERVICES[seed % SERVICES.length]
}

export function ServiceCatalog() {
  const { user, profile } = useAuth()
  const [greeting, setGreeting] = useState("")

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentServices, setRecentServices] = useState<string[]>([])
  const [serviceOfDay] = useState<Service>(getServiceOfDay())

  // 1. Dynamic Greeting Logic
  useEffect(() => {
    const name = profile?.displayName?.split(" ")[0] || "friend"
    const hour = new Date().getHours()

    let message = ""
    if (hour >= 5 && hour < 9) message = `Early morning grinding, ${name}`
    else if (hour >= 9 && hour < 12) message = `Good morning, ${name}. Ready to build?`
    else if (hour >= 12 && hour < 17) message = `Good afternoon, ${name}`
    else if (hour >= 17 && hour < 19) message = `It's golden hour time, ${name}`
    else if (hour >= 19 && hour < 23) message = `Good evening, ${name}`
    else message = `Late night ${name}`
    
    setGreeting(message)
  }, [profile?.displayName])

  // 2. Load User Preferences
  useEffect(() => {
    if (!user?.uid) return
    const savedFavorites = localStorage.getItem(`favorites_${user.uid}`)
    const savedRecent = localStorage.getItem(`recent_${user.uid}`)
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedRecent) setRecentServices(JSON.parse(savedRecent))
  }, [user?.uid])

  const toggleFavorite = (serviceId: string) => {
    if (!user?.uid) return
    const updated = favorites.includes(serviceId)
      ? favorites.filter(id => id !== serviceId)
      : [...favorites, serviceId]
    
    setFavorites(updated)
    localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(updated))
  }

  const addToRecent = (serviceId: string) => {
    if (!user?.uid) return
    const filtered = recentServices.filter(id => id !== serviceId)
    const updated = [serviceId, ...filtered].slice(0, 5)
    
    setRecentServices(updated)
    localStorage.setItem(`recent_${user.uid}`, JSON.stringify(updated))
  }

  const categories = ['All', ...Array.from(new Set(SERVICES.map(s => s.category)))]

  const filteredServices = SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const favoriteServices = SERVICES.filter(s => favorites.includes(s.id))
  const recentServicesData = SERVICES.filter(s => recentServices.includes(s.id))

  // 3. Tester View (If service selected)
  if (selectedService && user) {
    return (
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
        <Button
          variant="ghost"
          onClick={() => setSelectedService(null)}
          className="mb-4 hover:bg-secondary/80"
        >
          <X className="w-4 h-4 mr-2" />
          Back to Service Catalog
        </Button>
        <AIServiceTesterWithTracking
          userId={user.uid}
          serviceName={selectedService.name}
          creditCost={selectedService.creditCost}
          serviceId={selectedService.id}
          onUseService={() => addToRecent(selectedService.id)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ✅ HEADER FIXED: 
         - Negative margins (-mx) pull the border to the sidebar edges.
         - Padding (px) pushes the text back into alignment.
         - max-w-6xl keeps the text aligned with the content below.
      */}
      <div className="-mx-6 md:-mx-8 px-6 md:px-8 border-b border-border pb-2">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground mt-2">
            Explore our AI services or pick up where you left off.
          </p>
        </div>
      </div>

      {/* ✅ CONTENT WRAPPER:
         - Constrains the cards to max-w-6xl so they don't look huge on big screens.
      */}
      <div className="max-w-6xl space-y-8">
        
        {/* Service of the Day */}
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">
              {serviceOfDay.icon}
          </div>
          <CardHeader>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur px-3 py-1 rounded-full border border-border/50">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Service of the Day</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-2xl mb-2">{serviceOfDay.name}</h3>
                <p className="text-muted-foreground max-w-lg">{serviceOfDay.description}</p>
              </div>
              <div className="flex flex-col items-end gap-3 min-w-[140px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground line-through decorations-destructive">{serviceOfDay.creditCost}</span>
                  <span className="text-3xl font-bold text-primary flex items-center">
                      <Zap className="w-6 h-6 mr-1 fill-current" />
                      {Math.floor(serviceOfDay.creditCost * 0.8)}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedService(serviceOfDay)
                    addToRecent(serviceOfDay.id)
                  }}
                  className="w-full shadow-lg shadow-primary/20"
                >
                  Try Now (-20%)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recents */}
        {recentServicesData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recently Used</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {recentServicesData.map(service => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:border-primary/50 hover:bg-secondary/10 transition group"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="text-2xl group-hover:scale-110 transition duration-300">{service.icon}</div>
                    <p className="text-xs font-medium line-clamp-1">{service.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favoriteServices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Heart className="w-4 h-4 text-destructive fill-destructive" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Favorites</h3>
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
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <Input
                placeholder="Search AI services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                  <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                      selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                  >
                  {cat}
                  </button>
              ))}
              </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium">No services found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Sub-components ---

interface ServiceCardProps {
  service: Service
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick: () => void
}

function ServiceCard({ service, isFavorite, onToggleFavorite, onClick }: ServiceCardProps) {
  return (
    <Card className="hover:border-primary/50 transition flex flex-col group relative overflow-hidden">
      <CardHeader className="flex-1 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl bg-secondary/30 w-12 h-12 rounded-xl flex items-center justify-center">
             {service.icon}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="p-2 hover:bg-secondary rounded-full transition z-20"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>
        <CardTitle className="text-lg font-semibold">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-1.5 text-muted-foreground">
                 <TrendingUp className="w-3 h-3" />
                 <span>{service.popularity}% Popularity</span>
             </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Cost per run</span>
          <span className="text-base font-bold flex items-center gap-1 text-foreground">
            <Zap className="w-4 h-4 text-primary fill-current" />
            {service.creditCost}
          </span>
        </div>
        
        <Button className="w-full group" onClick={onClick}>
          Launch App
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