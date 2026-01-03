// components/PricingSkeleton.tsx
import { cn } from "@/lib/utils"

export function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "relative flex flex-col justify-between rounded-xl border border-border p-6 bg-card animate-pulse",
            i === 2 ? "md:scale-110 z-10" : "" // Matches the 'Best Value' middle card scale
          )}
        >
          {/* Header Section */}
          <div className="space-y-4 text-center w-full">
            <div className="h-3 w-1/2 bg-muted rounded mx-auto" /> {/* Name */}
            <div className="h-10 w-3/4 bg-muted rounded mx-auto" /> {/* Credits Number */}
            <div className="h-3 w-1/4 bg-muted rounded mx-auto" /> {/* "Credits" text */}
          </div>

          <div className="my-6 h-px w-full bg-border/50" />

          {/* Price & Action */}
          <div className="space-y-4 w-full text-center">
            <div className="h-8 w-1/2 bg-muted rounded mx-auto" /> {/* Price */}
            
            {/* Fake List */}
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-3 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>

            {/* Button */}
            <div className="h-10 w-full bg-muted rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}