"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Zap,
  Heart,
  TrendingUp,
  Check,
  Sparkles,
  Star,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Menu,
  X,
  Loader2,
  LayoutDashboard
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserNav } from "@/components/dashboard/user-nav" // ✅ Reusing your existing User component!
import { useAuth } from "@/components/firebase-auth-provider"
import type { Product } from "@/components/PricingSection"

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Simple Credit System",
    description: "Buy credits once and use them across all AI services. No subscriptions, no hidden fees.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "100+ AI Tools",
    description: "From image generation to meal planning, access powerful AI tools instantly in your browser.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Daily Featured Services",
    description: "Discover new AI tools with 20% off featured services every day.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Personalized Experience",
    description: "Save your favorite AI tools and quickly access your recently used services.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and encrypted storage.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Easy to Use",
    description: "No technical knowledge required. Just type your request and get instant AI-powered results.",
  },
]

const POPULAR_SERVICES = [
  { icon: "🎨", name: "Image Generation", credits: 150, popularity: 95 },
  { icon: "💻", name: "Code Generator", credits: 100, popularity: 92 },
  { icon: "✍️", name: "Content Writer", credits: 45, popularity: 89 },
  { icon: "📋", name: "Text Summarizer", credits: 30, popularity: 88 },
  { icon: "📝", name: "Text Analysis", credits: 25, popularity: 87 },
  { icon: "🌐", name: "Multi-Language Translator", credits: 20, popularity: 85 },
]

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    company: "YouTube",
    content:
      "Hetaru has been a game-changer for my content workflow. From generating thumbnails to summarizing research, it saves me hours every week.",
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Small Business Owner",
    company: "Chen's Restaurant",
    content:
      "The meal planner and recipe generator help me plan menus effortlessly. The credit system is so much better than monthly subscriptions!",
    avatar: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "GrowthCo",
    content:
      "I use Hetaru daily for content writing, image generation, and social media ideas. It's like having an AI assistant for every task.",
    avatar: "ER",
  },
]

export function LandingPageClient({ products }: { products: Product[] }) {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sort products by price to keep them in order
  const sortedProducts = [...products].sort((a, b) => a.amount - b.amount)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">Hetaru</h1>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">AI Platform</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                Features
              </a>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                AI Tools
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                Pricing
              </a>

              {/* ✅ Auth State Logic */}
              <div className="flex items-center gap-4 pl-4 border-l border-border">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : user ? (
                  <div className="flex items-center gap-4">
                     <Link href="/dashboard">
                        <Button variant="ghost" size="sm">Dashboard</Button>
                     </Link>
                     <UserNav />
                  </div>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/auth">
                      <Button size="sm" className="shadow-md shadow-primary/20">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-3 border-t border-border mt-4 animate-in slide-in-from-top-2">
              <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">
                Features
              </a>
              <a href="#services" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">
                AI Tools
              </a>
              <a href="#pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">
                Pricing
              </a>
              <div className="pt-4 border-t border-border">
                 {user ? (
                   <Link href="/dashboard">
                     <Button className="w-full">Go to Dashboard</Button>
                   </Link>
                 ) : (
                   <Link href="/auth">
                     <Button className="w-full">Get Started</Button>
                   </Link>
                 )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>100+ AI microservices live now</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-balance">
              Your all-in-one{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI toolkit</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              Access 100+ powerful AI services from meal planning to image generation. Pay only for what you use with
              our simple credit system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5">
                  Start Building Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#services">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                  Browse Tools
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="pt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto border-t border-border/50 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">100+</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Everything you need in one place</h2>
            <p className="text-lg text-muted-foreground">
              Powerful AI tools designed for everyone, no technical expertise required
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Most popular AI tools</h2>
            <p className="text-lg text-muted-foreground">Discover our most-loved AI services used by thousands daily</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SERVICES.map((service, index) => (
              <Card key={index} className="hover:border-primary/50 transition group cursor-default">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl group-hover:scale-110 transition duration-300">{service.icon}</div>
                    <div className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      {service.popularity}%
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Per call</span>
                    <span className="text-lg font-bold flex items-center gap-1">
                      <Zap className="w-4 h-4 text-primary fill-primary" />
                      {service.credits}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href={user ? "/dashboard/services" : "/auth"}>
              <Button size="lg" variant="outline" className="h-12 px-8">
                Explore All Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section - LIVE DATA */}
      <section id="pricing" className="py-24 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose a credit package that fits your needs. No hidden fees, no subscriptions.
            </p>
          </div>

          {/* Dynamic Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
            {!sortedProducts.length ? (
               <div className="col-span-full text-center py-12 text-muted-foreground">
                 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                 Loading latest pricing...
               </div>
            ) : sortedProducts.map((product) => {
              const credits = Number(product.metadata?.credits || 0)
              // Logic to highlight "Best Value" (usually the middle/expensive one)
              const isPopular = credits > 500 && credits < 5000 

              return (
                <Card
                  key={product.id}
                  className={`relative flex flex-col ${
                    isPopular 
                      ? "border-primary shadow-2xl shadow-primary/10 scale-105 z-10" 
                      : "border-border/50 hover:border-primary/30"
                  } transition-all duration-300`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      BEST VALUE
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-xl font-semibold mb-2">{product.name}</CardTitle>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-foreground">
                        ${product.amount}
                        <span className="text-base font-normal text-muted-foreground ml-1">USD</span>
                      </div>
                      <div className="text-sm font-medium text-primary mt-2 bg-primary/10 py-1 px-3 rounded-full inline-block">
                         {credits.toLocaleString()} Credits
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-4">
                       One-time payment • Never expires
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground text-left">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Instant delivery to wallet</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-muted-foreground text-left">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Access all 100+ AI tools</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-muted-foreground text-left">
                         <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                         <span>{credits > 1000 ? "Priority Support" : "Standard Support"}</span>
                      </div>
                    </div>

                    <Link href={user ? "/dashboard" : "/auth"} className="block mt-auto">
                      <Button className="w-full h-11" variant={isPopular ? "default" : "outline"}>
                        {user ? "Top Up Now" : "Get Started"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer (Simplified) */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">Hetaru</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Your all-in-one AI toolkit for everyday tasks.
            </p>
            <p className="text-xs text-muted-foreground">© 2025 Hetaru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}