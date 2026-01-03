import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, MoveLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-100">
        
        {/* Icon with glowing effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative bg-card border border-border p-6 rounded-2xl shadow-xl">
            <FileQuestion className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button asChild variant="default" size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              <MoveLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="lg">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>

        {/* Footer detail */}
        <p className="text-xs text-muted-foreground pt-8">
          Error 404 • Hetaru AI Platform
        </p>
      </div>
    </div>
  )
}